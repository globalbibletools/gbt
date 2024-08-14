import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { Fragment, MouseEvent, useEffect, useRef, useState } from 'react';
import { useFloating, autoUpdate } from '@floating-ui/react-dom';
import { ReadingWord } from '@translation/api-types';
import { createPortal } from 'react-dom';

export default function ReadingView() {
  const languageCode = 'spa';

  const versesQuery = useInfiniteQuery({
    queryKey: ['reading', languageCode],
    queryFn({ queryKey, pageParam = '01001001' }) {
      return apiClient.languages.read(queryKey[1], pageParam);
    },
    getNextPageParam: (lastPage) => lastPage.next,
  });

  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    whileElementsMounted: autoUpdate,
  });
  const [selectedWord, selectWord] = useState<{
    word: ReadingWord;
    mode: 'hover' | 'click';
  }>();
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

  useEffect(() => {
    if (!selectedWord) return;

    function handler(e: Event) {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const popover = refs.floating.current;
      if (
        popover &&
        target &&
        target !== popover &&
        !popover.contains(target)
      ) {
        selectWord(undefined);
        refs.setReference(null);
      }
    }

    // This prevents the click event from attaching to soon and immediately closing the popover.
    setTimeout(() => {
      window.addEventListener('click', handler);
    });
    return () => window.removeEventListener('click', handler);
  }, [refs, selectedWord]);

  return (
    <div className="absolute w-full h-full flex flex-col flex-grow overflow-y-auto pb-8">
      {(() => {
        if (versesQuery.status === 'loading') {
          return (
            <div className="flex items-center justify-center flex-grow">
              <LoadingSpinner />
            </div>
          );
        } else {
          return (
            <div
              className="font-mixed p-4 mx-auto max-w-[960px] leading-loose text-right"
              dir="rtl"
            >
              {selectedWord &&
                createPortal(
                  <div
                    className="bg-brown-100 dark:bg-gray-700 rounded-sm border border-gray-300 dark:border-gray-600 shadow-sm dark:shadow-none px-1 font-bold"
                    ref={refs.setFloating}
                    style={floatingStyles}
                  >
                    {selectedWord.word.gloss ?? '-'}
                  </div>,
                  document.body
                )}
              {versesQuery.data?.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.data.map((verse) => (
                    <span key={verse.id}>
                      {verse.words.map((word, i) => {
                        if (i === 0) {
                          return (
                            <Fragment key={word.id}>
                              <span className="font-sans text-xs">
                                {verse.number === 1 ? verse.chapter + ':' : ''}
                                {verse.number}&nbsp;
                              </span>
                              <span
                                onClick={(e) => onWordClick(e, word)}
                                onMouseEnter={(e) => onWordMouseEnter(e, word)}
                                onMouseLeave={(e) => onWordMouseLeave(e)}
                              >
                                {word.text}
                              </span>
                              {!word.text.endsWith('־') && ' '}
                            </Fragment>
                          );
                        } else {
                          return (
                            <Fragment key={word.id}>
                              <span
                                className="last:me-1"
                                onClick={(e) => onWordClick(e, word)}
                                onMouseEnter={(e) => onWordMouseEnter(e, word)}
                                onMouseLeave={(e) => onWordMouseLeave(e)}
                              >
                                {word.text}
                              </span>
                              {!word.text.endsWith('־') && ' '}
                            </Fragment>
                          );
                        }
                      })}
                    </span>
                  ))}
                </Fragment>
              ))}
              <div>
                <button
                  onClick={() => versesQuery.fetchNextPage()}
                  disabled={
                    !versesQuery.hasNextPage || versesQuery.isFetchingNextPage
                  }
                >
                  {versesQuery.isFetchingNextPage
                    ? 'Loading more...'
                    : versesQuery.hasNextPage
                    ? 'Load More'
                    : 'Nothing more to load'}
                </button>
              </div>
              <div>
                {versesQuery.isFetching && !versesQuery.isFetchingNextPage
                  ? 'Fetching...'
                  : null}
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}
