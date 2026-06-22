// See DESIGN_RULES.md before editing this file.
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
    <header className="flex items-center justify-between gap-4 px-6 py-4 bg-paper border-b border-border-light font-sans">
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            className="flex items-center justify-center w-8 h-8 rounded text-ink-muted transition-colors hover:bg-paper-surface hover:text-ink"
            onClick={() => navigate('/')}
            aria-label="Retour a la liste"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-ink leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ink-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
};
