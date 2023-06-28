import { Listbox, Transition } from '@headlessui/react';
import { ComponentProps, Fragment, useState } from 'react';
import { Icon } from '../Icon';

export interface AutocompleteProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string;
  options: string[];
  onChange: (text: string) => void;
}

const Autocomplete = ({ value, options, onChange }: AutocompleteProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    value ?? null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setSearchQuery('');
    onChange(option);
  };

  return (
    <Listbox value={selectedOption} onChange={handleSelect}>
      <div className="relative">
        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
          <span className="block truncate">
            {selectedOption || 'Select an option'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <Icon icon={'caret-down'} className="w-5 h-5 text-gray-400" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm">
            {filteredOptions.map((option, index) => (
              <Listbox.Option
                key={index}
                className={({ active }) =>
                  `${
                    active ? 'text-white bg-blue-600' : 'text-gray-900'
                  } cursor-default select-none relative py-2 pl-3 pr-1`
                }
                value={option}
              >
                {({ active }) => (
                  <span
                    className={`${
                      active ? 'font-medium' : 'font-normal'
                    } block truncate`}
                  >
                    {option}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default Autocomplete;
