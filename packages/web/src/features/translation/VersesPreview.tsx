import { useTranslation } from 'react-i18next';
import { generateReference, parseVerseId } from './verse-utils';

export const VersesPreview = ({ verseIds }: { verseIds: string[] }) => {
  const { t } = useTranslation(['bible']);
  const title =
    generateReference(parseVerseId(verseIds[0]), t) +
    (verseIds.length > 1
      ? ' - ' +
        generateReference(parseVerseId(verseIds[verseIds.length - 1]), t)
      : '');
  return (
    <div>
      <div className="flex ltr:flex-row rtl:flex-row-reverse justify-between">
        <span>{title}</span>
        <button>close</button>
      </div>
    </div>
  );
};
