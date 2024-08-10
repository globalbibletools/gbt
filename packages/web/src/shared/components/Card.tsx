import { ComponentProps } from 'react';

export default function Card({
  className = '',
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={`
        ${className}
        border border-gray-300 rounded shadow-md
        dark:bg-gray-700 dark:border-gray-600 dark:shadown-none
      `}
      {...props}
    />
  );
}
