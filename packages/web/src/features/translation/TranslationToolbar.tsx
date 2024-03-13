import { KeyboardEvent, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../shared/components/Icon';
import TextInput from '../../shared/components/form/TextInput';
import {
  decrementVerseId,
  generateReference,
  incrementVerseId,
  parseReference,
  parseVerseId,
} from './verse-utils';
import Button from '../../shared/components/actions/Button';
import FormLabel from '../../shared/components/form/FormLabel';
import ComboboxInput from '../../shared/components/form/ComboboxInput';
import { useAccessControl } from '../../shared/accessControl';
import apiClient from '../../shared/apiClient';
import { useFlash } from '../../shared/hooks/flash';

export interface TranslationToolbarProps {
  verseId: string;
  languageCode: string;
  languages: { name: string; code: string }[];
  onVerseChange: (verseId: string) => void;
  onLanguageChange: (languageCode: string) => void;
  approveAllGlosses: () => Promise<void>;
  canApproveAllGlosses: boolean;
}

export function TranslationToolbar({
  verseId,
  languages,
  languageCode,
  onLanguageChange,
  onVerseChange,
  approveAllGlosses,
  canApproveAllGlosses,
}: TranslationToolbarProps) {
  const { t } = useTranslation(['translate', 'bible', 'common', 'languages']);
  const flash = useFlash();
  const verseInfo = parseVerseId(verseId);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newReference = e.currentTarget.value;
      e.currentTarget.value = '';
      const newVerseId = parseReference(newReference, t);
      if (newVerseId == null) {
        // TODO: handle invalid input.
        console.log('UNKNOWN REFERENCE:', newReference);
      } else {
        onVerseChange(newVerseId);
      }
    }
  };

  const userCan = useAccessControl();
  const isTranslator = userCan('translate', {
    type: 'Language',
    id: languageCode,
  });

  useEffect(() => {
    if (isTranslator) {
      const keydownCallback = async (e: globalThis.KeyboardEvent) => {
        if (e.altKey && !e.shiftKey && !e.ctrlKey && e.key === 'a') {
          approveAllGlosses();
        }
      };
      window.addEventListener('keydown', keydownCallback);
      return () => window.removeEventListener('keydown', keydownCallback);
    }
  }, [approveAllGlosses, isTranslator]);

  const navigateToNextUnapprovedVerse = useCallback(async () => {
    const data = await apiClient.verses.findNextUnapprovedVerse(
      verseId,
      languageCode
    );
    if (data && data.nextUnapprovedVerseId) {
      onVerseChange(data.nextUnapprovedVerseId);
    } else {
      // TODO: figure out how to handle the situation where ALL words have been glossed (i.e. data.verseId === undefined)
      flash.error('No unapproved verses');
    }
  }, [onVerseChange, flash, verseId, languageCode]);

  useEffect(() => {
    if (isTranslator) {
      const keydownCallback = (e: globalThis.KeyboardEvent) => {
        if (e.altKey && !e.shiftKey && !e.ctrlKey && e.key === 'n')
          navigateToNextUnapprovedVerse();
      };
      window.addEventListener('keydown', keydownCallback);
      return () => window.removeEventListener('keydown', keydownCallback);
    }
  }, [navigateToNextUnapprovedVerse, isTranslator]);

  return (
    <div className="flex items-center shadow-md px-6 md:px-8 py-4">
      <div className={isTranslator ? 'me-2' : 'me-16'}>
        <FormLabel htmlFor="verse-reference">VERSE</FormLabel>
        <div className="relative">
          <TextInput
            id="verse-reference"
            className="pe-16 placeholder-current w-56"
            autoComplete="off"
            placeholder={generateReference(verseInfo, t)}
            onKeyDown={onKeyDown}
          />
          <Button
            className="absolute end-8 top-1 w-7 !h-7"
            variant="tertiary"
            onClick={() => onVerseChange(decrementVerseId(verseId))}
          >
            <Icon icon="arrow-up" />
            <span className="sr-only">{t('translate:previous_verse')}</span>
          </Button>
          <Button
            className="absolute end-1 top-1 w-7 !h-7"
            variant="tertiary"
            onClick={() => onVerseChange(incrementVerseId(verseId))}
          >
            <Icon icon="arrow-down" />
            <span className="sr-only">{t('translate:next_verse')}</span>
          </Button>
        </div>
      </div>
      {isTranslator && (
        <div className="me-16 pt-6">
          <Button variant="tertiary" onClick={navigateToNextUnapprovedVerse}>
            {t('translate:next_unapproved')}
            <Icon icon="arrow-right" className="ms-1 rtl:hidden" />
            <Icon icon="arrow-left" className="ms-1 ltr:hidden" />
          </Button>
        </div>
      )}
      <div className="me-2">
        <FormLabel htmlFor="target-language">LANGUAGE</FormLabel>
        <ComboboxInput
          id="target-language"
          items={languages.map((l) => ({ label: l.name, value: l.code }))}
          value={languageCode}
          onChange={onLanguageChange}
          className="w-40"
          autoComplete="off"
        />
      </div>
      {userCan('administer', { type: 'Language', id: languageCode }) && (
        <div className="pt-6 me-16">
          <Button variant="tertiary" to={`/languages/${languageCode}`}>
            <Icon icon="sliders" className="me-1" />
            {t('languages:manage')}
          </Button>
        </div>
      )}
      {isTranslator && (
        <div className="pt-6">
          <Button
            variant="secondary"
            disabled={!canApproveAllGlosses}
            onClick={approveAllGlosses}
          >
            <Icon icon="check" className="me-1" />
            {t('translate:approve_all')}
          </Button>
        </div>
      )}
    </div>
  );
}
