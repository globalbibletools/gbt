import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GetVerseGlossesResponseBody,
  GlossState,
  TextDirection,
} from '@translation/api-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccessControl } from '../../shared/accessControl';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import DropdownMenu, {
  DropdownMenuLink,
} from '../../shared/components/actions/DropdownMenu';
import {
  expandFontFamily,
  useFontLoader,
} from '../../shared/hooks/useFontLoader';
import TranslateWord, { TranslateWordRef } from './TranslateWord';
import { VerseSelector } from './VerseSelector';
import {
  bookFirstVerseId,
  bookLastVerseId,
  decrementVerseId,
  incrementVerseId,
  parseVerseId,
} from './verse-utils';
import Button from '../../shared/components/actions/Button';
import { Icon } from '../../shared/components/Icon';
import { useTranslation } from 'react-i18next';
import bibleTranslationClient, {
  BibleVerseTranslation,
} from '../../shared/bibleTranslationClient';

export const translationLanguageKey = 'translation-language';
export const translationVerseIdKey = 'translation-verse-id';

const VERSES_TO_PREFETCH = 3;

function useTranslationQueries(language: string, verseId: string) {
  const languagesQuery = useQuery(['languages'], () =>
    apiClient.languages.findAll()
  );
  const verseQuery = useQuery(['verse', verseId], () =>
    apiClient.verses.findById(verseId)
  );
  const referenceGlossesQuery = useQuery(
    ['verse-glosses', 'eng', verseId],
    () => apiClient.verses.findVerseGlosses(verseId, 'eng')
  );
  const targetGlossesQuery = useQuery(
    ['verse-glosses', language, verseId],
    () => apiClient.verses.findVerseGlosses(verseId, language)
  );

  const translationLanguages = languagesQuery.data?.data ?? [];
  const selectedLanguage = translationLanguages.find(
    (l) => l.code === language
  );

  const translationQuery = useQuery(
    ['verse-translation', language, verseId],
    () =>
      bibleTranslationClient.getTranslation(
        verseId,
        selectedLanguage?.bibleTranslationIds ?? []
      ),
    { enabled: !!selectedLanguage }
  );

  const queryClient = useQueryClient();

  // This primes the cache with verse data for the next VERSES_TO_PREFETCH verses.
  // API requests are only sent if there is no data in the cache for the verse.
  useEffect(() => {
    let nextVerseId = verseId;
    for (let i = 0; i < VERSES_TO_PREFETCH; i++) {
      nextVerseId = incrementVerseId(nextVerseId);
      queryClient.ensureQueryData({
        queryKey: ['verse', nextVerseId],
        queryFn: ({ queryKey }) => apiClient.verses.findById(queryKey[1]),
      });
      queryClient.ensureQueryData({
        queryKey: ['verse-glosses', 'eng', nextVerseId],
        queryFn: ({ queryKey }) =>
          apiClient.verses.findVerseGlosses(queryKey[2], 'eng'),
      });
      queryClient.ensureQueryData({
        queryKey: ['verse-glosses', language, nextVerseId],
        queryFn: ({ queryKey }) =>
          apiClient.verses.findVerseGlosses(queryKey[2], queryKey[1]),
      });
      if (selectedLanguage) {
        queryClient.prefetchQuery({
          queryKey: ['verse-translation', language, nextVerseId],
          queryFn: ({ queryKey }) =>
            bibleTranslationClient.getTranslation(
              queryKey[2],
              selectedLanguage.bibleTranslationIds
            ),
        });
      }
    }
  }, [language, verseId, queryClient, selectedLanguage]);

  return {
    translationLanguages,
    selectedLanguage,
    verseQuery,
    referenceGlossesQuery,
    targetGlossesQuery,
    translationQuery,
  };
}

