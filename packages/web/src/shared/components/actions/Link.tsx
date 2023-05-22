import { Link as BaseLink, LinkProps } from 'react-router-dom';

export function Link({ className, ...props }: LinkProps) {
  return (
    <BaseLink
      className={`text-blue-600 focus:outline-none focus:underline hover:underline ${className}`}
      {...props}
    />
  );
}
