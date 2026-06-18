import { useState, useEffect } from 'react';
import type { InvoiceData } from '../types/invoice';
import { InvoiceSchema } from '../schemas/invoice.schema';

interface UseInvoiceResult {
  data: InvoiceData | null;
  loading: boolean;
  error: string | null;
}

const API_URL = 'http://localhost:8000/invoices';

/**
 * Fetches a single invoice from the backend API by ID.
 * Validates and normalizes the JSON via Zod schema.
 */
export function useInvoice(id: string | undefined): UseInvoiceResult {
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No ID provided');
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to load invoice: ${response.status} ${response.statusText}`);
        }

        const rawJson = await response.json();
        
        // Ensure id and date are correctly mapped from backend response
        const validated = InvoiceSchema.parse(rawJson);
        const invoiceData: InvoiceData = { 
          ...validated, 
          id: rawJson.id,
          date: rawJson.invoice_date || rawJson.date || validated.date
        } as InvoiceData;
        
        setData(invoiceData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while loading the invoice');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  return { data, loading, error };
}
