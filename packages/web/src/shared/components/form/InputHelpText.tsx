import { ReactNode } from 'react';

export interface InputHelpTextProps {
  className?: string;
  id?: string;
  children: ReactNode;
}

export default function InputHelpText({
  className = '',
  id,
  children,
}: InputHelpTextProps) {
  return (
    <div id={id} className={`text-sm text-slate-500 ${className}`}>
      {children}
    </div>
  );
}
