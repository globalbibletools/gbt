import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GetVersePhrasesResponseBody,
  GlossState,
  TextDirection,
} from '@translation/api-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { useAccessControl } from '../../shared/accessControl';
import apiClient from '../../shared/apiClient';
import bibleTranslationClient from '../../shared/bibleTranslationClient';
import { Icon } from '../../shared/components/Icon';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import Button from '../../shared/components/actions/Button';
import {
  expandFontFamily,
  useFontLoader,
} from '../../shared/hooks/useFontLoader';
import TranslateWord, { TranslateWordRef } from './TranslateWord';
import {
  TranslationSidebar,
  TranslationSidebarRef,
} from './TranslationSidebar';
import { TranslationToolbar } from './TranslationToolbar';
import {
  bookFirstVerseId,
  bookLastVerseId,
  decrementVerseId,
  incrementVerseId,
  isOldTestament,
  parseVerseId,
} from './verse-utils';
import { isFlagEnabled } from '../../shared/featureFlags';
import useTitle from '../../shared/hooks/useTitle';
import { useFlash } from '../../shared/hooks/flash';
import { isRichTextEmpty } from '../../shared/components/form/RichTextInput';

export const translationLanguageKey = 'translation-language';
export const translationVerseIdKey = 'translation-verse-id';

const VERSES_TO_PREFETCH = 2;

function useTranslationQueries(language: string, verseId: string) {
  const languagesQuery = useQuery(['languages'], () =>
    apiClient.languages.findAll()
  );
  const verseQuery = useQuery(['verse', verseId], () =>
    apiClient.verses.findById(verseId)
  );
  const suggestionsQuery = useQuery(
    ['verse-suggestions', language, verseId],
    () => apiClient.verses.findVerseSuggestions(verseId, language)
  );
  const phrasesQuery = useQuery(['verse-phrases', language, verseId], () =>
    apiClient.verses.findVersePhrases(verseId, language)
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
      queryClient.prefetchQuery({
        queryKey: ['verse', nextVerseId],
        queryFn: ({ queryKey }) => apiClient.verses.findById(queryKey[1]),
      });
      queryClient.prefetchQuery({
        queryKey: ['verse-suggestions', language, nextVerseId],
        queryFn: ({ queryKey }) =>
          apiClient.verses.findVerseSuggestions(queryKey[2], queryKey[1]),
      });
      queryClient.prefetchQuery({
        queryKey: ['verse-phrases', language, nextVerseId],
        queryFn: ({ queryKey }) =>
          apiClient.verses.findVersePhrases(queryKey[2], queryKey[1]),
      });
    }
  }, [language, verseId, queryClient, selectedLanguage]);

  // This ensures that when the verse changes, we have the latest gloss suggestions,
  // but in the meantime, we can show what was prefetched.
  const refetch = suggestionsQuery.refetch;
  useEffect(() => {
    refetch();
  }, [refetch, language, verseId]);

  return {
    translationLanguages,
    selectedLanguage,
    verseQuery,
    suggestionsQuery,
    phrasesQuery,
    translationQuery,
  };
}

/// This function loads the current language for use in the interlinear tab title.
export async function translationViewLoader(code: string) {
  const languages = await apiClient.languages.findAll();
  return {
    languageName: languages.data.find((l) => l.code === code)?.name ?? '',
  };
}

