import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({ 
  children, 
  variant = 'secondary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  onClick, 
  type = 'button',
  title,
  ...props 
}, ref) => {

  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[var(--ink)] text-[var(--bg-canvas)] hover:opacity-90 active:scale-95 shadow-md',
    secondary: 'bg-[var(--bg-card)] hover:opacity-90 text-[var(--ink)] border border-[var(--border)]',
    ghost: 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-card)]',
    outline: 'border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] bg-transparent',
    indigo: 'bg-[var(--accent)] hover:opacity-90 text-white shadow-md',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg space-x-1.5',
    md: 'px-3.5 py-2 text-xs rounded-xl space-x-2',
    lg: 'px-4 py-2.5 text-sm rounded-xl space-x-2',
    icon: 'p-2 rounded-lg',
    iconSm: 'p-1.5 rounded-lg',
    iconRound: 'w-8 h-8 rounded-full p-0',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
