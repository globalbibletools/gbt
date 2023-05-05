import { ReactNode, useEffect, useState } from 'react';
import { useCombobox } from 'downshift';
import TextInput from './TextInput';
import { Icon } from './Icon';

export interface TypeaheadInputProps<Item, Value> {
  className?: string;
  value?: Value;
  labelId?: string;
  items: Item[];
  toValue(item: Item): Value;
  renderItem?(item: Item): ReactNode;
  filter?(input: string | undefined, item: Item): boolean;
  onChange(value?: Value): void;
}

// TODO: no items state.
export default function TypeaheadInput<
  Item extends { toString(): string },
  Value
>({
  className = '',
  items,
  toValue,
  filter = () => true,
  renderItem = (item) => item.toString(),
  value,
  onChange,
}: TypeaheadInputProps<Item, Value>) {
  const [filteredItems, setFilteredItems] = useState(items);
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
      setFilteredItems(items.filter((item) => filter(inputValue, item)));
    },
    items: filteredItems,
    onSelectedItemChange(changes) {
      onChange(
        changes.selectedItem ? toValue(changes.selectedItem) : undefined
      );
    },
  });

  useEffect(() => {
    selectItem(items.find((item) => toValue(item) === value) ?? null);
  }, [value, selectItem, toValue, items]);

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
            const itemValue = toValue(item);
            return (
              <li
                className={`
                ${highlightedIndex === index ? 'bg-blue-300' : ''}
                ${selectedItem === item ? 'font-bold' : ''}
                py-2 px-3
              `}
                key={`${itemValue}${index}`}
                {...getItemProps({ item, index })}
              >
                {renderItem(item)}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
