import {
  MouseEvent,
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
import {
  GlossState,
  TextDirection,
  VersePhrase,
  VerseWord,
  VerseWordSuggestion,
} from '@translation/api-types';
import Button from '../../shared/components/actions/Button';
import { isRichTextEmpty } from '../../shared/components/form/RichTextInput';
import Checkbox from '../../shared/components/form/Checkbox';

export interface TranslateWordProps {
  originalLanguage: 'hebrew' | 'greek';

  phrase: VersePhrase;
  hints?: VerseWordSuggestion;
  word: VerseWord;
  targetLanguage?: { textDirection: TextDirection; font: string };

  editable?: boolean;
  selected?: boolean;
  saving?: boolean;
  phraseFocused?: boolean;

  onChange(data: { gloss?: string; approved?: boolean }): void;
  onFocus?: () => void;
  onShowDetail?: () => void;
  onOpenNotes?: () => void;
  onSelect?: () => void;
}

export interface TranslateWordRef {
  focus(): void;
}

const TranslateWord = forwardRef<TranslateWordRef, TranslateWordProps>(
  (
    {
      phrase,
      hints,
      word,
      targetLanguage,

      editable = false,
      selected = false,
      saving = false,
      phraseFocused = false,

      originalLanguage,
      onChange,
      onFocus,
      onShowDetail,
      onOpenNotes,
      onSelect,
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

    let status: 'empty' | 'saving' | 'saved' | 'approved' = 'empty';
    if (saving) {
      status = 'saving';
    } else if (phrase.gloss?.text) {
      status =
        phrase.gloss.state === GlossState.Approved ? 'approved' : 'saved';
    }

    const isMultiWord = phrase.wordIds.length > 1;

    const hasTranslatorNote = !isRichTextEmpty(
      phrase.translatorNote?.content ?? ''
    );
    const hasFootnote = !isRichTextEmpty(phrase.footnote?.content ?? '');
    const hasNote = hasFootnote || (hasTranslatorNote && editable);

    const glossValue =
      phrase.gloss?.text ||
      (isMultiWord
        ? undefined
        : hints?.suggestions?.[0] || hints?.machineGloss);
    const [currentInputValue, setCurrentInputValue] = useState(
      glossValue ?? ''
    );
    const hasMachineSuggestion =
      !isMultiWord &&
      !phrase.gloss?.text &&
      !hints?.suggestions?.[0] &&
      !!hints?.machineGloss;

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
          // The first 24 pixels accommodates the checkbox and link icon for phrases.
          // The extra 36 pixels accommodates the sticky note icon
          24 + (hasNote ? 36 : 0) + (ancientWord.current?.clientWidth ?? 0),
          refGloss.current?.clientWidth ?? 0,
          // The extra 24 pixels accommodates the google icon
          // The extra 48 pixels accommodates the approval button
          glossWidth + (hasMachineSuggestion ? 24 : 0) + 44
        )
      );
    }, [hasNote, glossWidth, hasMachineSuggestion, isMultiWord]);

    return (
      <li
        ref={root}
        dir={originalLanguage === 'hebrew' ? 'rtl' : 'ltr'}
        className={`
          group/word relative p-2 rounded
          ${phraseFocused && !selected ? 'bg-brown-50' : ''}
          ${selected ? 'shadow-inner bg-brown-100' : ''}
        `}
        onClick={(e) => {
          if (!e.altKey) return;
          if (!isMultiWord) {
            onSelect?.();
          }
        }}
      >
        <div
          id={`word-${word.id}`}
          className={`flex items-center gap-1.5 h-8 cursor-pointer font-mixed ${
            originalLanguage === 'hebrew' ? 'text-right pr-3' : 'text-left pl-3'
          }`}
        >
          <span
            className="inline-block"
            ref={ancientWord}
            tabIndex={-1}
            onClick={() => {
              onFocus?.();
              onShowDetail?.();
            }}
          >
            {word.text}
          </span>
          <Button
            className={hasNote ? 'inline-block' : 'hidden'}
            title="Jump to Note"
            small
            variant="tertiary"
            tabIndex={-1}
            onClick={(e: MouseEvent) => {
              if (e.altKey) return;
              onFocus?.();
              onShowDetail?.();
              onOpenNotes?.();
            }}
          >
            <Icon icon="sticky-note" />
          </Button>
          <div className="flex-grow" />
          {isMultiWord ? (
            <Icon
              title="Linked to another word"
              icon="link"
              className="text-gray-600"
            />
          ) : (
            <Checkbox
              className="invisible group-hover/word:visible group-focus-within/word:visible [&:has(:checked)]:visible"
              aria-label="word selected"
              tabIndex={-1}
              checked={selected}
              onChange={() => onSelect?.()}
              onFocus={() => {
                onFocus?.();
                onShowDetail?.();
              }}
            />
          )}
        </div>
        <div
          className={`h-8 ${
            originalLanguage === 'hebrew' ? 'text-right pr-3' : 'text-left pl-3'
          }`}
          dir="ltr"
        >
          <span className="inline-block" ref={refGloss}>
            {editable ? word.referenceGloss : phrase.gloss?.text}
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
                    className="!bg-green-600 w-9"
                    tabIndex={-1}
                    title={t('translate:approve_tooltip') ?? ''}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
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
                    className="!bg-red-600 w-9"
                    tabIndex={-1}
                    title={t('translate:revoke_tooltip') ?? ''}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
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
                  className={`w-full ${
                    originalLanguage === 'hebrew' ? 'text-right' : 'text-left'
                  }`}
                  inputClassName={
                    originalLanguage === 'hebrew' ? 'text-right' : 'text-left'
                  }
                  right={originalLanguage === 'hebrew'}
                  renderOption={(item, i) => (
                    <div
                      className={
                        hints?.machineGloss
                          ? `relative ${
                              originalLanguage === 'hebrew' ? 'pl-5' : 'pr-5'
                            }`
                          : ''
                      }
                    >
                      {item}
                      {i === hints?.suggestions.length ? (
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
                      value !== phrase.gloss?.text ||
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
                    if (e.metaKey || e.ctrlKey) return;
                    switch (e.key) {
                      case 'Enter': {
                        e.preventDefault();
                        if (e.shiftKey) {
                          const prev = root.current?.previousElementSibling;
                          prev?.querySelector('input')?.focus();
                        } else if (e.altKey) {
                          if (!isMultiWord) {
                            onSelect?.();
                          }
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
                    hints?.machineGloss
                      ? [...(hints?.suggestions ?? []), hints?.machineGloss]
                      : hints?.suggestions ?? []
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
                      <span
                        dir={i18n.dir(i18n.language)}
                        className="text-green-600"
                      >
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
