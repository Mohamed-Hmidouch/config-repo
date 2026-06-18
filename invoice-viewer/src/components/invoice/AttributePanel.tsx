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

  const handleSelect = (key: string) => {
    const indices = ocrRefs[key] || [];
    if (indices.length > 0) {
      onAttributeSelect(key, indices);
    } else {
      // Clear selection if no indices found
      onAttributeSelect(key, []);
    }
  };

  const renderAttributeItem = (label: string, key: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return null;
    
    const hasMapping = Array.isArray(ocrRefs[key]) && ocrRefs[key].length > 0;
    const isActive = activeAttribute === key;
    
    return (
      <div 
        key={key}
        onClick={() => handleSelect(key)}
        className={`attribute-item ${isActive ? 'attribute-item--active' : ''} ${!hasMapping ? 'attribute-item--no-mapping' : ''}`}
      >
        <div className="attribute-item__header">
          <span className="attribute-item__label">{label}</span>
          {hasMapping && <span className="attribute-item__indicator" />}
        </div>
        <div className="attribute-item__value">{String(value)}</div>
      </div>
    );
  };

  return (
    <div className="attribute-panel-container">
      <Card title="Attributs Extraits" icon={<ListMagnifyingGlass size={18} weight="duotone" />} className="attribute-panel-card">
        <div className="attribute-panel-scroll">
          
          <div className="attribute-section">
            <h4 className="attribute-section__title">Identité</h4>
            {renderAttributeItem('N° Facture', 'invoice_number', data.invoice_number)}
            {renderAttributeItem('Date', 'date', data.date)}
          </div>

          <div className="attribute-section">
            <h4 className="attribute-section__title">Fournisseur</h4>
            {renderAttributeItem('Nom Fournisseur', 'supplier_name', data.supplier_name)}
            {renderAttributeItem('ID Fiscal', 'supplier_tax_id', data.supplier_tax_id)}
          </div>

          <div className="attribute-section">
            <h4 className="attribute-section__title">Logistique</h4>
            {renderAttributeItem('Destinataire', 'destinataire', data.destinataire)}
            {renderAttributeItem('Importateur', 'importateur', data.importateur)}
            {renderAttributeItem('Port', 'port', data.port)}
            {renderAttributeItem('Moyen Transport', 'moyen_transport', data.moyen_transport)}
            {renderAttributeItem('Incoterm', 'incoterm', data.incoterm)}
          </div>

          <div className="attribute-section">
            <h4 className="attribute-section__title">Montants</h4>
            {renderAttributeItem('Total HT', 'total_amount_excl_tax', data.total_amount_excl_tax)}
            {renderAttributeItem('TVA', 'tax_amount', data.tax_amount)}
            {renderAttributeItem('Total TTC', 'total_amount_incl_tax', data.total_amount_incl_tax)}
            {renderAttributeItem('Devise', 'currency', data.currency)}
          </div>

          {Object.keys(data.extra_data || {}).length > 0 && (
            <div className="attribute-section">
              <h4 className="attribute-section__title">Données Extra</h4>
              {Object.entries(data.extra_data).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                  return renderAttributeItem(key, key, JSON.stringify(value));
                }
                return renderAttributeItem(key, key, value as string | number);
              })}
            </div>
          )}
          
        </div>
      </Card>
    </div>
  );
};
