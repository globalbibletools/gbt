import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GetVerseGlossesResponseBody } from '@translation/api-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useLayoutContext } from '../../app/Layout';
import { useAccessControl } from '../../shared/accessControl';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import TranslateWord from './TranslateWord';
import { VerseSelector } from './VerseSelector';
import { parseVerseId } from './verse-utils';

export default function TranslationView() {
  const params = useParams() as { verseId: string };
  const navigate = useNavigate();
  const { language } = useLayoutContext();
  const { t } = useTranslation();

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
        ['verse-glosses', language, params.verseId],
        context?.previousGlosses
      );

      alert('Unknown error occurred.');
    },
    onSettled: (_, __, ___, context) => {
      queryClient.invalidateQueries({
        queryKey: ['verse-glosses', language, params.verseId],
      });

      if (context?.requestId) {
        setGlossRequests((requests) =>
          requests.filter((r) => r.requestId !== context.requestId)
        );
      }
    },
  });

  const userCan = useAccessControl();

  const loading =
    !verseQuery.isSuccess ||
    !referenceGlossesQuery.isSuccess ||
    !targetGlossesQuery.isSuccess;
  let content = (
    <div className="flex-grow flex items-center justify-center">
      <LoadingSpinner></LoadingSpinner>
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
  if (!loading) {
    const verse = verseQuery.data.data;
    const referenceGlosses = referenceGlossesQuery.data.data;
    const targetGlosses = targetGlossesQuery.data.data;

    const { bookId } = parseVerseId(verse.id);

    const canEdit = userCan('translate', { type: 'Language', id: language });

    const isHebrew = bookId < 40;
    content = (
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
    );
  }
  return (
    <div className="px-4 flex flex-grow flex-col gap-2">
      <VerseSelector
        verseId={params.verseId}
        onVerseChange={(verseId) => navigate('../translate/' + verseId)}
      />
      {content}
    </div>
  );
}
