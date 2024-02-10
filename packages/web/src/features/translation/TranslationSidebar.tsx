import { Tab } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { Verse } from '@translation/api-types';
import DOMPurify from 'dompurify';
import { throttle } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessControl } from '../../shared/accessControl';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import RichText from '../../shared/components/RichText';
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

  const footnotesQuery = useQuery(
    ['verse-footnotes', language, verse.id],
    async () => {
      const footnotes = await apiClient.verses.findFootnotes(
        verse.id,
        language
      );
      return footnotes;
    }
  );
  const footnote = footnotesQuery.isSuccess
    ? footnotesQuery.data.data[word.id]
    : null;

  const tabTitles = ['translate:lexicon', 'translate:notes'];
  if (showComments) {
    tabTitles.push('translate:comments');
  }

  const userCan = useAccessControl();
  const canViewNote = userCan('read', { type: 'Language', id: language });
  const canEditNote = userCan('translate', { type: 'Language', id: language });

  const [translatorNoteContent, setTranslatorNoteContent] = useState('');
  const [footnoteContent, setFootnoteContent] = useState('');
  const wordId = useRef('');
  useEffect(() => {
    if (
      translatorNotesQuery.isSuccess &&
      footnotesQuery.isSuccess &&
      word.id !== wordId.current
    ) {
      wordId.current = word.id;
      setTranslatorNoteContent(
        translatorNotesQuery.data.data[word.id]?.content ?? ''
      );
      setFootnoteContent(footnotesQuery.data.data[word.id]?.content ?? '');
    }
  }, [word.id, translatorNotesQuery, footnotesQuery]);

  const saveTranslatorNote = useMemo(
    () =>
      throttle(
        async (noteContent: string) => {
          await apiClient.words.updateTranslatorNote({
            wordId: word.id,
            language,
            note: noteContent,
          });
          translatorNotesQuery.refetch();
        },
        15000,
        { leading: false, trailing: true }
      ),
    [language, translatorNotesQuery, word.id]
  );

  const saveFootnote = useMemo(
    () =>
      throttle(
        async (noteContent: string) => {
          await apiClient.words.updateFootnote({
            wordId: word.id,
            language,
            note: noteContent,
          });
          footnotesQuery.refetch();
        },
        15000,
        { leading: false, trailing: true }
      ),
    [language, footnotesQuery, word.id]
  );

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
              <div className="flex flex-col gap-6 pb-2">
                {canViewNote && (
                  <>
                    <div className="flex flex-col gap-2">
                      <h2 className="font-bold">
                        {t('translate:translator_notes')}
                      </h2>
                      {translatorNote?.authorName && (
                        <span className="italic">
                          {t('translate:note_description', {
                            timestamp: translatorNote?.timestamp
                              ? new Date(
                                  translatorNote?.timestamp
                                ).toLocaleString()
                              : '',
                            authorName: translatorNote?.authorName ?? '',
                          })}
                        </span>
                      )}
                      {canEditNote ? (
                        <RichTextInput
                          key={`translatorNote--${word.id}`}
                          name="translator"
                          value={translatorNoteContent}
                          onBlur={async (e) => {
                            saveTranslatorNote(e.target.value);
                            saveTranslatorNote.flush();
                          }}
                          onChange={async (e) => {
                            saveTranslatorNote(e.target.value);
                          }}
                        />
                      ) : (
                        <RichText content={translatorNoteContent} />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="font-bold">{t('translate:footnotes')}</h2>
                      {footnote?.authorName && (
                        <span className="italic">
                          {t('translate:note_description', {
                            timestamp: footnote?.timestamp
                              ? new Date(footnote?.timestamp).toLocaleString()
                              : '',
                            authorName: footnote?.authorName ?? '',
                          })}
                        </span>
                      )}
                      {canEditNote ? (
                        <RichTextInput
                          key={`footnote--${word.id}`}
                          name="footnoteContent"
                          value={footnoteContent}
                          onBlur={async (e) => {
                            saveFootnote(e.target.value);
                            saveFootnote.flush();
                          }}
                          onChange={async (e) => {
                            saveFootnote(e.target.value);
                          }}
                        />
                      ) : (
                        <RichText content={footnoteContent} />
                      )}
                    </div>
                  </>
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
