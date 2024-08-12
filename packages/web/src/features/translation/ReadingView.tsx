import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../../shared/apiClient';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { Fragment } from 'react';

export default function ReadingView() {
  const languageCode = 'eng';

  const versesQuery = useInfiniteQuery({
    queryKey: ['reading', languageCode],
    queryFn({ queryKey, pageParam = '01001001' }) {
      return apiClient.languages.read(queryKey[1], pageParam);
    },
    getNextPageParam: (lastPage) => lastPage.next,
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
            <div
              className="font-mixed p-4 mx-auto max-w-[960px] leading-loose text-right"
              dir="rlt"
            >
              {versesQuery.data?.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.data.map((verse) => (
                    <span key={verse.id}>
                      <span className="font-sans font-bold text-sm pe-2">
                        {verse.number === 1 ? verse.chapter + ':' : ''}
                        {verse.number}
                      </span>{' '}
                      {verse.words.map((word) => (
                        <Fragment key={word.id}>
                          <span>{word.text}</span>{' '}
                        </Fragment>
                      ))}
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
