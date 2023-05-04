import { ReactNode } from 'react';

export interface InputHelpTextProps {
  id?: string;
  children: ReactNode;
}

export default function InputHelpText({ id, children }: InputHelpTextProps) {
  return (
    <div id={id} className="text-sm text-slate-500">
      {children}
    </div>
  );
}
