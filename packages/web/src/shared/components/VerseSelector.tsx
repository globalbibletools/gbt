import { useState } from 'react';
import { useLayoutContext } from '../../app/Layout';
import { decrementVerseId, incrementVerseId, parseReference, parseVerseId } from '../utils';
import { Icon } from './Icon';
import TextInput from './TextInput';


export interface VerseSelectorProps {
  verseId: string;
  goToVerse: (verseId: string) => any;
}

export function VerseSelector({ verseId, goToVerse }: VerseSelectorProps) {
  const { language } = useLayoutContext();
  const langCode = language?.code ?? 'en';
  const bookTerms = require(`../../assets/book-terms/${langCode}.json`);

  const { bookId, chapterNumber, verseNumber } = parseVerseId(verseId);
  const bookName = bookTerms[bookId - 1][0];
  const reference = `${bookName} ${chapterNumber}:${verseNumber}`;

  const [newReference, setNewReference] = useState('');

  const onInputChange = (e: any) => {
    e.preventDefault();
    setNewReference(e.target.value);
  }

  const onKeyDown = (e: any) => {
    if (e.keyCode == 13) {
      e.preventDefault();
      e.target.value = '';
      let newVerseId = parseReference(newReference, langCode);
      if (newVerseId == null) {
        // TODO: handle invalid input.
        console.log('UNKNOWN REFERENCE:', newReference);
      } else {
        goToVerse(newVerseId);
      }
    }
  }

  return (
    <div className='flex flex-row gap-4 items-center'>
      <TextInput autoComplete="off" placeholder={reference} onChange={onInputChange} onKeyDown={onKeyDown} />
      <button onClick={() => goToVerse(decrementVerseId(verseId))}>
        <Icon icon="arrow-left" />
      </button>
      <button onClick={() => goToVerse(incrementVerseId(verseId))}>
        <Icon icon="arrow-right" />
      </button>
    </div>
  );
}

