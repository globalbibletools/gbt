import { Resource, VerseWord } from '@translation/api-types';
import { parseVerseId } from './verse-utils';
import Markdown from 'react-markdown';

type TranslationSidebarProps = {
  verseId: string;
  word: VerseWord;
  resources: Resource[];
};

export const TranslationSidebar = ({
  verseId,
  word,
  resources,
}: TranslationSidebarProps) => {
  const { bookId } = parseVerseId(verseId);
  const isHebrew = bookId < 40;
  const strongsResource = resources.find(
    ({ resource }) => resource === 'STRONGS'
  );
  const strongsEntry = strongsResource?.entry ?? '';
  const lexiconResource = resources.find(({ resource }) =>
    ['BDB', 'LSJ'].includes(resource)
  );
  const lexiconEntry = lexiconResource?.entry ?? '';
  return (
    // TODO: handle mobile styling
    <div className="ltr:border-l rtl:border-r min-w-[320px] max-w-[320px] flex flex-col gap-4 ps-3">
      <div className="flex flex-row gap-4 items-center">
        <span className={`text-4xl ${isHebrew ? 'font-hebrew' : 'font-greek'}`}>
          {word.text}
        </span>
        <span>{word.lemmaId}</span>
      </div>
      <div className="overflow-y-auto">
        <div>
          <div className="text-sm font-bold me-2">Strongs</div>
          <span>{strongsEntry} </span>
        </div>
        {lexiconEntry && (
          <div>
            <span className="text-sm font-bold me-2">
              {lexiconResource?.resource}
            </span>
            <Markdown>{lexiconEntry}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};
