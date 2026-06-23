// See DESIGN_RULES.md before editing this file.
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
    <Card title="Resume Financier" icon={<CurrencyDollar size={18} weight="light" />}>
      <div className="space-y-0">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={[
              'flex items-center justify-between py-2.5',
              i > 0 ? 'border-t border-border-light' : '',
            ].join(' ')}
          >
            <span className={[
              'text-xs font-medium uppercase tracking-wide',
              row.emphasis ? 'text-ink' : 'text-ink-muted',
            ].join(' ')}>
              {row.label}
            </span>
            <span className={[
              'tabular-nums',
              row.emphasis
                ? 'text-sm font-semibold text-accent'
                : 'text-sm font-normal text-ink',
            ].join(' ')}>
              {formatMoney(row.value!, currency)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
