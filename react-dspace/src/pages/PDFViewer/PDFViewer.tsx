import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { pdfjs, Document, Page } from "react-pdf";
import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";

// Load PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer: React.FC = () => {
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get("uuid");
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch PDF URL based on UUID
    useEffect(() => {
        if (uuid) {
            const pdfUrl = `http://localhost:8080/server/api/core/bitstreams/${uuid}/content`;
            setFileUrl(pdfUrl);
        }
    }, [uuid]);

    // Handle document load success
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setLoading(false);
    };

    const onError = (err: any) => {
        setError("Failed to load PDF.");
        console.error("PDF Load Error:", err);
        setLoading(false);
    };

    const goToPreviousPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));

    return (
        <Container sx={{ textAlign: "center", p: 2, maxWidth: "800px", margin: "auto" }}>
            {loading && <CircularProgress sx={{ marginBottom: 2 }} />}
            
            {error ? (
                <Typography color="error">{error}</Typography>
            ) : fileUrl ? (
                <>
                    <Box sx={{
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: "hidden",
                        p: 2,
                        backgroundColor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onError}>
                            <Page pageNumber={pageNumber} width={600} />
                        </Document>

                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Page {pageNumber} of {numPages}
                        </Typography>

                        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                            <Button variant="contained" onClick={goToPreviousPage} disabled={pageNumber === 1 || loading}>
                                Previous
                            </Button>
                            <Button variant="contained" onClick={goToNextPage} disabled={pageNumber === numPages || loading}>
                                Next
                            </Button>
                        </Box>
                    </Box>
                </>
            ) : (
                <CircularProgress />
            )}
        </Container>
    );
};

export default PDFViewer;
