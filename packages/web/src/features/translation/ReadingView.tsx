import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import {
  Fragment,
  MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useFloating, autoUpdate } from '@floating-ui/react-dom';
import {
  GetLanguageVerseRangeResponseBody,
  ReadingWord,
} from '@translation/api-types';
import { createPortal } from 'react-dom';
import { bookName } from './verse-utils';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';

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

function useInfiniteScroll(languageCode: string) {
  const {
    isLoading,
    fetchPreviousPage,
    fetchNextPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    data,
  } = useInfiniteQuery({
    queryKey: ['reading', languageCode],
    queryFn({ queryKey, pageParam = { start: '20001001' } }) {
      return apiClient.languages.read(queryKey[1], pageParam);
    },
    getNextPageParam: (page) => (page.next ? { start: page.next } : undefined),
    getPreviousPageParam: (page) =>
      page.prev ? { end: page.prev } : undefined,
  });

  const chapters = data?.pages.flatMap((page) => page.data) ?? [];

  const root = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: chapters.length,
    getScrollElement: () => root.current,
    getItemKey: (index: number) =>
      `virt-${chapters[index]?.book}-${chapters[index]?.chapter}`,
    estimateSize: () => 100,
    overscan: 5,
  });

  const { scrollOffset, scrollToOffset, range, getVirtualItems } = virtualizer;
  const virtualItems = getVirtualItems();

  const firstPage = useRef<GetLanguageVerseRangeResponseBody>();
  useEffect(() => {
    const newFirstPage = data?.pages[0];
    if (newFirstPage && firstPage.current !== newFirstPage) {
      console.log('page loaded');
    }
    firstPage.current = newFirstPage;
  }, [data, getVirtualItems, scrollOffset, scrollToOffset]);

  useEffect(() => {
    const items = getVirtualItems();
    const lastItem = items.at(-1);
    const firstItem = items[0];

    if (
      lastItem &&
      lastItem.index >= chapters.length - 1 &&
      hasNextPage &&
      !isFetching
    ) {
      fetchNextPage();
    }
    if (firstItem && firstItem.index < 1 && hasPreviousPage && !isFetching) {
      fetchPreviousPage();
    }
  }, [
    range?.startIndex,
    range?.endIndex,
    getVirtualItems,
    fetchNextPage,
    fetchPreviousPage,
    chapters.length,
    hasNextPage,
    isFetching,
    hasPreviousPage,
  ]);

  return { root, virtualizer, virtualItems, isLoading, chapters };
}

export default function ReadingView() {
  const { t } = useTranslation(['bible']);
  const languageCode = 'spa';

  const popover = usePopover();

  const infiniteScroll = useInfiniteScroll(languageCode);

  return (
    <div
      ref={infiniteScroll.root}
      className="absolute w-full h-full flex flex-col flex-grow overflow-y-auto pb-8"
    >
      {(() => {
        if (infiniteScroll.isLoading) {
          return (
            <div className="flex items-center justify-center flex-grow">
              <LoadingSpinner />
            </div>
          );
        } else {
          return (
            <div>
              <div
                className="font-mixed p-4 mx-auto max-w-[960px] leading-loose text-right"
                dir="rtl"
              >
                <div
                  style={{
                    height: `${infiniteScroll.virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${
                        infiniteScroll.virtualItems[0]?.start ?? 0
                      }px)`,
                    }}
                  >
                    {infiniteScroll.virtualItems.map((item, i) => {
                      const chapter = infiniteScroll.chapters[item.index];
                      if (!chapter) return null;

                      return (
                        <div
                          key={`${chapter.book}-${chapter.chapter}`}
                          ref={infiniteScroll.virtualizer.measureElement}
                          data-index={item.index}
                        >
                          {chapter.chapter === 1 && (
                            <h2 className="text-center font-bold text-3xl mb-4 mt-2">
                              {bookName(chapter.book, t)}
                            </h2>
                          )}
                          <p>
                            <span className="font-sans text-lg">
                              {chapter.chapter}&nbsp;
                            </span>
                            {chapter.verses.map((verse) => (
                              <span key={verse.id}>
                                {verse.words.map((word, i) => {
                                  return (
                                    <Fragment key={word.id}>
                                      {i === 0 && verse.number !== 1 && (
                                        <span className={'font-sans text-xs'}>
                                          {verse.number}&nbsp;
                                        </span>
                                      )}
                                      <span
                                        className="last:me-1"
                                        onClick={(e) =>
                                          popover.onWordClick(e, word)
                                        }
                                        onMouseEnter={(e) =>
                                          popover.onWordMouseEnter(e, word)
                                        }
                                        onMouseLeave={(e) =>
                                          popover.onWordMouseLeave(e)
                                        }
                                      >
                                        {word.text}
                                      </span>
                                      {!word.text.endsWith('־') && ' '}
                                    </Fragment>
                                  );
                                })}
                              </span>
                            ))}
                          </p>
                        </div>
                      );
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
            </div>
          );
        }
      })()}
    </div>
  );
}
