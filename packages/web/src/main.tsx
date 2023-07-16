import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18next from 'i18next';
import { StrictMode, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from 'react-router-dom';
import './app/i18n';
import { FlashProvider } from './shared/hooks/flash';
import translationRoutes from './features/translation/router';
import languagesRoutes from './features/languages/router';
import userRoutes from './features/users/router';
import Layout from './app/Layout';
import NotFound from './app/NotFound';

function App() {
  useEffect(() => {
    function handler() {
      document.body.dir = i18next.dir();
    }
    handler();
    i18next.on('languageChanged', handler);
  }, []);

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <FlashProvider>
          <RouterProvider router={router} />
        </FlashProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient();

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
      ...userRoutes(queryClient),
      ...translationRoutes,
      ...languagesRoutes,
    ],
  },
]);

root.render(<App />);
