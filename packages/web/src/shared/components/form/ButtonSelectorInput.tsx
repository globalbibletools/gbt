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
          inline-block rounded-lg shadow-md
          has-[:focus-visible]:outline outline-2 outline-offset-0
          ${
            hasErrors
              ? 'focus-within:outline-red-700'
              : 'focus-within:outline-green-300'
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
        inline-flex items-center justify-center px-3 font-bold h-9 bg-white border border-l-0
        ltr:first:rounded-l-lg ltr:first:border-l ltr:last:rounded-r-lg
        rtl:last:rounded-l-lg rtl:last:border-l rtl:first:rounded-r-lg
        text-blue-800 has-[:not(:checked)]:shadow-inner
        has-[:checked]:bg-blue-800 has-[:checked]:text-white
        ${
          selectorContext.hasErrors
            ? 'border-red-700 shadow-red-100'
            : 'border-blue-800'
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
