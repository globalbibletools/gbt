import { createBrowserRouter } from 'react-router-dom';
import translationRoutes from '../features/translation/router';
import languagesRoutes from '../features/languages/router';
import userRoutes from '../features/users/router';
import Layout from './Layout';
import NotFound from './NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
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
