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
import { TextDirection } from '@translation/api-types';
import Button from '../../shared/components/actions/Button';

export interface TranslateWordProps {
  editable?: boolean;
  word: { id: string; text: string };
  originalLanguage: 'hebrew' | 'greek';
  status: 'empty' | 'saving' | 'saved' | 'approved';
  gloss?: string;
  machineGloss?: string;
  targetLanguage?: { textDirection: TextDirection; font: string };
  referenceGloss?: string;
  suggestions: string[];
  onChange(data: { gloss?: string; approved?: boolean }): void;
  onFocus?: () => void;
  onShowDetail?: () => void;
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
      machineGloss,
      targetLanguage,
      referenceGloss,
      suggestions,
      onChange,
      onFocus,
      onShowDetail,
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

    const glossValue = gloss || suggestions[0] || machineGloss;
    const [currentInputValue, setCurrentInputValue] = useState(
      glossValue ?? ''
    );
    const hasMachineSuggestion = !gloss && !suggestions[0] && !!machineGloss;

    const glossWidth = useTextWidth({
      text: glossValue ?? '',
      fontFamily: expandFontFamily(targetLanguage?.font ?? 'Noto Sans'),
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
          // The extra 24 pixels accommodates the google icon
          // The extra 48 pixels accommodates the approval button
          glossWidth + (hasMachineSuggestion ? 24 : 0) + 48
        )
      );
    }, [glossWidth, hasMachineSuggestion]);

    return (
      <li
        className="mx-2 mb-4"
        ref={root}
        dir={originalLanguage === 'hebrew' ? 'rtl' : 'ltr'}
      >
        <div
          id={`word-${word.id}`}
          className={`mb-1 h-8 cursor-pointer font-mixed ${
            originalLanguage === 'hebrew' ? 'text-right pr-3' : 'text-left pl-3'
          }`}
          tabIndex={-1}
          onClick={() => {
            onFocus?.();
            onShowDetail?.();
          }}
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
            <div
              className={`min-w-[128px] group/input-row flex gap-2 items-center ${
                originalLanguage === 'hebrew' ? 'flex-row' : 'flex-row-reverse'
              }`}
              // The extra 26 pixels give room for the padding and border.
              style={{
                width: width + 26,
                fontFamily: expandFontFamily(
                  targetLanguage?.font ?? 'Noto Sans'
                ),
              }}
              dir={targetLanguage?.textDirection ?? TextDirection.LTR}
            >
              <div className="group-focus-within/input-row:block hidden">
                {currentInputValue && status !== 'approved' && (
                  <Button
                    className="!bg-green-600"
                    tabIndex={-1}
                    title={t('translate:approve_tooltip') ?? ''}
                    onClick={() => {
                      if (status === 'saved') {
                        onChange({ approved: true });
                      } else {
                        onChange({ approved: true, gloss: glossValue });
                      }
                      root.current?.querySelector('input')?.focus();
                    }}
                  >
                    <Icon icon="check" />
                  </Button>
                )}
                {status === 'approved' && (
                  <Button
                    className="!bg-red-600"
                    tabIndex={-1}
                    title={t('translate:revoke_tooltip') ?? ''}
                    onClick={() => {
                      onChange({ approved: false });
                      root.current?.querySelector('input')?.focus();
                    }}
                  >
                    <Icon icon="arrow-rotate-left" />
                  </Button>
                )}
              </div>
              <div className="relative grow">
                {hasMachineSuggestion && (
                  <Icon
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      originalLanguage === 'hebrew' ? 'left-3' : 'right-3'
                    }`}
                    icon={['fab', 'google']}
                  />
                )}
                <AutocompleteInput
                  className={`
                  w-full h-10
                  ${originalLanguage === 'hebrew' ? 'text-right' : 'text-left'}
                `}
                  inputClassName={
                    originalLanguage === 'hebrew' ? 'text-right' : 'text-left'
                  }
                  renderOption={(item, i) => (
                    <div
                      className={
                        machineGloss
                          ? `relative ${
                              originalLanguage === 'hebrew' ? 'pl-5' : 'pr-5'
                            }`
                          : ''
                      }
                    >
                      {item}
                      {i === suggestions.length ? (
                        <Icon
                          className={`absolute top-1 ${
                            originalLanguage === 'hebrew' ? 'left-0' : 'right-0'
                          }`}
                          icon={['fab', 'google']}
                        />
                      ) : undefined}
                    </div>
                  )}
                  name="gloss"
                  value={glossValue}
                  state={status === 'approved' ? 'success' : undefined}
                  aria-describedby={`word-help-${word.id}`}
                  aria-labelledby={`word-${word.id}`}
                  onChange={(value, implicit) => {
                    if (
                      value !== gloss ||
                      (!implicit && status !== 'approved')
                    ) {
                      onChange({
                        gloss: value,
                        approved: !implicit && !!value,
                      });
                    }
                  }}
                  onInput={(event) => {
                    setCurrentInputValue(
                      (event.target as HTMLInputElement).value
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.metaKey || e.altKey || e.ctrlKey) return;
                    switch (e.key) {
                      case 'Enter': {
                        e.preventDefault();
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
                  onFocus={() => onFocus?.()}
                  suggestions={
                    machineGloss ? [...suggestions, machineGloss] : suggestions
                  }
                  ref={input}
                />
              </div>
            </div>
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
