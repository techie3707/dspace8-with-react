// SimplePDFViewer.tsx
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

// Load PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface SimplePDFViewerProps {
  fileUrl: string;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const onError = (err: any) => {
    setError("Failed to load PDF.");
    console.error("PDF Error:", err);
    setLoading(false);
  };

  const goToPreviousPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));

  return (
    <Box sx={{ textAlign: "center", p: 2, boxShadow: 3, borderRadius: 2, backgroundColor: "#fff" }}>
      {loading && <CircularProgress />}

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onError}>
            <Page pageNumber={pageNumber} width={600} />
          </Document>

          <Typography variant="body1" sx={{ mt: 2 }}>
            Page {pageNumber} of {numPages}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={goToPreviousPage}
              disabled={pageNumber === 1 || loading}
              sx={{ mr: 1 }}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              onClick={goToNextPage}
              disabled={pageNumber === numPages || loading}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SimplePDFViewer;