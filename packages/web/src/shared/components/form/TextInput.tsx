import { forwardRef, ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';
import useMergedRef from '../../hooks/mergeRefs';

export interface TextInputProps extends Omit<ComponentProps<'input'>, 'name'> {
  name: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', name, onChange, onBlur, required, ...props }, ref) => {
    const context = useFormContext();
    const hasErrors = !!context?.formState.errors[name];
    const registerProps = context?.register(name, {
      required,
      onChange,
      onBlur,
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
