import React from 'react';
import { Card } from '../ui/Card';
import { Anchor, Truck, ClipboardText, Globe } from '@phosphor-icons/react';

interface LogisticsSectionProps {
  port: string | null;
  moyenTransport: string | null;
  incoterm: string | null;
}

export const LogisticsSection: React.FC<LogisticsSectionProps> = ({
  port,
  moyenTransport,
  incoterm,
}) => {
  const hasAny = port || moyenTransport || incoterm;
  if (!hasAny) return null;

  const fields = [
    { label: 'Port', value: port, icon: <Anchor size={18} weight="duotone" /> },
    { label: 'Moyen de Transport', value: moyenTransport, icon: <Truck size={18} weight="duotone" /> },
    { label: 'Incoterm', value: incoterm, icon: <ClipboardText size={18} weight="duotone" /> },
  ].filter((f) => f.value);

  return (
    <Card title="Logistique" icon={<Globe size={18} weight="duotone" />}>
      <div className="logistics-grid">
        {fields.map((field) => (
          <div key={field.label} className="logistics-item">
            <span className="logistics-item__icon">{field.icon}</span>
            <div>
              <span className="logistics-item__label">{field.label}</span>
              <span className="logistics-item__value">{field.value}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
