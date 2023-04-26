import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import apiClient from '../../shared/apiClient';
import { useLayoutContext } from '../../app/Layout';
import { GetVerseResponseBody } from '@translation/api-types';

export async function translationViewLoader({ params }: LoaderFunctionArgs) {
  return apiClient.verses.findById(params.verseId ?? 'unknown');
}

export default function TranslationView() {
  const verse = useLoaderData() as GetVerseResponseBody;
  const bookId = parseInt(verse.data.id.slice(0, 2));
  const hebrew = bookId < 40;

  const { language } = useLayoutContext();

  return (
    <div className="px-4">
      <ol className={`flex flex-wrap ${hebrew ? 'flex-row-reverse' : ''}`}>
        {verse.data.words.map((word) => (
          <li key={word.id} className="mx-2">
            <div className="font-serif text-2xl">{word.text}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
