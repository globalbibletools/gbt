import { ReactNode } from 'react';

export interface ViewTitleProps {
  children?: ReactNode;
}

export default function ViewTitle({ children }: ViewTitleProps) {
  return <h1 className="text-2xl font-bold pb-2">{children}</h1>;
}
