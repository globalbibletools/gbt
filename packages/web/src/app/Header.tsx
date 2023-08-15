import { useTranslation } from 'react-i18next';
import DropdownMenu, {
  DropdownMenuButton,
} from '../shared/components/actions/DropdownMenu';
import { Icon } from '../shared/components/Icon';
import apiClient from '../shared/apiClient';
import useAuth from '../shared/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useAccessControl } from '../shared/accessControl';

export default function Header() {
  const session = useAuth();
  const { t } = useTranslation(['translation', 'users']);

  const userCan = useAccessControl();

  return (
    <header className="py-2 px-4 flex items-baseline flex-row z-10 mb-2 gap-4">
      <Link className="font-bold text-lg" to="/">
        {t('app_name')}
      </Link>
      <div className="flex-grow" />
      <nav className="flex items-baseline gap-4" aria-label="primary">
        <Link
          to={'/translate'}
          className="focus:outline-none hover:underline focus:underline"
        >
          {t('translate')}
        </Link>
        {userCan('administer', 'Language') && (
          <Link
            to={'/languages'}
            className="focus:outline-none hover:underline focus:underline"
          >
            {t('languages')}
          </Link>
        )}
        {userCan('administer', 'User') && (
          <Link
            to={'/users'}
            className="focus:outline-none hover:underline focus:underline"
          >
            {t('users:users')}
          </Link>
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
          <Link
            to={'/login'}
            className="focus:outline-none hover:underline focus:underline"
          >
            {t('users:log_in')}
          </Link>
        )}
      </nav>
    </header>
  );
}
