import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../shared/components/Icon';
import LanguageDialog, {
  LanguageDialogRef,
} from '../shared/components/LanguageDialog';
import { initialLanguageChosen } from './i18n';
import interfaceLanguages from '../shared/languages.json';
import Button from '../shared/components/actions/Button';

export interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const languageDialog = useRef<LanguageDialogRef>(null);
  const { t, i18n } = useTranslation(['languages']);

  useEffect(() => {
    if (!initialLanguageChosen) {
      languageDialog.current?.show();
    }
  }, []);

  return (
    <footer className={`p-2 flex flex-row z-10 justify-end ${className}`}>
      <Button
        variant="tertiary"
        small
        onClick={() => {
          languageDialog.current?.show();
        }}
      >
        <Icon icon="language" className="me-2" fixedWidth />
        {(interfaceLanguages as { [code: string]: string })[
          i18n.resolvedLanguage
        ] ?? t('languages:language', { count: 100 })}
      </Button>
      <LanguageDialog ref={languageDialog} />
    </footer>
  );
}
