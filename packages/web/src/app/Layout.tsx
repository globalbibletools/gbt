import { Suspense, useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import useLocalStorageState from '../shared/hooks/useLocalStorageState';
import Header from './Header';
import Footer from './Footer';

export interface LayoutContext {
  language: string;
}

export function useLayoutContext() {
  return useOutletContext<LayoutContext>();
}

export function Layout() {
  const [language, selectLanguage] = useLocalStorageState<string>(
    'translation-language',
    'en'
  );

  const outletContext = useMemo<LayoutContext>(
    () => ({ language }),
    [language]
  );

  return (
    <Suspense fallback="loading">
      <div className="min-h-screen flex flex-col">
        <Header language={language} onLanguageChange={selectLanguage} />
        <div className="flex-grow relative flex flex-col">
          <Outlet context={outletContext} />
        </div>
        <Footer />
      </div>
    </Suspense>
  );
}

export default Layout;
