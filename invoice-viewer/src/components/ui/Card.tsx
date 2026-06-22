// See DESIGN_RULES.md before editing this file.
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  icon,
  headerAction,
}) => {
  return (
    <div
      className={[
        'rounded-card bg-white border border-border-light shadow-level-1',
        className,
      ].join(' ')}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border-light">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <span className="flex-shrink-0 text-accent">{icon}</span>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-ink leading-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-ink-muted mt-0.5 leading-tight truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && (
            <div className="flex-shrink-0">{headerAction}</div>
          )}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
};
