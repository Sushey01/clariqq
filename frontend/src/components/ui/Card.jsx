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
    default: 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--ink)]',
    interactive: 'bg-[var(--bg-card)] hover:bg-[var(--bg-raised)] border-[var(--border)] hover:border-[var(--accent)] cursor-pointer group',
    glass: 'bg-[var(--bg-raised)]/80 backdrop-blur-md border-[var(--border)]',
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
