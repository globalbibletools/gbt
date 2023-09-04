import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetSessionResponse } from '@translation/api-types';
import { useCallback } from 'react';
import apiClient from '../apiClient';

export type UseAuthResult = { refreshAuth(): void } & (
  | {
      status: 'authenticated';
      user: Required<GetSessionResponse>['user'];
    }
  | { status: 'unauthenticated' | 'loading'; user?: undefined }
);

export const sessionQuery = {
  queryKey: ['session'],
  queryFn: () => apiClient.auth.session(),
};

/** Get the status and data in the current session. */
export default function useAuth(): UseAuthResult {
  const { data, status } = useQuery({
    ...sessionQuery,
    refetchOnMount: true,
  });

  const queryClient = useQueryClient();
  const refreshAuth = useCallback(() => {
    queryClient.invalidateQueries(['session']);
  }, [queryClient]);

  if (status === 'success') {
    const { user } = data;
    if (user) {
      return {
        refreshAuth: refreshAuth,
        status: 'authenticated',
        user,
      };
    } else {
      return { refreshAuth: refreshAuth, status: 'unauthenticated' };
    }
  } else {
    return {
      refreshAuth,
      status: 'loading',
    };
  }
}
