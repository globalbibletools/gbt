import { useTranslation } from 'react-i18next';
import { Icon } from '../../shared/components/Icon';
import InputHelpText from '../../shared/components/form/InputHelpText';
import AutocompleteInput from '../../shared/components/form/AutocompleteInput';
import { capitalize } from '../../shared/utils';

export interface TranslateWordProps {
  word: { id: string; text: string };
  referenceGloss?: string;
  gloss?: string;
  previousGlosses: string[];
  originalLanguage: 'hebrew' | 'greek';
  status: 'empty' | 'saving' | 'saved';
  onGlossChange(gloss?: string): void;
}

export default function TranslateWord({
  word,
  originalLanguage,
  status,
  gloss,
  referenceGloss,
  previousGlosses,
  onGlossChange,
}: TranslateWordProps) {
  const { t } = useTranslation();

  return (
    <li className="mx-2 mb-4 w-36">
      <div
        id={`word-${word.id}`}
        className={`font-serif mb-2 ${
          originalLanguage === 'hebrew' ? 'text-2xl text-right' : 'text-lg'
        }`}
      >
        {word.text}
      </div>
      <div className="mb-2">{referenceGloss}</div>
      <AutocompleteInput
        value={gloss}
        items={previousGlosses.map((gloss) => ({ label: gloss, value: gloss }))}
        aria-describedby={`word-help-${word.id}`}
        aria-labelledby={`word-${word.id}`}
        onChange={(newGloss) => {
          if (newGloss !== gloss) {
            onGlossChange(newGloss);
          }
        }}
        onCreate={(newGloss) => {
          if (newGloss !== gloss) {
            onGlossChange(newGloss);
          }
        }}
      />
      <InputHelpText id={`word-help-${word.id}`}>
        {(() => {
          if (status === 'saving') {
            return (
              <>
                <Icon icon="arrows-rotate" className="mr-1" />
                {capitalize(t('saving'))}
              </>
            );
          } else if (status === 'saved') {
            return (
              <>
                <Icon icon="check" className="mr-1" />
                {capitalize(t('saved'))}
              </>
            );
          } else {
            return null;
          }
        })()}
      </InputHelpText>
    </li>
  );
}
