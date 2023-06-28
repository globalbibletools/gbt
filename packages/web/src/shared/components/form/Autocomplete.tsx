import { Combobox, Listbox, Transition } from '@headlessui/react';
import { ComponentProps, Fragment, useState } from 'react';
import { Icon } from '../Icon';
import TextInput from './TextInput';

export interface AutocompleteProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string;
  options: string[];
  onChange: (text: string) => void;
}

const Autocomplete = ({
  className = '',
  value,
  options,
  onChange,
}: AutocompleteProps) => {
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
    <Combobox value={searchQuery} onChange={setSelectedOption}>
      <Combobox.Input
        onChange={(event) => setSearchQuery(event.target.value)}
        className="border rounded shadow-inner py-2 px-3 h-10
          focus:outline focus:outline-2 border-slate-400 focus:outline-blue-600"
      />
      <Transition
        as={Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Combobox.Options
          className="absolute bg-white shadow-md max-h-80 overflow-y-auto p-0
          border-slate-300 border rounded-b z-10"
        >
          {filteredOptions.map((option, index) => (
            <Combobox.Option key={index} value={option}>
              {option}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Transition>
    </Combobox>
  );
};

export default Autocomplete;
