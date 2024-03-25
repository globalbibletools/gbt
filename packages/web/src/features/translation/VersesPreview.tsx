import { useTranslation } from 'react-i18next';
import { generateReference, parseVerseId } from './verse-utils';
import { Icon } from '../../shared/components/Icon';
import { useState, useEffect } from 'react';

type VersesPreviewProps = { verseIds: string[]; onClose: () => void };

export const VersesPreview = ({ verseIds, onClose }: VersesPreviewProps) => {
  const { t } = useTranslation(['common', 'bible']);
  const [title, setTitle] = useState('');
  const [isValid, setIsValid] = useState(false);
  useEffect(() => {
    try {
      setTitle(
        generateReference(parseVerseId(verseIds[0]), t) +
          (verseIds.length > 1
            ? ' - ' +
              generateReference(parseVerseId(verseIds[verseIds.length - 1]), t)
            : '')
      );
      setIsValid(true);
    } catch {
      setTitle(t('common:not_found') ?? '');
      setIsValid(false);
    }
  });
  return (
    <div>
      <div className="flex ltr:flex-row rtl:flex-row-reverse items-center justify-between">
        <span className="text-base font-bold">{title}</span>
        <button
          onClick={onClose}
          type="button"
          className="w-9 h-9 text-red-700 rounded-md focus-visible:outline outline-2 outline-green-300"
        >
          <Icon icon="xmark" />
          <span className="sr-only">{t('common:close')}</span>
        </button>
      </div>
    </div>
  );
};
