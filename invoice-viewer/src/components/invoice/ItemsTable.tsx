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
      <Card title="Lignes de Facturation" icon={<Package size={18} weight="duotone" />}>
        <EmptyState
          message="Aucune ligne de facturation detectee"
          icon={<Tray size={22} weight="duotone" />}
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
        <span className="items-table__index">{index + 1}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: InvoiceItem) => (
        <span className="items-table__desc">{item.description}</span>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantite',
      align: 'right' as const,
      render: (item: InvoiceItem) => (
        <span>{item.quantity?.toLocaleString('fr-FR') ?? '-'}</span>
      ),
    },
    {
      key: 'unit_price',
      header: 'Prix Unitaire',
      align: 'right' as const,
      render: (item: InvoiceItem) => (
        <span>
          {item.unit_price !== null ? formatMoney(item.unit_price, currency) : '-'}
        </span>
      ),
    },
    {
      key: 'total_price',
      header: 'Total',
      align: 'right' as const,
      render: (item: InvoiceItem) => (
        <span className="items-table__total">
          {item.total_price !== null ? formatMoney(item.total_price, currency) : '-'}
        </span>
      ),
    },
    {
      key: 'tax_rate',
      header: 'TVA',
      align: 'right' as const,
      render: (item: InvoiceItem) => (
        <span>
          {item.tax_rate !== null ? `${item.tax_rate}%` : '-'}
        </span>
      ),
    },
  ];

  return (
    <Card
      title="Lignes de Facturation"
      icon={<Package size={18} weight="duotone" />}
      headerAction={
        <span className="items-table__count">{items.length} ligne{items.length > 1 ? 's' : ''}</span>
      }
    >
      <Table columns={columns} data={items} />
    </Card>
  );
};
