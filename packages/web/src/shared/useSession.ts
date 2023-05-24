import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export type UseSessionResponse =
  | {
      status: 'authenticated';
      user: {
        email?: string;
        name?: string;
      };
    }
  | { status: 'unauthenticated' | 'loading' };

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
