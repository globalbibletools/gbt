import { RouteObject } from 'react-router-dom';
import InviteUserView from './InviteUserView';
import UsersView from './UsersView';
import LoginView from './LoginView';
import AcceptInviteView, { acceptInviteLoader } from './AcceptInviteView';
import queryClient from '../../shared/queryClient';
import { authorize } from '../../shared/accessControl';
import UpdateProfileView from './UpdateProfileView';
import EmailVerificationView from './EmailVerificationView';

export const userPageRoutes: RouteObject[] = [
  {
    path: 'users',
    loader: () => authorize('administer', 'User'),
    element: <UsersView />,
  },
  {
    path: 'users/invite',
    loader: () => authorize('create', 'User'),
    element: <InviteUserView />,
  },
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
