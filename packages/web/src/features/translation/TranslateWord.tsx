import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../shared/components/Icon';
import AutocompleteInput from '../../shared/components/form/AutocompleteInput';
import InputHelpText from '../../shared/components/form/InputHelpText';
import { useTextWidth } from '../../shared/hooks/useTextWidth';
import { capitalize } from '../../shared/utils';

export interface TranslateWordProps {
  editable?: boolean;
  word: { id: string; text: string };
  referenceGloss?: string;
  gloss?: string;
  previousGlosses: string[];
  originalLanguage: 'hebrew' | 'greek';
  status: 'empty' | 'saving' | 'saved';
  onGlossChange(gloss?: string): void;
}

export default function TranslateWord({
  editable = false,
  word,
  originalLanguage,
  status,
  gloss,
  referenceGloss,
  previousGlosses,
  onGlossChange,
}: TranslateWordProps) {
  const { t } = useTranslation();
  const [text, setText] = useState(gloss ?? '');
  const width = useTextWidth(text);

  return (
    <li className="mx-2 mb-4">
      <div
        id={`word-${word.id}`}
        className={`font-serif mb-2 ${
          originalLanguage === 'hebrew'
            ? 'text-2xl text-right'
            : 'text-lg text-left'
        }`}
      >
        {word.text}
      </div>
      <div
        className={`mb-2 ${
          originalLanguage === 'hebrew' ? 'text-right' : 'text-left'
        }`}
      >
        {editable ? referenceGloss : gloss}
      </div>
      {editable && (
        <>
          <AutocompleteInput
            name="gloss"
            className="min-w-[80px]"
            value={gloss}
            items={previousGlosses.map((gloss) => ({
              label: gloss,
              value: gloss,
            }))}
            // The extra 24 pixel give room for the padding around the text.
            style={{ width: width + 24 }}
            aria-describedby={`word-help-${word.id}`}
            aria-labelledby={`word-${word.id}`}
            onChange={(newGloss: string) => {
              if (newGloss !== gloss) {
                onGlossChange(newGloss);
                setText(newGloss);
              }
            }}
            onCreate={(newGloss: string) => {
              if (newGloss !== gloss) {
                onGlossChange(newGloss);
                setText(newGloss);
              }
            }}
          />
          <InputHelpText id={`word-help-${word.id}`}>
            {(() => {
              if (status === 'saving') {
                return (
                  <>
                    <Icon icon="arrows-rotate" className="me-1" />
                    {capitalize(t('saving'))}
                  </>
                );
              } else if (status === 'saved') {
                return (
                  <>
                    <Icon icon="check" className="me-1" />
                    {capitalize(t('saved'))}
                  </>
                );
              } else {
                return null;
              }
            })()}
          </InputHelpText>
        </>
      )}
    </li>
  );
}
