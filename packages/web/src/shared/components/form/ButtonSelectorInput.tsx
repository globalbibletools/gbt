import { ComponentProps, ReactNode, createContext, useContext } from 'react';
import { useFormContext } from 'react-hook-form';

interface ButtonSelectorContextValue {
  name: string;
  value?: string;
  onChange?(value: string): void;
  defaultValue?: string;
  hasErrors: boolean;
}

const ButtonSelectorContext = createContext<ButtonSelectorContextValue | null>(
  null
);

export interface ButtonSelectorInputProps
  extends Omit<
    ComponentProps<'fieldset'>,
    'defaultValue' | 'value' | 'onChange'
  > {
  name: string;
  value?: string;
  onChange?(value: string): void;
  defaultValue?: string;
}

export function ButtonSelectorInput({
  value,
  onChange,
  children,
  name,
  defaultValue,
  ...props
}: ButtonSelectorInputProps) {
  const formContext = useFormContext();
  const hasErrors = !!(name && formContext?.getFieldState(name).error);

  return (
    <ButtonSelectorContext.Provider
      value={{ name, defaultValue, hasErrors, value, onChange }}
    >
      <fieldset
        className={`
          inline-block rounded
          focus-within:outline focus-within:outline-2
          ${
            hasErrors
              ? 'focus-within:outline-red-700'
              : 'focus-within:outline-blue-600'
          }
        `}
        {...props}
      >
        {children}
      </fieldset>
    </ButtonSelectorContext.Provider>
  );
}

export interface ButtonSelectorOptionProps {
  value: string;
  children: ReactNode;
}

export function ButtonSelectorOption({
  value,
  children,
}: ButtonSelectorOptionProps) {
  const selectorContext = useContext(ButtonSelectorContext);
  if (!selectorContext)
    throw new Error('ButtonSelectorOption must be within a ButtonSelector');

  return (
    <label
      className={`
        inline-block py-2 px-3 font-bold h-10 bg-white border border-l-0
        ltr:first:rounded-l ltr:first:border-l ltr:last:rounded-r
        rtl:last:rounded-l rtl:last:border-l rtl:first:rounded-r
        [&:has(:checked)]:bg-slate-900 [&:has(:checked)]:text-white
        shadow-inner [&:has(:checked)]:shadow-none
        ${
          selectorContext.hasErrors
            ? 'border-red-700 shadow-red-100'
            : 'border-slate-400'
        }
      `}
    >
      <input
        className="absolute opacity-0"
        type="radio"
        name={selectorContext.name}
        value={value}
        checked={
          selectorContext.value ? selectorContext.value === value : undefined
        }
        defaultChecked={
          selectorContext.defaultValue
            ? selectorContext.defaultValue === value
            : undefined
        }
        onChange={(e) => selectorContext.onChange?.(e.target.value)}
      />
      {children}
    </label>
  );
}
