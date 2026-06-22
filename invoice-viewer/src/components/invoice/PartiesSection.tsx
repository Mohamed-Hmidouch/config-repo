// See DESIGN_RULES.md before editing this file.
import React from 'react';
import { Card } from '../ui/Card';
import { Buildings, Envelope, Boat } from '@phosphor-icons/react';

interface PartiesSectionProps {
  supplierName: string | null;
  supplierTaxId: string | null;
  destinataire: string | null;
  importateur: string | null;
}

const PartyCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  name: string | null;
  details?: { label: string; value: string | null }[];
}> = ({ title, icon, name, details }) => {
  if (!name) return null;

  return (
    <div className="rounded bg-paper border border-border-light px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-accent shrink-0">{icon}</span>
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
          {title}
        </span>
      </div>
      <p className="text-sm font-normal text-ink">{name}</p>
      {details?.map((d) =>
        d.value ? (
          <p key={d.label} className="text-xs text-ink-muted mt-1">
            <span className="font-medium">{d.label} :</span> {d.value}
          </p>
        ) : null
      )}
    </div>
  );
};

export const PartiesSection: React.FC<PartiesSectionProps> = ({
  supplierName,
  supplierTaxId,
  destinataire,
  importateur,
}) => {
  const hasAny = supplierName || destinataire || importateur;
  if (!hasAny) return null;

  return (
    <Card title="Parties" icon={<Buildings size={18} weight="duotone" />}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PartyCard
          title="Fournisseur"
          icon={<Buildings size={16} weight="duotone" />}
          name={supplierName}
          details={[{ label: 'ID Fiscal', value: supplierTaxId }]}
        />
        <PartyCard
          title="Destinataire"
          icon={<Envelope size={16} weight="duotone" />}
          name={destinataire}
        />
        <PartyCard
          title="Importateur"
          icon={<Boat size={16} weight="duotone" />}
          name={importateur}
        />
      </div>
    </Card>
  );
};
