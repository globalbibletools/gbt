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
        loader: ({ request }) => {
          return authorize('administer', 'User', async () => {
            const url = new URL(request.url);
            if (url.pathname === '/admin') {
              // Default to the languages section.
              return redirect('./languages');
            }
            return null;
          });
        },
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
