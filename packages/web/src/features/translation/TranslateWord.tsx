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
    }: TranslateWordProps,
    ref
  ) => {
    const { t } = useTranslation(['translate']);
    const [text, setText] = useState(gloss ?? '');
    const width = useTextWidth(text);
    const input = useRef<HTMLInputElement>(null);

    const root = useRef<HTMLLIElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => input.current?.focus(),
      }),
      []
    );

    return (
      <li className="mx-2 mb-4" ref={root}>
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
                if (e.metaKey || e.altKey || e.ctrlKey) return;
                if (e.key === 'Enter') {
                  if (e.shiftKey) {
                    const prev = root.current?.previousElementSibling;
                    prev?.querySelector('input')?.focus();
                  } else {
                    const prev = root.current?.nextElementSibling;
                    prev?.querySelector('input')?.focus();
                  }
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
