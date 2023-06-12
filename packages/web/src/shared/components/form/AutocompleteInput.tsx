import { useCombobox } from 'downshift';
import { ComponentProps, useEffect, useState } from 'react';
import { Icon } from '../Icon';
import TextInput from './TextInput';

export interface AutocompleteItem {
  label: string;
  value: string;
}

export interface AutocompleteInputProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string;
  items: AutocompleteItem[];
  onChange(value?: string): void;
  onCreate?(text?: string): void;
}

/**
 * Text input with autocomplete suggestions.
 *
 * Suggestions have the shape of `{ label: string; value: string; }`.
 * When an item is selected, its value will be passed to the `onChange` event.
 *
 * To support the creation of new items, attach the `onCreate` event.
 * The text value will be passed to the event.
 */
export default function AutocompleteInput({
  className = '',
  items,
  value,
  onChange,
  onCreate,
  ...props
}: AutocompleteInputProps) {
  const [filteredItems, setFilteredItems] = useState<AutocompleteItem[]>(items);

  const {
    inputValue,
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
    selectItem,
    setHighlightedIndex,
  } = useCombobox({
    items: filteredItems,
    itemToString(item) {
      return item?.label ?? '';
    },
    onSelectedItemChange({ selectedItem }) {
      if (selectedItem?.value === '_create') {
        onCreate?.(selectedItem.label);
      } else {
        if (selectedItem?.value !== value) {
          onChange(selectedItem?.value);
        }
      }
    },
  });

  // If none of the items matches the input value exactly,
  // then we want to give the option of creating a new item.
  useEffect(() => {
    if (inputValue) {
      const filteredItems = items.filter((item) =>
        item.label.includes(inputValue)
      );
      if (
        filteredItems.every((item) => item.label !== inputValue) &&
        !!onCreate
      ) {
        setFilteredItems([
          { value: '_create', label: inputValue },
          ...filteredItems,
        ]);
      } else {
        setFilteredItems(items);
      }
    } else {
      setFilteredItems(items);
    }
  }, [items, inputValue, onCreate]);

  // In order to make this smooth, we want to make sure an item is always highlighted
  // so you can immediately tab out of the control to select a new value.
  useEffect(() => {
    if (highlightedIndex < 0) {
      setHighlightedIndex(0);
    }
  }, [highlightedIndex, setHighlightedIndex]);

  // We need to keep the state of the dropdown in sync with the value prop.
  useEffect(() => {
    selectItem(items.find((item) => item.value === value) ?? null);
  }, [value, selectItem, items]);

  return (
    <div className="relative">
      <TextInput
        {...props}
        {...getInputProps()}
        className={`w-full pe-10 ${
          isOpen ? 'rounded-b-none' : ''
        } ${className}`}
      />
      <button
        aria-label="toggle menu"
        className="absolute px-2 top-0 end-0 w-10 h-10"
        type="button"
        {...getToggleButtonProps()}
      >
        <Icon icon={isOpen ? 'caret-up' : 'caret-down'} />
      </button>
      <ul
        className={`
          absolute bg-white shadow-md max-h-80 overflow-y-auto p-0
          border-slate-300 border rounded-b z-10
          min-w-full max-w-[300px] w-max
          ${!(isOpen && filteredItems.length) && 'hidden'}
        `}
        {...getMenuProps()}
      >
        {isOpen &&
          filteredItems.map((item, index) => {
            return (
              <li
                className={`
                    ${highlightedIndex === index ? 'bg-blue-300' : ''}
                    ${selectedItem === item ? 'font-bold' : ''}
                    py-2 px-3
                  `}
                key={`${item.value}-${index}`}
                {...getItemProps({ item, index })}
              >
                {item.value === '_create' ? (
                  <>
                    <Icon icon="add" /> "
                    <span className="italic">{item.label}</span>"
                  </>
                ) : (
                  item.label
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
