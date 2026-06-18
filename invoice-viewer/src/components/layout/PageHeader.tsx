import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack,
  actions,
}) => {
  const navigate = useNavigate();

  return (
    <header className="page-header">
      <div className="page-header__left">
        {showBack && (
          <button
            className="page-header__back"
            onClick={() => navigate('/')}
            aria-label="Retour a la liste"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && (
            <p className="page-header__subtitle">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
};
