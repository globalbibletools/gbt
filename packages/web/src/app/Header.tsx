import { useTranslation } from 'react-i18next';
import DropdownMenu, {
  DropdownMenuButton,
  DropdownMenuLink,
} from '../shared/components/actions/DropdownMenu';
import { Icon } from '../shared/components/Icon';
import apiClient from '../shared/apiClient';
import useAuth from '../shared/hooks/useAuth';
import { NavLink } from 'react-router-dom';
import { useAccessControl } from '../shared/accessControl';

function navLinkClasses(props: { isActive: boolean; isPending: boolean }) {
  return `
    focus:outline-none focus:underline px-2 pt-3 pb-1 mb-2 font-bold rounded-b
    ${props.isActive ? 'bg-slate-800 text-white shadow-md' : ''}
  `;
}

export default function Header() {
  const session = useAuth();
  const { t } = useTranslation(['common', 'languages', 'translate', 'users']);

  const userCan = useAccessControl();

  return (
    <header className="px-4 z-10 mb-4 bg-slate-100">
      <div className="max-w-[1800px] mx-auto flex items-baseline flex-row gap-4 ">
        <NavLink className="font-bold text-lg" to="/">
          {t('common:app_name')}
        </NavLink>
        <div className="flex-grow" />
        <nav className="flex items-baseline gap-2" aria-label="primary">
          <NavLink to={'/interlinear'} className={navLinkClasses}>
            {t('translate:interlinear')}
          </NavLink>
          {userCan('administer', 'Language') && (
            <NavLink to={'/languages'} className={navLinkClasses}>
              {t('languages:languages')}
            </NavLink>
          )}
          {userCan('administer', 'User') && (
            <NavLink to={'/users'} className={navLinkClasses}>
              {t('users:users')}
            </NavLink>
          )}
          {session.status === 'authenticated' && (
            <DropdownMenu text={session.user.name ?? ''}>
              <DropdownMenuLink to="/profile">
                <Icon icon="user" className="me-2" fixedWidth />
                {t('users:profile')}
              </DropdownMenuLink>
              <DropdownMenuButton
                onClick={async () => {
                  await apiClient.auth.logout();
                  window.location.href = '/';
                }}
              >
                <Icon icon="right-from-bracket" className="me-4" fixedWidth />
                {t('users:log_out')}
              </DropdownMenuButton>
            </DropdownMenu>
          )}
          {session.status === 'unauthenticated' && (
            <NavLink
              to={'/login'}
              className="focus:outline-none hover:underline focus:underline"
            >
              {t('users:log_in')}
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
