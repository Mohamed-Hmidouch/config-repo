import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PdfViewer } from '../components/invoice/PdfViewer';
import { useInvoice } from '../hooks/useInvoice';
import { useAuth } from '../context/AuthContext';
import { formatDate, humanizeKey, formatMoney } from '../utils/formatters';
import { WarningCircle, CircleNotch, CaretLeft, CheckCircle, User, Buildings, MapPin, CurrencyCircleDollar, Hash, CalendarBlank, FileText, PencilSimple } from '@phosphor-icons/react';

const API_BASE = 'http://localhost:8000';

interface FieldCardProps {
  label: string;
  value: string | null;
  icon: any;
  isActive: boolean;
  onClick: () => void;
  editable?: boolean;
  fieldKey?: string;
  onEdit?: (key: string, value: string) => void;
}

const FieldCard = ({ label, value, icon: Icon, isActive, onClick, editable, fieldKey, onEdit }: FieldCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');

  const handleBlur = () => {
    setIsEditing(false);
    if (onEdit && fieldKey && localValue !== (value || '')) {
      onEdit(fieldKey, localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div
      onClick={() => !isEditing && onClick()}
      className={`flex items-center gap-4 bg-white border rounded-lg p-4 mb-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] transition-all ${!isEditing ? 'cursor-pointer' : ''} ${isActive ? 'border-[#0EA5E9]' : 'border-[#E2E8F0] hover:border-[#0EA5E9]'}`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-[#0EA5E9] text-white' : 'bg-[#F8FAFC] text-[#0EA5E9]'}`}>
        <Icon size={24} weight={isActive ? 'fill' : 'duotone'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#1F2937] flex items-center gap-2">
          <span className="truncate">{label}*</span>
          {editable && !isEditing && (
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="text-gray-400 hover:text-[#0EA5E9] shrink-0">
              <PencilSimple size={16} />
            </button>
          )}
        </div>
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full mt-1 bg-[#FFFFFF] border-2 border-[#0EA5E9] rounded-lg px-2 py-1 text-sm font-medium text-[#1F2937] outline-none"
          />
        ) : (
          <p className="text-sm font-medium text-gray-500 truncate">{value || 'Non disponible'}</p>
        )}
      </div>
      <div className={`ml-auto w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-white shadow-sm transition-colors ${isActive ? 'bg-[#0EA5E9]' : 'bg-gray-200'}`}>
        <CheckCircle size={14} weight="bold" />
      </div>
    </div>
  );
};

export const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useInvoice(id);
  const { token } = useAuth();

  const [activeAttribute, setActiveAttribute] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (loading) {
    return (
      <div className="h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 font-sans">
        <CircleNotch size={40} weight="bold" className="animate-spin text-[#0EA5E9]" />
        <p className="text-lg font-bold text-[#1F2937]">Chargement des détails...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 font-sans px-6 text-center">
        <WarningCircle size={64} weight="light" className="text-[#EF4444]" />
        <p className="text-xl font-bold text-[#1F2937]">{error || 'Facture introuvable'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-[#1F2937] text-white rounded-full px-8 py-4 font-bold"
        >
          Retour
        </button>
      </div>
    );
  }

  // Pre-calculate if already confirmed initially
  const alreadyConfirmed = !!data.confirmed_by_user_id || isConfirmed;

  const handleEdit = (key: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [key]: value }));
  };

  const handleExtraDataEdit = (key: string, value: string) => {
    setEditedFields(prev => ({
      ...prev,
      extra_data: {
        ...(prev.extra_data || {}),
        [key]: value
      }
    }));
  };

  const handleConfirm = async () => {
    if (!token) return;
    setIsSubmitting(true);

    // Helper to robustly parse currency strings like "2 539,90 £" or "1,234.56" into floats
    const parseFormattedNumber = (val: any): number | null => {
      if (typeof val === 'number') return val;
      if (!val || typeof val !== 'string') return null;
      let cleaned = val.replace(/[^0-9.,-]/g, '');
      const lastComma = cleaned.lastIndexOf(',');
      const lastDot = cleaned.lastIndexOf('.');
      if (lastComma > -1 && lastDot > -1) {
        if (lastComma > lastDot) {
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
          cleaned = cleaned.replace(/,/g, '');
        }
      } else if (lastComma > -1) {
        cleaned = cleaned.replace(',', '.');
      }
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    // Prepare payload and sanitize known numeric fields
    const payload = { ...editedFields };
    const numericFields = ['total_amount_excl_tax', 'tax_amount', 'total_amount_incl_tax'];
    numericFields.forEach(field => {
      if (payload[field] !== undefined) {
        payload[field] = parseFormattedNumber(payload[field]);
      }
    });

    try {
      const response = await fetch(`${API_BASE}/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm invoice');
      }

      setIsConfirmed(true);
      // Clear edits after successful save
      setEditedFields({});
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la confirmation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileUrl = data.source_filename ? `${API_BASE}/files/${data.source_filename}` : null;
  const extraDataEntries = Object.entries(data.extra_data || {});

  const ocrRefs = data.ocr_data?.ocr_line_references || {};
  let highlightedIndices: number[] = [];

  if (activeAttribute) {
    let indices = ocrRefs[activeAttribute];
    if (!Array.isArray(indices) && ocrRefs.extra_data && typeof ocrRefs.extra_data === 'object') {
      indices = (ocrRefs.extra_data as Record<string, any>)[activeAttribute];
    }
    highlightedIndices = Array.isArray(indices) ? indices : [];
  }

  const ocrLines = data.ocr_data?.ocr_lines || [];
  const bboxes = ocrLines.map((line: any) => line.bbox).filter((bbox: any) => bbox && bbox.length === 4);
  const ocrImageSize = data.ocr_data?.image_size || null;

  // Render values: show edited value if exists, else original
  const getValue = (key: string, original: any) => {
    return editedFields[key] !== undefined ? editedFields[key] : original;
  };

  const getValueFromExtra = (key: string, original: string) => {
    return editedFields.extra_data?.[key] !== undefined ? editedFields.extra_data[key] : original;
  };

  // Compute total number of edited fields (including extra_data fields)
  let editedCount = Object.keys(editedFields).filter(k => k !== 'extra_data').length;
  if (editedFields.extra_data) {
    editedCount += Object.keys(editedFields.extra_data).length;
  }

  return (
    <div className="h-screen bg-[#F8FAFC] font-sans flex flex-col md:flex-row overflow-hidden">

      {/* ── LEFT COLUMN: PDF Viewer ── */}
      <div className="hidden md:flex flex-1 bg-[#F8FAFC] p-6 pr-3">
        <div className="flex-1 bg-white rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-[#E2E8F0] overflow-hidden relative">
          {fileUrl ? (
            <PdfViewer
              key={fileUrl}
              fileUrl={fileUrl}
              bboxes={bboxes}
              highlightedIndices={highlightedIndices}
              ocrImageSize={ocrImageSize}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <FileText size={48} weight="light" />
              <p className="font-bold">Aucune source de document</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: Form ── */}
      <div className="w-full md:w-[500px] lg:w-[600px] shrink-0 h-full overflow-y-auto bg-[#F8FAFC] relative pb-[200px] hide-scrollbar pl-3">

        {/* Header Bar */}
        <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-[#F8FAFC] z-10">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-[#E2E8F0] flex items-center justify-center text-[#1F2937] hover:bg-gray-50 transition-colors"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <h1 className="text-xl font-bold text-[#1F2937]">Informations sur la facture</h1>
          <div className="w-12" />
        </div>

        <div className="px-6">

          {/* Main Card */}
          <div className={`rounded-xl p-8 relative overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] mb-8 transition-colors ${alreadyConfirmed ? 'bg-sky-50 border border-sky-100 text-[#0EA5E9]' : 'bg-white border border-[#E2E8F0] text-[#0EA5E9]'}`}>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {alreadyConfirmed ? 'Facture Confirmée' : 'Détails de la facture'}
                </h2>
                <p className="text-gray-500 font-medium max-w-[200px]">
                  {alreadyConfirmed ? 'Ce document a été vérifié' : 'Tous les détails extraits par OCR'}
                </p>
              </div>
              {alreadyConfirmed && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  <span className="text-sm font-bold text-slate-700">Vérifié</span>
                </div>
              )}
            </div>
            {/* Decorative Icon */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 w-20 h-20 border border-gray-100 rounded-full flex items-center justify-center pointer-events-none bg-gray-50/50">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <FileText size={28} weight="light" className={alreadyConfirmed ? 'text-sky-500' : 'text-gray-400'} />
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-x-4">
              <FieldCard editable={!alreadyConfirmed} fieldKey="invoice_number" onEdit={handleEdit} label="Numéro de Facture" value={getValue('invoice_number', data.invoice_number)} icon={Hash} isActive={activeAttribute === 'invoice_number'} onClick={() => setActiveAttribute('invoice_number')} />
              <FieldCard editable={!alreadyConfirmed} fieldKey="date" onEdit={handleEdit} label="Date" value={getValue('date', data.date ? formatDate(data.date) : null)} icon={CalendarBlank} isActive={activeAttribute === 'date'} onClick={() => setActiveAttribute('date')} />
              <FieldCard editable={!alreadyConfirmed} fieldKey="supplier_name" onEdit={handleEdit} label="Nom du fournisseur" value={getValue('supplier_name', data.supplier_name)} icon={Buildings} isActive={activeAttribute === 'supplier_name'} onClick={() => setActiveAttribute('supplier_name')} />
              <FieldCard editable={!alreadyConfirmed} fieldKey="supplier_tax_id" onEdit={handleEdit} label="Identifiant fiscal" value={getValue('supplier_tax_id', data.supplier_tax_id)} icon={Hash} isActive={activeAttribute === 'supplier_tax_id'} onClick={() => setActiveAttribute('supplier_tax_id')} />
            </div>

            {(data.destinataire || data.importateur || data.port) && (
              <div className="mt-4 mb-4">
                <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Détails Logistiques</h3>
                <div className="grid grid-cols-2 gap-x-4">
                  {data.destinataire && <FieldCard editable={!alreadyConfirmed} fieldKey="destinataire" onEdit={handleEdit} label="Destinataire" value={getValue('destinataire', data.destinataire)} icon={User} isActive={activeAttribute === 'destinataire'} onClick={() => setActiveAttribute('destinataire')} />}
                  {data.importateur && <FieldCard editable={!alreadyConfirmed} fieldKey="importateur" onEdit={handleEdit} label="Importateur" value={getValue('importateur', data.importateur)} icon={User} isActive={activeAttribute === 'importateur'} onClick={() => setActiveAttribute('importateur')} />}
                  {data.port && <FieldCard editable={!alreadyConfirmed} fieldKey="port" onEdit={handleEdit} label="Adresse / Port" value={getValue('port', data.port)} icon={MapPin} isActive={activeAttribute === 'port'} onClick={() => setActiveAttribute('port')} />}
                </div>
              </div>
            )}

            <div className="mt-4 mb-4">
              <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Détails Financiers</h3>
              <div className="grid grid-cols-2 gap-x-4">
                <FieldCard editable={!alreadyConfirmed} fieldKey="total_amount_excl_tax" onEdit={handleEdit} label="Total HT" value={getValue('total_amount_excl_tax', data.total_amount_excl_tax !== null ? formatMoney(data.total_amount_excl_tax, data.currency) : null)} icon={CurrencyCircleDollar} isActive={activeAttribute === 'total_amount_excl_tax'} onClick={() => setActiveAttribute('total_amount_excl_tax')} />
                <FieldCard editable={!alreadyConfirmed} fieldKey="tax_amount" onEdit={handleEdit} label="Montant de la TVA" value={getValue('tax_amount', data.tax_amount !== null ? formatMoney(data.tax_amount, data.currency) : null)} icon={CurrencyCircleDollar} isActive={activeAttribute === 'tax_amount'} onClick={() => setActiveAttribute('tax_amount')} />
                <FieldCard editable={!alreadyConfirmed} fieldKey="total_amount_incl_tax" onEdit={handleEdit} label="Total TTC" value={getValue('total_amount_incl_tax', data.total_amount_incl_tax !== null ? formatMoney(data.total_amount_incl_tax, data.currency) : null)} icon={CurrencyCircleDollar} isActive={activeAttribute === 'total_amount_incl_tax'} onClick={() => setActiveAttribute('total_amount_incl_tax')} />
              </div>
            </div>

            {extraDataEntries.length > 0 && (
              <div className="mt-4 mb-4">
                <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Informations Supplémentaires</h3>
                <div className="grid grid-cols-2 gap-x-4">
                  {extraDataEntries.map(([key, value]) => (
                    <FieldCard key={key} editable={!alreadyConfirmed} fieldKey={key} onEdit={handleExtraDataEdit} label={humanizeKey(key)} value={getValueFromExtra(key, String(value))} icon={FileText} isActive={activeAttribute === key} onClick={() => setActiveAttribute(key)} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Bottom Confirm Banner ── */}
        {!alreadyConfirmed && (
          <div className="fixed bottom-0 w-full md:w-[500px] lg:w-[600px] z-20 right-0">
            <div className="bg-white border-t border-[#E2E8F0] p-8 pt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 font-medium text-[15px] leading-relaxed max-w-[70%]">
                  Vérifiez les informations extraites. Vous pouvez modifier les champs directement.
                </p>
                {editedCount > 0 && (
                  <div className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                    {editedCount} modification{editedCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full bg-[#0EA5E9] text-white rounded-xl py-4 text-lg font-bold shadow-md hover:bg-[#0284C7] transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <CircleNotch size={24} className="animate-spin" /> : 'Confirmer la facture'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


