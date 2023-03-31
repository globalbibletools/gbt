import { ReactNode } from 'react';

export interface ViewProps {
  className?: string;
  children?: ReactNode;
  fitToScreen?: boolean;
}

export default function View({
  children,
  className,
  fitToScreen = false,
}: ViewProps) {
  return (
    <div
      className={`
        ${fitToScreen ? 'absolute w-full h-full' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
