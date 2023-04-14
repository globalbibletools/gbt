import { GetLanguagesResponseBody } from '@translation/api-types';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router-dom';
import { DialogRef } from '../shared/components/Dialog';
import DropdownMenu, {
  DropdownMenuButton,
  DropdownMenuLink,
  DropdownMenuSubmenu,
} from '../shared/components/DropdownMenu';
import { Icon } from '../shared/components/Icon';
import LanguageDialog from './LanguageDialog';
import interfaceLanguages from './languages.json';

export interface HeaderProps {
  language: string;
  onLanguageChange(code: string): void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const userName = 'Joe Translator';
  const languageDialog = useRef<DialogRef>(null);
  const { t, i18n } = useTranslation();
  const translationLanguages = useLoaderData() as GetLanguagesResponseBody;

  const selectedLanguage = translationLanguages.data.find(
    (l) => l.code === language
  );

  return (
    <header className="p-2 flex items-baseline z-10">
      <h1 className="font-bold text-lg">Gloss Translation</h1>
      <div className="flex-grow" />
      <nav className="flex items-baseline" aria-label="primary">
        <DropdownMenu
          text={selectedLanguage?.name ?? 'Language'}
          className="mr-4"
        >
          <DropdownMenuSubmenu text={t('switch_language')}>
            {translationLanguages.data.map((language) => (
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
        <DropdownMenu text={userName}>
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
        </DropdownMenu>
      </nav>
      <LanguageDialog ref={languageDialog} />
    </header>
  );
}
