import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { NotFoundError } from '../shared/accessControl';
import Footer from './Footer';
import Header from './Header';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '@translation/api-client';

export default function NotFound() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: any = useRouteError();
  const { t } = useTranslation(['common']);

  console.log(error);

  const isNotFound =
    error instanceof NotFoundError ||
    (error instanceof ApiClientError && error.status === 404) ||
    (isRouteErrorResponse(error) && error.status === 404);

  const headerText = isNotFound
    ? t('common:not_found')
    : t('common:unknown_error');
  const description = isNotFound
    ? t('common:not_found_message')
    : t('common:unknown_error_message');
  const errorMessage = isNotFound ? '' : error.statusText || error.message;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow relative flex flex-col items-center justify-center">
        <h1 className="font-bold text-xl mb-4">{headerText}</h1>
        <p className="mb-2">{description}</p>
        <p className="italic">{errorMessage}</p>
      </div>
      <Footer />
    </div>
  );
}
