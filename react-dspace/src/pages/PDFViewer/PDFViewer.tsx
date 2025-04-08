import React, { useEffect, useState } from "react";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useSearchParams } from "react-router-dom";
import { siteConfig } from "../../data/data";
import "./PDFViewer.css";
import Loader from "../loader/loader";
import { Box, Paper } from "@mui/material";

const PDFViewer: React.FC = () => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get("uuid");

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(() => {
        let pdfBlobUrl: string | null = null;

        const fetchPDF = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`,
                    { responseType: "blob" }
                );
                pdfBlobUrl = URL.createObjectURL(response.data as Blob);
                setPdfUrl(pdfBlobUrl);
                setLoading(false);
            } catch (error) {
                setError("Failed to load PDF");
                setLoading(false);
            }
        };

        fetchPDF();

        return () => {
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [uuid]);

    if (loading) return <Loader />;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            padding={2}
            bgcolor="#f5f5f5"
        >
            <Paper
                elevation={3}
                sx={{
                    width: "100%",
                    maxWidth: "900px",
                    height: { xs: "80vh", md: "90vh" },
                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
            >
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
                    <div style={{ height: "100%" }}>
                        {pdfUrl && (
                            <Viewer
                                fileUrl={pdfUrl}
                                plugins={[defaultLayoutPluginInstance]}
                                defaultScale={1.0}
                            />
                        )}
                    </div>
                </Worker>
            </Paper>
        </Box>
    );
};

export default PDFViewer;
