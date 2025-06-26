import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useSearchParams } from "react-router-dom";
import { siteConfig } from "../../data/data";
import "./PDFViewer.css";
import Loader from "../loader/loader";
import {
    Box,
    Paper,
    IconButton,
    TextField,
    Button,
    Slide,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { getAuthStatus } from "../../api/authApi";
import { updateUserCart } from "../../api/cart";
import { getAuthHeaders } from "../../api/searchApi";

const PDFViewer: React.FC = () => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get("uuid");
    const itemId = searchParams.get("itemId");

    const [showForm, setShowForm] = useState(false);
    const [pageInput, setPageInput] = useState("");
    const pageInputRef = useRef<HTMLInputElement>(null);

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(() => {
        if (showForm && pageInputRef.current) {
            pageInputRef.current.focus();
        }
    }, [showForm]);

    useEffect(() => {
        let pdfBlobUrl: string | null = null;
        const fetchPDF = async () => {
            try {
                setLoading(true);
                const headers = getAuthHeaders();
                const response = await axios.get(
                    `${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`,
                    {
                        responseType: "blob",
                        headers,
                    }
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

    const OverlayControls = () => (
        <Box
            sx={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
            }}
        >
            <IconButton
                color="primary"
                onClick={() => setShowForm(!showForm)}
                sx={{ bgcolor: "white", boxShadow: 3 }}
            >
                {showForm ? <CloseIcon /> : <AddIcon />}
            </IconButton>

            <Slide direction="down" in={showForm} mountOnEnter unmountOnExit>
                <Paper
                    elevation={4}
                    sx={{ mt: 1, width: 280, p: 2, bgcolor: "white" }}
                >
                    <Typography variant="subtitle1" gutterBottom>
                        Enter Pages
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="e.g. 1,2,5-8"
                        variant="outlined"
                        value={pageInput}
                        inputRef={pageInputRef}
                        onChange={(e) => setPageInput(e.target.value)}
                        autoFocus
                        sx={{ mb: 2 }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={async () => {
                            const trimmedInput = pageInput.trim();
                            if (!trimmedInput) {
                                alert("Please enter valid pages.");
                                return;
                            }

                            try {
                                const userID = await getAuthStatus();
                                if (!userID) {
                                    alert("User not authenticated.");
                                    return;
                                }

                                const today = new Date().toISOString().split("T")[0];
                                const bitstreamValue = `${itemId}_${uuid}_${today}_${trimmedInput}`;
                                await updateUserCart(userID, bitstreamValue);

                                alert("Document added successfully to your list.");
                                setShowForm(false);
                                setPageInput("");
                            } catch (error) {
                                console.error("Add to List error:", error);
                                alert("Failed to add document. Please try again.");
                            }
                        }}
                    >
                        Add to List
                    </Button>
                </Paper>
            </Slide>
        </Box>
    );

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
                    position: "relative",
                }}
            >
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
                    <Box sx={{ height: "100%", position: "relative" }}>
                        {pdfUrl && (
                            <Viewer
                                fileUrl={pdfUrl}
                                plugins={[defaultLayoutPluginInstance]}
                                defaultScale={1.0}
                            />
                        )}
                        <OverlayControls />
                    </Box>
                </Worker>
            </Paper>
        </Box>
    );
};

export default PDFViewer;
