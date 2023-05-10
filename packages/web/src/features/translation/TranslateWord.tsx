import { Icon } from '../../shared/components/Icon';
import InputHelpText from '../../shared/components/InputHelpText';
import TypeaheadInput from '../../shared/components/TypeaheadInput';

export interface TranslateWordProps {
  word: { id: string; text: string };
  referenceGloss?: string;
  gloss?: string;
  previousGlosses: string[];
  originalLanguage: 'hebrew' | 'greek';
  status: 'empty' | 'saving' | 'saved';
  onGlossChange(gloss?: string): void;
}

// TODO: replace empty string with undefined
// TODO: ignore empty glosses in dropdown list
export default function TranslateWord({
  word,
  originalLanguage,
  status,
  gloss,
  referenceGloss,
  previousGlosses,
  onGlossChange,
}: TranslateWordProps) {
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
      <TypeaheadInput
        value={gloss}
        labelId={`word-${word.id}`}
        items={previousGlosses.map((gloss) => ({ label: gloss, value: gloss }))}
        aria-describedby={`word-help-${word.id}`}
        onSelect={(newGloss) => {
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
                Saving...
              </>
            );
          } else if (status === 'saved') {
            return (
              <>
                <Icon icon="check" className="mr-1" />
                Saved
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
