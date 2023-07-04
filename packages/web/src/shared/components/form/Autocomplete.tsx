import { Combobox } from '@headlessui/react';
import { ComponentProps, useEffect, useState } from 'react';
import { Icon } from '../Icon';

const CREATE_TAG = '_create';

export interface AutocompleteItem {
  label: string;
  value: string;
}

export interface AutocompleteProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'ref'> {
  className?: string;
  value?: string;
  onBlur?(): void;
  onChange?(value: string): void;
  onCreate?(text?: string): void;
  items: AutocompleteItem[];
  defaultValue?: string[];
  name: string;
  hasErrors?: boolean;
}

const Autocomplete = ({
  className = '',
  hasErrors,
  value,
  onChange,
  onCreate,
  onBlur,
  items,
  name,
  ...props
}: AutocompleteProps) => {
  const [normalizedInputValue, setNormalizedInputValue] = useState('');
  const [filteredItems, setFilteredItems] = useState<AutocompleteItem[]>(items);

  // If none of the items matches the input value exactly,
  // then we want to give the option of creating a new item.
  useEffect(() => {
    if (normalizedInputValue) {
      const filteredItems = items.filter((item) =>
        item.label
          .normalize()
          .toLowerCase()
          .includes(normalizedInputValue.toLowerCase())
      );
      const noExactMatch = filteredItems.every(
        (item) => item.label.normalize() !== normalizedInputValue
      );
      if (noExactMatch && !!onCreate) {
        setFilteredItems([
          { value: CREATE_TAG, label: normalizedInputValue },
          ...filteredItems,
        ]);
      } else {
        setFilteredItems(items);
      }
    } else {
      setFilteredItems(items);
    }
  }, [items, normalizedInputValue, onCreate]);

  function onComboboxChange(newValue: string) {
    if (newValue === CREATE_TAG) {
      onCreate?.(normalizedInputValue);
    } else {
      if (newValue !== value) {
        onChange?.(newValue);
      }
    }
  }

  return (
    <div className={`${className}  group/autocomplete relative`}>
      <Combobox value={value} onChange={onComboboxChange} name={name}>
        <div
          className={`border rounded shadow-inner flex group-focus-within/autocomplete:outline group-focus-within/autocomplete:outline-2
            
            ${
              hasErrors
                ? 'border-red-700 shadow-red-100 group-focus-within/autocomplete:outline-red-700'
                : 'border-slate-400 group-focus-within/autocomplete:outline-blue-600'
            }
          `}
        >
          <Combobox.Input
            {...props}
            onChange={(event) =>
              setNormalizedInputValue(event.target.value.normalize())
            }
            onBlur={onBlur}
            className="w-full py-2 px-3 h-10 rounded-b flex-grow focus:outline-none bg-transparent rounded"
          />
          <Combobox.Button className="w-8">
            {({ open }) => <Icon icon={open ? 'caret-up' : 'caret-down'} />}
          </Combobox.Button>
        </div>
        <Combobox.Options className="z-10 absolute min-w-[160px] w-full max-h-80 bg-white overflow-auto mt-1 rounded border border-slate-400 shadow">
          {filteredItems.map((item) => (
            <Combobox.Option
              className="px-3 py-2 ui-active:bg-blue-400"
              key={item.value}
              value={item.value}
            >
              {item.value === CREATE_TAG ? (
                <>
                  <Icon icon="add" /> "
                  <span className="italic">{item.label}</span>"
                </>
              ) : (
                item.label
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};

export default Autocomplete;
