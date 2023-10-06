import { Combobox } from '@headlessui/react';
import {
  ComponentProps,
  KeyboardEventHandler,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';

const CREATE_TAG = '_create';
const MAX_ITEMS = 1000;

export interface ComboboxItem {
  label: string;
  value: string;
}

export interface ComboboxProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'ref'> {
  className?: string;
  value?: string;
  onBlur?(): void;
  onChange?(value: string): void;
  onCreate?(text?: string): void;
  items: ComboboxItem[];
  defaultValue?: string[];
  name: string;
  hasErrors?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

const ComboboxInput = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      className = '',
      hasErrors,
      value,
      onChange,
      onCreate,
      onBlur,
      items,
      name,
      onKeyDown,
      ...props
    }: ComboboxProps,
    ref
  ) => {
    const { t } = useTranslation(['common']);
    const [normalizedInputValue, setNormalizedInputValue] = useState('');
    const [filteredItems, setFilteredItems] = useState<ComboboxItem[]>(items);

    // If none of the items matches the input value exactly,
    // then we want to give the option of creating a new item.
    useEffect(() => {
      if (normalizedInputValue) {
        const filteredItems = items.filter((item) =>
          ignoreDiacritics(item.label.normalize('NFD').toLowerCase()).includes(
            ignoreDiacritics(normalizedInputValue.toLowerCase())
          )
        );
        const noExactMatch = filteredItems.every(
          (item) => item.label.normalize('NFD') !== normalizedInputValue
        );
        if (noExactMatch && !!onCreate) {
          setFilteredItems([
            { value: CREATE_TAG, label: normalizedInputValue },
            ...filteredItems,
          ]);
        } else {
          setFilteredItems(filteredItems);
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
      <div className={`${className}  group/combobox relative`}>
        <Combobox value={value} onChange={onComboboxChange} name={name}>
          <div
            className={`border rounded shadow-inner flex group-focus-within/combobox:outline group-focus-within/combobox:outline-2

            ${
              hasErrors
                ? 'border-red-700 shadow-red-100 group-focus-within/combobox:outline-red-700'
                : 'border-slate-400 group-focus-within/combobox:outline-blue-600'
            }
          `}
          >
            <Combobox.Input
              {...props}
              onChange={(event) =>
                setNormalizedInputValue(event.target.value.normalize('NFD'))
              }
              onBlur={onBlur}
              className="w-full py-2 px-3 h-10 rounded-b flex-grow focus:outline-none bg-transparent rounded"
              onKeyDown={(e) => {
                if (onKeyDown) {
                  onKeyDown(e);
                }
              }}
              ref={ref}
            />
            <Combobox.Button className="w-8">
              {({ open }) => <Icon icon={open ? 'caret-up' : 'caret-down'} />}
            </Combobox.Button>
          </div>
          <Combobox.Options className="z-10 absolute min-w-[160px] w-full max-h-80 bg-white overflow-auto mt-1 rounded border border-slate-400 shadow">
            {filteredItems.length > MAX_ITEMS ? (
              <div className="px-3 py-2">{t('common:too_many_options')}</div>
            ) : (
              filteredItems.map((item) => (
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
              ))
            )}
          </Combobox.Options>
        </Combobox>
      </div>
    );
  }
);

/**
 * Return a version of the word where all diacritics have been removed.
 */
function ignoreDiacritics(word: string) {
  // From https://stackoverflow.com/a/37511463
  return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export default ComboboxInput;
