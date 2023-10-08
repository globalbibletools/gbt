import { ComponentProps, forwardRef, useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';

export interface AutocompleteInputProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  state?: 'success';
  value?: string;
  /** When specified, overrides the text direction of the component. */
  dir?: 'ltr' | 'rtl';
  /** A change is implicit if it occurs:
   *    - when a user clicks out of the input
   *    - when a user uses the tab key to select
   *
   *  A change is explicit if it occurs:
   *    - when a user clicks on an autocomplete suggestion
   *    - when a user uses the enter key to select
   */
  onChange(value: string, implicit: boolean): void;
  suggestions: string[];
}

function normalizeFilter(word: string) {
  // From https://stackoverflow.com/a/37511463
  return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  (
    {
      className,
      style,
      suggestions,
      value,
      onChange,
      onKeyDown,
      state,
      dir,
      ...props
    },
    ref
  ) => {
    const [input, setInput] = useState('');
    const [isOpen, setOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
      []
    );
    const [activeIndex, setActiveIndex] = useState<number | undefined>();

    useEffect(() => {
      setInput(value ?? '');
    }, [value]);

    useEffect(() => {
      if (input) {
        const normalizedInput = normalizeFilter(input.toLowerCase());
        setFilteredSuggestions(
          suggestions.filter((suggestion) =>
            normalizeFilter(suggestion.toLowerCase()).includes(normalizedInput)
          )
        );
        setActiveIndex(undefined);
      } else {
        setFilteredSuggestions(suggestions);
        setActiveIndex(undefined);
      }
    }, [input, suggestions]);

    function open() {
      setOpen(true);
      setActiveIndex(undefined);
    }

    function close() {
      setOpen(false);
      setActiveIndex(undefined);
    }

    function change(newValue: string, implicit: boolean) {
      if (newValue !== value || !implicit) {
        onChange(newValue, implicit);
      }
    }

    const root = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const handler = (e: PointerEvent) => {
        if (!root.current?.contains(e.target as Element)) {
          let newValue;
          if (typeof activeIndex === 'number') {
            newValue = filteredSuggestions[activeIndex];
          } else {
            newValue = input;
          }
          if (newValue !== value) {
            onChange(newValue, true);
          }
          close();
        }
      };
      window.addEventListener('pointerdown', handler);
      return () => window.removeEventListener('pointerdown', handler);
    }, [onChange, input, activeIndex, filteredSuggestions, value]);

    return (
      <div
        ref={root}
        className={`${className} group/combobox relative`}
        style={style}
        dir={dir}
      >
        <div
          className={`
            border rounded shadow-inner flex group-focus-within/combobox:outline group-focus-within/combobox:outline-2
            ${
              state === 'success'
                ? 'border-green-600 group-focus-within/combobox:outline-green-700'
                : 'border-slate-400 group-focus-within/combobox:outline-blue-600'
            }
          `}
        >
          <input
            {...props}
            ref={ref}
            className={`
              w-full py-2 h-10 rounded-b flex-grow focus:outline-none bg-transparent rounded
              ${typeof dir !== 'string' ? 'ps-3' : ''}
              ${dir === 'ltr' ? 'pl-3 text-left' : ''}
              ${dir === 'rtl' ? 'pr-3 text-right' : ''}
            `}
            autoComplete="off"
            value={
              typeof activeIndex === 'number'
                ? filteredSuggestions[activeIndex]
                : input
            }
            onChange={(e) => {
              open();
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                switch (e.key) {
                  case 'Enter':
                  case 'Tab': {
                    if (typeof activeIndex === 'number') {
                      change(filteredSuggestions[activeIndex], e.key === 'Tab');
                    } else {
                      change(input, e.key === 'Tab');
                    }
                    close();
                    break;
                  }
                  case 'Escape': {
                    close();
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                  }
                  case 'ArrowDown': {
                    if (isOpen) {
                      if (typeof activeIndex === 'number') {
                        if (activeIndex === filteredSuggestions.length - 1) {
                          setActiveIndex(undefined);
                        } else {
                          setActiveIndex(activeIndex + 1);
                        }
                      } else {
                        setActiveIndex(0);
                      }
                    } else {
                      open();
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                  }
                  case 'ArrowUp': {
                    if (isOpen) {
                      if (typeof activeIndex === 'number') {
                        if (activeIndex === 0) {
                          setActiveIndex(undefined);
                        } else {
                          setActiveIndex(activeIndex - 1);
                        }
                      } else {
                        setActiveIndex(filteredSuggestions.length - 1);
                      }
                    } else {
                      open();
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                  }
                }
              }
              onKeyDown?.(e);
            }}
          />
          <button
            className="w-8"
            aria-hidden="true"
            tabIndex={-1}
            onClick={(e) => {
              if (isOpen) close();
              else open();
              const input = e.currentTarget.previousSibling as HTMLInputElement;
              input.focus();
            }}
          >
            <Icon icon={isOpen ? 'caret-up' : 'caret-down'} />
          </button>
        </div>
        {isOpen && (
          <ol className="z-10 absolute min-w-full min-h-[24px] max-h-80 bg-white overflow-auto mt-1 rounded border border-slate-400 shadow">
            {filteredSuggestions.map((suggestion, i) => (
              <li
                tabIndex={-1}
                ref={
                  i === activeIndex
                    ? (el) => {
                        el?.scrollIntoView({
                          block: 'nearest',
                        });
                      }
                    : undefined
                }
                className={`
                  px-3 py-1 whitespace-nowrap cursor-pointer hover:bg-blue-400
                  ${i === activeIndex ? 'bg-blue-400' : ''}
                `}
                key={suggestion}
                onClick={() => {
                  change(suggestion, false);
                  close();
                }}
              >
                {suggestion}
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }
);

export default AutocompleteInput;
