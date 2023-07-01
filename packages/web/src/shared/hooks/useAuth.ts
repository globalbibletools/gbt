import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetSessionResponse, SystemRole } from '@translation/api-types';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

export type UseAuthOptions =
  | {
      requireAuthenticated: true;
    }
  | {
      requireUnauthenticated: true;
    }
  | {
      requireRole: SystemRole[];
    };

export type UseAuthResult = { refreshAuth(): void } & (
  | {
      status: 'authenticated';
      user: Required<GetSessionResponse>['user'];
    }
  | { status: 'unauthenticated' | 'loading'; user?: undefined }
);

/**
 * This will return the authentication `status` of the session, and if authenticated, the profile of the user.
 *
 * Additionally, you can pass one of the following to restrict the view to certain users:
 * - `requireAuthenticated = true`: The user must be authenticated to access the page.
 * This is most useful in situations where you don't care which roles a user has, but they must be authenticated.
 * - `requireUnauthenticated = true`: The user must be not be authenticated to access the page.
 * This is most useful for views like login where authenticated users don't need to access.
 * - `requireRole`: If the user has at least one of these roles, they can access the page.
 * This assumes the user is authenticated.
 */
export default function useAuth(options?: UseAuthOptions): UseAuthResult {
  const navigate = useNavigate();
  const { data, status } = useQuery(['session'], async () =>
    apiClient.auth.session()
  );

  const queryClient = useQueryClient();
  const refreshAuth = useCallback(() => {
    queryClient.invalidateQueries(['session']);
  }, [queryClient]);

  useEffect(() => {
    if (status === 'success' && options) {
      const { user } = data;
      let canAccess = true;

      if ('requireRole' in options) {
        canAccess =
          !!user &&
          options.requireRole.some((role) => user.systemRoles.includes(role));
      } else if ('requireAuthenticated' in options) {
        canAccess = !!user;
      } else if ('requireUnauthenticated' in options) {
        canAccess = !user;
      }

      if (!canAccess) {
        setTimeout(() => {
          navigate('/', { replace: true });
        });
      }
    }
  }, [navigate, options, data, status]);

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
