import { ComponentProps, ReactNode, forwardRef } from 'react';
import { Icon } from '../Icon';

export interface CheckboxProps extends ComponentProps<'input'> {
  children?: ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label className={`${className}`}>
        <input ref={ref} type="checkbox" className="sr-only" {...props} />
        <div
          className="
            border border-gray-400 rounded bg-white w-5 h-5 shadow-inner
            flex justify-center items-center text-blue-800
            dark:border-gray-500 dark:bg-gray-800 dark:text-green-400
            [:focus+&]:outline outline-2 outline-green-300
          "
        >
          <Icon className="hidden [:checked+div>&]:block" icon="check" />
        </div>
      </label>
    );
  }
);
export default Checkbox;
