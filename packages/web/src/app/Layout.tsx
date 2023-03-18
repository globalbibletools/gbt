import { Outlet } from 'react-router-dom'
import Header from './Header'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow relative">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout;
