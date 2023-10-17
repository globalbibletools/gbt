import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
  suggestions: string[];
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
      suggestions,
      onChange,
    }: TranslateWordProps,
    ref
  ) => {
    const { t, i18n } = useTranslation(['translate']);
    const input = useRef<HTMLInputElement>(null);

    const root = useRef<HTMLLIElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => input.current?.focus(),
      }),
      []
    );

    const glossWidth = useTextWidth({
      text: gloss ?? '',
      fontFamily: expandFontFamily(font ?? 'Noto Sans'),
      fontSize: '16px',
    });
    const ancientWord = useRef<HTMLSpanElement>(null);
    const refGloss = useRef<HTMLSpanElement>(null);
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
      setWidth(
        Math.max(
          ancientWord.current?.clientWidth ?? 0,
          refGloss.current?.clientWidth ?? 0,
          glossWidth
        )
      );
    }, [glossWidth]);

    return (
      <li
        className="mx-2 mb-4"
        ref={root}
        dir={originalLanguage === 'hebrew' ? 'rtl' : 'ltr'}
      >
        <div
          id={`word-${word.id}`}
          className={`mb-1 h-8 ${
            originalLanguage === 'hebrew'
              ? 'text-2xl text-right font-hebrew pr-3'
              : 'text-lg text-left font-greek pl-3'
          }`}
        >
          <span className="inline-block" ref={ancientWord}>
            {word.text}
          </span>
        </div>
        <div
          className={`mb-1 h-8 ${
            originalLanguage === 'hebrew' ? 'text-right pr-3' : 'text-left pl-3'
          }`}
          dir="ltr"
        >
          <span className="inline-block" ref={refGloss}>
            {editable ? referenceGloss : gloss}
          </span>
        </div>
        {editable && (
          <>
            <AutocompleteInput
              className={`
                -m-px min-w-[80px]
                ${originalLanguage === 'hebrew' ? 'text-right' : 'text-left'}
              `}
              inputClassName={
                originalLanguage === 'hebrew' ? 'text-right' : 'text-left'
              }
              name="gloss"
              value={gloss || suggestions[0]}
              // The extra 26 pixels give room for the padding and border.
              style={{
                width: width + 26,
                fontFamily: expandFontFamily(font ?? 'Noto Sans'),
              }}
              // TODO: set based on translating language
              dir="ltr"
              state={status === 'approved' ? 'success' : undefined}
              aria-describedby={`word-help-${word.id}`}
              aria-labelledby={`word-${word.id}`}
              onChange={(value, implicit) => {
                if (value !== gloss) {
                  onChange({
                    gloss: value,
                    approved: !implicit && !!value,
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.metaKey || e.altKey || e.ctrlKey) return;
                switch (e.key) {
                  case 'Enter': {
                    e.preventDefault();
                    if (status !== 'approved') {
                      onChange({ gloss, approved: !!gloss });
                    }
                    if (e.shiftKey) {
                      const prev = root.current?.previousElementSibling;
                      prev?.querySelector('input')?.focus();
                    } else {
                      const nextRoot = root.current?.nextElementSibling;
                      const next =
                        nextRoot?.querySelector('input') ??
                        nextRoot?.querySelector('button');
                      next?.focus();
                    }
                    break;
                  }
                  case 'Escape': {
                    onChange({ approved: false });
                    break;
                  }
                }
              }}
              suggestions={suggestions}
              ref={input}
            />
            <InputHelpText
              id={`word-help-${word.id}`}
              className={
                originalLanguage === 'hebrew' ? 'text-right' : 'text-left'
              }
            >
              {(() => {
                if (status === 'saving') {
                  return (
                    <>
                      <Icon icon="arrows-rotate" className="me-1" />
                      <span dir={i18n.dir(i18n.language)}>
                        {capitalize(t('translate:saving'))}
                      </span>
                    </>
                  );
                } else if (status === 'approved') {
                  return (
                    <>
                      <Icon icon="check" className="me-1 text-green-600" />
                      <span dir={i18n.dir(i18n.language)}>
                        {capitalize(t('translate:approved'))}
                      </span>
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
