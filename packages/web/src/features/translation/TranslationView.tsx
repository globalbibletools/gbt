import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import { useLayoutContext } from '../../app/Layout';
import TextInput from '../../shared/components/TextInput';

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
  const hebrew = bookId < 40;

  return (
    <div className="px-4">
      <ol className={`flex flex-wrap ${hebrew ? 'flex-row-reverse' : ''}`}>
        {verse.words.map((word, i) => (
          <li key={word.id} className="mx-2 mb-4 w-36">
            <div
              className={`font-serif ${
                hebrew ? 'text-2xl text-right' : 'text-lg'
              }`}
            >
              {word.text}
            </div>
            <div>{referenceGlosses[i]?.gloss}</div>
            <TextInput
              className="w-full"
              defaultValue={targetGlosses[i]?.gloss}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
