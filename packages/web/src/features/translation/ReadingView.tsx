import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import {
  Fragment,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  enable: boolean;
  fetchNextPage: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const bottomSentinel = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

  const { fetchNextPage } = options;

  useEffect(() => {
    observer.current = new IntersectionObserver(
      ([entry]) => {
        console.log(entry.isIntersecting);
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: root.current,
        threshold: 1,
        rootMargin: '1000px',
      }
    );
  }, [fetchNextPage]);

  useEffect(() => {
    const sentinel = bottomSentinel.current;
    const obs = observer.current;
    if (options.enable && sentinel && obs) {
      obs.observe(sentinel);
      return () => obs.unobserve(sentinel);
    }
  }, [options.enable, observer]);

  return { root, bottomSentinel };
}

export default function ReadingView() {
  const { t } = useTranslation(['bible']);
  const languageCode = 'spa';

  const versesQuery = useInfiniteQuery({
    queryKey: ['reading', languageCode],
    queryFn({ queryKey, pageParam = '01001001' }) {
      return apiClient.languages.read(queryKey[1], pageParam);
    },
    getNextPageParam: (lastPage) => lastPage.next,
  });

  const popover = usePopover();

  const infiniteScroll = useInfiniteScroll({
    enable: !versesQuery.isLoading,
    fetchNextPage: versesQuery.fetchNextPage,
  });

  return (
    <div
      ref={infiniteScroll.root}
      className="absolute w-full h-full flex flex-col flex-grow overflow-y-auto pb-8"
    >
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
                className="font-mixed p-4 mx-auto max-w-[960px] leading-loose text-right"
                dir="rtl"
              >
                {versesQuery.data?.pages.map((page, i) => (
                  <Fragment key={i}>
                    {page.data.map((chapter) => (
                      <Fragment key={`${chapter.book}-${chapter.chapter}`}>
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
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
              </div>
              {versesQuery.hasNextPage && (
                <div ref={infiniteScroll.bottomSentinel} />
              )}
              <div>
                {versesQuery.isFetching && versesQuery.isFetchingNextPage
                  ? 'Fetching...'
                  : null}
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
