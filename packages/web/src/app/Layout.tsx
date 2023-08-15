import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export function Layout() {
  return (
    <Suspense fallback="loading">
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow relative flex flex-col">
          <Outlet />
        </div>
        <Footer />
      </div>
    </Suspense>
  );
}

export default Layout;
