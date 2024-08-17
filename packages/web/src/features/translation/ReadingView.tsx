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
import { ReadingWord } from '@translation/api-types';
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

function useInfiniteScroll(options: {
  chapters: { book: number; chapter: number }[];
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

  const { fetchNextPage, fetchPreviousPage } = options;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target.id === 'bottom-sentinel') {
            fetchNextPage();
          } else if (entry.target.id === 'top-sentinel') {
            fetchPreviousPage();
          }
        }
      },
      {
        root: root.current,
        threshold: 1,
        rootMargin: '1000px',
      }
    );
    observer.current = obs;
    return () => obs.disconnect();
  }, [fetchNextPage, fetchPreviousPage]);

  const bottomSentinel = useRef<HTMLDivElement>(null);
  const setBottomSentinel = useCallback((el: HTMLDivElement | null) => {
    if (bottomSentinel.current) {
      observer.current?.unobserve(bottomSentinel.current);
    }
    if (el) {
      observer.current?.observe(el);
    }
  }, []);

  const topSentinel = useRef<HTMLDivElement>(null);
  const setTopSentinel = useCallback((el: HTMLDivElement | null) => {
    if (topSentinel.current) {
      observer.current?.unobserve(topSentinel.current);
    }
    if (el) {
      observer.current?.observe(el);
    }
  }, []);

  const virtualizer = useVirtualizer({
    count: options.chapters.length,
    getScrollElement: () => root.current,
    getItemKey: (index: number) =>
      `virt-${options.chapters[index]?.book}-${options.chapters[index]?.chapter}`,
    estimateSize: () => 1000,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return { root, setBottomSentinel, setTopSentinel, virtualizer, virtualItems };
}

export default function ReadingView() {
  const { t } = useTranslation(['bible']);
  const languageCode = 'spa';

  const versesQuery = useInfiniteQuery({
    queryKey: ['reading', languageCode],
    queryFn({ queryKey, pageParam = { start: '02001001' } }) {
      return apiClient.languages.read(queryKey[1], pageParam);
    },
    getNextPageParam: (page) => ({ start: page.next }),
    getPreviousPageParam: (page) => ({ end: page.prev }),
  });

  const popover = usePopover();

  const chapters = versesQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const infiniteScroll = useInfiniteScroll({
    chapters,
    fetchNextPage: versesQuery.fetchNextPage,
    fetchPreviousPage: versesQuery.fetchPreviousPage,
  });

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
            <div>
              <div
                ref={infiniteScroll.root}
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
                    {infiniteScroll.virtualItems.map((item) => {
                      const chapter = chapters[item.index];
                      if (!chapter) return null;

                      return (
                        <div
                          key={`${chapter.book}-${chapter.chapter}`}
                          ref={infiniteScroll.virtualizer.measureElement}
                          data-index={item.index}
                        >
                          {item.index === 0 && (
                            <div
                              id="top-sentinel"
                              ref={infiniteScroll.setTopSentinel}
                              className="h-px"
                            />
                          )}
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
                          {item.index === chapters.length - 1 && (
                            <div
                              id="bottom-sentinel"
                              ref={infiniteScroll.setBottomSentinel}
                              className="h-px"
                            />
                          )}
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
