import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import bibleTranslationClient from '../../shared/bibleTranslationClient';
import { Icon } from '../../shared/components/Icon';
import { generateReference, parseVerseId } from './verse-utils';
import { expandFontFamily } from '../../shared/hooks/useFontLoader';
import { TextDirection } from '@translation/api-types';

type VersesPreviewProps = {
  language: string;
  verseIds: string[];
  onClose: () => void;
};

function usePreviewQueries(
  language: string,
  getContent: boolean,
  verseIds: string[]
) {
  const languagesQuery = useQuery(['languages'], () =>
    apiClient.languages.findAll()
  );
  const translationLanguages = languagesQuery.data?.data ?? [];
  const selectedLanguage = translationLanguages.find(
    (l) => l.code === language
  );

  const translationQuery = useQuery(
    ['verse-translation', language, verseIds.join(','), getContent],
    () =>
      getContent
        ? Promise.all(
            verseIds.map(
              (verseId) =>
                bibleTranslationClient.getTranslation(
                  verseId,
                  selectedLanguage?.bibleTranslationIds ?? []
                ),
              { enabled: !!selectedLanguage }
            )
          )
        : null
  );

  return {
    translationLanguages,
    selectedLanguage,
    translationQuery,
  };
}

export const VersesPreview = ({
  language,
  verseIds,
  onClose,
}: VersesPreviewProps) => {
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
  }, [verseIds, t]);

  const { translationLanguages, selectedLanguage, translationQuery } =
    usePreviewQueries(language, isValid, verseIds);

  console.log(translationQuery.data);
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
      {isValid &&
        translationQuery.data &&
        translationQuery.data.map((verseContent) => (
          <p
            className="mx-2 text-base"
            dir={selectedLanguage?.textDirection ?? TextDirection.LTR}
            style={{
              fontFamily: expandFontFamily(
                selectedLanguage?.font ?? 'Noto Sans'
              ),
            }}
          >
            <span>{verseContent?.translation}</span>
          </p>
        ))}
    </div>
  );
};
