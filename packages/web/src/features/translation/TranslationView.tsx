import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GetVerseGlossesResponseBody } from '@translation/api-types';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLayoutContext } from '../../app/Layout';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import InputHelpText from '../../shared/components/InputHelpText';
import TextInput from '../../shared/components/TextInput';
import { VerseSelector } from './VerseSelector';
import { parseVerseId } from './verse-utils';

export default function TranslationView() {
  const params = useParams() as { verseId: string };
  const { language } = useLayoutContext();
  const navigate = useNavigate();

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
    mutationFn: (variables: { wordId: string; gloss: string }) =>
      apiClient.words.updateGloss(variables.wordId, language, variables.gloss),
    onMutate: ({ wordId }) => {
      const requestId = Math.floor(Math.random() * 1000000);
      setGlossRequests((requests) => [...requests, { wordId, requestId }]);
      return { requestId };
    },
    onError: () => {
      alert('Unknown error occurred.');
    },
    onSuccess: (_, { wordId, gloss }, context) => {
      if (context?.requestId) {
        setGlossRequests((requests) =>
          requests.filter((r) => r.requestId !== context.requestId)
        );
      }

      const queryKey = ['verse-glosses', language, params.verseId];
      const query =
        queryClient.getQueryData<GetVerseGlossesResponseBody>(queryKey);
      if (query) {
        const glosses = query.data.slice();
        const index = glosses.findIndex((g) => g.wordId === wordId);
        glosses.splice(index, 1, { wordId, gloss });
        queryClient.setQueryData<GetVerseGlossesResponseBody>(queryKey, {
          data: glosses,
        });
      }
    },
  });

  const loading =
    !verseQuery.isSuccess ||
    !referenceGlossesQuery.isSuccess ||
    !targetGlossesQuery.isSuccess;
  if (loading) {
    return (
      <div className="flex justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  const verse = verseQuery.data.data;
  const referenceGlosses = referenceGlossesQuery.data.data;
  const targetGlosses = targetGlossesQuery.data.data;

  const { bookId } = parseVerseId(verse.id);

  const isHebrew = bookId < 40;
  return (
    <div className="px-4 flex flex-col gap-2">
      <VerseSelector
        verseId={verse.id}
        onVerseChange={(verseId) => navigate('../translate/' + verseId)}
      />
      <ol className={`flex flex-wrap ${isHebrew ? 'flex-row-reverse' : ''}`}>
        {verse.words.map((word, i) => {
          const targetGloss = targetGlosses[i]?.gloss;
          const isSaving = glossRequests.some(
            ({ wordId }) => wordId === word.id
          );

          return (
            <li key={word.id} className="mx-2 mb-4 w-36">
              <div
                className={`font-serif mb-2 ${
                  isHebrew ? 'text-2xl text-right' : 'text-lg'
                }`}
              >
                {word.text}
              </div>
              <div className="mb-2">{referenceGlosses[i]?.gloss}</div>
              <TextInput
                className="w-full"
                defaultValue={targetGloss}
                aria-describedby={`word-help-${word.id}`}
                onBlur={async (e) => {
                  const newGloss = e.currentTarget.value;
                  if (newGloss !== targetGloss) {
                    glossMutation.mutate({
                      wordId: word.id,
                      gloss: newGloss,
                    });
                  }
                }}
              />
              <InputHelpText id={`word-help-${word.id}`}>
                {(() => {
                  if (isSaving) {
                    return (
                      <>
                        <Icon icon="arrows-rotate" className="mr-1" />
                        Saving...
                      </>
                    );
                  } else if (targetGloss) {
                    return (
                      <>
                        <Icon icon="check" className="mr-1" />
                        Saved
                      </>
                    );
                  } else {
                    return null;
                  }
                })()}
              </InputHelpText>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