export default function TranslationView() {
  const { t, i18n } = useTranslation(['common']);
  const { language, verseId } = useParams() as {
    language: string;
    verseId: string;
  };

  useEffect(() => {
    localStorage.setItem(translationLanguageKey, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(translationVerseIdKey, verseId);
  }, [verseId]);

  const navigate = useNavigate();

  const {
    translationLanguages,
    selectedLanguage,
    verseQuery,
    referenceGlossesQuery,
    targetGlossesQuery,
    translationQuery,
  } = useTranslationQueries(language, verseId);

  useFontLoader(selectedLanguage ? [selectedLanguage.font] : []);

  const [glossRequests, setGlossRequests] = useState<
    { wordId: string; requestId: number }[]
  >([]);
  const queryClient = useQueryClient();
  const glossMutation = useMutation({
    mutationFn: (variables: {
      wordId: string;
      gloss?: string;
      state?: GlossState;
    }) =>
      apiClient.words.updateGloss({
        wordId: variables.wordId,
        language,
        gloss: variables.gloss,
        state: variables.state,
      }),
    onMutate: async ({ wordId, gloss, state }) => {
      const requestId = Math.floor(Math.random() * 1000000);
      setGlossRequests((requests) => [...requests, { wordId, requestId }]);

      const queryKey = ['verse-glosses', language, verseId];
      await queryClient.cancelQueries({ queryKey });
      const previousGlosses = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<GetVerseGlossesResponseBody>(queryKey, (old) => {
        if (old) {
          const glosses = old.data.slice();
          const index = glosses.findIndex((g) => g.wordId === wordId);
          if (index >= 0) {
            const doc = glosses[index];
            glosses.splice(index, 1, {
              ...doc,
              gloss: gloss ?? doc.gloss,
              state: state ?? doc.state,
            });
            return {
              data: glosses,
            };
          }
        }
        return old;
      });

      return { requestId, previousGlosses };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(
        ['verse-glosses', language, verseId],
        context?.previousGlosses
      );

      alert('Unknown error occurred.');
    },
    onSettled: (_, __, ___, context) => {
      queryClient.invalidateQueries({
        queryKey: ['verse-glosses', language, verseId],
      });

      if (context?.requestId) {
        setGlossRequests((requests) =>
          requests.filter((r) => r.requestId !== context.requestId)
        );
      }
    },
  });

  const userCan = useAccessControl();

  const firstWord = useRef<TranslateWordRef>(null);
  const lastWord = useRef<TranslateWordRef>(null);
  const handleKeyPress = useCallback(
    (event: {
      key: string;
      shiftKey: boolean;
      ctrlKey: boolean;
      preventDefault: VoidFunction;
      stopPropagation: VoidFunction;
    }) => {
      const watchKeys = ['ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (!event.ctrlKey || !watchKeys.includes(event.key)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const { bookId } = parseVerseId(verseId);
      switch (event.key) {
        case 'ArrowUp':
          navigate(
            `/languages/${language}/verses/${decrementVerseId(verseId)}`
          );
          break;
        case 'ArrowDown':
          navigate(
            `/languages/${language}/verses/${incrementVerseId(verseId)}`
          );
          break;
        case 'Home':
          if (event.shiftKey) {
            navigate(
              `/languages/${language}/verses/${bookFirstVerseId(bookId)}`
            );
          } else {
            firstWord.current?.focus();
          }
          break;
        case 'End':
          if (event.shiftKey) {
            navigate(
              `/languages/${language}/verses/${bookLastVerseId(bookId)}`
            );
          } else {
            lastWord.current?.focus();
          }
          break;
      }
    },
    [language, navigate, verseId]
  );

  useEffect(() => {
    // Attach the event listener to the window object
    window.addEventListener('keydown', handleKeyPress);
    // Cleanup by removing the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const loading =
    !verseQuery.isSuccess ||
    !referenceGlossesQuery.isSuccess ||
    !targetGlossesQuery.isSuccess;

  const loadedFromNextButton = useRef(false);
  useEffect(() => {
    if (!loading && loadedFromNextButton.current) {
      firstWord.current?.focus();
      loadedFromNextButton.current = false;
    }
  }, [loading, verseQuery.data]);

  return (
    <div className="px-4 flex flex-grow flex-col gap-8">
      <div className="flex gap-8 items-center">
        <VerseSelector
          verseId={verseId}
          onVerseChange={(verseId) =>
            navigate(`/languages/${language}/verses/${verseId}`)
          }
        />
        <DropdownMenu text={selectedLanguage?.name ?? 'Language'}>
          {translationLanguages.map((language) => (
            <DropdownMenuLink
              key={language.code}
              to={`/languages/${language.code}/verses/${verseId}`}
            >
              {language.name}
            </DropdownMenuLink>
          ))}
        </DropdownMenu>
      </div>
      {(() => {
        if (loading) {
          return (
            <div className="flex-grow flex items-center justify-center">
              <LoadingSpinner />
            </div>
          );
        } else {
          const verse = verseQuery.data.data;
          const referenceGlosses = referenceGlossesQuery.data.data;
          const targetGlosses = targetGlossesQuery.data.data;

          const { bookId } = parseVerseId(verse.id);

          const canEdit = userCan('translate', {
            type: 'Language',
            id: language,
          });

          const isHebrew = bookId < 40;
          return (
            <>
              {translationQuery.data && (
                <p
                  className="text-base mx-2"
                  dir={selectedLanguage?.textDirection ?? TextDirection.LTR}
                  style={{
                    fontFamily: expandFontFamily(
                      selectedLanguage?.font ?? 'Noto Sans'
                    ),
                  }}
                >
                  <span className="text-sm font-bold me-2">
                    {translationQuery.data.name}
                  </span>
                  <span>{translationQuery.data.translation}</span>
                </p>
              )}
              <ol
                className={`flex flex-wrap ${
                  isHebrew ? 'ltr:flex-row-reverse' : 'rtl:flex-row-reverse'
                }`}
              >
                {verse.words.map((word, i) => {
                  const targetGloss = targetGlosses[i];
                  const isSaving = glossRequests.some(
                    ({ wordId }) => wordId === word.id
                  );

                  let status: 'empty' | 'saving' | 'saved' | 'approved' =
                    'empty';
                  if (isSaving) {
                    status = 'saving';
                  } else if (targetGloss.gloss) {
                    status =
                      targetGloss.state === GlossState.Approved
                        ? 'approved'
                        : 'saved';
                  }

                  return (
                    <TranslateWord
                      key={word.id}
                      editable={canEdit}
                      word={word}
                      originalLanguage={isHebrew ? 'hebrew' : 'greek'}
                      status={status}
                      gloss={targetGloss?.gloss}
                      targetLanguage={selectedLanguage}
                      referenceGloss={referenceGlosses[i]?.gloss}
                      suggestions={targetGlosses[i]?.suggestions}
                      onChange={({ gloss, approved }) => {
                        glossMutation.mutate({
                          wordId: word.id,
                          gloss,
                          state:
                            approved === true
                              ? GlossState.Approved
                              : approved === false
                              ? GlossState.Unapproved
                              : undefined,
                        });
                      }}
                      ref={(() => {
                        if (i === 0) {
                          return firstWord;
                        } else if (i === verse.words.length - 1) {
                          return lastWord;
                        }
                      })()}
                    />
                  );
                })}
                {canEdit && (
                  <li className="mx-2" dir={isHebrew ? 'rtl' : 'ltr'}>
                    <Button
                      variant="tertiary"
                      className="mt-20"
                      onClick={() => {
                        loadedFromNextButton.current = true;
                        navigate(
                          `/languages/${language}/verses/${incrementVerseId(
                            verseId
                          )}`
                        );
                      }}
                    >
                      {isHebrew && <Icon icon="arrow-left" className="mr-1" />}
                      <span dir={i18n.dir(i18n.language)}>
                        {t('common:next')}
                      </span>
                      {!isHebrew && (
                        <Icon icon="arrow-right" className="ml-1" />
                      )}
                    </Button>
                  </li>
                )}
              </ol>
            </>
          );
        }
      })()}
    </div>
  );
}
