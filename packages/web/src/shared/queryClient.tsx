import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();
export default queryClient;

queryClient.setDefaultOptions({
  queries: {
    staleTime: 10 * 60 * 1000, // 10 minutes,
  },
});
