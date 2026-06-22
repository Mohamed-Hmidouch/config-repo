// See DESIGN_RULES.md before editing this file.
import React from 'react';
import { FileX } from '@phosphor-icons/react';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon,
  description,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
      <span className="text-ink-muted">
        {icon || <FileX size={22} weight="duotone" />}
      </span>
      <p className="text-sm font-medium text-ink">{message}</p>
      {description && (
        <p className="text-xs text-ink-muted text-center max-w-xs leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
