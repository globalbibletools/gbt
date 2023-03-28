import { FocusEvent, ReactNode, useRef, useState } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import useCssId from './cssId';
import { Icon } from './Icon';

export interface DropdownProps {
  className?: string;
  text: string;
  children: ReactNode;
}

export default function DropdownMenu({
  className = '',
  children,
  text,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const cssId = useCssId('dropdown-menu');

  // We want to close the menu if the focus moves outside of the component.
  function onBlur(e: FocusEvent) {
    const focusedElement = e.relatedTarget;
    const isInComponent =
      focusedElement instanceof Node && root.current?.contains(focusedElement);
    if (!isInComponent) {
      setIsOpen(false);
    }
  }

  return (
    <div ref={root} className={`relative ${className}`} onBlur={onBlur}>
      <button
        className="focus:outline-none hover:underline focus:underline"
        type="button"
        onClick={() => setIsOpen((menu) => !menu)}
        aria-expanded={isOpen}
        aria-controls={`${cssId}-menu`}
      >
        {text}
        <Icon fixedWidth icon={isOpen ? 'caret-up' : 'caret-down'} />
      </button>
      <ul
        id={`${cssId}-menu`}
        className={`
          absolute right-0 border border-slate-300 shadow-md py-2 rounded
          ${isOpen ? '' : 'hidden'}
        `}
        onClick={() => setIsOpen(false)}
      >
        {children}
      </ul>
    </div>
  );
}

export interface DropdownMenuLinkProps {
  children: ReactNode;
  to: LinkProps['to'];
}

export function DropdownMenuLink({ children, to }: DropdownMenuLinkProps) {
  return (
    <li>
      <Link
        type="button"
        className="focus:outline-none focus:underline hover:underline whitespace-nowrap px-4 py-1 text-left w-full"
        to={to}
      >
        {children}
      </Link>
    </li>
  );
}

export interface DropdownMenuButtonProps {
  children: ReactNode;
  onClick(): void;
}

export function DropdownMenuButton({
  children,
  onClick,
}: DropdownMenuButtonProps) {
  return (
    <li>
      <button
        type="button"
        className="focus:outline-none focus:underline hover:underline whitespace-nowrap px-4 py-1 text-left w-full"
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}
