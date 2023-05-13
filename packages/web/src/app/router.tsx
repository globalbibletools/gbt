import { createBrowserRouter, redirect } from 'react-router-dom';
import authRoutes from '../features/auth/router';
import translationRoutes from '../features/translation/router';
import languagesRoutes from '../features/languages/router';
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
        loader() {
          return redirect('/translate/01001001');
        },
      },
      ...authRoutes,
      ...translationRoutes,
      ...languagesRoutes,
    ],
  },
]);

export default router;
