import { Combobox } from '@headlessui/react';
import { ComponentProps, useState } from 'react';
import { Icon } from '../Icon';

export interface AutocompleteProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'ref'> {
  className?: string;
  value?: string;
  onBlur?(): void;
  onChange?(value: string): void;
  items: { label: string; value: string }[];
  defaultValue?: string[];
  name: string;
  hasErrors?: boolean;
}

const Autocomplete = ({
  className = '',
  hasErrors,
  value,
  onChange,
  onBlur,
  items,
  name,
  ...props
}: AutocompleteProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.label
      .normalize()
      .toLowerCase()
      .includes(searchQuery.normalize().toLowerCase())
  );

  return (
    <div className={`${className}  group/autocomplete relative`}>
      <Combobox value={value} onChange={onChange} name={name}>
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
            onChange={(event) => setSearchQuery(event.target.value)}
            onBlur={onBlur}
            className="w-full py-2 px-3 h-10 rounded-b flex-grow focus:outline-none bg-transparent rounded"
          />
          <Combobox.Button className="w-8">
            {({ open }) => <Icon icon={open ? 'caret-up' : 'caret-down'} />}
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute w-full bg-white mt-1 rounded border border-slate-400 shadow">
          {filteredItems.map((item) => (
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
};

export default Autocomplete;
