import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import './app/i18n';
import router from './app/router';
import { FlashProvider } from './shared/hooks/flash';

function App() {
  const { i18n } = useTranslation();
  document.body.dir = i18n.dir();
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
