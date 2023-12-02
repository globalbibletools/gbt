import { Resource, VerseWord, Verse } from '@translation/api-types';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { Icon } from '../../shared/components/Icon';
import { parseVerseId } from './verse-utils';
import apiClient from '../../shared/apiClient';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

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
    ? lemmaResourcesQuery.data.data[wordIndex]
    : [];
  const strongsResource = resources.find(
    ({ resource }) => resource === 'STRONGS'
  );
  const strongsEntry = strongsResource?.entry ?? '';
  const lexiconResource = resources.find(({ resource }) =>
    ['BDB', 'LSJ'].includes(resource)
  );
  const lexiconEntry = lexiconResource?.entry ?? '';
  const { t } = useTranslation(['common', 'translate']);
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
      <div className="overflow-y-auto grow">
        {lemmaResourcesQuery.isLoading && (
          <div className="h-full w-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {lemmaResourcesQuery.isSuccess && (
          <>
            <div>
              <div className="text-sm font-bold me-2">
                {t('translate:strongs')}
              </div>
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
          </>
        )}
      </div>
    </div>
  );
};
