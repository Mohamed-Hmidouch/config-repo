import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { InvoiceRenderer } from '../components/invoice/InvoiceRenderer';
import { InvoiceInspector } from '../components/invoice/InvoiceInspector';
import { useInvoice } from '../hooks/useInvoice';
import { Badge } from '../components/ui/Badge';
import { WarningCircle, MagnifyingGlass, FileText } from '@phosphor-icons/react';

const API_BASE = 'http://localhost:8000';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useInvoice(id);
  const [isInspectorMode, setIsInspectorMode] = useState(false);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Chargement de la facture...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="invoice-detail-page">
        <PageHeader title="Erreur" showBack />
        <div className="page-error">
          <span className="page-error__icon">
            <WarningCircle size={24} weight="duotone" />
          </span>
          <p>{error || 'Facture introuvable'}</p>
        </div>
      </div>
    );
  }

  const fileUrl = data.source_filename ? `${API_BASE}/files/${data.source_filename}` : null;

  return (
    <div className="invoice-detail-page h-full flex flex-col">
      <PageHeader
        title={`Facture ${data.invoice_number || ''}`}
        subtitle={data.source_filename || `Facture #${data.id}`}
        showBack
        actions={
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsInspectorMode(!isInspectorMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ring-1 ${
                isInspectorMode 
                  ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-300 ring-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {isInspectorMode ? (
                <><FileText size={16} /> Vue Classique</>
              ) : (
                <><MagnifyingGlass size={16} /> Inspecter</>
              )}
            </button>
            <Badge variant="info" size="md">
              {data.currency || '-'}
            </Badge>
          </div>
        }
      />
      
      <div className="flex-1 min-h-0">
        {isInspectorMode ? (
          <InvoiceInspector data={data} fileUrl={fileUrl} />
        ) : (
          <InvoiceRenderer data={data} />
        )}
      </div>
    </div>
  );
};
