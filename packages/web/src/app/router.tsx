import { createBrowserRouter, redirect } from 'react-router-dom';
import translationRoutes from '../features/translation/router';
import {
  languageAdminRoutes,
  languagePageRoutes,
} from '../features/languages/router';
import {
  userPageRoutes,
  userModalRoutes,
  userAdminRoutes,
} from '../features/users/router';
import Layout from './Layout';
import ModalLayout from './ModalLayout';
import ErrorView from './ErrorView';
import AdminView from './AdminView';
import { authorize } from '../shared/accessControl';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorView />,
    children: [
      {
        index: true,
        loader() {
          return redirect('/interlinear');
        },
      },
      {
        path: 'admin',
        element: <AdminView />,
        loader: () => authorize('administer', 'User'),
        children: [...userAdminRoutes, ...languageAdminRoutes],
      },
      ...userPageRoutes,
      ...languagePageRoutes,
      ...translationRoutes,
    ],
  },
  {
    element: <ModalLayout />,
    errorElement: <ErrorView />,
    children: [...userModalRoutes],
  },
]);

export default router;
