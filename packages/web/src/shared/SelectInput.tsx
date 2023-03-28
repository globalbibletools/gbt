import { forwardRef, HTMLProps } from 'react';

const SelectInput = forwardRef<HTMLSelectElement, HTMLProps<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          rounded border border-slate-400 py-2 px-3
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
