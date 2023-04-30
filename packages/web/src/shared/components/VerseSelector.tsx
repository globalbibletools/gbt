import { parseVerseId } from '../utils';
import { Icon } from './Icon';
import TextInput from './TextInput';

export interface VerseSelectorProps {
  verseId: string;
  goToVerse: (verseId: string) => any;
}

export function VerseSelector({ verseId, goToVerse }: VerseSelectorProps) {
  console.log('VERSE ID:', verseId);
  const { bookId, chapterNumber, verseNumber } = parseVerseId(verseId);
  const reference = `${bookId} ${chapterNumber}:${verseNumber}`;

  function changeVerse(delta: number) {
    // TODO: use the delta to calculate the next verse ID.
    goToVerse(verseId);
  }

  return (
    <div className='flex flex-row gap-4 items-center'>
      <TextInput autoComplete="off" placeholder={reference} />
      <button onClick={() => changeVerse(-1)}>
        <Icon icon="arrow-left" />
      </button>
      <button onClick={() => changeVerse(1)}>
        <Icon icon="arrow-right" />
      </button>
    </div>
  );
}