export default function TranslationView() {
  const { t, i18n } = useTranslation(['common']);
  const { language, verseId } = useParams() as {
    language: string;
    verseId: string;
  };
  const loaderData = useLoaderData() as { languageName: string };

  useTitle(
    t('common:tab_titles.interlinear', {
      languageName: loaderData.languageName,
    })
  );

  const [sidebarWordIndex, setSidebarWordIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    localStorage.setItem(translationLanguageKey, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(translationVerseIdKey, verseId);
    setSidebarWordIndex(0);
  }, [verseId]);

  const navigate = useNavigate();

  const {
    translationLanguages,
    selectedLanguage,
    verseQuery,
    suggestionsQuery,
    phrasesQuery,
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

      const queryKey = ['verse-phrases', language, verseId];
      await queryClient.cancelQueries({ queryKey });
      const previousGlosses = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<GetVersePhrasesResponseBody>(queryKey, (old) => {
        if (old) {
          const phrases = old.data.slice();
          const index = phrases.findIndex((phrase) =>
            phrase.wordIds.includes(wordId)
          );
          if (index >= 0) {
            const phrase = phrases[index];
            phrases.splice(index, 1, {
              ...phrase,
              gloss: {
                text: gloss ?? phrase.gloss?.text,
                state: state ?? phrase.gloss?.state ?? GlossState.Unapproved,
              },
            });
          }
          else {
            phrases.push({
              id: 0,
              wordIds: [wordId],
              gloss: {
                text: gloss,
                state: state ?? GlossState.Unapproved
              }
            })
          }
          return {
            data: phrases,
          };
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
      const watchKeys = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'd'];
      if (!event.ctrlKey || !watchKeys.includes(event.key)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const { bookId } = parseVerseId(verseId);
      switch (event.key) {
        case 'ArrowUp':
          navigate(
            `/interlinear/${language}/verses/${decrementVerseId(verseId)}`
          );
          break;
        case 'ArrowDown':
          navigate(
            `/interlinear/${language}/verses/${incrementVerseId(verseId)}`
          );
          break;
        case 'Home':
          if (event.shiftKey) {
            navigate(
              `/interlinear/${language}/verses/${bookFirstVerseId(bookId)}`
            );
          } else {
            firstWord.current?.focus();
          }
          break;
        case 'End':
          if (event.shiftKey) {
            navigate(
              `/interlinear/${language}/verses/${bookLastVerseId(bookId)}`
            );
          } else {
            lastWord.current?.focus();
          }
          break;
        case 'd':
          setShowSidebar((showSidebar) => !showSidebar);
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
    !phrasesQuery.isSuccess ||
    !suggestionsQuery.isSuccess;

  const loadedFromNextButton = useRef(false);
  useEffect(() => {
    if (!loading && loadedFromNextButton.current) {
      firstWord.current?.focus();
      loadedFromNextButton.current = false;
    }
  }, [loading, verseQuery.data]);

  const commentsEnabled =
    isFlagEnabled('comments') &&
    !!userCan('read', { type: 'Language', id: language });

  const flash = useFlash();

  const glossesAsDisplayed = useMemo(
    () =>
      verseQuery.data?.data.words.map((word) => {
        const wordSuggestions = suggestionsQuery.data?.data.find(
          (w) => w.wordId === word.id
        );
        const phrase = phrasesQuery.data?.data.find((phrase) =>
          phrase.wordIds.includes(word.id)
        );

        return {
          wordId: word.id,
          glossAsDisplayed:
            phrase?.gloss?.text ??
            wordSuggestions?.suggestions[0] ??
            wordSuggestions?.machineGloss,
          state: phrase?.gloss?.state ?? GlossState.Unapproved,
        };
      }),
    [verseQuery.data, suggestionsQuery.data, phrasesQuery.data]
  );

  const approveAllGlossesMutation = useMutation({
    mutationFn: async () => {
      if (glossesAsDisplayed) {
        const data = Object.fromEntries(
          glossesAsDisplayed
            .filter(
              ({ glossAsDisplayed, state }) =>
                glossAsDisplayed !== undefined &&
                state === GlossState.Unapproved
            )
            .map(({ wordId, glossAsDisplayed }) => [
              wordId,
              { gloss: glossAsDisplayed, state: GlossState.Approved },
            ])
        );
        await apiClient.languages.bulkUpdateGlosses(language, {
          data,
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['verse-glosses', language, verseId]);
      flash.success(t('translate:all_glosses_approved'));
    },
  });

  const sidebarRef = useRef<TranslationSidebarRef>(null);

  return (
    <div className="absolute w-full h-full flex flex-col flex-grow">
      <TranslationToolbar
        canApproveAllGlosses={
          !approveAllGlossesMutation.isLoading &&
          !!glossesAsDisplayed?.some(
            ({ glossAsDisplayed, state }) =>
              glossAsDisplayed && state === GlossState.Unapproved
          )
        }
        approveAllGlosses={approveAllGlossesMutation.mutate}
        verseId={verseId}
        languageCode={language}
        languages={translationLanguages.map(({ code, name }) => ({
          code,
          name,
        }))}
        onLanguageChange={(language) => {
          navigate(`/interlinear/${language}/verses/${verseId}`);
        }}
        onVerseChange={(verseId) =>
          navigate(`/interlinear/${language}/verses/${verseId}`)
        }
      />
      {(() => {
        if (loading) {
          return (
            <div className="flex items-center justify-center flex-grow">
              <LoadingSpinner />
            </div>
          );
        } else {
          const verse = verseQuery.data.data;

          const canEdit = userCan('translate', {
            type: 'Language',
            id: language,
          });

          const isHebrew = isOldTestament(verse.id);
          return (
            <div className="flex flex-col flex-grow w-full min-h-0 gap-6 lg:flex-row">
              <div className="flex flex-col max-h-full min-h-0 gap-8 overflow-auto grow pt-8 pb-10 px-6 lg:pe-0 lg:ps-8">
                {translationQuery.data && (
                  <p
                    className="mx-2 text-base"
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
                  className={`flex h-fit content-start flex-wrap gap-x-4 gap-y-6 ${
                    isHebrew ? 'ltr:flex-row-reverse' : 'rtl:flex-row-reverse'
                  }`}
                >
                  {verse.words.map((word, i) => {
                    const phrase = phrasesQuery.data?.data.find((phrase) =>
                      phrase.wordIds.includes(word.id)
                    );
                    const wordSuggestions = suggestionsQuery.data.data.find(
                      (w) => w.wordId === word.id
                    );
                    const isSaving = glossRequests.some(
                      ({ wordId }) => wordId === word.id
                    );

                    let status: 'empty' | 'saving' | 'saved' | 'approved' =
                      'empty';
                    if (isSaving) {
                      status = 'saving';
                    } else if (phrase?.gloss?.text) {
                      status =
                        phrase.gloss.state === GlossState.Approved
                          ? 'approved'
                          : 'saved';
                    }

                    const hasTranslatorNote = !isRichTextEmpty(
                      phrase?.translatorNote?.content ?? ''
                    );
                    const hasFootnote = !isRichTextEmpty(
                      phrase?.footnote?.content ?? ''
                    );

                    return (
                      <TranslateWord
                        key={word.id}
                        editable={canEdit}
                        word={word}
                        originalLanguage={isHebrew ? 'hebrew' : 'greek'}
                        status={status}
                        gloss={phrase?.gloss?.text}
                        machineGloss={wordSuggestions?.machineGloss}
                        targetLanguage={selectedLanguage}
                        referenceGloss={word.referenceGloss}
                        suggestions={wordSuggestions?.suggestions ?? []}
                        hasNote={hasFootnote || (hasTranslatorNote && canEdit)}
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
                        onFocus={() => setSidebarWordIndex(i)}
                        onShowDetail={() => setShowSidebar(true)}
                        onOpenNotes={() =>
                          setTimeout(() => sidebarRef.current?.openNotes(), 0)
                        }
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
                        className="mt-16"
                        onClick={() => {
                          loadedFromNextButton.current = true;
                          navigate(
                            `/interlinear/${language}/verses/${incrementVerseId(
                              verseId
                            )}`
                          );
                        }}
                      >
                        <span dir={i18n.dir(i18n.language)}>
                          {t('common:next')}
                        </span>
                        <Icon
                          icon={isHebrew ? 'arrow-left' : 'arrow-right'}
                          className="ms-1"
                        />
                      </Button>
                    </li>
                  )}
                </ol>
              </div>
              {showSidebar && sidebarWordIndex < verse.words.length && (
                <TranslationSidebar
                  ref={sidebarRef}
                  className="h-[320px] lg:h-auto lg:w-1/3 lg:min-w-[320px] lg:max-w-[480px] mt-8 mb-10 mx-6 lg:ms-0 lg:me-8"
                  language={language}
                  verse={verse}
                  wordIndex={sidebarWordIndex}
                  showComments={commentsEnabled}
                  onClose={() => setShowSidebar(false)}
                />
              )}
            </div>
          );
        }
      })()}
    </div>
  );
}
