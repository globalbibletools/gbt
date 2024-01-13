import { Combobox } from '@headlessui/react';
import {
  ComponentProps,
  KeyboardEventHandler,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';

const MAX_ITEMS = 1000;

export interface ComboboxItem {
  label: string;
  value: string;
}

interface BaseComboboxInputProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'ref'> {
  className?: string;
  name?: string;
  items: ComboboxItem[];
  value?: string;
  defaultValue?: string;
  up?: boolean;
  onBlur?(): void;
  onChange?(value: string): void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

const ComboboxInput = forwardRef<HTMLInputElement, BaseComboboxInputProps>(
  (
    {
      className = '',
      value = '',
      onChange,
      onBlur,
      items,
      name,
      up,
      onKeyDown,
      disabled,
      ...props
    }: BaseComboboxInputProps,
    ref
  ) => {
    const { t } = useTranslation(['common']);
    const [normalizedInputValue, setNormalizedInputValue] = useState('');
    const [filteredItems, setFilteredItems] = useState<ComboboxItem[]>(items);

    const formContext = useFormContext();
    const hasErrors = !!(
      formContext &&
      name &&
      formContext.getFieldState(name).error
    );

    // If none of the items matches the input value exactly,
    // then we want to give the option of creating a new item.
    useEffect(() => {
      if (normalizedInputValue) {
        const filteredItems = items.filter((item) =>
          ignoreDiacritics(item.label.normalize('NFD').toLowerCase()).includes(
            ignoreDiacritics(normalizedInputValue.toLowerCase())
          )
        );
        setFilteredItems(filteredItems);
      } else {
        setFilteredItems(items);
      }
    }, [items, normalizedInputValue]);

    return (
      <div
        className={`${className}  group/combobox relative ${
          disabled ? 'opacity-25' : ''
        }`}
      >
        <Combobox
          value={value}
          onChange={onChange}
          name={name}
          disabled={disabled}
        >
          <div
            className={`
              border rounded shadow-inner flex group-focus-within/combobox:outline group-focus-within/combobox:outline-2
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
              displayValue={(value) =>
                items.find((i) => i.value === value)?.label ?? ''
              }
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
          <Combobox.Options
            className={`
              z-10 absolute min-w-[160px] w-full max-h-80 bg-white overflow-auto mt-1 rounded border border-slate-400 shadow
              ${up ? '-mt-1 top-0 transform -translate-y-full' : 'mt-1'}
            `}
          >
            {filteredItems.length > MAX_ITEMS ? (
              <div className="px-3 py-2">{t('common:too_many_options')}</div>
            ) : (
              filteredItems.map((item) => (
                <Combobox.Option
                  className="px-3 py-2 ui-active:bg-blue-400 h-10"
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Combobox>
      </div>
    );
  }
);

export default ComboboxInput;

/**
 * Return a version of the word where all diacritics have been removed.
 */
function ignoreDiacritics(word: string) {
  // From https://stackoverflow.com/a/37511463
  return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
