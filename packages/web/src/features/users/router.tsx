import { RouteObject } from 'react-router-dom';
import InviteUserView from './InviteUserView';
import UsersView from './UsersView';
import LoginView from './LoginView';

const routes: RouteObject[] = [
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
];

export default routes;
