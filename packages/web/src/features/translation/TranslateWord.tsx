import {
  KeyboardEventHandler,
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../shared/components/Icon';
import ComboboxInput from '../../shared/components/form/ComboboxInput';
import InputHelpText from '../../shared/components/form/InputHelpText';
import { useTextWidth } from '../../shared/hooks/useTextWidth';
import { capitalize } from '../../shared/utils';
import AutocompleteInput from '../../shared/components/form/AutocompleteInput';

export interface TranslateWordProps {
  editable?: boolean;
  word: { id: string; text: string };
  referenceGloss?: string;
  gloss?: string;
  previousGlosses: string[];
  originalLanguage: 'hebrew' | 'greek';
  status: 'empty' | 'saving' | 'saved';
  onGlossChange(gloss?: string): void;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
}

export interface TranslateWordRef {
  focus(): void;
}

const TranslateWord = forwardRef<TranslateWordRef, TranslateWordProps>(
  (
    {
      editable = false,
      word,
      originalLanguage,
      status,
      gloss,
      referenceGloss,
      previousGlosses,
      onGlossChange,
      onKeyDown,
    }: TranslateWordProps,
    ref
  ) => {
    const { t } = useTranslation(['translate']);
    const [text, setText] = useState(gloss ?? '');
    const width = useTextWidth(text);
    const input = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => input.current?.focus(),
      }),
      []
    );

    return (
      <li className="mx-2 mb-4">
        <div
          id={`word-${word.id}`}
          className={`mb-2 ${
            originalLanguage === 'hebrew'
              ? 'text-2xl text-right font-hebrew'
              : 'text-lg text-left font-greek'
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
              style={{ width: width + 24 }}
              aria-describedby={`word-help-${word.id}`}
              aria-labelledby={`word-${word.id}`}
              onChange={(value) => {
                if (value !== gloss) {
                  onGlossChange(value);
                  setText(value);
                }
              }}
              onKeyDown={(e) => {
                if (onKeyDown) {
                  onKeyDown(e);
                }
              }}
              suggestions={previousGlosses}
              ref={input}
            />
            <InputHelpText id={`word-help-${word.id}`}>
              {(() => {
                if (status === 'saving') {
                  return (
                    <>
                      <Icon icon="arrows-rotate" className="me-1" />
                      {capitalize(t('translate:saving'))}
                    </>
                  );
                } else if (status === 'saved') {
                  return (
                    <>
                      <Icon icon="check" className="me-1" />
                      {capitalize(t('translate:saved'))}
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
);

export default TranslateWord;
