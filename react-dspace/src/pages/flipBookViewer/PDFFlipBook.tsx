import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { Box, CircularProgress, Container } from "@mui/material";
import { getPDFUrl } from "../../api/bitstream";

const PDFFlipBook: React.FC = () => {
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get("uuid");
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [pages, setPages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const bookRef = useRef<React.ElementRef<typeof HTMLFlipBook>>(null);


    const pageBatchSize = 10;

    
    useEffect(() => {
        if (uuid) {
            setFileUrl(getPDFUrl(uuid));
        }
    }, [uuid]);

    useEffect(() => {
        if (!fileUrl) return;

        const loadPDF = async () => {
            try {
                const pdf = await pdfjsLib.getDocument(fileUrl).promise;
                setNumPages(pdf.numPages);

                const loadPages = async (start: number, count: number) => {
                    const pageImages: string[] = [];
                    for (let i = start; i < Math.min(start + count, pdf.numPages); i++) {
                        const page = await pdf.getPage(i + 1);
                        const viewport = page.getViewport({ scale: 2 });
                        const canvas = document.createElement("canvas");
                        const context = canvas.getContext("2d");
                        if (!context) continue;

                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        await page.render({ canvasContext: context, viewport }).promise;
                        pageImages.push(canvas.toDataURL("image/png"));
                    }
                    setPages(prevPages => [...prevPages, ...pageImages]);
                };

                await loadPages(0, pageBatchSize);

                let currentPage = pageBatchSize;
                const loadRemainingPages = async () => {
                    while (currentPage < pdf.numPages) {
                        await loadPages(currentPage, pageBatchSize);
                        currentPage += pageBatchSize;
                    }
                };

                setTimeout(loadRemainingPages, 100);
            } catch (error) {
                setError("Failed to load PDF");
            }
        };

        loadPDF();
    }, [fileUrl]);

    return (
        <Container>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : pages.length > 0 ? (
                <Box  sx={{
                    boxShadow: 6, 
                    border: "3px solidrgb(37, 38, 39)", 
                    borderRadius: 2,
                    overflow: "hidden",
                    p: 2,
                    backgroundColor: "#fff",
                }}>
                    <HTMLFlipBook
                        ref={bookRef}
                        width={window.innerWidth > 768 ? 500 : 300}
                        height={window.innerWidth > 768 ? 700 : 450}
                        className="my-flipbook"
                        style={{ margin: "auto", maxWidth: "100%", maxHeight: "100%" }}
                        startPage={0}
                        size="stretch"
                        minWidth={250}
                        maxWidth={800}
                        minHeight={350}
                        maxHeight={1200}
                        drawShadow={true}
                        flippingTime={1000}
                        usePortrait={true}
                        showPageCorners={true}
                        startZIndex={0}
                        autoSize={true}
                        maxShadowOpacity={0.5}
                        mobileScrollSupport={true}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showCover={true}
                        disableFlipByClick={false}
                    >
                        {Array.from({ length: numPages }).map((_, index) => (
                            <div key={index} className="page">
                                {pages[index] ? (
                                    <img src={pages[index]} alt={`Page ${index + 1}`} style={{ width: "100%", height: "100%" }} />
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                        ))}
                    </HTMLFlipBook>
                </Box>
            ) : (
                <CircularProgress />
            )}
        </Container>
    );
};

export default PDFFlipBook;
