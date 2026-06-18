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
    <div className={`card ${className}`}>
      {(title || headerAction) && (
        <div className="card__header">
          <div className="card__header-left">
            {icon && <span className="card__icon">{icon}</span>}
            <div>
              {title && <h3 className="card__title">{title}</h3>}
              {subtitle && <p className="card__subtitle">{subtitle}</p>}
            </div>
          </div>
          {headerAction && (
            <div className="card__header-action">{headerAction}</div>
          )}
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  );
};
