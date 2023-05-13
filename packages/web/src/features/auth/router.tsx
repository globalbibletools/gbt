import { RouteObject } from 'react-router-dom';
import LoginErrorView from './LoginErrorView';
import LoginView, { loginViewLoader } from './LoginView';
import LogoutView from './LogoutView';
import VerifyLoginView from './VerifyLoginView';

const routes: RouteObject[] = [
  {
    path: 'auth/login',
    loader: loginViewLoader,
    element: <LoginView />,
  },
  {
    path: 'auth/logout',
    element: <LogoutView />,
  },
  {
    path: 'auth/verify-login',
    element: <VerifyLoginView />,
  },
  {
    path: 'auth/error',
    element: <LoginErrorView />,
  },
];

export default routes;
