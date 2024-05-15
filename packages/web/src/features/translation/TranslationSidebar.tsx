import { Tab } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { Verse } from '@translation/api-types';
import DOMPurify from 'dompurify';
import { throttle } from 'lodash';
import {
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessControl } from '../../shared/accessControl';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import RichText from '../../shared/components/RichText';
import RichTextInput, {
  RichTextInputRef,
} from '../../shared/components/form/RichTextInput';
import { bdbBookRefNames } from 'data/bdb-book-ref-names';
import { parseVerseId, parseReferenceRange } from './verse-utils';
import { createPortal } from 'react-dom';
import { VersesPreview } from './VersesPreview';

type TranslationSidebarProps = {
  ref?: Ref<TranslationSidebarRef>;
  className: string;
  language: string;
  verse: Verse;
  wordIndex: number;
  showComments: boolean;
  onClose: () => void;
};
export type TranslationSidebarRef = {
  openNotes: () => void;
};

export const TranslationSidebar = forwardRef<
  TranslationSidebarRef,
  TranslationSidebarProps
>(
  (
    { language, verse, wordIndex, showComments, className = '', onClose },
    ref
  ) => {
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
    const canEditNote = userCan('translate', {
      type: 'Language',
      id: language,
    });

    const wordId = useRef('');

    const translatorNotesEditorRef = useRef<RichTextInputRef>(null);

    const [translatorNoteContent, setTranslatorNoteContent] = useState('');
    const [footnoteContent, setFootnoteContent] = useState('');

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
    const bdbCurrentVerseRef = `${
      bdbBookRefNames[bookId - 1]
    } ${chapterNumber}:${verseNumber}`;

    const lexiconEntryRef = useRef<HTMLDivElement>(null);
    const [previewElement, setPreviewElement] = useState<HTMLDivElement | null>(
      null
    );
    const [previewVerseIds, setPreviewVerseIds] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      openNotes: () => {
        setTabIndex(1);
        setTimeout(() => {
          translatorNotesEditorRef.current?.focus();
        }, 0);
      },
    }));

    useEffect(() => {
      const { current } = lexiconEntryRef;
      // Highlight references to the currently selected verse
      current
        ?.querySelectorAll(`a[data-ref="${bdbCurrentVerseRef}"]`)
        .forEach((element) => element.classList.add('bg-yellow-300'));
    }, [bdbCurrentVerseRef, lexiconEntry, t]);

    const openPreview = (anchorElement: HTMLAnchorElement) => {
      const oldPreview = document.querySelector('#ref-preview');
      oldPreview?.remove();

      const reference = anchorElement.getAttribute('data-ref') ?? '';
      setPreviewVerseIds(parseReferenceRange(reference, t));

      const previewElement = document.createElement('div');
      previewElement.id = 'ref-preview';
      previewElement.style.width = 'calc(100% + 32px)';
      previewElement.style.margin = '4px -16px';
      previewElement.style.padding = '8px 16px';
      previewElement.style.backgroundColor = '#ffffff80';
      previewElement.style.float = 'left';
      anchorElement.insertAdjacentElement('afterend', previewElement);
      setPreviewElement(previewElement);
    };

    const [tabIndex, setTabIndex] = useState(0);

    return (
      <div
        className={`
        relative flex flex-col gap-4 flex-shrink-0 shadow rounded-2xl bg-brown-100
        ${className}
      `}
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute w-9 h-9 end-1 top-1 text-red-700 rounded-md focus-visible:outline outline-2 outline-green-300"
        >
          <Icon icon="xmark" />
          <span className="sr-only">{t('common:close')}</span>
        </button>
        <div className="flex items-start p-4 pb-0">
          <div>
            <div className="flex gap-4 items-baseline">
              <span className="font-mixed text-xl">{word.text}</span>
              <span>{word.lemmaId}</span>
            </div>
            <div>{word.grammar}</div>
          </div>
        </div>
        <div className="grow flex flex-col min-h-0">
          <Tab.Group selectedIndex={tabIndex} onChange={setTabIndex}>
            <Tab.List className="flex flex-row">
              <div className="border-b border-blue-800 h-full w-2"></div>
              {tabTitles.map((title) => (
                <>
                  <Tab
                    key={title}
                    className="px-4 py-1 text-blue-800 font-bold rounded-t-lg border border-blue-800 ui-selected:border-b-transparent outline-green-300 focus-visible:outline outline-2"
                  >
                    {t(title)}
                  </Tab>
                  <div className="border-b border-blue-800 h-full w-1"></div>
                </>
              ))}
              <div className="border-b border-blue-800 h-full grow"></div>
            </Tab.List>
            <Tab.Panels className="overflow-y-auto grow px-4 pt-4 mb-4">
              <Tab.Panel unmount={false}>
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
                      className="leading-relaxed text-sm font-mixed"
                      ref={lexiconEntryRef}
                      onClick={(event) => {
                        const target = event.target as HTMLElement;
                        if (
                          target.nodeName === 'A' &&
                          target.classList.contains('ref')
                        ) {
                          openPreview(target as HTMLAnchorElement);
                        }
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(lexiconEntry),
                      }}
                    />
                    {previewElement !== null &&
                      createPortal(
                        <VersesPreview
                          language={language}
                          verseIds={previewVerseIds}
                          onClose={() => {
                            setPreviewVerseIds([]);
                            setPreviewElement(null);
                            previewElement.remove();
                          }}
                        />,
                        previewElement
                      )}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel unmount={false}>
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
                          ref={translatorNotesEditorRef}
                          value={translatorNoteContent}
                          name="translatorNoteContent"
                          onBlur={() => saveTranslatorNote.flush()}
                          onChange={(noteContent) => {
                            setTranslatorNoteContent(noteContent);
                            saveTranslatorNote(noteContent);
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
                        value={footnoteContent}
                        name="footnoteContent"
                        onBlur={() => saveFootnote.flush()}
                        onChange={(noteContent) => {
                          setFootnoteContent(noteContent);
                          saveFootnote(noteContent);
                        }}
                      />
                    ) : (
                      <RichText content={footnoteContent} />
                    )}
                  </div>
                </div>
              </Tab.Panel>
              {showComments && (
                <Tab.Panel unmount={false}>{t('common:coming_soon')}</Tab.Panel>
              )}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    );
  }
);
