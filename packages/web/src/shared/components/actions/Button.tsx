import { ComponentProps, forwardRef } from 'react';

export const buttonTailwindClasses =
  'bg-slate-900 text-white rounded py-2 px-3 font-bold h-10 disabled:opacity-50 focus:outline focus:outline-2 focus:outline-blue-600 focus:shadow-lg';

const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  ({ className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${buttonTailwindClasses} ${className}`}
        type="button"
        {...props}
      />
    );
  }
);
export default Button;
