import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import DropdownMenu, {
  DropdownMenuButton,
  DropdownMenuLink,
  DropdownMenuSubmenu,
} from '../shared/components/actions/DropdownMenu';
import { Icon } from '../shared/components/Icon';
import apiClient from '../shared/apiClient';
import useAuth from '../shared/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useAccessControl } from '../shared/accessControl';

export interface HeaderProps {
  language: string;
  onLanguageChange(code: string): void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const session = useAuth();
  const { t } = useTranslation(['translation', 'users']);

  const languagesQuery = useQuery(['languages'], () =>
    apiClient.languages.findAll()
  );
  const translationLanguages = languagesQuery.data?.data ?? [];
  const selectedLanguage = translationLanguages.find(
    (l) => l.code === language
  );

  const userCan = useAccessControl();

  return (
    <header className="p-2 flex items-baseline flex-row z-10">
      <Link className="font-bold text-lg" to="/">
        {t('app_name')}
      </Link>
      <div className="flex-grow" />
      <nav className="flex items-baseline" aria-label="primary">
        {translationLanguages.length > 0 && (
          <>
            <Link
              to={'/translate'}
              className="me-4 focus:outline-none hover:underline focus:underline"
            >
              {t('translate')}
            </Link>
            {userCan('administer', 'Language') ? (
              <DropdownMenu
                text={selectedLanguage?.name ?? 'Language'}
                className="me-4"
              >
                <DropdownMenuSubmenu text={t('switch_language')}>
                  {translationLanguages.map((language) => (
                    <DropdownMenuButton
                      key={language.code}
                      onClick={() => onLanguageChange(language.code)}
                    >
                      {language.name}
                    </DropdownMenuButton>
                  ))}
                </DropdownMenuSubmenu>
                <DropdownMenuLink to={'/languages'}>
                  {t('manage_languages')}
                </DropdownMenuLink>
              </DropdownMenu>
            ) : (
              <DropdownMenu
                text={selectedLanguage?.name ?? 'Language'}
                className="me-4"
              >
                {translationLanguages.map((language) => (
                  <DropdownMenuButton
                    key={language.code}
                    onClick={() => onLanguageChange(language.code)}
                  >
                    {language.name}
                  </DropdownMenuButton>
                ))}
              </DropdownMenu>
            )}
          </>
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
              <Icon icon="right-from-bracket" className="me-2" fixedWidth />
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
