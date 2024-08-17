import { useQuery } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { Fragment, MouseEvent, useEffect, useState } from 'react';
import { useFloating, autoUpdate } from '@floating-ui/react-dom';
import { ReadingWord } from '@translation/api-types';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { ReadingToolbar } from './ReadingToolbar';

function usePopover(onClose?: () => void) {
  const [selectedWord, selectWord] = useState<{
    word: ReadingWord;
    mode: 'hover' | 'click';
  }>();

  const { refs, elements, floatingStyles } = useFloating({
    strategy: 'fixed',
    placement: 'top',
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!elements.reference) return;

    function handler(e: Event) {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const popover = refs.floating.current;
      const reference =
        refs.reference.current instanceof HTMLElement
          ? refs.reference.current
          : null;
      if (
        target !== popover &&
        !popover?.contains(target) &&
        target !== reference &&
        !popover?.contains(reference)
      ) {
        selectWord(undefined);
        refs.setReference(null);
      }
    }

    // This prevents the click event from attaching to soon and immediately closing the popover.
    setTimeout(() => {
      window.addEventListener('click', handler);
    });
    return () => {
      setTimeout(() => window.removeEventListener('click', handler));
    };
  }, [refs, elements.reference, onClose]);

  function onWordClick(e: MouseEvent<HTMLSpanElement>, word: ReadingWord) {
    refs.setReference(e.currentTarget);
    selectWord({ word, mode: 'click' });
  }
  function onWordMouseEnter(e: MouseEvent<HTMLSpanElement>, word: ReadingWord) {
    refs.setReference(e.currentTarget);
    selectWord({ word, mode: 'hover' });
  }
  function onWordMouseLeave(e: MouseEvent<HTMLSpanElement>) {
    refs.setReference(e.currentTarget);
    if (selectedWord?.mode === 'hover') {
      selectWord(undefined);
    }
  }

  return {
    refs,
    floatingStyles,
    onWordClick,
    onWordMouseEnter,
    onWordMouseLeave,
    selectedWord,
  };
}

export default function ReadingView() {
  const [searchParams, setSearchParams] = useSearchParams();

  const languageCode = searchParams.get('lang') ?? 'eng';
  const chapterId = searchParams.get('chapter') ?? '01001';

  const { data, isLoading } = useQuery({
    queryKey: ['read-chapter', languageCode, chapterId],
    queryFn: async ({ queryKey }) => {
      return apiClient.languages.readChapter(queryKey[1], queryKey[2]);
    },
  });

  const languagesQuery = useQuery(['languages'], () =>
    apiClient.languages.findAll()
  );

  const popover = usePopover();

  return (
    <div className="absolute w-full h-full flex flex-col flex-grow">
      <ReadingToolbar
        verseId={chapterId + '001'}
        languageCode={languageCode}
        languages={
          languagesQuery.data?.data.map(({ code, name }) => ({
            code,
            name,
          })) ?? []
        }
        onLanguageChange={(language) => {
          searchParams.set('lang', language);
          setSearchParams(searchParams);
        }}
        onVerseChange={(verseId) => {
          const newChapterId = verseId.slice(0, 5);
          if (newChapterId !== chapterId) {
            searchParams.set('chapter', newChapterId);
            setSearchParams(searchParams);
          }
        }}
      />
      {(() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center flex-grow">
              <LoadingSpinner />
            </div>
          );
        } else {
          return (
            <>
              <div className="flex flex-col flex-grow w-full min-h-0 lg:flex-row">
                <div className="flex flex-col max-h-full min-h-0 gap-8 overflow-auto grow pt-8 pb-10 px-6">
                  <div
                    className="font-mixed p-4 mx-auto max-w-[960px] leading-loose text-right"
                    dir="rtl"
                  >
                    {data?.data.verses.flatMap((verse) => {
                      const words = verse.words.map((word, i) => (
                        <Fragment key={word.id}>
                          <span
                            className={
                              i === verse.words.length - 1 ? 'me-1' : ''
                            }
                            onClick={(e) => popover.onWordClick(e, word)}
                            onMouseEnter={(e) =>
                              popover.onWordMouseEnter(e, word)
                            }
                            onMouseLeave={(e) => popover.onWordMouseLeave(e)}
                          >
                            {word.text}
                          </span>
                          {!word.text.endsWith('־') && ' '}
                        </Fragment>
                      ));
                      words.unshift(
                        <span className={'font-sans text-xs'}>
                          {verse.number}&nbsp;
                        </span>
                      );
                      return words;
                    })}
                  </div>
                </div>
              </div>
              {popover.selectedWord &&
                createPortal(
                  <div
                    className="bg-brown-100 dark:bg-gray-700 rounded-sm border border-gray-300 dark:border-gray-600 shadow-sm dark:shadow-none px-1 font-bold"
                    ref={popover.refs.setFloating}
                    style={popover.floatingStyles}
                  >
                    {popover.selectedWord.word.gloss ?? '-'}
                  </div>,
                  document.body
                )}
            </>
          );
        }
      })()}
    </div>
  );
}
