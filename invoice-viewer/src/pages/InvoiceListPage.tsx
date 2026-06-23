import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useInvoiceList } from '../hooks/useInvoiceList';
import { useAuth } from '../context/AuthContext';
import { formatMoney, formatDate, truncateFilename } from '../utils/formatters';
import type { RootState } from '../store';
import { setDateFrom, setDateTo, setMinAmount, setMaxAmount, resetFilters } from '../store/filterSlice';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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
  Scan,
  DownloadSimple,
  DotsThree,
  Faders,
  SignOut
} from '@phosphor-icons/react';

type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';

// Helper to get initials
const getInitials = (name: string) => {
  if (!name || name === 'Unknown Supplier') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-sky-100 text-sky-700',
    'bg-orange-100 text-orange-700'
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { invoices, loading, error } = useInvoiceList();
  const [searchQuery, setSearchQuery] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal and Filter states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { dateFrom, dateTo, minAmount, maxAmount } = useSelector((state: RootState) => state.filters);

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

      let matchesDate = true;
      if (dateFrom) matchesDate = matchesDate && (!inv.date || inv.date >= dateFrom);
      if (dateTo) matchesDate = matchesDate && (!inv.date || inv.date <= dateTo);

      let matchesAmount = true;
      if (minAmount) matchesAmount = matchesAmount && (inv.total_amount_incl_tax !== null && inv.total_amount_incl_tax >= Number(minAmount));
      if (maxAmount) matchesAmount = matchesAmount && (inv.total_amount_incl_tax !== null && inv.total_amount_incl_tax <= Number(maxAmount));

      return matchesSearch && matchesConfidence && matchesDate && matchesAmount;
    });
  }, [invoices, searchQuery, confidenceFilter, dateFrom, dateTo, minAmount, maxAmount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 font-sans">
        <CircleNotch size={40} weight="light" className="animate-spin text-[#0EA5E9]" />
        <p className="text-lg font-bold text-[#1F2937]">Chargement des factures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 font-sans text-center px-6">
        <WarningCircle size={64} weight="light" className="text-[#EF4444]" />
        <p className="text-xl font-bold text-[#1F2937]">{error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIdx, endIdx);

  // KPIs
  const needsReviewCount = invoices.filter(inv => inv.confidence_score >= 0.6 && inv.confidence_score < 0.8).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col pb-20">

      <div className="w-full px-6 md:px-8">

        {/* ── HEADER ── */}
        <div className="mt-12 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-[56px] font-gladiesky tracking-tight text-[#0EA5E9] flex items-center gap-4">
              Invoice Viewer
              <span className="bg-slate-200 text-slate-600 rounded-md px-2 py-0.5 text-[11px] font-bold border border-slate-300 tracking-normal uppercase font-sans mt-2">Prod</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Tableau de bord d'extraction et de validation OCR
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/upload')}
              className="bg-[#0EA5E9] text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-[#0284C7] flex items-center justify-center flex-1 md:flex-none gap-2 transition-transform active:scale-95 shadow-sm"
            >
              <Plus size={18} weight="bold" />
              Importer
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
            >
              <SignOut size={18} weight="bold" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* ── B2B COMMAND CENTER (LAYOUT HRBANA) ── */}
        <div className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-sky-50 to-white border border-sky-100 isolate mt-8">
          
          {/* Abstract Background Elements for depth */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-300 rounded-full blur-[90px] opacity-60 mix-blend-multiply -z-10 translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-400 rounded-full blur-[60px] opacity-40 -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
          
          {/* Grid Layout inside the Command Center */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-sky-100">
            
            {/* Left Panel: The Main KPI (Accuracy/Health) */}
            <div className="lg:col-span-5 bg-white/60 backdrop-blur-xl p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-sm">
                    <Scan size={20} className="text-[#0EA5E9]" />
                  </div>
                  <h2 className="text-sky-800 font-bold tracking-widest uppercase text-xs">Intelligence Artificielle</h2>
                </div>
                
                <div className="flex items-end gap-3 mb-3">
                  <p className="text-7xl xl:text-8xl font-galatia text-slate-800 tracking-tighter leading-none">
                    {invoices.length > 0 ? Math.round((invoices.reduce((acc, inv) => acc + inv.confidence_score, 0) / invoices.length) * 100) : 0}
                  </p>
                  <span className="text-4xl xl:text-5xl text-slate-400 font-galatia mb-1">%</span>
                </div>
                <p className="text-slate-500 font-semibold text-sm tracking-wide">Précision d'extraction globale</p>
              </div>

              {/* Decorative SVG Graph in the background */}
              <div className="absolute bottom-0 left-0 w-full h-40 opacity-80 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full text-sky-400 drop-shadow-[0_10px_10px_rgba(14,165,233,0.3)]">
                  <path d="M0,100 L0,60 Q100,10 200,50 T400,20 L400,100 Z" fill="url(#grad)" opacity="0.6"/>
                  <path d="M0,100 L0,70 Q100,30 200,60 T400,40 L400,100 Z" fill="currentColor" opacity="0.4"/>
                  <path d="M0,70 Q100,30 200,60 T400,40" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Right Panel: The Data Points */}
            <div className="lg:col-span-7 bg-white/60 backdrop-blur-xl p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Volume Opérationnel</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
                  
                  {/* Metric 1 */}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-1 h-12 bg-sky-200 rounded-full"></div>
                    <p className="text-5xl font-galatia text-slate-800 tracking-tight mb-2">{invoices.length}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents<br/>traités</p>
                  </div>

                  {/* Metric 2 */}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-1 h-12 bg-emerald-400 rounded-full"></div>
                    <p className="text-5xl font-galatia text-slate-800 tracking-tight mb-2">{invoices.filter(inv => inv.confidence_score >= 0.8).length}</p>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Extraction<br/>validée</p>
                  </div>

                  {/* Metric 3 */}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-1 h-12 bg-amber-400 rounded-full"></div>
                    <div className="flex items-start gap-3">
                      <p className="text-5xl font-galatia text-slate-800 tracking-tight mb-2">{needsReviewCount}</p>
                      {needsReviewCount > 0 && (
                        <span className="flex h-2.5 w-2.5 relative mt-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Exceptions<br/>à réviser</p>
                  </div>

                </div>
              </div>

              {/* STP Progress Bar */}
              <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                  <span>Taux d'automatisation (STP)</span>
                  <span className="text-slate-800 font-galatia text-sm">{invoices.length > 0 ? Math.round((invoices.filter(inv => inv.confidence_score >= 0.8).length / invoices.length) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-[#0EA5E9] rounded-full relative" 
                    style={{ width: `${invoices.length > 0 ? (invoices.filter(inv => inv.confidence_score >= 0.8).length / invoices.length) * 100 : 0}%` }}
                  >
                     {/* Shine effect on progress bar */}
                     <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-b from-white/40 to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── FILTER TOGGLES ── */}
        <div className="flex flex-col xl:flex-row items-center justify-between mb-6 gap-4">

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto h-auto md:h-10">
            {/* Search */}
            <div className="bg-white rounded-lg h-10 px-3 flex items-center gap-2 border border-slate-200 w-full md:w-[320px] shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
              <MagnifyingGlass size={18} weight="light" className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher par fournisseur ou numéro..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 bg-transparent text-[14px] font-medium text-slate-800 outline-none placeholder-slate-400 h-full"
              />
            </div>

            {/* Segmented Control Filters */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 w-full md:w-auto overflow-x-auto h-10">
              {[
                { id: 'all', label: 'Tout' },
                { id: 'high', label: 'Validé' },
                { id: 'medium', label: 'À réviser' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setConfidenceFilter(filter.id as ConfidenceFilter);
                    setCurrentPage(1);
                  }}
                  className={[
                    'px-4 h-full text-sm font-semibold rounded-md transition-all whitespace-nowrap flex items-center justify-center',
                    confidenceFilter === filter.id
                      ? 'bg-white text-slate-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]'
                      : 'text-slate-500 hover:text-slate-700',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto h-10">
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 h-full px-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]"
            >
              <CalendarBlank size={16} weight="bold" /> Filtrer
            </button>
            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 h-full px-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
              <DownloadSimple size={16} weight="bold" /> Exporter
            </button>
          </div>
        </div>

        {/* ── EMPTY STATE ── */}
        {filteredInvoices.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-24 h-24 bg-white border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] rounded-xl flex items-center justify-center mb-2">
              <FileX size={40} className="text-[#0EA5E9]" weight="light" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937]">Aucun document trouvé</h3>
            <p className="text-lg font-medium text-gray-500">Essayez d'ajuster vos filtres ou d'importer une nouvelle facture.</p>
          </div>
        )}

        {/* ── INVOICE TABLE ── */}
        {filteredInvoices.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facture</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fournisseur</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => navigate(`/invoice/${inv.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-slate-400 group-hover:text-[#0EA5E9] transition-colors" weight="light" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{inv.invoice_number || 'N/A'}</p>
                            <p className="text-xs font-medium text-slate-400 truncate max-w-[150px]">{truncateFilename(inv.filename)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(inv.supplier_name || '')}`}>
                            {getInitials(inv.supplier_name || '')}
                          </div>
                          <p className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">{inv.supplier_name || 'Unknown Supplier'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-500">{inv.date ? formatDate(inv.date) : '—'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-slate-800 tabular-nums">
                          {inv.total_amount_incl_tax !== null ? formatMoney(inv.total_amount_incl_tax, inv.currency) : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {inv.confidence_score >= 0.8 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                            <span className="text-xs font-semibold text-slate-600">Validé</span>
                          </div>
                        ) : inv.confidence_score >= 0.6 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span className="text-xs font-semibold text-slate-600">À réviser</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                            <span className="text-xs font-semibold text-slate-600">Brouillon</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm text-slate-400 hover:text-slate-700 transition-all">
                          <DotsThree size={20} weight="bold" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {filteredInvoices.length > 0 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] border border-[#E2E8F0]">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <div className="px-4 text-xs font-bold text-slate-600">
                {currentPage} <span className="text-slate-300 mx-1">/</span> {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FILTER MODAL (SHADCN) ── */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0EA5E9]">
              <Faders size={24} weight="bold" />
              Filtres Avancés
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Période (Date de facture)</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <DatePicker 
                    date={dateFrom ? new Date(dateFrom) : undefined} 
                    setDate={(d) => dispatch(setDateFrom(d ? format(d, 'yyyy-MM-dd') : ''))} 
                    placeholder="Début"
                  />
                </div>
                <span className="text-slate-400 font-medium">à</span>
                <div className="flex-1">
                  <DatePicker 
                    date={dateTo ? new Date(dateTo) : undefined} 
                    setDate={(d) => dispatch(setDateTo(d ? format(d, 'yyyy-MM-dd') : ''))} 
                    placeholder="Fin"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Montant TTC</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input 
                    type="number" 
                    placeholder="Min €" 
                    value={minAmount} 
                    onChange={(e) => dispatch(setMinAmount(e.target.value))} 
                  />
                </div>
                <span className="text-slate-400 font-medium">-</span>
                <div className="flex-1">
                  <Input 
                    type="number" 
                    placeholder="Max €" 
                    value={maxAmount} 
                    onChange={(e) => dispatch(setMaxAmount(e.target.value))} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between sm:justify-between w-full mt-4">
            <Button 
              variant="ghost" 
              onClick={() => dispatch(resetFilters())}
              className="text-slate-500 font-bold"
            >
              Réinitialiser
            </Button>
            <Button 
              onClick={() => setIsFilterModalOpen(false)} 
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold"
            >
              Appliquer les filtres
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
