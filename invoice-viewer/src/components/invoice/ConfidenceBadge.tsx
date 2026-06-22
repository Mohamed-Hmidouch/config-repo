// See DESIGN_RULES.md before editing this file.
import React from 'react';
import { Badge } from '../ui/Badge';

interface ConfidenceBadgeProps {
  score: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score }) => {
  const percentage = Math.round(score * 100);

  let variant: 'success' | 'warning' | 'danger';
  let label: string;

  if (score >= 0.8) {
    variant = 'success';
    label = 'Fiabilité élevée';
  } else if (score >= 0.5) {
    variant = 'warning';
    label = 'Fiabilité moyenne';
  } else {
    variant = 'danger';
    label = 'Fiabilité faible';
  }

  return (
    <Badge variant={variant} size="md">
      <span className="confidence-badge">
        <span className="confidence-badge__dot" />
        <span>{label}</span>
        <span className="confidence-badge__score">{percentage}%</span>
      </span>
    </Badge>
  );
};
