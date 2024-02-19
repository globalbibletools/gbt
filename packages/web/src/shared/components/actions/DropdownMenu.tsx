import { FocusEvent, ReactNode, useRef, useState } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import useCssId from '../../hooks/cssId';
import { Icon } from '../Icon';

export interface DropdownProps {
  className?: string;
  buttonClassName?: string;
  text: string;
  children: ReactNode;
}

export default function DropdownMenu({
  className = '',
  buttonClassName = '',
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
    <div
      ref={root}
      className={`relative inline-block ${className}`}
      onBlur={onBlur}
    >
      <button
        className={`focus:outline-none hover:underline focus:underline ${buttonClassName}`}
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
          absolute end-0 border border-slate-300 shadow-md py-2 rounded bg-white z-10
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

const className =
  'focus:outline-none focus:underline hover:underline whitespace-nowrap px-4 py-1 text-start w-full';

export function DropdownMenuLink({ children, to }: DropdownMenuLinkProps) {
  return (
    <li>
      {/* If we want to link to external URLs, we have use a standard anchor element. */}
      {typeof to === 'string' && to.startsWith('http') ? (
        <a className={className} href={to}>
          {children}
        </a>
      ) : (
        <Link className={className} to={to}>
          {children}
        </Link>
      )}
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
        className="focus:outline-none focus:underline hover:underline whitespace-nowrap px-4 py-1 text-start w-full"
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}

export interface DropdownMenuSubmenuProps {
  children: ReactNode;
  text: string;
}

export function DropdownMenuSubmenu({
  children,
  text,
}: DropdownMenuSubmenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);
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
    <li ref={root} className="relative" onBlur={onBlur}>
      <button
        className="focus:outline-none focus:underline hover:underline whitespace-nowrap px-4 py-1 text-start w-full"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((menu) => !menu);
        }}
        aria-expanded={isOpen}
        aria-controls={`${cssId}-menu`}
      >
        {text}
        <Icon fixedWidth icon={isOpen ? 'caret-up' : 'caret-down'} />
      </button>
      <ul
        id={`${cssId}-menu`}
        className={`
          absolute end-0 border border-slate-300 shadow-md py-2 rounded bg-white
          ${isOpen ? '' : 'hidden'}
        `}
        onClick={() => setIsOpen(false)}
      >
        {children}
      </ul>
    </li>
  );
}
