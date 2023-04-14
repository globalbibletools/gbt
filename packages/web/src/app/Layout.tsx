import { GetLanguagesResponseBody, Language } from '@translation/api-types';
import { Suspense, useMemo } from 'react';
import { Outlet, useLoaderData, useOutletContext } from 'react-router-dom';
import apiClient from '../shared/apiClient';
import useLocalStorageState from '../shared/useLocalStorageState';
import Header from './Header';

export function layoutLoader() {
  return apiClient.languages.findAll();
}

export interface LayoutContext {
  language?: Language;
}

export function useLayoutContext() {
  return useOutletContext<LayoutContext>();
}

export function Layout() {
  const languages = useLoaderData() as GetLanguagesResponseBody;
  const [language, selectLanguage] = useLocalStorageState<string>(
    'translation-language',
    languages.data[0]?.code
  );

  const outletContext = useMemo<LayoutContext>(
    () => ({
      language: languages.data.find((l) => l.code === language),
    }),
    [language, languages]
  );

  return (
    <Suspense fallback="loading">
      <div className="min-h-screen flex flex-col">
        <Header language={language} onLanguageChange={selectLanguage} />
        <div className="flex-grow relative">
          <Outlet context={outletContext} />
        </div>
      </div>
    </Suspense>
  );
}

export default Layout;
