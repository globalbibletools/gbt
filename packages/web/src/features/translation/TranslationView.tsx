import {
  GetVerseGlossesResponseBody,
  GetVerseResponseBody,
} from '@translation/api-types';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { useLayoutContext } from '../../app/Layout';
import apiClient from '../../shared/apiClient';
import { parseVerseId } from '../../shared/verse-utils';
import { VerseSelector } from './VerseSelector';

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
  const { bookId } = parseVerseId(verse.data.id);
  const hebrew = bookId < 40;

  const { language } = useLayoutContext();
  const navigate = useNavigate();

  return (
    <div className="px-4">
      <div className='flex flex-col gap-2'>
        <VerseSelector
          verseId={verse.data.id}
          goToVerse={(verseId) => navigate('../translate/' + verseId)} />
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
    </div>
  );
}
