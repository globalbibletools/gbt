import { Tab } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { Verse } from '@translation/api-types';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import RichText from '../../shared/components/RichText';
import Button from '../../shared/components/actions/Button';
import RichTextInput from '../../shared/components/form/RichTextInput';

type TranslationSidebarProps = {
  language: string;
  verse: Verse;
  wordIndex: number;
  showComments: boolean;
  onClose: () => void;
};

export const TranslationSidebar = ({
  language,
  verse,
  wordIndex,
  showComments,
  onClose,
}: TranslationSidebarProps) => {
  const { t } = useTranslation(['common', 'translate']);

  const word = verse.words[wordIndex];
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

  const translatorNotesQuery = useQuery(
    ['verse-translator-notes', language, verse.id],
    () => apiClient.verses.findTranslatorNotes(verse.id, language)
  );
  const translatorNote = translatorNotesQuery.isSuccess
    ? translatorNotesQuery.data.data[word.id]
    : null;

  const tabTitles = ['translate:lexicon', 'translate:notes'];
  if (showComments) {
    tabTitles.push('translate:comments');
  }

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteAuthorName, setNoteAuthorName] = useState('');
  const [noteTimestampString, setNoteTimestampString] = useState('');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    setNoteAuthorName(translatorNote?.authorName ?? '');
    setNoteTimestampString(
      translatorNote?.timestamp
        ? new Date(translatorNote.timestamp).toLocaleString()
        : ''
    );
    setNoteContent(translatorNote?.content ?? '');
  }, [translatorNote]);

  const saveNote = async () => {
    setIsEditingNote(false);
    await apiClient.words.updateTranslatorNote({
      wordId: word.id,
      language,
      note: noteContent,
    });
    translatorNotesQuery.refetch();
  };

  return (
    <div
      className="
        border-t h-[320px] flex flex-col gap-4 pt-3 flex-shrink-0 border-slate-400
        md:border-t-0 md:ltr:border-l md:rtl:border-r md:h-auto md:w-1/3 md:min-w-[320px] md:max-w-[480px] md:pt-0 md:ps-3
      "
    >
      <div className="flex items-start">
        <button onClick={onClose} type="button" className="w-6 h-7">
          <Icon icon="chevron-down" className="block md:hidden" />
          <Icon
            icon="chevron-right"
            className="hidden md:block rtl:rotate-180"
          />
          <span className="sr-only">{t('common:close')}</span>
        </button>
        <div>
          <div className="flex gap-4 items-baseline">
            <span className="font-mixed text-xl">{word.text}</span>
            <span>{word.lemmaId}</span>
          </div>
          <div>{word.grammar}</div>
        </div>
      </div>
      <div className="grow flex flex-col min-h-0">
        <Tab.Group>
          <Tab.List className="flex flex-row md:-ms-3 -mx-4">
            <div className="border-b border-slate-400 h-full w-4"></div>
            {tabTitles.map((title) => (
              <>
                <Tab
                  key={title}
                  className="px-4 py-1 rounded-t-lg border border-slate-400 ui-selected:border-b-transparent focus:outline-blue-600 focus:outline focus:outline-2"
                >
                  {t(title)}
                </Tab>
                <div className="border-b border-slate-400 h-full w-1"></div>
              </>
            ))}
            <div className="border-b border-slate-400 h-full grow"></div>
          </Tab.List>
          <Tab.Panels className="overflow-y-auto grow p-3 md:-ms-3 -mx-4">
            <Tab.Panel>
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
                  <div
                    className="leading-7 font-mixed"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(lexiconEntry),
                    }}
                  />
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel>
              {/* TODO: add author and timestamp */}
              <div className="flex flex-col gap-2 pb-2">
                <div className="flex flex-row justify-between">
                  <span className="font-bold">{t('translate:author')}</span>
                  <span>{noteAuthorName}</span>
                </div>
                <div className="flex flex-row justify-between">
                  <span className="font-bold">
                    {t('translate:last_updated')}
                  </span>
                  <span>{noteTimestampString}</span>
                </div>
                <div className="flex flex-row justify-end gap-1">
                  {isEditingNote ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsEditingNote(false);
                          setNoteContent(translatorNote?.content ?? '');
                        }}
                      >
                        {t('common:cancel')}
                      </Button>
                      <Button onClick={saveNote}>{t('common:confirm')}</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditingNote(true)}>
                      {t('common:edit')}
                    </Button>
                  )}
                </div>
                {isEditingNote ? (
                  <RichTextInput
                    name="noteContent"
                    value={noteContent}
                    onBlur={async (e) => setNoteContent(e.target.value)}
                  />
                ) : (
                  <RichText content={noteContent} />
                )}
              </div>
            </Tab.Panel>
            {showComments && <Tab.Panel>{t('common:coming_soon')}</Tab.Panel>}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};
