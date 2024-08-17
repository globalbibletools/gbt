import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../shared/components/Icon';
import TextInput from '../../shared/components/form/TextInput';
import {
  decrementChapterId,
  generateChapterReference,
  generateReference,
  incrementChapterId,
  parseReference,
  parseVerseId,
} from './verse-utils';
import Button from '../../shared/components/actions/Button';
import FormLabel from '../../shared/components/form/FormLabel';
import ComboboxInput from '../../shared/components/form/ComboboxInput';
import { useAccessControl } from '../../shared/accessControl';
import Form from '../../shared/components/form/Form';
import { useForm } from 'react-hook-form';
import useMergedRef from '../../shared/hooks/mergeRefs';

export interface ReadingToolbarProps {
  verseId: string;
  languageCode: string;
  languages: { name: string; code: string }[];
  onVerseChange: (verseId: string) => void;
  onLanguageChange: (languageCode: string) => void;
}

export function ReadingToolbar({
  verseId,
  languages,
  languageCode,
  onLanguageChange,
  onVerseChange,
}: ReadingToolbarProps) {
  const { t } = useTranslation(['translate', 'bible', 'common', 'languages']);

  const userCan = useAccessControl();

  const verseReferenceForm = useForm<{ verseReference: string }>();
  const verseReferenceAttributes =
    verseReferenceForm.register('verseReference');
  const verseReferenceInput = useRef<HTMLInputElement>(null);

  const { setValue } = verseReferenceForm;
  useEffect(() => {
    setValue(
      'verseReference',
      generateChapterReference(parseVerseId(verseId), t)
    );
  }, [verseId, setValue, t]);

  return (
    <div className="shadow-md dark:shadow-none dark:border-b dark:border-gray-500 px-6">
      <div className="flex items-center mx-auto max-w-[960px] py-4">
        <Form
          context={verseReferenceForm}
          onSubmit={({ verseReference }) => {
            if (verseReferenceInput.current) {
              verseReferenceInput.current.value = '';
              verseReferenceInput.current?.blur();
            }
            const newVerseId = parseReference(verseReference, t);
            if (newVerseId == null) {
              // TODO: handle invalid input.
              console.log('UNKNOWN REFERENCE:', verseReference);
            } else {
              onVerseChange(newVerseId.slice(0, 5));
            }
          }}
        >
          <div className="me-16">
            <FormLabel htmlFor="verse-reference">VERSE</FormLabel>
            <div className="relative">
              <TextInput
                id="verse-reference"
                className="pe-16 placeholder-current w-56"
                autoComplete="off"
                {...verseReferenceAttributes}
                ref={useMergedRef(
                  verseReferenceAttributes.ref,
                  verseReferenceInput
                )}
                onFocus={(e) => e.target.select()}
              />
              <Button
                className="absolute end-8 top-1 w-7 !h-7"
                variant="tertiary"
                onClick={() => onVerseChange(decrementChapterId(verseId))}
              >
                <Icon icon="arrow-up" />
                <span className="sr-only">{t('translate:previous_verse')}</span>
              </Button>
              <Button
                className="absolute end-1 top-1 w-7 !h-7"
                variant="tertiary"
                onClick={() => onVerseChange(incrementChapterId(verseId))}
              >
                <Icon icon="arrow-down" />
                <span className="sr-only">{t('translate:next_verse')}</span>
              </Button>
            </div>
          </div>
        </Form>
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
      </div>
    </div>
  );
}
