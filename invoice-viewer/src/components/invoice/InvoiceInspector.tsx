// See DESIGN_RULES.md before editing this file.
import React, { useState } from 'react';
import type { InvoiceData } from '../../types/invoice';
import { PdfViewer } from './PdfViewer';
import { AttributePanel } from './AttributePanel';
import { WarningCircle } from '@phosphor-icons/react';

interface InvoiceInspectorProps {
  data: InvoiceData;
  fileUrl: string | null;
}

export const InvoiceInspector: React.FC<InvoiceInspectorProps> = ({ data, fileUrl }) => {
  const [activeAttribute, setActiveAttribute] = useState<string | null>(null);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);

  const ocrLines = data.ocr_data?.ocr_lines || [];
  const bboxes = ocrLines.map(line => line.bbox).filter(bbox => bbox && bbox.length === 4);

  const ocrImageSize = data.ocr_data?.image_size || null;

  const handleAttributeSelect = (key: string, indices: number[]) => {
    setActiveAttribute(key);
    // Filter out indices that might be out of bounds just in case
    const validIndices = indices.filter(idx => idx >= 0 && idx < bboxes.length);
    setHighlightedIndices(validIndices);
  };

  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 font-sans">
        <WarningCircle size={32} className="text-ink-muted" />
        <p className="text-sm text-ink">Le document source n'est pas disponible pour cette facture.</p>
        <p className="text-xs text-ink-muted mt-1">Veuillez revenir a la vue classique.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full font-sans">
      {/* PDF à gauche */}
      <div className="flex-1 min-w-0">
        <PdfViewer
          fileUrl={fileUrl}
          bboxes={bboxes}
          highlightedIndices={highlightedIndices}
          ocrImageSize={ocrImageSize}
        />
      </div>
      {/* Panel à droite */}
      <div className="w-[420px] shrink-0 bg-paper-surface border-l border-border-light overflow-y-auto">
        <AttributePanel
          data={data}
          activeAttribute={activeAttribute}
          onAttributeSelect={handleAttributeSelect}
        />
      </div>
    </div>
  );
};
