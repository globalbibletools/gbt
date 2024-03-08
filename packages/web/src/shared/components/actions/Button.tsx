import { Link, LinkProps } from 'react-router-dom';
import { ComponentProps, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export type ButtonProps = (LinkProps | ComponentProps<'button'>) & {
  variant?: ButtonVariant;
  destructive?: boolean;
  small?: boolean;
};

const sharedClasses =
  'inline-flex justify-center items-center rounded-lg font-bold outline-2 disabled:opacity-50 focus-visible:outline';

function buttonClasses(
  variant: ButtonVariant,
  destructive: boolean,
  small: boolean
): string {
  const sizeClasses = small ? 'h-6 px-2' : 'h-9 px-3';

  switch (variant) {
    case 'primary': {
      return `${sharedClasses} ${sizeClasses} ${
        destructive
          ? 'bg-red-800 outline-red-300'
          : 'bg-blue-800 outline-green-300'
      } text-white shadow-md`;
    }
    case 'secondary': {
      return `${sharedClasses} ${sizeClasses} ${
        destructive
          ? 'text-red-800 border-red-800 outline-red-300'
          : 'text-blue-800 border-blue-800 outline-green-300'
      } border-2 bg-white shadow-md`;
    }
    case 'tertiary': {
      return `${sharedClasses} ${sizeClasses} ${
        destructive
          ? 'text-red-800 outline-red-300'
          : 'text-blue-800 outline-green-300'
      }`;
    }
  }
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      destructive = false,
      small = false,
      ...props
    },
    ref
  ) => {
    if ('to' in props) {
      return (
        <Link
          ref={ref as any}
          className={`${buttonClasses(
            variant,
            destructive,
            small
          )} ${className}`}
          {...props}
        />
      );
    } else {
      return (
        <button
          ref={ref as any}
          className={`${buttonClasses(
            variant,
            destructive,
            small
          )} ${className}`}
          type="button"
          {...props}
        />
      );
    }
  }
);
export default Button;
