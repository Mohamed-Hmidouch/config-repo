// See DESIGN_RULES.md before editing this file.
import React from 'react';
import { Card } from '../ui/Card';
import { ConfidenceBadge } from './ConfidenceBadge';
import { formatDate } from '../../utils/formatters';

interface HeaderSectionProps {
  invoiceNumber: string | null;
  date: string | null;
  confidence: number;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  invoiceNumber,
  date,
  confidence,
}) => {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div>
            <span className="block text-xs font-medium text-ink-muted uppercase tracking-wide">
              Facture N°
            </span>
            <span className="block text-sm font-normal text-ink mt-0.5">
              {invoiceNumber || '—'}
            </span>
          </div>
          <div>
            <span className="block text-xs font-medium text-ink-muted uppercase tracking-wide">
              Date
            </span>
            <span className="block text-sm font-normal text-ink mt-0.5">
              {formatDate(date)}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <ConfidenceBadge score={confidence} />
        </div>
      </div>
    </Card>
  );
};
