// See DESIGN_RULES.md before editing this file.
import React from 'react';
import { Card } from '../ui/Card';
import { DynamicField } from './DynamicField';
import { Badge } from '../ui/Badge';
import { Paperclip } from '@phosphor-icons/react';

interface ExtraDataGridProps {
  data: Record<string, unknown>;
  currency?: string | null;
}

/**
 * Recursive parser for extra_data - iterates over all keys
 * and renders each via DynamicField with type detection.
 */
export const ExtraDataGrid: React.FC<ExtraDataGridProps> = ({
  data,
  currency,
}) => {
  const entries = Object.entries(data);

  if (entries.length === 0) return null;

  return (
    <Card
      title="Donnees Supplementaires"
      icon={<Paperclip size={18} weight="light" />}
      headerAction={
        <Badge variant="info" size="sm">
          {entries.length} champ{entries.length > 1 ? 's' : ''}
        </Badge>
      }
    >
      <div className="extra-data-grid">
        {entries.map(([key, value]) => (
          <DynamicField
            key={key}
            label={key}
            value={value}
            currency={currency}
          />
        ))}
      </div>
    </Card>
  );
};
