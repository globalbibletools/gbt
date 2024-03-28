import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import bibleTranslationClient from '../../shared/bibleTranslationClient';
import { Icon } from '../../shared/components/Icon';
import { generateReference, parseVerseId } from './verse-utils';
import { expandFontFamily } from '../../shared/hooks/useFontLoader';
import { TextDirection } from '@translation/api-types';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

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

  const originalLanguageQuery = useQuery(
    ['verse', verseIds.join(','), getContent],
    async () =>
      getContent
        ? Object.fromEntries(
            await Promise.all(
              verseIds.map(async (verseId) => [
                verseId,
                (await apiClient.verses.findById(verseId)).data.words
                  .map((w) => w.text)
                  .join(' '),
              ])
            )
          )
        : null
  );

  const translationQuery = useQuery(
    ['verse-translation', language, verseIds.join(','), getContent],
    async () =>
      getContent
        ? Object.fromEntries(
            await Promise.all(
              verseIds.map(async (verseId) => [
                verseId,
                await bibleTranslationClient.getTranslation(
                  verseId,
                  selectedLanguage?.bibleTranslationIds ?? []
                ),
              ])
            )
          )
        : null
  );

  return {
    selectedLanguage,
    originalLanguageQuery,
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
    } catch (e) {
      console.error(e);
      setTitle(t('common:not_found') ?? '');
      setIsValid(false);
    }
  }, [verseIds, t]);

  const { selectedLanguage, originalLanguageQuery, translationQuery } =
    usePreviewQueries(language, isValid, verseIds);

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
        (originalLanguageQuery.isLoading || translationQuery.isLoading) && (
          <div>
            <LoadingSpinner className="mx-auto" />
          </div>
        )}
      {isValid &&
        originalLanguageQuery.data &&
        translationQuery.data &&
        verseIds.map((verseId) => (
          <div key={verseId} className="mb-4">
            {/* TODO: align right for hebrew */}
            <p className="mb-2 mx-2 text-base font-mixed">
              <span>{originalLanguageQuery.data[verseId]}</span>
            </p>
            <p
              className="mx-2 text-base"
              dir={selectedLanguage?.textDirection ?? TextDirection.LTR}
              style={{
                fontFamily: expandFontFamily(
                  selectedLanguage?.font ?? 'Noto Sans'
                ),
              }}
            >
              <span>{translationQuery.data[verseId]?.translation}</span>
            </p>
          </div>
        ))}
    </div>
  );
};
