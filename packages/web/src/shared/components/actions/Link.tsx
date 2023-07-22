import { Link as BaseLink, LinkProps as BaseLinkProps } from 'react-router-dom';
import { buttonTailwindClasses } from './Button';

type LinkProps = BaseLinkProps & {
  variant?: 'base' | 'button';
};

export function Link({ className, variant, ...props }: LinkProps) {
  let tailwindClasses =
    'text-blue-600 focus:outline-none focus:underline hover:underline';
  if (variant === 'button') {
    // Copy button styling.
    tailwindClasses = buttonTailwindClasses;
  }
  return <BaseLink className={`${tailwindClasses} ${className}`} {...props} />;
}
