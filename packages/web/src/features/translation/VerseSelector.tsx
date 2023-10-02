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

export interface VerseSelectorProps {
  verseId: string;
  onVerseChange: (verseId: string) => void;
}

export function VerseSelector({ verseId, onVerseChange }: VerseSelectorProps) {
  const { t } = useTranslation(['translate', 'bible']);
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

  return (
    <div className="flex gap-4 items-center flex-row">
      <TextInput
        name="verseReference"
        autoComplete="off"
        placeholder={generateReference(verseInfo, t)}
        onKeyDown={onKeyDown}
        arial-label={t('translate:select_verse')}
      />
      <button onClick={() => onVerseChange(decrementVerseId(verseId))}>
        <Icon icon="arrow-up" />
        <span className="sr-only">{t('translate:previous_verse')}</span>
      </button>
      <button onClick={() => onVerseChange(incrementVerseId(verseId))}>
        <Icon icon="arrow-down" />
        <span className="sr-only">{t('translate:next_verse')}</span>
      </button>
    </div>
  );
}
