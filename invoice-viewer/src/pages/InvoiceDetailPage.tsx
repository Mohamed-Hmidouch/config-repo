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
      className={`flex items-center gap-4 bg-white border-2 rounded-[24px] p-4 mb-4 shadow-sm transition-all ${!isEditing ? 'cursor-pointer' : ''} ${isActive ? 'border-[#D97757]' : 'border-gray-100 hover:border-[#D97757]'}`}
    >
      <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-[#D97757] text-white' : 'bg-[#F3F1EC] text-[#D97757]'}`}>
        <Icon size={24} weight={isActive ? 'fill' : 'duotone'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#1F2937] flex items-center gap-2">
          <span className="truncate">{label}*</span>
          {editable && !isEditing && (
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="text-gray-400 hover:text-[#D97757] shrink-0">
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
            className="w-full mt-1 bg-[#F5F7F6] border-2 border-[#D97757] rounded-lg px-2 py-1 text-sm font-medium text-[#1F2937] outline-none"
          />
        ) : (
          <p className="text-sm font-medium text-gray-500 truncate">{value || 'Not available'}</p>
        )}
      </div>
      <div className={`ml-auto w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-white shadow-sm transition-colors ${isActive ? 'bg-[#D97757]' : 'bg-gray-200'}`}>
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
      <div className="h-screen bg-[#F3F1EC] flex flex-col items-center justify-center gap-4 font-sans">
        <CircleNotch size={40} weight="bold" className="animate-spin text-[#D97757]" />
        <p className="text-lg font-bold text-[#1F2937]">Loading Details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen bg-[#F3F1EC] flex flex-col items-center justify-center gap-4 font-sans px-6 text-center">
        <WarningCircle size={64} weight="duotone" className="text-[#EF4444]" />
        <p className="text-xl font-bold text-[#1F2937]">{error || 'Invoice Not Found'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-[#1F2937] text-white rounded-full px-8 py-4 font-bold"
        >
          Go Back
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
    <div className="h-screen bg-[#F3F1EC] font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* ── LEFT COLUMN: PDF Viewer ── */}
      <div className="hidden md:flex flex-1 bg-[#F5F7F6] p-6">
        <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden relative">
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
              <FileText size={48} weight="duotone" />
              <p className="font-bold">No Document Source</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: Form ── */}
      <div className="w-full md:w-[500px] lg:w-[600px] shrink-0 h-full overflow-y-auto bg-[#F3F1EC] relative pb-[200px] hide-scrollbar">
        
        {/* Header Bar */}
        <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-[#F3F1EC] z-10">
          <button 
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#1F2937] hover:bg-gray-50"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <h1 className="text-xl font-bold text-[#1F2937]">Invoice Information</h1>
          <div className="w-12" />
        </div>

        <div className="px-6">
          
          {/* Main Green Card */}
          <div className={`rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg mb-8 transition-colors ${alreadyConfirmed ? 'bg-green-600' : 'bg-[#D97757]'}`}>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {alreadyConfirmed ? 'Confirmed Invoice' : 'Invoice Details'}
                </h2>
                <p className="text-white/90 font-medium max-w-[200px]">
                  {alreadyConfirmed ? 'This document has been verified' : 'All legal details as extracted by OCR'}
                </p>
              </div>
              {alreadyConfirmed && (
                <div className="bg-white text-green-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle weight="bold" size={20} /> Verified
                </div>
              )}
            </div>
            {/* Decorative Icon */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 w-20 h-20 border-4 border-white/20 rounded-full flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FileText size={28} weight="fill" className="text-white" />
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-x-4">
              <FieldCard editable={!alreadyConfirmed} fieldKey="invoice_number" onEdit={handleEdit} label="Invoice Number" value={getValue('invoice_number', data.invoice_number)} icon={Hash} isActive={activeAttribute === 'invoice_number'} onClick={() => setActiveAttribute('invoice_number')} />
              <FieldCard editable={!alreadyConfirmed} fieldKey="date" onEdit={handleEdit} label="Date" value={getValue('date', data.date ? formatDate(data.date) : null)} icon={CalendarBlank} isActive={activeAttribute === 'date'} onClick={() => setActiveAttribute('date')} />
              <FieldCard editable={!alreadyConfirmed} fieldKey="supplier_name" onEdit={handleEdit} label="Supplier Name" value={getValue('supplier_name', data.supplier_name)} icon={Buildings} isActive={activeAttribute === 'supplier_name'} onClick={() => setActiveAttribute('supplier_name')} />
              <FieldCard editable={!alreadyConfirmed} fieldKey="supplier_tax_id" onEdit={handleEdit} label="Supplier Tax ID" value={getValue('supplier_tax_id', data.supplier_tax_id)} icon={Hash} isActive={activeAttribute === 'supplier_tax_id'} onClick={() => setActiveAttribute('supplier_tax_id')} />
            </div>
            
            {(data.destinataire || data.importateur || data.port) && (
              <div className="mt-4 mb-4">
                 <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Logistics Details</h3>
                 <div className="grid grid-cols-2 gap-x-4">
                   {data.destinataire && <FieldCard editable={!alreadyConfirmed} fieldKey="destinataire" onEdit={handleEdit} label="Destinataire" value={getValue('destinataire', data.destinataire)} icon={User} isActive={activeAttribute === 'destinataire'} onClick={() => setActiveAttribute('destinataire')} />}
                   {data.importateur && <FieldCard editable={!alreadyConfirmed} fieldKey="importateur" onEdit={handleEdit} label="Importateur" value={getValue('importateur', data.importateur)} icon={User} isActive={activeAttribute === 'importateur'} onClick={() => setActiveAttribute('importateur')} />}
                   {data.port && <FieldCard editable={!alreadyConfirmed} fieldKey="port" onEdit={handleEdit} label="Address / Port" value={getValue('port', data.port)} icon={MapPin} isActive={activeAttribute === 'port'} onClick={() => setActiveAttribute('port')} />}
                 </div>
              </div>
            )}

            <div className="mt-4 mb-4">
               <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Financials</h3>
               <div className="grid grid-cols-2 gap-x-4">
                 <FieldCard editable={!alreadyConfirmed} fieldKey="total_amount_excl_tax" onEdit={handleEdit} label="Total Excl. Tax" value={getValue('total_amount_excl_tax', data.total_amount_excl_tax !== null ? formatMoney(data.total_amount_excl_tax, data.currency) : null)} icon={CurrencyCircleDollar} isActive={activeAttribute === 'total_amount_excl_tax'} onClick={() => setActiveAttribute('total_amount_excl_tax')} />
                 <FieldCard editable={!alreadyConfirmed} fieldKey="tax_amount" onEdit={handleEdit} label="Tax Amount" value={getValue('tax_amount', data.tax_amount !== null ? formatMoney(data.tax_amount, data.currency) : null)} icon={CurrencyCircleDollar} isActive={activeAttribute === 'tax_amount'} onClick={() => setActiveAttribute('tax_amount')} />
                 <FieldCard editable={!alreadyConfirmed} fieldKey="total_amount_incl_tax" onEdit={handleEdit} label="Total Incl. Tax" value={getValue('total_amount_incl_tax', data.total_amount_incl_tax !== null ? formatMoney(data.total_amount_incl_tax, data.currency) : null)} icon={CurrencyCircleDollar} isActive={activeAttribute === 'total_amount_incl_tax'} onClick={() => setActiveAttribute('total_amount_incl_tax')} />
               </div>
            </div>

            {extraDataEntries.length > 0 && (
              <div className="mt-4 mb-4">
                 <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Extra Information</h3>
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
          <div className="fixed bottom-0 w-full md:w-[500px] lg:w-[600px] z-20">
            <div className="bg-[#FBBF24] rounded-t-[40px] p-8 pt-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[#1F2937] font-semibold text-[15px] leading-relaxed max-w-[70%]">
                  Vérifiez les informations extraites. Vous pouvez modifier les champs directement.
                </p>
                {editedCount > 0 && (
                  <div className="bg-[#1F2937] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {editedCount} modification{editedCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <button 
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full bg-[#1F2937] text-white rounded-[24px] py-5 text-lg font-bold shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
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

