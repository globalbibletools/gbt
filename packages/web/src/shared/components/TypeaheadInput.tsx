import { useEffect, useState } from 'react';
import { useCombobox } from 'downshift';
import TextInput from './TextInput';
import { Icon } from './Icon';

export interface TypeaheadInputItem {
  label: string;
  value: string;
}

export interface TypeaheadInputProps {
  className?: string;
  value?: string;
  labelId?: string;
  items: TypeaheadInputItem[];
  onSelect(value?: string): void;
}

export default function TypeaheadInput({
  className = '',
  items,
  value,
  onSelect,
}: TypeaheadInputProps) {
  const [filteredItems, setFilteredItems] =
    useState<TypeaheadInputItem[]>(items);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
    selectItem,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      if (inputValue) {
        const filteredItems = items.filter((item) =>
          item.label.includes(inputValue)
        );
        if (filteredItems.every((item) => item.label !== inputValue)) {
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
    },
    items: filteredItems,
    itemToString(item) {
      return item?.label ?? '';
    },
    onSelectedItemChange(changes) {
      onSelect(
        changes.selectedItem?.value === '_create'
          ? changes.selectedItem.label
          : changes.selectedItem?.value
      );
    },
  });

  useEffect(() => {
    selectItem(items.find((item) => item.value === value) ?? null);
  }, [value, selectItem, items]);

  return (
    <div className={`relative ${className}`}>
      <TextInput
        className={`w-full pr-10 ${isOpen ? 'rounded-b-none' : ''}`}
        {...getInputProps()}
      />
      <button
        aria-label="toggle menu"
        className="absolute px-2 top-0 right-0 w-10 h-10"
        type="button"
        {...getToggleButtonProps()}
      >
        <Icon icon={isOpen ? 'caret-up' : 'caret-down'} />
      </button>
      <ul
        className={`
          absolute w-full bg-white shadow-md max-h-80 overflow-scroll p-0
          border-slate-300 border border-t-0 rounded-b
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
