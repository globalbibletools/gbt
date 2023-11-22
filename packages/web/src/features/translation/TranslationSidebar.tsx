import { Resource, VerseWord } from '@translation/api-types';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { Icon } from '../../shared/components/Icon';
import { parseVerseId } from './verse-utils';

type TranslationSidebarProps = {
  verseId: string;
  word: VerseWord;
  resources: Resource[];
  onClose: () => void;
};

export const TranslationSidebar = ({
  verseId,
  word,
  resources,
  onClose,
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
  const { t } = useTranslation(['common']);
  return (
    <div className="border-t sm:border-t-0 sm:ltr:border-l sm:rtl:border-r sm:min-w-[320px] sm:max-w-[320px] flex flex-col gap-4 pt-3 sm:pt-0 sm:ps-3">
      <div className="flex flex-row gap-4 items-center">
        <button onClick={onClose}>
          <Icon icon="chevron-right" />
          <span className="sr-only">{t('common:close')}</span>
        </button>
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
