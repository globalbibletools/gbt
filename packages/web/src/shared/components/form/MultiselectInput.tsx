import { forwardRef } from 'react';
import { Combobox } from '@headlessui/react';
import { useFormContext } from 'react-hook-form';
import { Icon } from '../Icon';

export interface MultiselectInputProps {
  className?: string;
  name: string;
  items: { label: string; value: string }[];
  value?: string[];
  defaultValue?: string[];
  placeholder?: string;
  onChange?(value: string[]): void;
  onBlur?(): void;
}

const MultiselectInput = forwardRef<HTMLInputElement, MultiselectInputProps>(
  (
    {
      className = '',
      value,
      onChange,
      onBlur,
      items,
      name,
      defaultValue,
      placeholder,
    },
    ref
  ) => {
    const formContext = useFormContext();
    const hasErrors = !!(name && formContext?.getFieldState(name).error);

    return (
      <div className={`${className} group/multiselect relative`}>
        <Combobox
          value={value}
          onChange={onChange}
          multiple
          name={name}
          defaultValue={defaultValue}
        >
          <div
            className={`
            border rounded shadow-inner flex
            group-focus-within/multiselect:outline group-focus-within/multiselect:outline-2
            ${
              hasErrors
                ? 'border-red-700 shadow-red-100 group-focus-within/multiselect:outline-red-700'
                : 'border-slate-400 group-focus-within/multiselect:outline-blue-600'
            }
          `}
          >
            <Combobox.Input
              className="w-full py-2 px-3 h-10 rounded-b flex-grow focus:outline-none bg-transparent rounded"
              readOnly
              ref={ref}
              onBlur={onBlur}
              displayValue={(value: string[]) =>
                value
                  .map((v) => items.find((i) => i.value === v)?.label ?? '')
                  .join(', ')
              }
              placeholder={placeholder}
            />
            <Combobox.Button className="w-8">
              {({ open }) => <Icon icon={open ? 'caret-up' : 'caret-down'} />}
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded border border-slate-400 bg-white shadow">
            {items.map((item) => (
              <Combobox.Option
                className="px-3 py-2 ui-active:bg-blue-400"
                key={item.value}
                value={item.value}
              >
                {({ selected }) => (
                  <>
                    <span className="inline-block w-6">
                      {selected && <Icon icon="check" />}
                    </span>
                    {item.label}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox>
      </div>
    );
  }
);

export default MultiselectInput;
