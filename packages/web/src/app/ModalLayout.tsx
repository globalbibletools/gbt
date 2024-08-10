import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export function ModalLayout() {
  return (
    <Suspense fallback="loading">
      <div className="h-screen flex justify-center items-center bg-gradient-to-b from-brown-100 to-green-300 dark:from-green-700 dark:to-green-900">
        <Outlet />
      </div>
    </Suspense>
  );
}

export default ModalLayout;
