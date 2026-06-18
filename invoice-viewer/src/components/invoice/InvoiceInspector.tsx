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
      <div className="inspector-error">
        <WarningCircle size={32} className="text-zinc-500 mb-4" />
        <p>Le document source n'est pas disponible pour cette facture.</p>
        <p className="text-sm text-zinc-500 mt-2">Veuillez revenir a la vue classique.</p>
      </div>
    );
  }

  return (
    <div className="invoice-inspector">
      <div className="invoice-inspector__left">
        <PdfViewer 
          fileUrl={fileUrl} 
          bboxes={bboxes} 
          highlightedIndices={highlightedIndices}
          ocrImageSize={ocrImageSize}
        />
      </div>
      <div className="invoice-inspector__right">
        <AttributePanel 
          data={data} 
          activeAttribute={activeAttribute} 
          onAttributeSelect={handleAttributeSelect} 
        />
      </div>
    </div>
  );
};
