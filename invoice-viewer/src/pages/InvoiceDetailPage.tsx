import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PdfViewer } from '../components/invoice/PdfViewer';
import { useInvoice } from '../hooks/useInvoice';
import { formatDate, humanizeKey, formatMoney } from '../utils/formatters';
import { WarningCircle, CircleNotch, CaretLeft, CheckCircle, User, Buildings, MapPin, CurrencyCircleDollar, Hash, CalendarBlank, FileText } from '@phosphor-icons/react';

const API_BASE = 'http://localhost:8000';

const FieldCard = ({ label, value, icon: Icon, isActive, onClick }: { label: string, value: string | null, icon: any, isActive: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 bg-white border-2 rounded-[24px] p-4 mb-4 shadow-sm transition-all cursor-pointer ${isActive ? 'border-[#D97757]' : 'border-gray-100 hover:border-[#D97757]'}`}
  >
    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-[#D97757] text-white' : 'bg-[#F3F1EC] text-[#D97757]'}`}>
      <Icon size={24} weight={isActive ? 'fill' : 'duotone'} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-[#1F2937] truncate">{label}*</p>
      <p className="text-sm font-medium text-gray-500 truncate">{value || 'Not available'}</p>
    </div>
    <div className={`ml-auto w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-white shadow-sm transition-colors ${isActive ? 'bg-[#D97757]' : 'bg-gray-200'}`}>
      <CheckCircle size={14} weight="bold" />
    </div>
  </div>
);

export const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useInvoice(id);
  const [activeAttribute, setActiveAttribute] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);

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

  const fileUrl = data.source_filename ? `${API_BASE}/files/${data.source_filename}` : null;
  const extraDataEntries = Object.entries(data.extra_data || {});

  // Extract OCR data mapping correctly based on schema
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

  return (
    <div className="h-screen bg-[#F3F1EC] font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* ── LEFT COLUMN: PDF Viewer (Hidden on mobile) ── */}
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

      {/* ── RIGHT COLUMN: KYC Style Form ── */}
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
          <div className="w-12" /> {/* Spacer for centering */}
        </div>

        <div className="px-6">
          
          {/* Main Green Card */}
          <div className="bg-[#D97757] rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg mb-8">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Invoice Details</h2>
              <p className="text-green-100 font-medium opacity-90 max-w-[200px]">
                All legal details as extracted by OCR
              </p>
              <div className="flex gap-1 mt-4">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
                <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
              </div>
            </div>
            {/* Decorative Icon */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 w-20 h-20 border-4 border-white/20 rounded-full flex items-center justify-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FileText size={28} weight="fill" className="text-white" />
              </div>
              {/* Yellow dot */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#FBBF24] rounded-full border-2 border-[#D97757]"></div>
            </div>
          </div>



          {/* Fields List */}
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-x-4">
              <FieldCard label="Invoice Number" value={data.invoice_number} icon={Hash} isActive={activeAttribute === 'invoice_number'} onClick={() => setActiveAttribute('invoice_number')} />
              <FieldCard label="Date" value={data.date ? formatDate(data.date) : null} icon={CalendarBlank} isActive={activeAttribute === 'date'} onClick={() => setActiveAttribute('date')} />
              <FieldCard label="Supplier Name" value={data.supplier_name} icon={Buildings} isActive={activeAttribute === 'supplier_name'} onClick={() => setActiveAttribute('supplier_name')} />
              <FieldCard label="Supplier Tax ID" value={data.supplier_tax_id} icon={Hash} isActive={activeAttribute === 'supplier_tax_id'} onClick={() => setActiveAttribute('supplier_tax_id')} />
            </div>
            
            {(data.destinataire || data.importateur || data.port) && (
              <div className="mt-4 mb-4">
                 <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Logistics Details</h3>
                 <div className="grid grid-cols-2 gap-x-4">
                   {data.destinataire && <FieldCard label="Destinataire" value={data.destinataire} icon={User} isActive={activeAttribute === 'destinataire'} onClick={() => setActiveAttribute('destinataire')} />}
                   {data.importateur && <FieldCard label="Importateur" value={data.importateur} icon={User} isActive={activeAttribute === 'importateur'} onClick={() => setActiveAttribute('importateur')} />}
                   {data.port && <FieldCard label="Address / Port" value={data.port} icon={MapPin} isActive={activeAttribute === 'port'} onClick={() => setActiveAttribute('port')} />}
                 </div>
              </div>
            )}

            <div className="mt-4 mb-4">
               <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Financials</h3>
               <div className="grid grid-cols-2 gap-x-4">
                 <FieldCard label="Total Excl. Tax" value={data.total_amount_excl_tax !== null ? formatMoney(data.total_amount_excl_tax, data.currency) : null} icon={CurrencyCircleDollar} isActive={activeAttribute === 'total_amount_excl_tax'} onClick={() => setActiveAttribute('total_amount_excl_tax')} />
                 <FieldCard label="Tax Amount" value={data.tax_amount !== null ? formatMoney(data.tax_amount, data.currency) : null} icon={CurrencyCircleDollar} isActive={activeAttribute === 'tax_amount'} onClick={() => setActiveAttribute('tax_amount')} />
                 <FieldCard label="Total Incl. Tax" value={data.total_amount_incl_tax !== null ? formatMoney(data.total_amount_incl_tax, data.currency) : null} icon={CurrencyCircleDollar} isActive={activeAttribute === 'total_amount_incl_tax'} onClick={() => setActiveAttribute('total_amount_incl_tax')} />
               </div>
            </div>

            {extraDataEntries.length > 0 && (
              <div className="mt-4 mb-4">
                 <h3 className="text-lg font-bold text-[#1F2937] px-2 mb-4">Extra Information</h3>
                 <div className="grid grid-cols-2 gap-x-4">
                   {extraDataEntries.map(([key, value]) => (
                     <FieldCard key={key} label={humanizeKey(key)} value={String(value)} icon={FileText} isActive={activeAttribute === key} onClick={() => setActiveAttribute(key)} />
                   ))}
                 </div>
              </div>
            )}
            
          </div>
        </div>

        {/* ── Yellow Bottom Card ── */}
        {showBanner && (
          <div className="fixed bottom-0 w-full md:w-[500px] lg:w-[600px] z-20">
            <div className="bg-[#FBBF24] rounded-t-[40px] p-8 pt-10 shadow-2xl">
              <p className="text-[#1F2937] font-semibold text-[15px] leading-relaxed mb-6">
                Ces informations ont été extraites de votre facture, veuillez les lire attentivement et les vérifier avec le document source. Vous pouvez télécharger le JSON ou valider.
              </p>
              <button 
                onClick={() => setShowBanner(false)}
                className="w-full bg-[#1F2937] text-white rounded-[24px] py-5 text-lg font-bold shadow-lg hover:bg-black transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
