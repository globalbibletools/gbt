import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../shared/components/Icon';

export default function AdminView() {
  return (
    <div className="absolute w-full h-full flex items-stretch">
      <div className="min-w-[280px] flex-shrink-0 bg-brown-100 p-6 pt-7">
        <div className="px-3 mb-4">
          <h2 className="font-bold text-lg">Admin</h2>
        </div>
        <ul>
          <li>
            <NavLink
              to="/admin/languages"
              className={({ isActive }) =>
                `block px-3 py-1 rounded-lg text-blue-800 font-bold mb-2 ${
                  isActive ? 'bg-green-200 ' : ''
                }`
              }
            >
              <Icon icon="language" className="w-4 mr-2" />
              Languages
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `block px-3 py-1 rounded-lg text-blue-800 font-bold mb-2 ${
                  isActive ? 'bg-green-200 ' : ''
                }`
              }
            >
              <Icon icon="user" className="w-4 mr-2" />
              Users
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
