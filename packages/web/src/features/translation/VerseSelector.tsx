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
  const { t, i18n } = useTranslation(['translation', 'bible']);
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
        arial-label={t('select_verse')}
      />
      {/* Use flex-row-reverse on rtl, so that the previous button is always
          to the left of the next button. */}
      <div className="flex ltr:flex-row rtl:flex-row-reverse gap-4">
        <button onClick={() => onVerseChange(decrementVerseId(verseId))}>
          <Icon icon="arrow-left" />
          <span className="sr-only">{t('previous_verse')}</span>
        </button>
        <button onClick={() => onVerseChange(incrementVerseId(verseId))}>
          <Icon icon="arrow-right" />
          <span className="sr-only">{t('next_verse')}</span>
        </button>
      </div>
    </div>
  );
}
