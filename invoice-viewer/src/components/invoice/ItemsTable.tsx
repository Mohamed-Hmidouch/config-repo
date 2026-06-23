// See DESIGN_RULES.md before editing this file.
import React from 'react';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney } from '../../utils/formatters';
import { Package, Tray } from '@phosphor-icons/react';
import type { InvoiceItem } from '../../types/invoice';

interface ItemsTableProps {
  items: InvoiceItem[];
  currency: string | null;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({ items, currency }) => {
  if (items.length === 0) {
    return (
      <Card title="Lignes de Facturation" icon={<Package size={18} weight="light" />}>
        <EmptyState
          message="Aucune ligne de facturation detectee"
          icon={<Tray size={22} weight="light" />}
          description="L'OCR n'a pas pu extraire les lignes detaillees de cette facture."
        />
      </Card>
    );
  }

  const columns = [
    {
      key: 'index',
      header: '#',
      align: 'center' as const,
      render: (_: InvoiceItem, index: number) => (
        <span className="text-xs text-ink-muted tabular-nums">{index + 1}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: InvoiceItem) => (
        <span className="text-sm font-normal text-ink">{item.description}</span>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantite',
      align: 'right' as const,
      render: (item: InvoiceItem) => (
        <span className="text-sm font-normal text-ink tabular-nums">
          {item.quantity?.toLocaleString('fr-FR') ?? '-'}
        </span>
      ),
    },
    {
      key: 'unit_price',
      header: 'Prix Unitaire',
      align: 'right' as const,
      render: (item: InvoiceItem) => (
        <span className="text-sm font-normal text-ink tabular-nums">
          {item.unit_price !== null ? formatMoney(item.unit_price, currency) : '-'}
        </span>
      ),
    },
    {
      key: 'total_price',
      header: 'Total',
      align: 'right' as const,
      render: (item: InvoiceItem) => (
        <span className="text-sm font-semibold text-accent tabular-nums">
          {item.total_price !== null ? formatMoney(item.total_price, currency) : '-'}
        </span>
      ),
    },
    {
      key: 'tax_rate',
      header: 'TVA',
      align: 'right' as const,
      render: (item: InvoiceItem) => (
        <span className="text-sm font-normal text-ink tabular-nums">
          {item.tax_rate !== null ? `${item.tax_rate}%` : '-'}
        </span>
      ),
    },
  ];

  return (
    <Card
      title="Lignes de Facturation"
      icon={<Package size={18} weight="light" />}
      headerAction={
        <span className="text-xs font-medium text-ink-muted">
          {items.length} ligne{items.length > 1 ? 's' : ''}
        </span>
      }
    >
      <Table columns={columns} data={items} />
    </Card>
  );
};
