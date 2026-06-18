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
      setError(`Format non supporte. Formats acceptes : ${ALLOWED_EXTENSIONS.join(', ')}`);
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

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col font-sans">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-[1.5rem] font-bold tracking-[-0.025em] text-zinc-50">
          Nouvelle facture
        </h1>
        <p className="mt-1 text-[0.82rem] text-zinc-500">
          Importez un PDF ou une image pour extraction automatique
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start gap-8">

        {/* Success */}
        {state === 'success' && result && (
          <div className="w-full max-w-lg">
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-8 text-center">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <CheckCircle size={28} weight="duotone" className="text-emerald-400" />
              </div>

              <h2 className="text-center text-lg font-semibold text-zinc-100">
                Facture extraite avec succes
              </h2>
              <p className="mt-1 text-center text-[0.82rem] text-zinc-500">
                Les donnees ont ete persistees en base de donnees
              </p>

              <div className="mt-6 space-y-3 rounded-xl bg-zinc-900/60 p-5 ring-1 ring-zinc-800">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Numero</span>
                  <span className="font-medium text-zinc-200">{result.invoice_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Fournisseur</span>
                  <span className="font-medium text-zinc-200">{result.supplier_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Montant TTC</span>
                  <span className="font-semibold text-emerald-400 tabular-nums">
                    {result.total_amount_incl_tax != null
                      ? `${result.total_amount_incl_tax.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${result.currency || ''}`
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate(`/invoice/${result.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.98]"
                >
                  Voir le detail
                  <ArrowRight size={16} weight="bold" />
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-300 ring-1 ring-zinc-700 transition-all hover:bg-zinc-700 active:scale-[0.98]"
                >
                  <Plus size={16} />
                  Nouvelle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload zone */}
        {state !== 'success' && !isProcessing && (
          <div className="w-full max-w-lg">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                group relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center
                transition-all duration-200
                ${dragOver
                  ? 'border-emerald-400/60 bg-emerald-500/[0.06] scale-[1.01]'
                  : file
                    ? 'border-emerald-500/25 bg-emerald-500/[0.03]'
                    : 'border-zinc-700/60 bg-zinc-900/30 hover:border-zinc-600/60 hover:bg-zinc-900/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChange={onFileSelect}
                className="hidden"
              />

              <div className={`
                mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors
                ${file ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-400'}
              `}>
                {file ? (
                  file.type === 'application/pdf' ? (
                    <FilePdf size={24} weight="duotone" />
                  ) : (
                    <Image size={24} weight="duotone" />
                  )
                ) : (
                  <UploadSimple size={24} weight="duotone" />
                )}
              </div>

              {file ? (
                <>
                  <p className="text-sm font-semibold text-zinc-200">{file.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(0)} Ko - Cliquez pour changer
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-300">
                    Glissez votre facture ici
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    ou cliquez pour parcourir - PDF, JPG, PNG, TIFF, WebP
                  </p>
                </>
              )}

              {preview && (
                <div className="mt-6 overflow-hidden rounded-xl ring-1 ring-zinc-800">
                  <img
                    src={preview}
                    alt="Apercu facture"
                    className="mx-auto max-h-44 object-contain"
                  />
                </div>
              )}
            </div>

            {state === 'error' && error && (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-500/[0.06] px-4 py-3 ring-1 ring-red-500/15">
                <WarningCircle size={18} weight="duotone" className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {file && state !== 'error' && (
              <button
                onClick={handleUpload}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition-all hover:bg-emerald-500 active:scale-[0.98]"
              >
                <CloudArrowUp size={18} weight="bold" />
                Lancer le traitement
              </button>
            )}

            {state === 'error' && file && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleUpload}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.98]"
                >
                  <ArrowCounterClockwise size={16} />
                  Reessayer
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-400 ring-1 ring-zinc-700 transition-all hover:bg-zinc-700 active:scale-[0.98]"
                >
                  <X size={16} />
                  Annuler
                </button>
              </div>
            )}
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="w-full max-w-lg">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
              <div className="mb-6 inline-flex">
                <CircleNotch size={40} weight="bold" className="animate-spin text-emerald-400" />
              </div>

              <p className="text-sm font-semibold text-zinc-200">
                {state === 'uploading' ? 'Envoi du fichier...' : 'Traitement en cours...'}
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                {state === 'uploading'
                  ? 'Transfert vers le serveur'
                  : 'Analyse et extraction en cours...'}
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { label: 'Transfert securise', done: state === 'processing', icon: <CloudArrowUp size={14} weight="bold" /> },
                  { label: 'Numerisation du document', done: false, active: state === 'processing', icon: <Scan size={14} weight="bold" /> },
                  { label: 'Analyse et classification', done: false, icon: <Brain size={14} weight="bold" /> },
                  { label: 'Finalisation du dossier', done: false, icon: <Database size={14} weight="bold" /> },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-left">
                    <div className={`
                      flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
                      ${step.done
                        ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20'
                        : step.active
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/15 animate-pulse'
                          : 'bg-zinc-800 text-zinc-600 ring-1 ring-zinc-700'
                      }
                    `}>
                      {step.done ? (
                        <CheckCircle size={14} weight="fill" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className={`text-sm ${step.done ? 'text-emerald-400' : step.active ? 'text-zinc-200' : 'text-zinc-600'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-lg bg-zinc-950/60 px-4 py-2.5 text-xs text-zinc-600 ring-1 ring-zinc-800">
                {file?.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
