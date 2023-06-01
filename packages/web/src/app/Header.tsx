import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DialogRef } from '../shared/components/Dialog';
import DropdownMenu, {
  DropdownMenuButton,
  DropdownMenuLink,
  DropdownMenuSubmenu,
} from '../shared/components/actions/DropdownMenu';
import { Icon } from '../shared/components/Icon';
import LanguageDialog from './LanguageDialog';
import interfaceLanguages from './languages.json';
import apiClient from '../shared/apiClient';
import useSession from '../shared/hooks/useSession';

export interface HeaderProps {
  language: string;
  onLanguageChange(code: string): void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const session = useSession();
  const languageDialog = useRef<DialogRef>(null);
  const { t, i18n } = useTranslation();

  const languagesQuery = useQuery(['languages'], () =>
    apiClient.languages.findAll()
  );
  const translationLanguages = languagesQuery.data?.data ?? [];
  const selectedLanguage = translationLanguages.find(
    (l) => l.code === language
  );

  return (
    <header className="p-2 flex items-baseline flex-row z-10">
      <h1 className="font-bold text-lg">Gloss Translation</h1>
      <div className="flex-grow" />
      <nav className="flex items-baseline" aria-label="primary">
        {translationLanguages.length > 0 && (
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
        )}
        {session.status === 'authenticated' && (
          <DropdownMenu text={session.user.name ?? ''}>
            <DropdownMenuLink to={'#'}>
              <Icon icon="user" className="me-2" fixedWidth />
              Profile
            </DropdownMenuLink>
            <DropdownMenuButton
              onClick={() => {
                languageDialog.current?.open();
              }}
            >
              <Icon icon="earth" className="me-2" fixedWidth />
              {(interfaceLanguages as { [code: string]: string })[
                i18n.resolvedLanguage
              ] ?? t('language', { count: 100 })}
            </DropdownMenuButton>
            <DropdownMenuLink
              to={`${process.env.API_URL}/api/auth/signout?callbackUrl=${window.location.href}`}
            >
              <Icon icon="right-from-bracket" className="me-2" fixedWidth />
              {t('log_out')}
            </DropdownMenuLink>
          </DropdownMenu>
        )}
        {session.status === 'unauthenticated' && (
          <a
            href={`${process.env.API_URL}/api/auth/signin?callbackUrl=${window.location.href}`}
            className="focus:outline-none hover:underline focus:underline"
          >
            {t('log_in')}
          </a>
        )}
      </nav>
      <LanguageDialog ref={languageDialog} />
    </header>
  );
}
