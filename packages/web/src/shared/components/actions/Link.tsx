import { Link as BaseLink, LinkProps as BaseLinkProps } from 'react-router-dom';

export default function Link({ className, ...props }: BaseLinkProps) {
  return (
    <BaseLink
      className={`text-blue-800 dark:text-green-400 font-bold focus:outline-none focus:underline hover:underline ${className}`}
      {...props}
    />
  );
}
