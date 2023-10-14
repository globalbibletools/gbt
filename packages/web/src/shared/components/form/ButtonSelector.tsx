import { ComponentProps, ReactNode, createContext, useContext } from 'react';
import { useFormContext } from 'react-hook-form';

interface ButtonSelectorContextValue {
  name: string;
  defaultValue?: string;
  required?: boolean;
}

const ButtonSelectorContext = createContext<ButtonSelectorContextValue | null>(
  null
);

export interface ButtonSelectorProps
  extends Omit<ComponentProps<'fieldset'>, 'defaultValue'> {
  name: string;
  defaultValue?: string;
  required?: boolean;
}

export function ButtonSelector({
  children,
  name,
  defaultValue,
  required,
  ...props
}: ButtonSelectorProps) {
  const formContext = useFormContext();
  const hasErrors = !!formContext?.formState.errors[name];

  return (
    <ButtonSelectorContext.Provider value={{ name, defaultValue, required }}>
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

  const formContext = useFormContext();
  const hasErrors = !!formContext?.formState.errors[selectorContext.name];
  const registerProps = formContext?.register(selectorContext.name, {
    required: selectorContext.required,
  });

  return (
    <label
      className={`
        inline-block py-2 px-3 font-bold h-10 bg-white border border-l-0
        first:rounded-l first:border-l last:rounded-r
        [&:has(:checked)]:bg-slate-900 [&:has(:checked)]:text-white
        shadow-inner [&:has(:checked)]:shadow-none
        ${hasErrors ? 'border-red-700 shadow-red-100' : 'border-slate-400'}
      `}
    >
      <input
        {...registerProps}
        className="absolute opacity-0"
        type="radio"
        name={selectorContext.name}
        defaultValue={selectorContext.defaultValue}
        value={value}
      />
      {children}
    </label>
  );
}
