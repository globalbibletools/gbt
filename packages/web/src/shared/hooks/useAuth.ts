import { useQuery } from '@tanstack/react-query';
import { GetSessionResponse, SystemRole } from '@translation/api-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

export interface UseAuthOptions {
  authenticated?: boolean;
  systemRoles?: SystemRole[];
}

export type UseAuthResult =
  | {
      status: 'authenticated';
      user: Required<GetSessionResponse>['user'];
    }
  | { status: 'unauthenticated' | 'loading'; user?: undefined };

export default function useAuth({
  authenticated,
  systemRoles,
}: UseAuthOptions = {}): UseAuthResult {
  const navigate = useNavigate();
  const { data, status } = useQuery(['session'], async () =>
    apiClient.getSession()
  );

  useEffect(() => {
    if (status === 'success') {
      const { user } = data;
      if (user) {
        // A page is off-limits for users that don't have one of the accepted
        // roles.
        if (
          authenticated === false ||
          (systemRoles &&
            !systemRoles.some((role) => user.systemRoles.includes(role)))
        ) {
          // I'm not sure why we need a timeout, but without it, we get a recursion bug from react updates.
          setTimeout(() => {
            navigate('/', { replace: true });
          });
        }
      } else {
        // The user is not authenticated, so a page is off limits when it
        // requires authentication and/or a specific system role.
        if (authenticated === true || (systemRoles?.length ?? 0) > 0) {
          setTimeout(() => {
            navigate('/', { replace: true });
          });
        }
      }
    }
  }, [navigate, authenticated, systemRoles, data, status]);

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
