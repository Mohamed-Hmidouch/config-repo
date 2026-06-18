import { useState, useEffect } from 'react';
import type { InvoiceListEntry } from '../types/invoice';

const API_URL = 'http://localhost:8000/invoices';

interface UseInvoiceListResult {
  invoices: InvoiceListEntry[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches all invoices from the backend API.
 */
export function useInvoiceList(): UseInvoiceListResult {
  const [invoices, setInvoices] = useState<InvoiceListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Failed to load invoices: ${response.status}`);
        
        const rawJson = await response.json();
        
        const parsedInvoices: InvoiceListEntry[] = rawJson.map((inv: any) => ({
          id: inv.id,
          filename: inv.source_filename || 'unknown.pdf',
          invoice_number: inv.invoice_number,
          supplier_name: inv.supplier_name,
          date: inv.invoice_date || inv.date,
          total_amount_incl_tax: inv.total_amount_incl_tax,
          currency: inv.currency,
          confidence_score: inv.confidence_score,
          items_count: inv.items ? inv.items.length : 0,
          extra_data_keys: inv.extra_data ? Object.keys(inv.extra_data).length : 0,
        }));

        setInvoices(parsedInvoices);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An error occurred while loading invoices');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { invoices, loading, error };
}
