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
    <Card className="header-section">
      <div className="header-section__content">
        <div className="header-section__identity">
          <div className="header-section__number">
            <span className="header-section__label">Facture N°</span>
            <span className="header-section__value">
              {invoiceNumber || '—'}
            </span>
          </div>
          <div className="header-section__date">
            <span className="header-section__label">Date</span>
            <span className="header-section__value">
              {formatDate(date)}
            </span>
          </div>
        </div>
        <div className="header-section__confidence">
          <ConfidenceBadge score={confidence} />
        </div>
      </div>
    </Card>
  );
};
