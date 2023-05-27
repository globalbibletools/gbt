import { useQuery } from '@tanstack/react-query';
import { GetSessionResponse } from '@translation/api-types';
import apiClient from '../apiClient';

export type UseSessionResponse =
  | {
      status: 'authenticated';
      user: Required<GetSessionResponse>['user'];
    }
  | { status: 'unauthenticated' | 'loading'; user?: undefined };

export default function useSession(): UseSessionResponse {
  const { data, status } = useQuery(['session'], async () =>
    apiClient.getSession()
  );

  if (status === 'success') {
    const { user } = data;
    if (user) {
      return {
        status: 'authenticated',
        user,
      };
    } else {
      return { status: 'unauthenticated' };
    }
  } else {
    return {
      status: 'loading',
    };
  }
}
