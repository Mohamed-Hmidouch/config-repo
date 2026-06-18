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
    <div className="empty-state">
      <span className="empty-state__icon">
        {icon || <FileX size={22} weight="duotone" />}
      </span>
      <p className="empty-state__message">{message}</p>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
    </div>
  );
};
