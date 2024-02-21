import { RouteObject } from 'react-router-dom';
import UsersView from './UsersView';
import LoginView from './LoginView';
import AcceptInviteView, { acceptInviteLoader } from './AcceptInviteView';
import queryClient from '../../shared/queryClient';
import { authorize } from '../../shared/accessControl';
import UpdateProfileView from './UpdateProfileView';
import EmailVerificationView from './EmailVerificationView';

export const userAdminRoutes: RouteObject[] = [
  {
    path: 'users',
    loader: () => authorize('administer', 'User'),
    element: <UsersView />,
  },
];

export const userPageRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <UpdateProfileView />,
  },
];

export const userModalRoutes: RouteObject[] = [
  {
    path: 'login',
    element: <LoginView />,
  },
  {
    path: 'invite',
    loader: acceptInviteLoader(queryClient),
    element: <AcceptInviteView />,
  },
  {
    path: 'verify-email',
    element: <EmailVerificationView />,
  },
];
