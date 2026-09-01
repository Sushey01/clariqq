import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ 
  children, 
  className = '', 
  hoverable = false, 
  onClick, 
  variant = 'default',
  ...props 
}) => {
  const baseStyles = 'p-4 rounded-2xl transition-all duration-200 border shadow-md select-none';

  const variants = {
    default: 'bg-[#171717]/80 border-white/5',
    interactive: 'bg-[#171717]/80 hover:bg-zinc-800/90 border-white/5 hover:border-white/20 cursor-pointer group',
    glass: 'bg-zinc-900/60 backdrop-blur-md border-white/5',
    indigo: 'bg-indigo-600/10 border-indigo-500/30 text-white',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      className={twMerge(
        clsx(
          baseStyles,
          hoverable ? variants.interactive : variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
