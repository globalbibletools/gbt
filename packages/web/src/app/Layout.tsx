import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export function Layout() {
  return (
    <Suspense fallback="loading">
      <div className="relative min-h-screen flex flex-col">
        <Header />
        <div
          id="scroll-root"
          className="flex-grow relative flex flex-col max-w-[1800px] mx-auto w-full"
        >
          <Outlet />
        </div>
        <Footer className="absolute bottom-0 w-full" />
      </div>
    </Suspense>
  );
}

export default Layout;
