// See DESIGN_RULES.md before editing this file.
import React from 'react';
import type { InvoiceData } from '../../types/invoice';
import { Card } from '../ui/Card';
import { ListMagnifyingGlass } from '@phosphor-icons/react';

interface AttributePanelProps {
  data: InvoiceData;
  activeAttribute: string | null;
  onAttributeSelect: (key: string, indices: number[]) => void;
}

export const AttributePanel: React.FC<AttributePanelProps> = ({ data, activeAttribute, onAttributeSelect }) => {
  const ocrRefs = data.ocr_data?.ocr_line_references || {};

  const getMappingIndices = (key: string): number[] => {
    let indices = ocrRefs[key];
    if (!Array.isArray(indices) && ocrRefs.extra_data && typeof ocrRefs.extra_data === 'object') {
      indices = (ocrRefs.extra_data as Record<string, any>)[key];
    }
    return Array.isArray(indices) ? indices : [];
  };

  const handleSelect = (key: string) => {
    const indices = getMappingIndices(key);
    if (indices.length > 0) {
      onAttributeSelect(key, indices);
    } else {
      // Clear selection if no indices found
      onAttributeSelect(key, []);
    }
  };

  const renderAttributeItem = (label: string, key: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return null;

    const indices = getMappingIndices(key);
    const hasMapping = indices.length > 0;
    const isActive = activeAttribute === key;

    return (
      <div
        key={key}
        onClick={() => handleSelect(key)}
        className={[
          'rounded px-3 py-2.5 transition-all',
          hasMapping ? 'cursor-pointer' : 'cursor-default opacity-70',
          isActive
            ? 'border border-accent shadow-input-focus bg-paper'
            : 'bg-paper border border-border-light hover:border-border-dark',
        ].join(' ')}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-ink-muted">{label}</span>
          {hasMapping && (
            <span className={[
              'w-1.5 h-1.5 rounded-full',
              isActive ? 'bg-accent' : 'bg-border-dark',
            ].join(' ')} />
          )}
        </div>
        <div className="text-sm font-medium text-ink break-words">{String(value)}</div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col font-sans">
      <Card
        title="Attributs Extraits"
        icon={<ListMagnifyingGlass size={18} weight="duotone" />}
        className="flex-1 flex flex-col border-0 shadow-none rounded-none bg-transparent"
      >
        <div className="flex-1 overflow-y-auto space-y-5 pb-4">

          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Identité</h4>
            <div className="grid grid-cols-2 gap-2">
              {renderAttributeItem('N° Facture', 'invoice_number', data.invoice_number)}
              {renderAttributeItem('Date', 'date', data.date)}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Fournisseur</h4>
            <div className="grid grid-cols-2 gap-2">
              {renderAttributeItem('Nom Fournisseur', 'supplier_name', data.supplier_name)}
              {renderAttributeItem('ID Fiscal', 'supplier_tax_id', data.supplier_tax_id)}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Logistique</h4>
            <div className="grid grid-cols-2 gap-2">
              {renderAttributeItem('Destinataire', 'destinataire', data.destinataire)}
              {renderAttributeItem('Importateur', 'importateur', data.importateur)}
              {renderAttributeItem('Port', 'port', data.port)}
              {renderAttributeItem('Moyen Transport', 'moyen_transport', data.moyen_transport)}
              {renderAttributeItem('Incoterm', 'incoterm', data.incoterm)}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Montants</h4>
            <div className="grid grid-cols-2 gap-2">
              {renderAttributeItem('Total HT', 'total_amount_excl_tax', data.total_amount_excl_tax)}
              {renderAttributeItem('TVA', 'tax_amount', data.tax_amount)}
              {renderAttributeItem('Total TTC', 'total_amount_incl_tax', data.total_amount_incl_tax)}
              {renderAttributeItem('Devise', 'currency', data.currency)}
            </div>
          </div>

          {Object.keys(data.extra_data || {}).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Données Extra</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.extra_data).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null) {
                    return renderAttributeItem(key, key, JSON.stringify(value));
                  }
                  return renderAttributeItem(key, key, value as string | number);
                })}
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
};
