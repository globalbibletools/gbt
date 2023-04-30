import { useLayoutContext } from '../../app/Layout';
import { decrementVerseId, incrementVerseId, parseVerseId } from '../utils';
import { Icon } from './Icon';
import TextInput from './TextInput';


export interface VerseSelectorProps {
  verseId: string;
  goToVerse: (verseId: string) => any;
}

export function VerseSelector({ verseId, goToVerse }: VerseSelectorProps) {
  const { language } = useLayoutContext();
  const langCode = language?.code ?? 'en';
  const bookTerms = require(`../../assets/book-terms/${langCode}.json`);

  const { bookId, chapterNumber, verseNumber } = parseVerseId(verseId);
  const bookName = bookTerms[bookId - 1][0];
  const reference = `${bookName} ${chapterNumber}:${verseNumber}`;

  return (
    <div className='flex flex-row gap-4 items-center'>
      <TextInput autoComplete="off" placeholder={reference} />
      <button onClick={() => goToVerse(decrementVerseId(verseId))}>
        <Icon icon="arrow-left" />
      </button>
      <button onClick={() => goToVerse(incrementVerseId(verseId))}>
        <Icon icon="arrow-right" />
      </button>
    </div>
  );
}

