import { QueryClientProvider } from '@tanstack/react-query';
import i18next from 'i18next';
import { StrictMode, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './app/i18n';
import { FlashProvider } from './shared/hooks/flash';
import queryClient from './shared/queryClient';
import router from './app/router';

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
root.render(<App />);
