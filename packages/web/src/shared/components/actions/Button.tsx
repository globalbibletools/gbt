import { Link, LinkProps } from 'react-router-dom';
import { ComponentProps, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export type ButtonProps = (LinkProps | ComponentProps<'button'>) & {
  variant?: ButtonVariant;
  destructive?: boolean;
};

const sharedClasses =
  'inline-flex justify-center items-center rounded-lg px-3 font-bold h-9 outline-2 outline-offset-2 disabled:opacity-50 focus-visible:outline';

export const classMap: Record<ButtonVariant, string> = {
  primary: `${sharedClasses} bg-blue-800 text-white shadow-md`,
  secondary: `${sharedClasses} text-blue-800 border border-blue-800 bg-white shadow-md`,
  tertiary: `${sharedClasses} text-blue-800`,
};

function buttonClasses(variant: ButtonVariant, destructive: boolean): string {
  switch (variant) {
    case 'primary': {
      return `${sharedClasses} ${
        destructive
          ? 'bg-red-800 outline-red-300'
          : 'bg-blue-800 outline-green-300'
      } text-white shadow-md`;
    }
    case 'secondary': {
      return `${sharedClasses} ${
        destructive
          ? 'text-red-800 border-red-800 outline-red-300'
          : 'text-blue-800 border-blue-800 outline-green-300'
      } border-2 bg-white shadow-md`;
    }
    case 'tertiary': {
      return `${sharedClasses} ${
        destructive
          ? 'text-red-800 outline-red-300'
          : 'text-blue-800 outline-green-300'
      }`;
    }
  }
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    { className = '', variant = 'primary', destructive = false, ...props },
    ref
  ) => {
    if ('to' in props) {
      return (
        <Link
          ref={ref as any}
          className={`${buttonClasses(variant, destructive)} ${className}`}
          {...props}
        />
      );
    } else {
      return (
        <button
          ref={ref as any}
          className={`${buttonClasses(variant, destructive)} ${className}`}
          type="button"
          {...props}
        />
      );
    }
  }
);
export default Button;
