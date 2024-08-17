import { useQuery } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { Fragment, MouseEvent, useEffect, useState } from 'react';
import { useFloating, autoUpdate } from '@floating-ui/react-dom';
import { ReadingWord } from '@translation/api-types';
import { createPortal } from 'react-dom';
import { bookName } from './verse-utils';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['bible']);
  const languageCode = 'spa';
  const chapterId = '01001';
  const bookId = parseInt(chapterId.slice(0, 2)) || 1;
  const chapterNumber = parseInt(chapterId.slice(2, 5)) || 1;

  const popover = usePopover();

  const { data, isLoading } = useQuery({
    queryKey: ['read-chapter', languageCode, chapterId],
    queryFn: async ({ queryKey }) => {
      return apiClient.languages.readChapter(queryKey[1], queryKey[2]);
    },
  });

  return (
    <div className="absolute w-full h-full flex flex-col flex-grow overflow-y-auto pb-8">
      {(() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center flex-grow">
              <LoadingSpinner />
            </div>
          );
        } else {
          return (
            <div>
              <h2 className="text-center font-bold text-3xl mb-4 mt-2">
                {bookName(bookId, t)} {chapterNumber}
              </h2>
              <div
                className="font-mixed p-4 mx-auto max-w-[960px] leading-loose text-right"
                dir="rtl"
              >
                {data?.data.verses.flatMap((verse) =>
                  verse.words.map((word) => {
                    return (
                      <Fragment key={word.id}>
                        <span className={'font-sans text-xs'}>
                          {verse.number}&nbsp;
                        </span>
                        <span
                          className="last:me-1"
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
                    );
                  })
                )}
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
            </div>
          );
        }
      })()}
    </div>
  );
}
