import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ 
  className = '', 
  icon: Icon, 
  error = false, 
  type = 'text',
  ...props 
}, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] pointer-events-none" />
      )}
      <input
        ref={ref}
        type={type}
        className={twMerge(
          clsx(
            'w-full bg-[var(--bg-input)] text-xs text-[var(--ink)] placeholder-[var(--ink-faint)] py-1.5 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] transition-colors',
            Icon ? 'pl-8 pr-3' : 'px-3',
            error && 'border-rose-500 focus:border-rose-500',
            className
          )
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
