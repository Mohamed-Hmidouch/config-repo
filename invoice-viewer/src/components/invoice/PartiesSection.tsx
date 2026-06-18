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
    <div className="party-card">
      <div className="party-card__header">
        <span className="party-card__icon">{icon}</span>
        <span className="party-card__title">{title}</span>
      </div>
      <p className="party-card__name">{name}</p>
      {details?.map((d) =>
        d.value ? (
          <p key={d.label} className="party-card__detail">
            <span className="party-card__detail-label">{d.label} :</span>{' '}
            {d.value}
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
      <div className="parties-grid">
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
