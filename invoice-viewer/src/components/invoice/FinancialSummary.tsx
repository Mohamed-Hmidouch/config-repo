import React from 'react';
import { Card } from '../ui/Card';
import { CurrencyDollar } from '@phosphor-icons/react';
import { formatMoney } from '../../utils/formatters';

interface FinancialSummaryProps {
  totalExclTax: number | null;
  taxAmount: number | null;
  totalInclTax: number | null;
  currency: string | null;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  totalExclTax,
  taxAmount,
  totalInclTax,
  currency,
}) => {
  const hasAny =
    totalExclTax !== null || taxAmount !== null || totalInclTax !== null;
  if (!hasAny) return null;

  const rows = [
    { label: 'Total HT', value: totalExclTax, emphasis: false },
    { label: 'TVA', value: taxAmount, emphasis: false },
    { label: 'Total TTC', value: totalInclTax, emphasis: true },
  ].filter((r) => r.value !== null);

  return (
    <Card title="Resume Financier" icon={<CurrencyDollar size={18} weight="duotone" />}>
      <div className="financial-summary">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`financial-summary__row ${
              row.emphasis ? 'financial-summary__row--total' : ''
            }`}
          >
            <span className="financial-summary__label">{row.label}</span>
            <span className="financial-summary__value">
              {formatMoney(row.value!, currency)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
