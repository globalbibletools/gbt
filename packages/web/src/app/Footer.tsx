import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogRef } from '../shared/components/Dialog';
import { Icon } from '../shared/components/Icon';
import LanguageDialog from './LanguageDialog';
import { initialLanguageChosen } from './i18n';
import interfaceLanguages from './languages.json';

export default function Footer() {
  const languageDialog = useRef<DialogRef>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!initialLanguageChosen) {
      languageDialog.current?.open();
    }
  }, []);

  return (
    <footer className="p-2 flex flex-row z-10 justify-end">
      <button
        type="button"
        onClick={() => {
          languageDialog.current?.open();
        }}
      >
        <Icon icon="earth" className="me-2" fixedWidth />
        {(interfaceLanguages as { [code: string]: string })[
          i18n.resolvedLanguage
        ] ?? t('language', { count: 100 })}
      </button>
      <LanguageDialog ref={languageDialog} />
    </footer>
  );
}
