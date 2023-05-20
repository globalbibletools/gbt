import { forwardRef, ComponentProps } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';

export interface TextInputProps extends Omit<ComponentProps<'input'>, 'name'> {
  name: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', name, onChange, onBlur, required, ...props }, ref) => {
    const context = useFormContext();
    const { errors } = useFormState({ name });

    const hasErrors = !!errors[name];

    const registerProps = context.register(name, {
      required,
      onChange,
      onBlur,
    });

    return (
      <input
        className={`
          border rounded shadow-inner py-2 px-3 h-10
          focus:outline focus:outline-2 focus:outline-blue-600
          ${hasErrors ? 'border-red-700 shadow-red-100' : 'border-slate-400'}
          ${className}
        `}
        {...props}
        {...registerProps}
        ref={(el) => {
          registerProps?.ref(el);
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
        }}
      />
    );
  }
);
export default TextInput;
