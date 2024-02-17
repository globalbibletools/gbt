import { Link, LinkProps } from 'react-router-dom';
import { ComponentProps, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export type ButtonProps = (LinkProps | ComponentProps<'button'>) & {
  variant?: ButtonVariant;
};

const sharedClasses =
  'inline-block flex justify-center items-center rounded-lg px-3 font-bold h-9 outline-2 outline-green-300 outline-offset-2 disabled:opacity-50 focus-visible:outline';

export const classMap: Record<ButtonVariant, string> = {
  primary: `${sharedClasses} bg-blue-800 text-white shadow-md`,
  secondary: `${sharedClasses} text-blue-800 border-2 border-blue-800 bg-white shadow-md`,
  tertiary: `${sharedClasses} text-blue-800`,
};

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    if ('to' in props) {
      return (
        <Link
          ref={ref as any}
          className={`${classMap[variant]} ${className}`}
          {...props}
        />
      );
    } else {
      return (
        <button
          ref={ref as any}
          className={`${classMap[variant]} ${className}`}
          type="button"
          {...props}
        />
      );
    }
  }
);
export default Button;
