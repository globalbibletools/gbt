import { useRouteError } from 'react-router-dom';
import { NotFoundError } from '../shared/accessControl';

export default function NotFound() {
  const error: any = useRouteError();
  console.error(error);

  const message =
    error instanceof NotFoundError
      ? 'Not Found'
      : error.statusText || error.message;

  return (
    <div className="absolute w-full h-full flex flex-col items-center justify-center">
      <h1 className="font-bold text-xl mb-6">Woops!</h1>
      <p className="mb-2">An unknown error has occurred.</p>
      <p className="italic">{message}</p>
    </div>
  );
}
