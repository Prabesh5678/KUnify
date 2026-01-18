

import React, { useState, useEffect } from "react";
import {
  Download,
  ZoomIn,
  ZoomOut,
  Printer,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PDFViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  const pdfUrl = searchParams.get("url");
  const fileName = searchParams.get("title") || "Proposal.pdf";

  // Use Google Docs Viewer as a fallback for reliable PDF viewing
  const getViewablePdfUrl = (url) => {
    if (!url) return null;

    // Option 1: Use Google Docs Viewer (most reliable)
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    // Option 2: Direct URL with Cloudinary flag
    // if (url.includes('cloudinary.com')) {
    //   const baseUrl = url.split('/upload/')[0];
    //   const path = url.split('/upload/')[1];
    //   return `${baseUrl}/upload/fl_attachment/${path}`;
    // }
    // return url;
  };

  const viewableUrl = getViewablePdfUrl(pdfUrl);

  useEffect(() => {
    if (!pdfUrl) {
      navigate(-1);
    }
  }, [pdfUrl, navigate]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName + ".pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to direct download
      window.open(pdfUrl, "_blank");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    const printWindow = window.open(viewableUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No PDF URL provided</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition flex items-center gap-2"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 truncate max-w-md">
            {decodeURIComponent(fileName)}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
            title="Zoom out"
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium px-3 min-w-[60px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
            title="Zoom in"
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded transition"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-100 rounded transition"
            title="Print"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-20">
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-800 p-4">
        <div className="max-w-5xl mx-auto">
          <iframe
            src={viewableUrl}
            className="w-full bg-white shadow-2xl rounded-lg"
            style={{
              height: "calc(100vh - 100px)",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
            title="PDF Viewer"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              console.error("Failed to load PDF");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;