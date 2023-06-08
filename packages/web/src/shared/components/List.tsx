import { ReactNode } from 'react';

export interface ListProps {
  children?: ReactNode;
  className?: string;
}

export function List({ children, className = '' }: ListProps) {
  return <table className={`${className}`}>{children}</table>;
}

export interface ListHeaderProps {
  children?: ReactNode;
}

export function ListHeader({ children }: ListHeaderProps) {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
}

export interface ListHeaderCellProps {
  children?: ReactNode;
  className?: string;
}

export function ListHeaderCell({
  children,
  className = '',
}: ListHeaderCellProps) {
  return (
    <th
      className={`
        border-b-2 border-slate-700 text-start text-sm px-2 first:ps-0 last:pe-0
        ${className}
      `}
    >
      {children}
    </th>
  );
}

export interface ListRowActionProps {
  children?: ReactNode;
  colSpan: number;
}

export function ListRowAction({ children, colSpan }: ListRowActionProps) {
  return (
    <tbody>
      <tr className="h-10">
        <td colSpan={colSpan} className="border-b border-slate-700">
          {children}
        </td>
      </tr>
    </tbody>
  );
}

export interface ListBodyProps {
  children?: ReactNode;
}

export function ListBody({ children }: ListBodyProps) {
  return <tbody>{children}</tbody>;
}

export interface ListRowProps {
  children?: ReactNode;
}

export function ListRow({ children }: ListRowProps) {
  return <tr className="h-8">{children}</tr>;
}

export interface ListCellProps {
  children?: ReactNode;
  header?: boolean;
  className?: string;
}

export function ListCell({
  children,
  header = false,
  className = '',
}: ListCellProps) {
  if (header) {
    return (
      <th
        className={`text-start font-bold px-2 first:ps-0 last:pe-0 ${className}`}
      >
        {children}
      </th>
    );
  } else {
    return (
      <td className={`text-start px-2 first:ps-0 last:pe-0 ${className}`}>
        {children}
      </td>
    );
  }
}
