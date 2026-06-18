/** Ligne de facturation */
export interface InvoiceItem {
  description: string;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
  tax_rate: number | null;
}

/** Structure complète d'une facture (tronc commun + extra_data dynamique) */
export interface InvoiceData {
  id: number;
  
  // ── Identité ──
  invoice_number: string | null;
  date: string | null; // ISO 8601

  // ── Fournisseur ──
  supplier_name: string | null;
  supplier_tax_id: string | null;

  // ── Logistique ──
  destinataire: string | null;
  importateur: string | null;
  port: string | null;
  moyen_transport: string | null;
  incoterm: string | null;

  // ── Montants ──
  total_amount_excl_tax: number | null;
  tax_amount: number | null;
  total_amount_incl_tax: number | null;
  currency: string | null;

  // ── Métadonnées ──
  confidence_score: number;
  source_filename?: string;
  created_at?: string;

  // ── Tableau de lignes ──
  items: InvoiceItem[];

  // ── Zone dynamique (le cœur du système) ──
  extra_data: Record<string, unknown>;

  // ── Données OCR pour le viewer ──
  ocr_data?: {
    ocr_lines?: Array<{ text: string; confidence: number; bbox: number[][] }>;
    ocr_line_references?: Record<string, number[]>;
    image_size?: { width: number; height: number };
  };
}

/** Metadata for the invoice list */
export interface InvoiceListEntry {
  id: number;
  filename: string;
  invoice_number: string | null;
  supplier_name: string | null;
  date: string | null;
  total_amount_incl_tax: number | null;
  currency: string | null;
  confidence_score: number;
  items_count: number;
  extra_data_keys: number;
}
