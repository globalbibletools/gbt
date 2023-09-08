import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GetVerseGlossesResponseBody } from '@translation/api-types';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccessControl } from '../../shared/accessControl';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import TranslateWord from './TranslateWord';
import { VerseSelector } from './VerseSelector';
import { parseVerseId } from './verse-utils';
import DropdownMenu, {
  DropdownMenuLink,
} from '../../shared/components/actions/DropdownMenu';
import useKeyboardShortcut from '../../shared/hooks/useKeyboardShortcut';

export const translationLanguageKey = 'translation-language';
export const translationVerseIdKey = 'translation-verse-id';

export default function TranslationView() {
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

  const verseQuery = useQuery(['verse', verseId], () =>
    apiClient.verses.findById(verseId)
  );
  const referenceGlossesQuery = useQuery(['verse-glosses', 'en', verseId], () =>
    apiClient.verses.findVerseGlosses(verseId, 'en')
  );
  const targetGlossesQuery = useQuery(
    ['verse-glosses', language, verseId],
    () => apiClient.verses.findVerseGlosses(verseId, language)
  );

  const languagesQuery = useQuery(['languages'], () =>
    apiClient.languages.findAll()
  );
  const translationLanguages = languagesQuery.data?.data ?? [];
  const selectedLanguage = translationLanguages.find(
    (l) => l.code === language
  );

  const [glossRequests, setGlossRequests] = useState<
    { wordId: string; requestId: number }[]
  >([]);
  const queryClient = useQueryClient();
  const glossMutation = useMutation({
    mutationFn: (variables: { wordId: string; gloss?: string }) =>
      apiClient.words.updateGloss(variables.wordId, language, variables.gloss),
    onMutate: async ({ wordId, gloss }) => {
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
              approvedGloss: gloss,
              glosses: gloss
                ? doc.glosses.includes(gloss)
                  ? doc.glosses
                  : [...doc.glosses, gloss]
                : doc.glosses,
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

  const options = {
    overrideSystem: true,
    ignoreInputFields: false,
    repeatOnHold: false,
  };
  useKeyboardShortcut(
    ['Control', 'ArrowUp'],
    () => console.log('Ctrl + Up has been pressed.'),
    options
  );

  const loading =
    !verseQuery.isSuccess ||
    !referenceGlossesQuery.isSuccess ||
    !targetGlossesQuery.isSuccess;
  return (
    <div className="px-4 flex flex-grow flex-col gap-2">
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
            <ol
              className={`flex flex-wrap ${
                isHebrew ? 'ltr:flex-row-reverse' : 'rtl:flex-row-reverse'
              }`}
            >
              {verse.words.map((word, i) => {
                const targetGloss = targetGlosses[i]?.approvedGloss;
                const isSaving = glossRequests.some(
                  ({ wordId }) => wordId === word.id
                );

                return (
                  <TranslateWord
                    key={word.id}
                    editable={canEdit}
                    word={word}
                    originalLanguage={isHebrew ? 'hebrew' : 'greek'}
                    status={
                      isSaving ? 'saving' : targetGloss ? 'saved' : 'empty'
                    }
                    gloss={targetGloss}
                    referenceGloss={referenceGlosses[i]?.approvedGloss}
                    previousGlosses={targetGlosses[i]?.glosses}
                    onGlossChange={(newGloss) => {
                      glossMutation.mutate({
                        wordId: word.id,
                        gloss: newGloss,
                      });
                    }}
                  />
                );
              })}
            </ol>
          );
        }
      })()}
    </div>
  );
}
