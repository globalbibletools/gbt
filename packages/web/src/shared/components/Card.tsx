import { ComponentProps } from 'react';

export default function Card({
  className = '',
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={`${className} border border-slate-300 rounded shadow-md`}
      {...props}
    />
  );
}
