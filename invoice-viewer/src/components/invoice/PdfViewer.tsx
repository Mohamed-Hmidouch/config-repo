import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Configurer le worker pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
  bboxes: number[][][]; // Array of [ [x,y], [x,y], [x,y], [x,y] ]
  highlightedIndices: number[]; // Indices of bboxes to highlight
  ocrImageSize: { width: number; height: number } | null; // Original OCR image dimensions
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl, bboxes, highlightedIndices, ocrImageSize }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  // Canvas dimensions = the actual pixel size of the rendered PDF/image canvas
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const isPdfFile = fileUrl.toLowerCase().endsWith('.pdf');
    
    if (isPdfFile) {
      loadPdf();
    } else {
      loadImage();
    }
  }, [fileUrl]);

  const loadPdf = async () => {
    try {
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); // Only showing first page for now

      const viewport = page.getViewport({ scale: 1.5 });
      setCanvasSize({ width: viewport.width, height: viewport.height });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
      
    } catch (err) {
      console.error('Error loading PDF:', err);
    }
  };

  const loadImage = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setCanvasSize({ width: img.naturalWidth, height: img.naturalHeight });
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      context.drawImage(img, 0, 0);
    };
    img.src = fileUrl;
  };

  // Resize handler to match container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasSize.width > 0) {
        const containerWidth = containerRef.current.clientWidth;
        // Padding
        const availableWidth = containerWidth - 32; 
        const newScale = availableWidth / canvasSize.width;
        setScale(newScale > 0 ? newScale : 1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasSize]);

  // Draw highlights with coordinate mapping
  useEffect(() => {
    const hCanvas = highlightCanvasRef.current;
    if (!hCanvas || canvasSize.width === 0) return;
    const ctx = hCanvas.getContext('2d');
    if (!ctx) return;

    // The highlight canvas matches the rendered canvas dimensions
    hCanvas.width = canvasSize.width;
    hCanvas.height = canvasSize.height;
    ctx.clearRect(0, 0, hCanvas.width, hCanvas.height);

    if (highlightedIndices.length > 0) {
      // ── Coordinate mapping ratio ──────────────────────────────────────
      // OCR bbox coords are in the original image's pixel space.
      // We need to convert them to the rendered canvas pixel space.
      //
      // scaleX = canvasRenderedWidth / ocrOriginalImageWidth
      // scaleY = canvasRenderedHeight / ocrOriginalImageHeight
      //
      // If we don't have ocrImageSize, fall back to 1:1 (no scaling).
      const ratioX = ocrImageSize ? canvasSize.width / ocrImageSize.width : 1;
      const ratioY = ocrImageSize ? canvasSize.height / ocrImageSize.height : 1;

      console.log('[PdfViewer] Coordinate mapping:', {
        ocrImageSize,
        canvasSize,
        ratioX: ratioX.toFixed(4),
        ratioY: ratioY.toFixed(4),
        highlightCount: highlightedIndices.length,
      });

      highlightedIndices.forEach(idx => {
        const bbox = bboxes[idx];
        if (!bbox || bbox.length < 4) return;
        
        // Map each point from OCR space → canvas space
        const mappedBbox = bbox.map(([x, y]) => [x * ratioX, y * ratioY]);

        ctx.beginPath();
        ctx.moveTo(mappedBbox[0][0], mappedBbox[0][1]);
        ctx.lineTo(mappedBbox[1][0], mappedBbox[1][1]);
        ctx.lineTo(mappedBbox[2][0], mappedBbox[2][1]);
        ctx.lineTo(mappedBbox[3][0], mappedBbox[3][1]);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'; // Emerald 500 with opacity
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Scroll to the first highlighted bbox (use mapped coords)
      const firstBbox = bboxes[highlightedIndices[0]];
      if (firstBbox && firstBbox.length > 0 && containerRef.current) {
        const ratioForScroll = ocrImageSize ? canvasSize.height / ocrImageSize.height : 1;
        const y = firstBbox[0][1] * ratioForScroll * scale;
        // Scroll container to position
        containerRef.current.scrollTo({
          top: Math.max(0, y - 100),
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndices, bboxes, canvasSize, scale, ocrImageSize]);

  return (
    <div 
      ref={containerRef} 
      className="pdf-viewer-container"
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'auto',
        position: 'relative',
        backgroundColor: '#18181b', // zinc-900
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div 
        className="canvas-wrapper" 
        style={{
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      >
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }} 
        />
        <canvas 
          ref={highlightCanvasRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0,
            pointerEvents: 'none'
          }} 
        />
      </div>
    </div>
  );
};
