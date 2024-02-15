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
import { bdbBookRefNames } from 'data/bdb-book-ref-namess';
import { parseVerseId } from './verse-utils';

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

  const notesQuery = useQuery(
    ['verse-translator-notes', language, verse.id],
    () => apiClient.verses.findNotes(verse.id, language)
  );
  const translatorNote = notesQuery.isSuccess
    ? notesQuery.data.data.translatorNotes[word.id]
    : null;

  const footnote = notesQuery.isSuccess
    ? notesQuery.data.data.footnotes[word.id]
    : null;

  const tabTitles = ['translate:lexicon', 'translate:notes'];
  if (showComments) {
    tabTitles.push('translate:comments');
  }

  const userCan = useAccessControl();
  const hasLanguageReadPermissions = userCan('read', {
    type: 'Language',
    id: language,
  });
  const canEditNote = userCan('translate', { type: 'Language', id: language });

  const [translatorNoteContent, setTranslatorNoteContent] = useState('');
  const [footnoteContent, setFootnoteContent] = useState('');
  const wordId = useRef('');
  useEffect(() => {
    if (notesQuery.isSuccess && word.id !== wordId.current) {
      wordId.current = word.id;
      setTranslatorNoteContent(
        notesQuery.data.data.translatorNotes[word.id]?.content ?? ''
      );
      setFootnoteContent(
        notesQuery.data.data.footnotes[word.id]?.content ?? ''
      );
    }
  }, [word.id, notesQuery]);

  const saveTranslatorNote = useMemo(
    () =>
      throttle(
        async (noteContent: string) => {
          await apiClient.words.updateTranslatorNote({
            wordId: word.id,
            language,
            note: noteContent,
          });
          notesQuery.refetch();
        },
        15000,
        { leading: false, trailing: true }
      ),
    [language, notesQuery, word.id]
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
          notesQuery.refetch();
        },
        15000,
        { leading: false, trailing: true }
      ),
    [language, notesQuery, word.id]
  );
  const { bookId, chapterNumber, verseNumber } = parseVerseId(verse.id);
  const isHebrew = bookId < 40;
  const bdbCurrentVerseRef = `${
    bdbBookRefNames[bookId - 1]
  } ${chapterNumber}:${verseNumber}`;

  const lexiconEntryHTML = useMemo(() => {
    if (isHebrew) {
      const modifiedLexiconEntryElement = document.createElement('div');
      modifiedLexiconEntryElement.innerHTML = DOMPurify.sanitize(lexiconEntry);
      // Remove the href on verse references (since these hrefs don't point to anywhere in our app)
      modifiedLexiconEntryElement
        .querySelectorAll('a')
        .forEach((element) => element.removeAttribute('href'));
      // Highlight references to the currently selected verse
      modifiedLexiconEntryElement
        .querySelectorAll(`a[data-ref="${bdbCurrentVerseRef}"]`)
        .forEach((element) => element.classList.add('bg-yellow-300'));
      return modifiedLexiconEntryElement.innerHTML ?? '';
    } else return DOMPurify.sanitize(lexiconEntry);
  }, [isHebrew, bdbCurrentVerseRef, lexiconEntry]);

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
                    dangerouslySetInnerHTML={{ __html: lexiconEntryHTML }}
                  />
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel>
              <div className="flex flex-col gap-6 pb-2">
                {hasLanguageReadPermissions && (
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
                        name="translatorNoteContent"
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
                )}
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold">{t('translate:footnotes')}</h2>
                  {hasLanguageReadPermissions && footnote?.authorName && (
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
              </div>
            </Tab.Panel>
            {showComments && <Tab.Panel>{t('common:coming_soon')}</Tab.Panel>}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};
