// See DESIGN_RULES.md before editing this file.
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
  const [error, setError] = useState<string | null>(null);
  // Canvas dimensions = the actual pixel size of the rendered PDF/image canvas
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let isActive = true;
    let loadingTask: any = null;
    let renderTask: any = null;

    // Clear the canvas immediately on URL change to prevent showing old invoices
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setError(null);

    if (!fileUrl) return;

    // Clean the URL only for checking the extension, DO NOT mutate the fetch URL
    // Otherwise trailing spaces in actual filenames will cause 404s!
    const isPdfFile = fileUrl.trim().toLowerCase().endsWith('.pdf');

    const loadPdf = async (url: string) => {
      try {
        loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (!isActive) return;

        const page = await pdf.getPage(1); // Only showing first page for now
        if (!isActive) return;

        const viewport = page.getViewport({ scale: 1.5 });
        if (!isActive) return;

        setCanvasSize({ width: viewport.width, height: viewport.height });

        const currentCanvas = canvasRef.current;
        if (!currentCanvas) return;
        const context = currentCanvas.getContext('2d');
        if (!context) return;

        currentCanvas.width = viewport.width;
        currentCanvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        renderTask = page.render(renderContext);
        await renderTask.promise;

      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') return;
        if (!isActive) return;
        console.warn('PDF load failed, falling back to image loader...', err);
        // Fallback in case the file is actually an image disguised with a .pdf extension
        loadImage(url);
      }
    };

    const loadImage = (url: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!isActive) return;
        setCanvasSize({ width: img.naturalWidth, height: img.naturalHeight });

        const currentCanvas = canvasRef.current;
        if (!currentCanvas) return;
        const context = currentCanvas.getContext('2d');
        if (!context) return;

        currentCanvas.width = img.naturalWidth;
        currentCanvas.height = img.naturalHeight;
        context.drawImage(img, 0, 0);
      };
      img.onerror = () => {
        if (!isActive) return;
        console.error('Error loading image fallback:', url);
        setError('Impossible de charger le document.');
      };
      img.src = url;
    };

    if (isPdfFile) {
      loadPdf(fileUrl);
    } else {
      loadImage(fileUrl);
    }

    return () => {
      isActive = false;
      if (renderTask) {
        try { renderTask.cancel(); } catch (e) {}
      }
      if (loadingTask) {
        try { loadingTask.destroy(); } catch (e) {}
      }
    };
  }, [fileUrl]);

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
      let ratioX = 1;
      let ratioY = 1;

      if (ocrImageSize && ocrImageSize.width > 0 && ocrImageSize.height > 0) {
        let ocrW = ocrImageSize.width;
        let ocrH = ocrImageSize.height;

        // Detect EXIF rotation / PDF internal rotation mismatch.
        // If the canvas aspect ratio is flipped compared to the reported OCR image size,
        // it means the OCR backend or PDF.js auto-rotated the image, so we must swap dimensions.
        const canvasIsLandscape = canvasSize.width > canvasSize.height;
        const ocrIsLandscape = ocrW > ocrH;

        if (canvasIsLandscape !== ocrIsLandscape) {
          ocrW = ocrImageSize.height;
          ocrH = ocrImageSize.width;
        }

        ratioX = canvasSize.width / ocrW;
        ratioY = canvasSize.height / ocrH;
      }

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

        // Use accent color (C0571A) with transparency for highlights
        ctx.fillStyle = 'rgba(192, 87, 26, 0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(192, 87, 26, 0.7)';
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
      className="w-full h-full overflow-auto relative bg-[#F5F7F6] p-4 flex flex-col items-center"
    >
      <div
        style={{
          width: canvasSize.width * scale,
          height: canvasSize.height * scale,
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: canvasSize.width,
            height: canvasSize.height,
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 shadow-lg rounded-xl"
          />
          <canvas
            ref={highlightCanvasRef}
            className="absolute top-0 left-0 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
