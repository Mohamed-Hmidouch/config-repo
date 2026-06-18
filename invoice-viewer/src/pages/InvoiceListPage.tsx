import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ConfidenceBadge } from '../components/invoice/ConfidenceBadge';
import { Badge } from '../components/ui/Badge';
import { useInvoiceList } from '../hooks/useInvoiceList';
import { formatMoney, formatDate, truncateFilename } from '../utils/formatters';
import {
  File,
  Package,
  Paperclip,
  Crosshair,
  Buildings,
  CalendarBlank,
  ArrowRight,
  WarningCircle,
} from '@phosphor-icons/react';

export const InvoiceListPage: React.FC = () => {
  const { invoices, loading, error } = useInvoiceList();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Chargement des factures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <span className="page-error__icon">
          <WarningCircle size={24} weight="duotone" />
        </span>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="invoice-list-page">
      <PageHeader
        title="Factures"
        subtitle={`${invoices.length} facture${invoices.length > 1 ? 's' : ''} extraites par OCR`}
      />

      <div className="invoice-list-page__stats">
        <div className="stat-card">
          <span className="stat-card__icon">
            <File size={20} weight="duotone" />
          </span>
          <div>
            <span className="stat-card__value">{invoices.length}</span>
            <span className="stat-card__label">Factures</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">
            <Package size={20} weight="duotone" />
          </span>
          <div>
            <span className="stat-card__value">
              {invoices.reduce((acc, inv) => acc + inv.items_count, 0)}
            </span>
            <span className="stat-card__label">Lignes totales</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">
            <Paperclip size={20} weight="duotone" />
          </span>
          <div>
            <span className="stat-card__value">
              {invoices.reduce((acc, inv) => acc + inv.extra_data_keys, 0)}
            </span>
            <span className="stat-card__label">Champs extra</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">
            <Crosshair size={20} weight="duotone" />
          </span>
          <div>
            <span className="stat-card__value">
              {invoices.length > 0
                ? Math.round(
                    (invoices.reduce((acc, inv) => acc + inv.confidence_score, 0) /
                      invoices.length) *
                      100
                  )
                : 0}
              %
            </span>
            <span className="stat-card__label">Confiance moy.</span>
          </div>
        </div>
      </div>

      <div className="invoice-list">
        {invoices.map((inv) => (
          <Link
            key={inv.id}
            to={`/invoice/${inv.id}`}
            className="invoice-card"
          >
            <div className="invoice-card__header">
              <div className="invoice-card__id">
                <span className="invoice-card__number">
                  {inv.invoice_number || 'N/A'}
                </span>
                <span className="invoice-card__filename">
                  {truncateFilename(inv.filename)}
                </span>
              </div>
              <ConfidenceBadge score={inv.confidence_score} />
            </div>

            <div className="invoice-card__body">
              <div className="invoice-card__field">
                <span className="invoice-card__field-icon">
                  <Buildings size={16} weight="duotone" />
                </span>
                <span>{inv.supplier_name || '-'}</span>
              </div>
              <div className="invoice-card__field">
                <span className="invoice-card__field-icon">
                  <CalendarBlank size={16} weight="duotone" />
                </span>
                <span>{formatDate(inv.date)}</span>
              </div>
            </div>

            <div className="invoice-card__footer">
              <div className="invoice-card__amount">
                {inv.total_amount_incl_tax !== null
                  ? formatMoney(inv.total_amount_incl_tax, inv.currency)
                  : '-'}
              </div>
              <div className="invoice-card__tags">
                {inv.items_count > 0 && (
                  <Badge variant="neutral" size="sm">
                    {inv.items_count} ligne{inv.items_count > 1 ? 's' : ''}
                  </Badge>
                )}
                {inv.extra_data_keys > 0 && (
                  <Badge variant="info" size="sm">
                    +{inv.extra_data_keys} extra
                  </Badge>
                )}
              </div>
            </div>

            <div className="invoice-card__arrow">
              <ArrowRight size={18} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
