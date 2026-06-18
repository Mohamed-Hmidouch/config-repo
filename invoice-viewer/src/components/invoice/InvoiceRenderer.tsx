import React from 'react';
import type { InvoiceData } from '../../types/invoice';
import { HeaderSection } from './HeaderSection';
import { PartiesSection } from './PartiesSection';
import { LogisticsSection } from './LogisticsSection';
import { ItemsTable } from './ItemsTable';
import { FinancialSummary } from './FinancialSummary';
import { ExtraDataGrid } from './ExtraDataGrid';

interface InvoiceRendererProps {
  data: InvoiceData;
}

/**
 * Main orchestrator — receives validated InvoiceData
 * and distributes it to the appropriate section components.
 */
export const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({ data }) => {
  return (
    <div className="invoice-renderer">
      <HeaderSection
        invoiceNumber={data.invoice_number}
        date={data.date}
        confidence={data.confidence_score}
      />

      <div className="invoice-renderer__grid">
        <PartiesSection
          supplierName={data.supplier_name}
          supplierTaxId={data.supplier_tax_id}
          destinataire={data.destinataire}
          importateur={data.importateur}
        />

        <LogisticsSection
          port={data.port}
          moyenTransport={data.moyen_transport}
          incoterm={data.incoterm}
        />
      </div>

      <ItemsTable items={data.items} currency={data.currency} />

      <FinancialSummary
        totalExclTax={data.total_amount_excl_tax}
        taxAmount={data.tax_amount}
        totalInclTax={data.total_amount_incl_tax}
        currency={data.currency}
      />

      <ExtraDataGrid data={data.extra_data} currency={data.currency} />
    </div>
  );
};
