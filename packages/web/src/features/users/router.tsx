import { RouteObject } from 'react-router-dom';
import InviteUserView from './InviteUserView';
import UsersView from './UsersView';

const routes: RouteObject[] = [
  {
    path: 'users',
    element: <UsersView />,
  },
  {
    path: 'users/invite',
    element: <InviteUserView />,
  },
];

export default routes;
