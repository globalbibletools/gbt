import { forwardRef, ComponentProps } from 'react';

const SelectInput = forwardRef<HTMLSelectElement, ComponentProps<'select'>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          rounded border border-slate-400 py-2 px-3 shadow-inner h-10
          focus:outline focus:outline-2 focus:outline-blue-600 focus:shadow-lg
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    );
  }
);
export default SelectInput;
