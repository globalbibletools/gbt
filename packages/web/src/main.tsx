import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18next from 'i18next';
import { StrictMode, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './app/i18n';
import router from './app/router';
import { FlashProvider } from './shared/hooks/flash';

function App() {
  useEffect(() => {
    function handler() {
      console.log('DIR:', i18next.dir());
      document.body.dir = i18next.dir();
    }
    i18next.on('initialized', handler);
    i18next.on('languageChanged', handler);
  }, [i18next.dir, i18next.on]);

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

root.render(<App />);
