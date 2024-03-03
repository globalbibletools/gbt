import { KeyboardEvent } from 'react';
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

export interface TranslationToolbarProps {
  verseId: string;
  languageCode: string;
  languages: { name: string; code: string }[];
  onVerseChange: (verseId: string) => void;
  onLanguageChange: (languageCode: string) => void;
}

export function TranslationToolbar({
  verseId,
  languages,
  languageCode,
  onLanguageChange,
  onVerseChange,
}: TranslationToolbarProps) {
  const { t } = useTranslation(['translate', 'bible', 'common', 'languages']);
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

  return (
    <div className="flex items-center shadow-md px-6 md:px-8 py-4">
      <div className="me-16">
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
      {userCan('translate', {
        type: 'Language',
        id: languageCode,
      }) && (
        <div className="pt-6">
          <Button
            variant="secondary"
            onClick={() => {
              return;
            }}
          >
            <Icon icon="check" className="me-1" />
            Approve All
          </Button>
        </div>
      )}
    </div>
  );
}
