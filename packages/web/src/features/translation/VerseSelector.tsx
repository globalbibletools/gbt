import { useState, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { bookName, decrementVerseId, incrementVerseId, parseReference, parseVerseId } from './verse-utils';
import { Icon } from '../../shared/components/Icon';
import TextInput from '../../shared/components/TextInput';


export interface VerseSelectorProps {
  verseId: string;
  onVerseChange: (verseId: string) => any;
}

export function VerseSelector({ verseId, onVerseChange }: VerseSelectorProps) {
  const { t, i18n } = useTranslation();
  const langCode = i18n.language;
  const verseInfo = parseVerseId(verseId);
  const reference = t('reference_format', { ...verseInfo, bookName: bookName(verseInfo.bookId, langCode) });

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') {
      const newReference = (e.target as HTMLInputElement).value;
      (e.target as HTMLInputElement).value = '';
      let newVerseId = parseReference(newReference, langCode);
      if (newVerseId == null) {
        // TODO: handle invalid input.
        console.log('UNKNOWN REFERENCE:', newReference);
      } else {
        onVerseChange(newVerseId);
      }
    }
  }

  return (
    <div className='flex flex-row gap-4 items-center'>
      <TextInput autoComplete="off" placeholder={reference} onKeyDown={onKeyDown} />
      <button onClick={() => onVerseChange(decrementVerseId(verseId))}>
        <Icon icon="arrow-left" />
      </button>
      <button onClick={() => onVerseChange(incrementVerseId(verseId))}>
        <Icon icon="arrow-right" />
      </button>
    </div>
  );
}
