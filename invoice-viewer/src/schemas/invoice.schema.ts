import { z } from 'zod';

const InvoiceItemSchema = z.object({
  description: z.string().default(''),
  quantity: z.number().nullable().default(null),
  unit_price: z.number().nullable().default(null),
  total_price: z.number().nullable().default(null),
  tax_rate: z.number().nullable().default(null),
});

export const InvoiceSchema = z.object({
  invoice_number: z.string().nullable().default(null),
  date: z.string().nullable().default(null),
  supplier_name: z.string().nullable().default(null),
  supplier_tax_id: z.string().nullable().default(null),
  destinataire: z.string().nullable().default(null),
  importateur: z.string().nullable().default(null),
  port: z.string().nullable().default(null),
  moyen_transport: z.string().nullable().default(null),
  incoterm: z.string().nullable().default(null),
  total_amount_excl_tax: z.number().nullable().default(null),
  tax_amount: z.number().nullable().default(null),
  total_amount_incl_tax: z.number().nullable().default(null),
  currency: z.string().nullable().default(null),
  confidence_score: z.number().default(0),
  items: z.array(InvoiceItemSchema).default([]),
  extra_data: z.record(z.string(), z.unknown()).default({}),
  ocr_data: z.record(z.string(), z.unknown()).nullable().optional(),
}).passthrough(); // Accept unknown keys in case the LLM adds extras
