import { RouteObject } from 'react-router-dom';
import InviteUserView from './InviteUserView';
import UsersView from './UsersView';
import LoginView from './LoginView';
import AcceptInviteView, { acceptInviteLoader } from './AcceptInviteView';
import queryClient from '../../shared/queryClient';
import { authorize } from '../../shared/accessControl';
import UpdateProfileView from './UpdateProfileView';

const routes: RouteObject[] = [
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
    path: 'login',
    element: <LoginView />,
  },
  {
    path: 'profile',
    element: <UpdateProfileView />,
  },
  {
    path: 'invite',
    loader: acceptInviteLoader(queryClient),
    element: <AcceptInviteView />,
  },
];

export default routes;
