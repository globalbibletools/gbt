import { VerseWord } from '@translation/api-types';
import { parseVerseId } from './verse-utils';

type TranslationSidebarProps = {
  verseId: string;
  word: VerseWord;
};

export const TranslationSidebar = ({
  verseId,
  word,
}: TranslationSidebarProps) => {
  const { bookId } = parseVerseId(verseId);
  const isHebrew = bookId < 40;
  return (
    <div className="border-l w-80 p-2">
      <div className="flex flex-row gap-4 items-center">
        <span className={`text-4xl ${isHebrew ? 'font-hebrew' : 'font-greek'}`}>
          {word.text}
        </span>
        <span>{word.lemmaId}</span>
      </div>
    </div>
  );
};
