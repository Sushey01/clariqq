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
    primary: 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-md',
    secondary: 'bg-zinc-800 hover:bg-zinc-700/80 text-zinc-100 border border-white/5 shadow-xs',
    ghost: 'text-zinc-400 hover:text-white hover:bg-zinc-800',
    outline: 'border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white bg-transparent',
    indigo: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20',
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
