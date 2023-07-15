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

// If we land on the app from the server and there was an issue with the token,
// we redirect to the error view.
const location = new URL(window.location.href);
const error = location.searchParams.get('error');
if (error === 'invalid-token') {
  router.navigate('/login?error=invalid-token');
}

export default router;
