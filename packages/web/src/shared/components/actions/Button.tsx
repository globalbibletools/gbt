import { ComponentProps, forwardRef } from 'react';

const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  ({ className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          bg-slate-900 text-white rounded py-2 px-3 font-bold h-10
          focus:outline focus:outline-2 focus:outline-blue-600 focus:shadow-lg
          ${className}
        `}
        type="button"
        {...props}
      />
    );
  }
);
export default Button;
