import React, { useEffect, useState } from "react";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useSearchParams } from "react-router-dom";
import { siteConfig } from "../../data/data";
import "./PDFViewer.css";

const PDFViewer: React.FC = () => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get("uuid");

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(() => {
        let pdfBlobUrl: string | null = null;

        const fetchPDF = async () => {
            try {
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

    if (loading) return <p>Loading PDF...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
            <div style={{ height: "720px" }}>
                {pdfUrl && <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]}  defaultScale={1.0}/>}
            </div>
        </Worker>
    );
};

export default PDFViewer;