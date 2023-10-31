import { ComponentProps, forwardRef } from 'react';
import { Validate, useFormContext } from 'react-hook-form';
import useMergedRef from '../../hooks/mergeRefs';

export interface TextInputProps extends Omit<ComponentProps<'input'>, 'name'> {
  name: string;
  confirms?: string;
  validate?: Record<string, Validate<any, any>>;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    { className = '', required, minLength, confirms, validate, ...props },
    ref
  ) => {
    const context = useFormContext();
    const hasErrors = !!context?.formState.errors[props.name];
    validate ??= {};
    if (confirms) {
      validate.confirms = (value: unknown) =>
        value === context.getValues()[confirms];
    }
    const registerProps = context?.register(props.name, {
      required,
      minLength: minLength,
      ...(confirms && {
        deps: confirms,
      }),
      validate,
      onChange: props.onChange,
      onBlur: props.onBlur,
    });

    return (
      <input
        className={`
          border rounded shadow-inner py-2 px-3 h-10
          focus:outline focus:outline-2
          ${
            hasErrors
              ? 'border-red-700 shadow-red-100 focus:outline-red-700'
              : 'border-slate-400 focus:outline-blue-600'
          }
          ${className}
        `}
        {...props}
        {...registerProps}
        ref={useMergedRef(ref, registerProps?.ref)}
      />
    );
  }
);
export default TextInput;
