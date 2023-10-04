import { ComponentProps, forwardRef, useEffect, useState } from 'react';
import { Icon } from '../Icon';

export interface AutocompleteInputProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string;
  onChange(value: string): void;
  suggestions: string[];
}

function normalizeFilter(word: string) {
  // From https://stackoverflow.com/a/37511463
  return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  (
    { className, onBlur, suggestions, value, onChange, onKeyDown, ...props },
    ref
  ) => {
    const [isOpen, setOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
      []
    );

    const [activeIndex, setActiveIndex] = useState<number | undefined>();

    useEffect(() => {
      if (value) {
        const normalizedInput = normalizeFilter(value.toLowerCase());
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
    }, [value, suggestions]);

    function open() {
      setOpen(true);
      setActiveIndex(undefined);
    }

    function close() {
      setOpen(false);
      setActiveIndex(undefined);
    }

    return (
      <div className={`${className} group/combobox relative`}>
        <div
          className={`
            border rounded shadow-inner flex group-focus-within/combobox:outline group-focus-within/combobox:outline-2
          border-slate-400 group-focus-within/combobox:outline-blue-600
          `}
        >
          <input
            ref={ref}
            {...props}
            value={value ?? ''}
            onChange={(e) => {
              open();
              onChange(e.target.value);
            }}
            onBlur={(e) => {
              if (e.relatedTarget !== e.currentTarget.nextSibling) {
                close();
              }
              onBlur?.(e);
            }}
            onKeyDown={(e) => {
              if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                switch (e.key) {
                  case 'Enter':
                  case 'Tab': {
                    if (typeof activeIndex === 'number') {
                      onChange(filteredSuggestions[activeIndex]);
                    }
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
            className="w-full py-2 px-3 h-10 rounded-b flex-grow focus:outline-none bg-transparent rounded"
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
          <ol className="z-10 absolute min-w-full max-h-80 bg-white overflow-auto mt-1 rounded border border-slate-400 shadow">
            {filteredSuggestions.map((suggestion, i) => (
              <li
                className={`
                  px-3 py-2
                  ${i === activeIndex ? 'bg-blue-400' : ''}
                `}
                key={suggestion}
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
