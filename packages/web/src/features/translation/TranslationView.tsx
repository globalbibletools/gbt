import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import { useLayoutContext } from '../../app/Layout';
import { useState } from 'react';
import { GetVerseGlossesResponseBody } from '@translation/api-types';
import TranslateWord from './TranslateWord';

export default function TranslationView() {
  const params = useParams() as { verseId: string };
  const { language } = useLayoutContext();

  const verseQuery = useQuery(['verse', params.verseId], () =>
    apiClient.verses.findById(params.verseId)
  );
  const referenceGlossesQuery = useQuery(
    ['verse-glosses', 'en', params.verseId],
    () => apiClient.verses.findVerseGlosses(params.verseId, 'en')
  );
  const targetGlossesQuery = useQuery(
    ['verse-glosses', language, params.verseId],
    () => apiClient.verses.findVerseGlosses(params.verseId, language)
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

      const queryKey = ['verse-glosses', language, params.verseId];
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
        ['verse-glosses', 'language', params.verseId],
        context?.previousGlosses
      );

      alert('Unknown error occurred.');
    },
    onSettled: (_, __, ___, context) => {
      queryClient.invalidateQueries({ queryKey: ['verse-glosses'] });

      if (context?.requestId) {
        setGlossRequests((requests) =>
          requests.filter((r) => r.requestId !== context.requestId)
        );
      }
    },
  });

  const loading =
    !verseQuery.isSuccess ||
    !referenceGlossesQuery.isSuccess ||
    !targetGlossesQuery.isSuccess;
  if (loading) {
    return <div>Loading...</div>;
  }

  const verse = verseQuery.data.data;
  const referenceGlosses = referenceGlossesQuery.data.data;
  const targetGlosses = targetGlossesQuery.data.data;

  const bookId = parseInt(verse.id.slice(0, 2));
  const isHebrew = bookId < 40;

  return (
    <div className="px-4">
      <ol className={`flex flex-wrap ${isHebrew ? 'flex-row-reverse' : ''}`}>
        {verse.words.map((word, i) => {
          const targetGloss = targetGlosses[i]?.approvedGloss;
          const isSaving = glossRequests.some(
            ({ wordId }) => wordId === word.id
          );

          return (
            <TranslateWord
              key={word.id}
              word={word}
              originalLanguage={isHebrew ? 'hebrew' : 'greek'}
              status={isSaving ? 'saving' : targetGloss ? 'saved' : 'empty'}
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
    </div>
  );
}
