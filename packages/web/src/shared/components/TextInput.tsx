import { forwardRef, ComponentProps } from 'react';

const TextInput = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          border border-slate-400 rounded shadow-inner py-2 px-3 h-10
          focus:outline focus:outline-2 focus:outline-blue-600 focus:shadow-lg
          ${className}
        `}
        {...props}
      />
    );
  }
);
export default TextInput;
