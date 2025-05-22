import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { Box, CircularProgress, Container, IconButton } from "@mui/material";
import { getPDFUrl } from "../../api/bitstream";
import { showToast } from "../../contexts/ToastProvider";
import Loader from "../loader/loader";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

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
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef<React.ElementRef<typeof HTMLFlipBook>>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const pageBatchSize = 10;
  let blurTimeout: NodeJS.Timeout;

  const updateCurrentPage = useCallback(() => {
    if (bookRef.current) {
      const flipbook = bookRef.current.pageFlip();
      setCurrentPage(flipbook.getCurrentPageIndex());
    }
  }, []);

  const goNext = useCallback(() => {
    if (bookRef.current) {
      const flipbook = bookRef.current.pageFlip();
      flipbook.flipNext();
    }
  }, [updateCurrentPage]);

  const goPrev = useCallback(() => {
    if (bookRef.current) {
      const flipbook = bookRef.current.pageFlip();
      flipbook.flipPrev();
    }
  }, [updateCurrentPage]);

  useEffect(() => {
    const flipbook = bookRef.current?.pageFlip();
    if (flipbook) {
      const handleFlip = (e: { data: number }) => {
        setCurrentPage(e.data);
      };

      flipbook.on("flip", handleFlip);
      setIsInitialized(true);

      return () => {
        flipbook.off("flip", handleFlip);
      };
    }
  }, [bookRef.current]);

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
          setPages((prevPages) => [...prevPages, ...pageImages]);
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

      if (key === "arrowright") {
        event.preventDefault();
        goNext();
      } else if (key === "arrowleft") {
        event.preventDefault();
        goPrev();
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
  }, [currentPage, numPages]);

  return (
    <Container
      sx={{
        position: "fixed",
        top: 0,
        left: 40,
        width: "100vw",
        height: "100vh",
        padding: 0,
        margin: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
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
            overflow: hidden;
            margin: 0;
            padding: 0;
          }

          html {
            overflow: hidden;
          }
        `}
      </style>

      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : pages.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "#fff",
            position: "relative",
          }}
        >
          <IconButton
            onClick={goPrev}
            sx={{
              display: { xs: "none", sm: "flex" },
              zIndex: 10,
              backgroundColor: "background.paper",
              boxShadow: 2,
              "&:hover": { backgroundColor: "action.hover" },
              "&.Mui-disabled": { opacity: 0.5 },
              position: "absolute",
              left: 10,
            }}
            size="large"
            disabled={currentPage <= 0 || !isInitialized}
          >
            <ChevronLeft fontSize="large" />
          </IconButton>
          <Box
            sx={{
              
              flexGrow: 1,
              boxShadow: 6,
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: "#fff",
              position: "relative",
              width: "100%",
              height: "100%",
              border: "5px solid #ebc979",
            }}
            
          >
            {isBlocked && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "black",
                  zIndex: 10,
                  opacity: 1,
                  transition: "opacity 0.3s ease-in-out",
                }}
              />
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
              onFlip={(e) => setCurrentPage(e.data)}
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
                    <img
                      src={pages[index]}
                      alt={`Page ${index + 1}`}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              ))}
            </HTMLFlipBook>
          </Box>

          <IconButton
            onClick={goNext}
            sx={{
              display: { xs: "none", sm: "flex" },
              zIndex: 10,
              backgroundColor: "background.paper",
              boxShadow: 2,
              "&:hover": { backgroundColor: "action.hover" },
              "&.Mui-disabled": { opacity: 0.5 },
              position: "absolute",
              right: 10,
            }}
            size="large"
            disabled={currentPage >= numPages - 2 || !isInitialized}
          >
            <ChevronRight fontSize="large" />
          </IconButton>
        </Box>
      ) : (
        <Loader />
      )}
    </Container>
  );
};

export default PDFFlipBook;