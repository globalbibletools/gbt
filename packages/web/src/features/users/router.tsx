import { RouteObject } from 'react-router-dom';
import UsersView from './UsersView';
import LoginView from './LoginView';
import AcceptInviteView, { acceptInviteLoader } from './AcceptInviteView';
import queryClient from '../../shared/queryClient';
import { authorize } from '../../shared/accessControl';
import UpdateProfileView from './UpdateProfileView';
import EmailVerificationView from './EmailVerificationView';
import ForgotPasswordView from './ForgotPasswordView';
import ResetPasswordView, { resetPasswordLoader } from './ResetPasswordView';

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
  { path: 'forgot-password', element: <ForgotPasswordView /> },
  {
    path: 'reset-password',
    loader: resetPasswordLoader(queryClient),
    element: <ResetPasswordView />,
  },
];
