import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Textarea = React.forwardRef(({ 
  className = '', 
  rows = 1, 
  disabled = false, 
  value, 
  onChange, 
  onKeyDown, 
  placeholder,
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className={twMerge(
        clsx(
          'w-full bg-transparent text-zinc-100 placeholder-zinc-400 resize-none min-h-[44px] max-h-[180px] py-2 px-4 focus:outline-none focus:ring-0 font-inter text-[15px] leading-relaxed overflow-y-auto disabled:opacity-50',
          className
        )
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
