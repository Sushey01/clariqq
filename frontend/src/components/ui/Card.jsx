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
    default: 'lab-glass text-[var(--ink)] shadow-none',
    interactive: 'lab-glass hover:border-[var(--accent)] cursor-pointer group shadow-none',
    glass: 'lab-glass',
    indigo: 'bg-[var(--accent-soft)] border-[color-mix(in_srgb,var(--accent)_40%,transparent)] text-[var(--ink)]',
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
