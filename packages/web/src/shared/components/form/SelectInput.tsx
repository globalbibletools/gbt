import { forwardRef, ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';
import useMergedRef from '../../hooks/mergeRefs';

export interface SelectInputProps
  extends Omit<ComponentProps<'select'>, 'name'> {
  name: string;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    { className = '', name, onChange, onBlur, required, children, ...props },
    ref
  ) => {
    const context = useFormContext();
    const hasErrors = !!context?.formState.errors[name];
    const registerProps = context?.register(name, {
      required,
      onChange,
      onBlur,
    });
    return (
      <select
        className={`
          rounded border py-2 px-3 shadow-inner h-10
          focus:outline focus:outline-2 focus:outline-blue-600
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
      >
        {children}
      </select>
    );
  }
);
export default SelectInput;
