import { forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';
import { Icon } from './Icon';

export interface DialogProps {
  children: ReactNode;
  className?: string;
}

export interface DialogRef {
  open(): void;
}

const Dialog = forwardRef<DialogRef, DialogProps>(
  ({ children, className = '' }, ref) => {
    const dialog = useRef<HTMLDialogElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        open() {
          dialog.current?.show();
        },
      }),
      []
    );

    return (
      <dialog
        ref={dialog}
        className={`border border-slate-300 shadow-md rounded p-4 pt-2 ${className}`}
      >
        {children}
        <button
          className="absolute end-0 -top-1 w-8 h-8 pt-2 pe-1"
          type="button"
          onClick={() => dialog.current?.close()}
        >
          <Icon icon="close" />
          <span className="sr-only">Close</span>
        </button>
      </dialog>
    );
  }
);
export default Dialog;
