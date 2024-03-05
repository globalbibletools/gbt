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
import logo from '../assets/images/bet-scroll.png';

function navLinkClasses(props: { isActive: boolean }) {
  return `
    h-full px-2 text-center block pt-[28px] md:pt-[30px] font-bold md:mx-2 border-b-4
    ${props.isActive ? 'border-blue-800' : 'border-white'}
  `;
}

export default function Header() {
  const session = useAuth();
  const { t } = useTranslation(['common', 'languages', 'translate', 'users']);

  const userCan = useAccessControl();

  return (
    <nav className="bg-white flex items-center h-20 border-b border-gray-200 relative flex-shrink-0 px-6 md:px-8">
      <NavLink to="/" className="flex items-center me-8 lg:me-12">
        <img src={logo} className="w-14 h-14" alt="" aria-hidden="true" />
        <h1 className="font-bold ms-2 hidden sm:text-lg md:text-2xl sm:block">
          {t('common:app_name')}
        </h1>
      </NavLink>
      <div className="flex-grow md:flex-grow-0" />
      <NavLink to={'/interlinear'} className={navLinkClasses}>
        {t('translate:interlinear')}
      </NavLink>
      {userCan('create', 'Language') && (
        <NavLink to={'/admin/languages'} className={navLinkClasses}>
          {t('common:admin')}
        </NavLink>
      )}
      <div className="md:flex-grow" />
      {session.status === 'authenticated' && (
        <DropdownMenu
          text={session.user.name ?? ''}
          className="h-full"
          buttonClassName="pt-[28px] md:pt-[30px] font-bold"
        >
          <DropdownMenuLink to="/profile">
            <Icon icon="user" className="me-2" fixedWidth />
            <span className="font-bold">{t('users:profile')}</span>
          </DropdownMenuLink>
          <DropdownMenuButton
            onClick={async () => {
              await apiClient.auth.logout();
              window.location.href = '/';
            }}
          >
            <Icon icon="right-from-bracket" className="me-2" fixedWidth />
            <span className="font-bold">{t('users:log_out')}</span>
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
  );
}
