import { useQuery } from '@tanstack/react-query';
import { Verse } from '@translation/api-types';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { parseVerseId } from './verse-utils';
import rehypeRaw from 'rehype-raw';

type TranslationSidebarProps = {
  language: string;
  verse: Verse;
  wordIndex: number;
  onClose: () => void;
};

export const TranslationSidebar = ({
  language,
  verse,
  wordIndex,
  onClose,
}: TranslationSidebarProps) => {
  const word = verse.words[wordIndex];
  const { bookId } = parseVerseId(verse.id);
  const isHebrew = bookId < 40;
  const lemmaResourcesQuery = useQuery(
    ['verse-lemma-resources', language, verse.id],
    () => apiClient.verses.findLemmaResources(verse.id)
  );
  const resources = lemmaResourcesQuery.isSuccess
    ? lemmaResourcesQuery.data.data[word.lemmaId]
    : [];
  const lexiconResource = resources.find(({ resource }) =>
    ['BDB', 'LSJ'].includes(resource)
  );
  const lexiconEntry = lexiconResource?.entry ?? '';
  const { t } = useTranslation(['common', 'translate']);
  return (
    <div className="border-t sm:border-t-0 sm:ltr:border-l sm:rtl:border-r max-sm:h-[320px] sm:min-w-[320px] sm:max-w-[320px] flex flex-col gap-4 pt-3 sm:pt-0 sm:ps-3">
      <div className="flex flex-row gap-4 items-center">
        <button onClick={onClose} type="button">
          <Icon icon="chevron-down" className="block sm:hidden" />
          <Icon icon="chevron-right" className="hidden sm:block" />
          <span className="sr-only">{t('common:close')}</span>
        </button>
        <span
          className={isHebrew ? 'font-hebrew text-2xl' : 'font-greek text-xl'}
        >
          {word.text}
        </span>
        <span>{word.lemmaId}</span>
      </div>
      <div className="overflow-y-auto grow">
        {lemmaResourcesQuery.isLoading && (
          <div className="h-full w-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {lemmaResourcesQuery.isSuccess && lexiconEntry && (
          <div>
            <div className="text-lg mb-3 font-bold me-2">
              {lexiconResource?.resource}
            </div>
            <Markdown rehypePlugins={[rehypeRaw]}>{lexiconEntry}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};
