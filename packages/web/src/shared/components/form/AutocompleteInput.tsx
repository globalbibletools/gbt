import {
  ComponentProps,
  ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface AutocompleteInputProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  inputClassName?: string;
  state?: 'success';
  value?: string;
  right?: boolean;
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
  renderOption?(item: string, index: number): ReactNode;
}

function normalizeFilter(word: string) {
  // From https://stackoverflow.com/a/37511463
  return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  (
    {
      inputClassName = '',
      className = '',
      style,
      suggestions,
      value,
      right,
      onChange,
      onKeyDown,
      state,
      renderOption,
      ...props
    },
    ref
  ) => {
    const [input, setInput] = useState('');
    const [isFocused, setFocus] = useState(false);
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
      if (isFocused) {
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
      }
    }, [isFocused, onChange, input, activeIndex, filteredSuggestions, value]);

    return (
      <div ref={root} className={`${className} relative`} style={style}>
        <input
          {...props}
          ref={ref}
          className={`
            ${inputClassName}
            border rounded shadow-inner focus-visible:outline outline-2 outline-offset-0 outline-green-300
            w-full px-3 h-9 bg-transparent
            ${state === 'success' ? 'border-green-600' : 'border-gray-400'}
          `}
          autoComplete="off"
          value={
            typeof activeIndex === 'number'
              ? filteredSuggestions[activeIndex]
              : input
          }
          onFocus={(e) => {
            setFocus(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            props.onBlur?.(e);
          }}
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
        {isOpen && filteredSuggestions.length > 0 && (
          <ol
            className={`z-10 absolute min-w-full min-h-[24px] max-h-80 bg-white overflow-auto mt-1 rounded border border-gray-400 shadow ${
              right ? 'right-0' : 'left-0'
            }`}
          >
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
                  px-3 py-1 whitespace-nowrap cursor-pointer
                  ${i === activeIndex ? 'bg-blue-800 text-white' : ''}
                `}
                key={suggestion}
                onClick={() => {
                  change(suggestion, false);
                  close();
                }}
              >
                {renderOption?.(suggestion, i) ?? suggestion}
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }
);

export default AutocompleteInput;
