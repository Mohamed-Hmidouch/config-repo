// See DESIGN_RULES.md before editing this file.
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInvoiceList } from '../hooks/useInvoiceList';
import { formatMoney, formatDate, truncateFilename } from '../utils/formatters';
import {
  FileText,
  Buildings,
  CalendarBlank,
  WarningCircle,
  CircleNotch,
  MagnifyingGlass,
  Plus,
  FileX,
  CaretLeft,
  CaretRight,
  ShieldCheck,
  Warning,
  Hash,
  Scan
} from '@phosphor-icons/react';

type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, loading, error } = useInvoiceList();
  const [searchQuery, setSearchQuery] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter((inv) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        (inv.invoice_number?.toLowerCase().includes(query)) ||
        (inv.supplier_name?.toLowerCase().includes(query)) ||
        (inv.filename?.toLowerCase().includes(query));
      
      let matchesConfidence = true;
      if (confidenceFilter === 'high') {
        matchesConfidence = inv.confidence_score >= 0.8;
      } else if (confidenceFilter === 'medium') {
        matchesConfidence = inv.confidence_score >= 0.6 && inv.confidence_score < 0.8;
      } else if (confidenceFilter === 'low') {
        matchesConfidence = inv.confidence_score < 0.6;
      }

      return matchesSearch && matchesConfidence;
    });
  }, [invoices, searchQuery, confidenceFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F1EC] flex flex-col items-center justify-center gap-4 font-sans">
        <CircleNotch size={40} weight="bold" className="animate-spin text-[#D97757]" />
        <p className="text-lg font-bold text-[#1F2937]">Loading Invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F1EC] flex flex-col items-center justify-center gap-4 font-sans text-center px-6">
        <WarningCircle size={64} weight="duotone" className="text-[#EF4444]" />
        <p className="text-xl font-bold text-[#1F2937]">{error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIdx, endIdx);

  return (
    <div className="min-h-screen bg-[#F3F1EC] font-sans flex flex-col pb-20">
      
      <div className="w-full px-6 md:px-12 lg:px-20 xl:px-24 mx-auto">
        
        {/* ── HEADER GREEN CARD ── */}
        <div className="bg-[#D97757] rounded-[40px] p-10 text-white relative overflow-hidden shadow-lg mt-12 mb-10 flex items-center justify-between">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Scan size={40} weight="duotone" />
              Invoice Viewer
            </h1>
            <p className="text-green-100 font-medium opacity-90">
              {invoices.length} extracted and saved invoices
            </p>
            <div className="flex gap-1 mt-6">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="bg-white text-[#D97757] rounded-[24px] px-8 py-4 font-bold shadow-md hover:bg-gray-50 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus size={20} weight="bold" />
              Upload New
            </button>
          </div>

          {/* Decorative Icon */}
          <div className="absolute top-1/2 -translate-y-1/2 right-1/4 w-32 h-32 border-4 border-white/20 rounded-full flex items-center justify-center pointer-events-none hidden lg:flex">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FileText size={40} weight="fill" className="text-white" />
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#FBBF24] rounded-full border-[3px] border-[#D97757]"></div>
          </div>
        </div>

        {/* ── FILTER TOGGLES ── */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          
          <div className="bg-white rounded-full p-2 shadow-sm flex items-center gap-2 border border-gray-100 w-full md:w-[400px]">
            <div className="pl-4 text-[#D97757]">
              <MagnifyingGlass size={20} weight="bold" />
            </div>
            <input
              type="text"
              placeholder="Search by supplier or number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent py-2 px-2 text-[15px] font-bold text-[#1F2937] outline-none placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {[
              { id: 'all', label: 'All Documents' },
              { id: 'high', label: 'Verified' },
              { id: 'medium', label: 'Needs Review' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setConfidenceFilter(filter.id as ConfidenceFilter);
                  setCurrentPage(1);
                }}
                className={[
                  'px-6 py-3 font-bold rounded-full transition-all whitespace-nowrap',
                  confidenceFilter === filter.id
                    ? 'bg-white border-2 border-[#D97757] text-[#D97757] shadow-sm'
                    : 'text-gray-500 hover:text-[#1F2937] border-2 border-transparent',
                ].join(' ')}
              >
                {filter.label}
              </button>
            ))}
          </div>

        </div>

        {/* ── EMPTY STATE ── */}
        {filteredInvoices.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-24 h-24 bg-white border border-gray-100 shadow-sm rounded-[32px] flex items-center justify-center mb-2">
              <FileX size={40} className="text-[#D97757]" weight="duotone" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937]">No documents found</h3>
            <p className="text-lg font-medium text-gray-500">Try adjusting your filters or upload a new invoice.</p>
          </div>
        )}

        {/* ── INVOICE GRID ── */}
        {filteredInvoices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {paginatedInvoices.map((inv) => (
              <Link
                key={inv.id}
                to={`/invoice/${inv.id}`}
                className="group bg-white rounded-[32px] p-6 shadow-sm border-2 border-transparent transition-all hover:border-[#D97757] hover:shadow-lg flex flex-col cursor-pointer"
              >
                {/* Header: Status + Number */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 bg-[#F3F1EC] rounded-[16px] flex items-center justify-center text-[#D97757] shrink-0">
                       <FileText size={28} weight="duotone" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-[#1F2937] block mb-0.5 truncate max-w-[150px]">
                        {inv.invoice_number || 'N/A'}
                      </span>
                      <span className="text-sm font-bold text-gray-400">
                        {truncateFilename(inv.filename)}
                      </span>
                    </div>
                  </div>
                  {inv.confidence_score >= 0.8 ? (
                    <div className="w-8 h-8 rounded-full bg-[#D97757] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck size={16} weight="bold" />
                    </div>
                  ) : inv.confidence_score >= 0.6 ? (
                    <div className="w-8 h-8 rounded-full bg-[#FBBF24] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Warning size={16} weight="bold" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <WarningCircle size={16} weight="bold" />
                    </div>
                  )}
                </div>

                {/* Details Block */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Buildings size={20} className="text-[#D97757]" weight="fill" />
                    <p className="text-[15px] font-bold text-[#1F2937] truncate">{inv.supplier_name || 'Unknown Supplier'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarBlank size={20} className="text-[#D97757]" weight="fill" />
                    <p className="text-[15px] font-bold text-gray-500">{inv.date ? formatDate(inv.date) : 'No date'}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-6" />

                {/* Footer: Amount */}
                <div className="flex items-end justify-between">
                  <span className="text-[15px] font-bold text-gray-400">Total</span>
                  <p className="text-2xl font-black text-[#1F2937] tabular-nums leading-none">
                    {inv.total_amount_incl_tax !== null
                      ? formatMoney(inv.total_amount_incl_tax, inv.currency)
                      : '—'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {filteredInvoices.length > 0 && (
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-full p-2 shadow-sm border border-gray-100">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1F2937] disabled:opacity-50 transition-colors"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <div className="px-6 text-lg font-bold text-[#1F2937]">
                {currentPage} <span className="text-gray-300 mx-1">/</span> {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1F2937] disabled:opacity-50 transition-colors"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
