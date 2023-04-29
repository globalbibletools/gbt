import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import apiClient from '../../shared/apiClient';
import { useLayoutContext } from '../../app/Layout';
import {
  GetVerseGlossesResponseBody,
  GetVerseResponseBody,
} from '@translation/api-types';

export async function translationViewLoader({ params }: LoaderFunctionArgs) {
  const verse = await apiClient.verses.findById(params.verseId ?? 'unknown');
  const referenceGlosses = await apiClient.verses.findVerseGlosses(
    params.verseId ?? 'unknown',
    'en'
  );

  return { verse, referenceGlosses };
}

export default function TranslationView() {
  const { verse, referenceGlosses } = useLoaderData() as {
    verse: GetVerseResponseBody;
    referenceGlosses: GetVerseGlossesResponseBody;
  };
  const bookId = parseInt(verse.data.id.slice(0, 2));
  const hebrew = bookId < 40;

  const { language } = useLayoutContext();

  return (
    <div className="px-4">
      <ol className={`flex flex-wrap ${hebrew ? 'flex-row-reverse' : ''}`}>
        {verse.data.words.map((word, i) => (
          <li key={word.id} className="mx-2 mb-4">
            <div className={`font-serif ${hebrew ? 'text-2xl' : 'text-lg'}`}>
              {word.text}
            </div>
            <div className="">{referenceGlosses.data[i]?.gloss}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
