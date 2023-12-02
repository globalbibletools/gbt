import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export function Layout() {
  return (
    <Suspense fallback="loading">
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-grow relative flex flex-col min-h-0 max-w-[1800px] mx-auto w-full">
          <Outlet />
        </div>
        <Footer />
      </div>
    </Suspense>
  );
}

export default Layout;
