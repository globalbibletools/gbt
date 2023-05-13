import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DialogRef } from '../shared/components/Dialog';
import DropdownMenu, {
  DropdownMenuButton,
  DropdownMenuLink,
  DropdownMenuSubmenu,
} from '../shared/components/DropdownMenu';
import { Icon } from '../shared/components/Icon';
import LanguageDialog from './LanguageDialog';
import interfaceLanguages from './languages.json';
import apiClient from '../shared/apiClient';
import { signIn, signOut, useSession } from 'next-auth/react';

export interface HeaderProps {
  language: string;
  onLanguageChange(code: string): void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const { data: session, status } = useSession();
  const userName = 'Joe Translator';
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
    <header className="p-2 flex items-baseline z-10">
      <h1 className="font-bold text-lg">Gloss Translation</h1>
      <div className="flex-grow" />
      <nav className="flex items-baseline" aria-label="primary">
        {translationLanguages.length > 0 && (
          <DropdownMenu
            text={selectedLanguage?.name ?? 'Language'}
            className="mr-4"
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
        {status === 'authenticated' && (
          <DropdownMenu text={session.user?.name ?? ''}>
            <DropdownMenuLink to={'#'}>
              <Icon icon="user" className="mr-2" />
              Profile
            </DropdownMenuLink>
            <DropdownMenuButton
              onClick={() => {
                languageDialog.current?.open();
              }}
            >
              <Icon icon="earth" className="mr-2" />
              {(interfaceLanguages as { [code: string]: string })[
                i18n.resolvedLanguage
              ] ?? t('language', { count: 100 })}
            </DropdownMenuButton>
            <DropdownMenuButton onClick={() => signOut()}>
              {t('log_out')}
            </DropdownMenuButton>
          </DropdownMenu>
        )}
        {status === 'unauthenticated' && (
          <button onClick={() => signIn()}>{t('log_in')}</button>
        )}
      </nav>
      <LanguageDialog ref={languageDialog} />
    </header>
  );
}
