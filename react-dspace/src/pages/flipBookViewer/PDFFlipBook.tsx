import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { Box, CircularProgress, Container } from "@mui/material";
import { getPDFUrl } from "../../api/bitstream";
import { showToast } from "../../contexts/ToastProvider";

const getAuthHeaders = (): Record<string, string> => {
  const authToken = localStorage.getItem("authToken") || "";
  const csrfToken = localStorage.getItem("csrfToken") || "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) headers["Authorization"] = authToken;
  if (csrfToken) headers["X-XSRF-TOKEN"] = csrfToken;

  return headers;
};

const PDFFlipBook: React.FC = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const bookRef = useRef<React.ElementRef<typeof HTMLFlipBook>>(null);

  const pageBatchSize = 10;
  let blurTimeout: NodeJS.Timeout;

  useEffect(() => {
    if (uuid) {
      setFileUrl(getPDFUrl(uuid));
    }
  }, [uuid]);

  useEffect(() => {
    if (!fileUrl) return;

    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          httpHeaders: getAuthHeaders(),
        });

        const pdf = await loadingTask.promise;
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
        console.error("PDF load error:", error);
      }
    };

    loadPDF();
  }, [fileUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;

      const blockedCombos = [
        ctrl && key === "p",
        ctrl && key === "s",
        ctrl && shift && key === "i",
        ctrl && shift && key === "j",
        ctrl && shift && key === "c",
        key === "printscreen",
        ctrl && key === "u",
      ];

      if (blockedCombos.some(Boolean)) {
        event.preventDefault();
        setIsBlocked(true);
        showToast("🔒 Action Blocked", "warning");
        setTimeout(() => setIsBlocked(false), 3000);
      }

      if (event.key === "Meta" || event.key === "OS") {
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 5000);
      }
    };

    const handleBlur = () => {
      blurTimeout = setTimeout(() => {
        if (!isBlocked) setIsBlocked(true);
      }, 300);
    };

    const handleFocus = () => {
      clearTimeout(blurTimeout);
      setTimeout(() => setIsBlocked(false), 300);
    };

    const disableRightClick = (event: MouseEvent) => {
      event.preventDefault();
      showToast("🔒 Right-click disabled!", "warning");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", disableRightClick);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", disableRightClick);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <Container>
      <style>
        {`
          @media print {
            body * {
              display: none !important;
            }
          }

          body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        `}
      </style>

      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : pages.length > 0 ? (
        <Box sx={{
          boxShadow: 6,
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
          position: "relative",
        }}>
          {isBlocked && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "black",
              zIndex: 10,
              opacity: 1,
              transition: "opacity 0.3s ease-in-out",
            }} />
          )}

          <HTMLFlipBook
            ref={bookRef}
            width={window.innerWidth > 768 ? 500 : 300}
            height={window.innerWidth > 768 ? 700 : 450}
            className="my-flipbook"
            style={{
              margin: "auto",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
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
