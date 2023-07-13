import { RouteObject } from 'react-router-dom';
import InviteUserView from './InviteUserView';
import UsersView from './UsersView';
import LoginView from './LoginView';
import AcceptInviteView, { acceptInviteLoader } from './AcceptInviteView';
import { QueryClient } from '@tanstack/query-core';

export default (queryClient: QueryClient): RouteObject[] => [
  {
    path: 'users',
    element: <UsersView />,
  },
  {
    path: 'users/invite',
    element: <InviteUserView />,
  },
  {
    path: 'login',
    element: <LoginView />,
  },
  {
    path: 'invite',
    loader: acceptInviteLoader(queryClient),
    element: <AcceptInviteView />,
  },
];
