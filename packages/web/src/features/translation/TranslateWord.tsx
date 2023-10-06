import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../shared/components/Icon';
import InputHelpText from '../../shared/components/form/InputHelpText';
import { expandFontFamily } from '../../shared/hooks/useFontLoader';
import { useTextWidth } from '../../shared/hooks/useTextWidth';
import { capitalize } from '../../shared/utils';
import AutocompleteInput from '../../shared/components/form/AutocompleteInput';

export interface TranslateWordProps {
  editable?: boolean;
  word: { id: string; text: string };
  originalLanguage: 'hebrew' | 'greek';
  status: 'empty' | 'saving' | 'saved' | 'approved';
  gloss?: string;
  font?: string;
  referenceGloss?: string;
  previousGlosses: string[];
  onChange(data: { gloss?: string; approved?: boolean }): void;
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
      font,
      referenceGloss,
      previousGlosses,
      onChange,
    }: TranslateWordProps,
    ref
  ) => {
    const { t } = useTranslation(['translate']);
    const width = useTextWidth({
      text: gloss ?? '',
      fontFamily: expandFontFamily(font ?? 'Noto Sans'),
      fontSize: '16px',
    });
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
              // The extra 42 pixels give room for the padding and caret icon.
              style={{
                width: width + 42,
                fontFamily: expandFontFamily(font ?? 'Noto Sans'),
              }}
              state={status === 'approved' ? 'success' : undefined}
              aria-describedby={`word-help-${word.id}`}
              aria-labelledby={`word-${word.id}`}
              onChange={(value, implicit) => {
                if (value !== gloss) {
                  onChange({
                    gloss: value,
                    approved: implicit ? undefined : true,
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.metaKey || e.altKey || e.ctrlKey) return;
                switch (e.key) {
                  case 'Enter': {
                    if (status !== 'approved') {
                      onChange({ approved: true });
                    }
                    if (e.shiftKey) {
                      const prev = root.current?.previousElementSibling;
                      prev?.querySelector('input')?.focus();
                    } else {
                      const prev = root.current?.nextElementSibling;
                      prev?.querySelector('input')?.focus();
                    }
                    break;
                  }
                  case 'Escape': {
                    onChange({ approved: false });
                    break;
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
                } else if (status === 'approved') {
                  return (
                    <>
                      <Icon icon="check" className="me-1 text-green-600" />
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
