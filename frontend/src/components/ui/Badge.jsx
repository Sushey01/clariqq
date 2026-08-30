import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Badge = ({ 
  children, 
  variant = 'indigo', 
  size = 'md', 
  className = '', 
  dot = false,
  pulse = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center space-x-1 font-medium border rounded-md select-none';

  const variants = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    zinc: 'bg-zinc-800 text-zinc-300 border-white/5',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  };

  const dotColors = {
    indigo: 'bg-indigo-400',
    emerald: 'bg-emerald-400',
    purple: 'bg-purple-400',
    amber: 'bg-amber-400',
    zinc: 'bg-zinc-400',
    rose: 'bg-rose-400',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
