import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadSimple,
  FilePdf,
  Image,
  CheckCircle,
  ArrowRight,
  Plus,
  CloudArrowUp,
  CircleNotch,
  Scan,
  Brain,
  Database,
  WarningCircle,
  ArrowCounterClockwise,
  X,
  FileText,
  CaretLeft,
} from '@phosphor-icons/react';

const API_BASE = 'http://localhost:8000';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/bmp',
  'image/tiff',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'];

type UploadState = 'idle' | 'selected' | 'uploading' | 'processing' | 'success' | 'error';

interface UploadResult {
  id: number;
  invoice_number: string | null;
  supplier_name: string | null;
  total_amount_incl_tax: number | null;
  currency: string | null;
}

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Format non supporté. Acceptés : ${ALLOWED_EXTENSIONS.join(', ')}`);
      setState('error');
      return;
    }
    setFile(f);
    setError('');
    setState('selected');

    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;

    setState('uploading');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    setTimeout(() => {
      setState((prev) => (prev === 'uploading' ? 'processing' : prev));
    }, 800);

    try {
      const response = await fetch(`${API_BASE}/invoices/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || `Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      setResult({
        id: data.id,
        invoice_number: data.invoice_number,
        supplier_name: data.supplier_name,
        total_amount_incl_tax: data.total_amount_incl_tax,
        currency: data.currency,
      });
      setState('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      setState('error');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setState('idle');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isProcessing = state === 'uploading' || state === 'processing';

  // ── Success state ──
  if (state === 'success' && result) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[600px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-[#0EA5E9] p-10 text-center relative text-white">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-[#0EA5E9]">
              <CheckCircle size={40} weight="light" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Extraction Réussie</h2>
            <p className="text-sky-100 font-medium">Votre facture a été traitée et sauvegardée de manière sécurisée.</p>
          </div>

          <div className="p-10 space-y-4">
            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-gray-100 rounded-lg p-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                <FileText size={24} weight="light" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1F2937]">Numéro de Facture</p>
                <p className="text-sm font-medium text-gray-500">{result.invoice_number || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-gray-100 rounded-lg p-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                <FileText size={24} weight="light" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1F2937]">Fournisseur</p>
                <p className="text-sm font-medium text-gray-500">{result.supplier_name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-gray-100 rounded-lg p-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[#0EA5E9] shrink-0">
                <FileText size={24} weight="light" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1F2937]">Montant Total</p>
                <p className="text-sm font-medium text-gray-500">
                  {result.total_amount_incl_tax != null
                    ? `${result.total_amount_incl_tax.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${result.currency || ''}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4 pt-4 border-t border-dashed border-gray-200">
              <button
                onClick={() => navigate(`/invoice/${result.id}`)}
                className="flex-1 bg-[#0EA5E9] text-white rounded-full py-4 font-bold shadow-md hover:bg-[#0284C7] transition-colors flex items-center justify-center gap-2"
              >
                Voir les Détails <ArrowRight size={18} weight="bold" />
              </button>
              <button
                onClick={reset}
                className="w-14 h-14 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus size={24} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Processing state ──
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[500px] bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <CircleNotch size={48} weight="bold" className="animate-spin text-[#0EA5E9]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Brain size={24} className="text-[#0EA5E9]" weight="light" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">
            {state === 'uploading' ? 'Téléchargement...' : 'Extraction des données...'}
          </h2>
          <p className="text-gray-500 font-medium mb-10">Veuillez patienter pendant que notre IA analyse votre document.</p>

          <div className="space-y-6 text-left">
            {[
              { label: 'Transfert Sécurisé', done: state === 'processing', icon: <CloudArrowUp size={20} weight="bold" /> },
              { label: 'Analyse du Document', done: false, active: state === 'processing', icon: <Scan size={20} weight="bold" /> },
              { label: 'OCR & Classification', done: false, icon: <Brain size={20} weight="bold" /> },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#FFFFFF] p-4 rounded-[20px] border border-transparent transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-[#0EA5E9] text-white' : step.active ? 'bg-white text-[#1F2937] border-2 border-[#0EA5E9]' : 'bg-white text-gray-400'
                  }`}>
                  {step.done ? <CheckCircle size={20} weight="bold" /> : step.icon}
                </div>
                <span className={`font-bold ${step.done ? 'text-[#0EA5E9]' : step.active ? 'text-[#1F2937]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-sky-50 font-sans flex flex-col items-center pb-20 relative overflow-hidden isolate">
      {/* ── IMMERSIVE PAGE BACKGROUND ── */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-sky-200 rounded-full blur-[150px] opacity-60 mix-blend-multiply pointer-events-none -z-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-sky-300 rounded-full blur-[120px] opacity-40 mix-blend-multiply pointer-events-none -z-10 translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-[1000px] px-6 relative z-10">

        {/* ── HEADER BAR ── */}
        <div className="pt-12 pb-6 flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-[#1F2937] hover:bg-gray-50 transition-all active:scale-95"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <div className="bg-white rounded-full px-6 py-2 shadow-sm border border-gray-100">
            <span className="font-bold text-[#0EA5E9] text-sm tracking-widest uppercase">Téléchargement Intelligent</span>
          </div>
        </div>

        <div className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-sky-50 to-white border border-sky-100 isolate mt-4 text-center p-14">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-300 rounded-full blur-[80px] opacity-40 mix-blend-multiply -z-10 translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-400 rounded-full blur-[60px] opacity-20 -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-5xl font-galatia text-slate-800 tracking-tight mb-4">Nouveau Document</h1>
            <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
              Téléchargez une facture (PDF ou Image) pour l'extraction automatique par OCR.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── DROPZONE ── */}
          <div className="col-span-1">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative cursor-pointer rounded-2xl border-4 border-dashed p-12 text-center transition-all duration-300 min-h-[400px] flex flex-col items-center justify-center backdrop-blur-xl ${dragOver
                  ? 'border-[#0EA5E9] bg-[#0EA5E9]/10'
                  : file
                    ? 'border-white/50 bg-white/60'
                    : 'border-white/60 bg-white/40 hover:border-sky-300/60 hover:bg-white/60'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChange={onFileSelect}
                className="hidden"
              />

              <div className={`w-24 h-24 rounded-lg flex items-center justify-center mb-6 transition-colors ${file ? 'bg-[#F8FAFC] text-[#0EA5E9]' : 'bg-gray-100 text-gray-400 group-hover:bg-[#F8FAFC] group-hover:text-[#0EA5E9]'}`}>
                {file ? (
                  file.type === 'application/pdf' ? (
                    <FilePdf size={48} weight="light" />
                  ) : (
                    <Image size={48} weight="light" />
                  )
                ) : (
                  <UploadSimple size={48} weight="light" />
                )}
              </div>

              {file ? (
                <>
                  <p className="text-xl font-bold text-[#1F2937] mb-2 px-4 truncate max-w-full">{file.name}</p>
                  <p className="text-sm font-medium text-gray-500">
                    {(file.size / 1024).toFixed(0)} KB - Cliquez pour remplacer
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-[#1F2937] mb-2">
                    Glissez votre facture ici
                  </p>
                  <p className="text-sm font-medium text-gray-500">
                    ou cliquez pour parcourir
                  </p>
                </>
              )}

              {preview && (
                <div className="absolute inset-0 p-4 w-full h-full pointer-events-none opacity-20">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              )}
            </div>

            {state === 'error' && error && (
              <div className="mt-6 flex items-start gap-4 rounded-lg bg-red-50 p-6">
                <WarningCircle size={24} weight="light" className="text-red-500 shrink-0" />
                <p className="text-sm font-bold text-red-700 leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          {/* ── ACTION COLUMN ── */}
          <div className="col-span-1 flex flex-col justify-center">

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-10 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Prêt au traitement</h3>
              <p className="text-slate-500 font-medium mb-8">
                Notre moteur prend en charge les formats PDF, JPG, PNG, TIFF et WebP. Assurez-vous que le document est lisible.
              </p>

              {file && state !== 'error' ? (
                <button
                  onClick={handleUpload}
                  className="w-full bg-[#0EA5E9] text-white rounded-full py-5 text-lg font-bold shadow-lg hover:bg-[#0284C7] transition-colors flex items-center justify-center gap-3"
                >
                  <CloudArrowUp size={24} weight="bold" />
                  Traiter le Document
                </button>
              ) : state === 'error' && file ? (
                <div className="w-full flex gap-4">
                  <button
                    onClick={handleUpload}
                    className="flex-1 bg-[#0EA5E9] text-white rounded-full py-4 font-bold shadow-md hover:bg-[#0284C7] transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowCounterClockwise size={20} /> Réessayer
                  </button>
                  <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 rounded-full bg-gray-100 px-6 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <X size={20} /> Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-[#0EA5E9] text-white rounded-full py-5 text-lg font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                >
                  <UploadSimple size={24} weight="bold" />
                  Sélectionner un fichier
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
