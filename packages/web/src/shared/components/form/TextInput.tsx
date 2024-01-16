import { ComponentProps, forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';

export type TextInputProps = ComponentProps<'input'>;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', ...props }, ref) => {
    const context = useFormContext();
    const hasErrors = !!(props.name && context?.formState.errors[props.name]);

    return (
      <input
        ref={ref}
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
      />
    );
  }
);
export default TextInput;
