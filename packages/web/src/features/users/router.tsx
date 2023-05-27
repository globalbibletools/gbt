import { RouteObject } from 'react-router-dom';
import InviteUserView from './InviteUserView';
import UsersView, { usersViewLoader } from './UsersView';

const routes: RouteObject[] = [
  {
    path: 'users',
    loader: usersViewLoader,
    element: <UsersView />,
  },
  {
    path: 'users/invite',
    element: <InviteUserView />,
  },
];

export default routes;
