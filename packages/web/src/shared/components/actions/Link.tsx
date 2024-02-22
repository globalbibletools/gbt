import { Link as BaseLink, LinkProps as BaseLinkProps } from 'react-router-dom';
import { classMap as buttonClassMap } from './Button';

type LinkProps = BaseLinkProps & {
  variant?: 'default' | 'button';
};

export default function Link({ className, variant, ...props }: LinkProps) {
  let tailwindClasses =
    'text-blue-800 font-bold focus:outline-none focus:underline hover:underline';
  if (variant === 'button') {
    // Copy button styling.
    tailwindClasses = `${buttonClassMap.primary} inline-block`;
  }
  return <BaseLink className={`${tailwindClasses} ${className}`} {...props} />;
}
