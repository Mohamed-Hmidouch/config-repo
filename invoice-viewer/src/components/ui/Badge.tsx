// See DESIGN_RULES.md before editing this file.
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  success:
    'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/60',
  warning:
    'bg-amber-100 text-amber-800 ring-1 ring-amber-300/60',
  danger:
    'bg-red-100 text-red-800 ring-1 ring-red-300/60',
  info:
    'bg-sky-100 text-sky-800 ring-1 ring-sky-300/60',
  neutral:
    'bg-paper-surface text-ink-muted ring-1 ring-border-light',
};

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full leading-tight',
        variantClasses[variant],
        sizeClasses[size],
      ].join(' ')}
    >
      {children}
    </span>
  );
};
