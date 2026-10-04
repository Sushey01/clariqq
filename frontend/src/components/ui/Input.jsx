import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ 
  className = '', 
  icon: Icon, 
  error = false, 
  type = 'text',
  'aria-label': ariaLabel,
  ...props 
}, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" aria-hidden="true" />
      )}
      <input
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        className={twMerge(
          clsx(
            'w-full bg-zinc-900/90 text-xs text-zinc-100 placeholder-zinc-400 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors',
            Icon ? 'pl-9 pr-3' : 'px-3',
            error && 'border-rose-500 focus:ring-rose-500',
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
