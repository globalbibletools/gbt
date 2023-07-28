import { ComponentProps, forwardRef } from 'react';

export const buttonTailwindClasses =
  'bg-slate-900 text-white rounded py-2 px-3 font-bold h-10 disabled:opacity-50 focus:outline focus:outline-2 focus:outline-blue-600 focus:shadow-lg';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
}

const sharedClasses =
  'rounded py-2 px-3 font-bold h-10 disabled:opacity-50 focus:outline focus:outline-2 focus:outline-blue-600 focus:shadow-lg';

export const classMap: Record<ButtonVariant, string> = {
  primary: `${sharedClasses} bg-slate-900 text-white`,
  secondary: `${sharedClasses} text-slate-900 border-2 border-slate-900 bg-white`,
  tertiary: `text-slate-900 font-bold disabled:opacity-50 focus:underline focus:outline-none`,
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${classMap[variant]} ${className}`}
        type="button"
        {...props}
      />
    );
  }
);
export default Button;
