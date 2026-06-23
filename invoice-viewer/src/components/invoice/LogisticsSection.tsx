// See DESIGN_RULES.md before editing this file.
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
    { label: 'Port', value: port, icon: <Anchor size={18} weight="light" /> },
    { label: 'Moyen de Transport', value: moyenTransport, icon: <Truck size={18} weight="light" /> },
    { label: 'Incoterm', value: incoterm, icon: <ClipboardText size={18} weight="light" /> },
  ].filter((f) => f.value);

  return (
    <Card title="Logistique" icon={<Globe size={18} weight="light" />}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-start gap-2.5 rounded bg-paper border border-border-light px-4 py-3"
          >
            <span className="text-accent shrink-0 mt-0.5">{field.icon}</span>
            <div>
              <span className="block text-xs font-medium text-ink-muted uppercase tracking-wide">
                {field.label}
              </span>
              <span className="block text-sm font-normal text-ink mt-0.5">
                {field.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
