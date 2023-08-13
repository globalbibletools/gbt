import { createBrowserRouter } from 'react-router-dom';
import translationRoutes from '../features/translation/router';
import languagesRoutes from '../features/languages/router';
import userRoutes from '../features/users/router';
import Layout from './Layout';
import ErrorView from './ErrorView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorView />,
    children: [
      {
        index: true,
        element: <>Under Construction</>,
      },
      ...userRoutes,
      ...translationRoutes,
      ...languagesRoutes,
    ],
  },
]);

export default router;
