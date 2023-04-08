import { createBrowserRouter, redirect } from 'react-router-dom';
import translationRoutes from '../features/translation/router';
import languagesRoutes from '../features/languages/router';
import Layout, { layoutLoader } from './Layout';
import NotFound from './NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    loader: layoutLoader,
    children: [
      {
        index: true,
        loader() {
          return redirect('/translation');
        },
      },
      ...translationRoutes,
      ...languagesRoutes,
    ],
  },
]);

export default router;
