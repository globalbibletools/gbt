import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();
export default queryClient;

queryClient.setDefaultOptions({
  queries: {
    // This stale time prevents refetches for 10 minutes after data is loaded.
    // If a query is invalidated, it will still be refetched,
    // but this prevents continually refetching queries that are used in multiple places like the user session.
    staleTime: 10 * 60 * 1000, // 10 minutes,
    // We always refetch on mount so that during navigation after changes, data is refreshed.
    // This reduces the need to invalid individual queries at the expense of extra requests on navigation.
    refetchOnMount: 'always',
  },
});
