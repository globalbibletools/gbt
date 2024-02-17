import { createBrowserRouter, redirect } from 'react-router-dom';
import translationRoutes from '../features/translation/router';
import languagesRoutes from '../features/languages/router';
import { userPageRoutes, userModalRoutes } from '../features/users/router';
import Layout from './Layout';
import ModalLayout from './ModalLayout';
import ErrorView from './ErrorView';

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
      ...userPageRoutes,
      ...translationRoutes,
      ...languagesRoutes,
    ],
  },
  {
    element: <ModalLayout />,
    errorElement: <ErrorView />,
    children: [...userModalRoutes],
  },
]);

export default router;
