import { ComponentProps, forwardRef, useEffect, useState } from 'react';
import { Icon } from '../Icon';

export interface AutocompleteInputProps
  extends Omit<ComponentProps<'input'>, 'value'> {
  value?: string;
  suggestions: string[];
}

function normalizeFilter(word: string) {
  // From https://stackoverflow.com/a/37511463
  return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ className, onBlur, suggestions, value, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
      []
    );

    useEffect(() => {
      if (value) {
        const normalizedInput = normalizeFilter(value.toLowerCase());
        setFilteredSuggestions(
          suggestions.filter((suggestion) =>
            normalizeFilter(suggestion.toLowerCase()).includes(normalizedInput)
          )
        );
      } else {
        setFilteredSuggestions(suggestions);
      }
    }, [value, suggestions]);

    return (
      <div className={`${className}  group/combobox relative`}>
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
            onBlur={(e) => {
              if (e.relatedTarget !== e.currentTarget.nextSibling) {
                setOpen(false);
              }
              onBlur?.(e);
            }}
            className="w-full py-2 px-3 h-10 rounded-b flex-grow focus:outline-none bg-transparent rounded"
          />
          <button
            className="w-8"
            aria-hidden="true"
            tabIndex={-1}
            onClick={(e) => {
              setOpen(!open);
              const input = e.currentTarget.previousSibling as HTMLInputElement;
              input.focus();
            }}
          >
            <Icon icon={open ? 'caret-up' : 'caret-down'} />
          </button>
        </div>
        {open && (
          <ol className="z-10 absolute min-w-[160px] w-full max-h-80 bg-white overflow-auto mt-1 rounded border border-slate-400 shadow">
            {filteredSuggestions.map((suggestion) => (
              <li className="px-3 py-2 ui-active:bg-blue-400" key={suggestion}>
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
