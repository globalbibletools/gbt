import { RouteObject } from 'react-router-dom';
import InviteUserView from './InviteUserView';

const routes: RouteObject[] = [
  {
    path: 'users/invite',
    element: <InviteUserView />,
  },
];

export default routes;
