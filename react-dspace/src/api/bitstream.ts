import { showToast } from "../contexts/ToastProvider";
import { Bitstream, BitstreamsResponse, BitstreamUploadResponse, Bundle, BundlesResponse, PatchOperation } from "../data/bookDetail";
import { siteConfig } from "../data/data";
import axios from "axios";
import { PDFDocument } from 'pdf-lib';
import { getAuthHeaders } from "./searchApi";
const authToken = localStorage.getItem("authToken") || "";
const csrfToken = localStorage.getItem("csrfToken") || "";



function parsePages(pageString: string): number[] {
  const pages = new Set<number>();

  pageString.split(',').forEach((part) => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const page = Number(part);
      if (!isNaN(page)) {
        pages.add(page);
      }
    }
  });

  return Array.from(pages).sort((a, b) => a - b);
}

export const downloadPDF = async (uuid: string, name: string, pagesStr?: string | null) => {
  try {
    const authToken = localStorage.getItem("authToken");
    const csrfToken = localStorage.getItem("csrfToken");

    const headers: Record<string, string> = {};
    if (authToken) headers["Authorization"] = authToken;
    if (csrfToken) headers["X-XSRF-TOKEN"] = csrfToken;

    const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch PDF");
    }

    const pdfBytes = await response.arrayBuffer();
    const fullPdf = await PDFDocument.load(pdfBytes);
    const pageCount = fullPdf.getPageCount();

    const newPdf = await PDFDocument.create();

    let pagesToCopy: number[];

    if (pagesStr) {
      const parsed = parsePages(pagesStr);
      pagesToCopy = parsed.filter(i => i >= 1 && i <= pageCount).map(i => i - 1);
    } else {
      pagesToCopy = Array.from({ length: pageCount }, (_, i) => i); 
    }

    if (pagesToCopy.length === 0) {
      showToast("No valid pages to extract!", "error");
      return;
    }

    const copiedPages = await newPdf.copyPages(fullPdf, pagesToCopy);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();

    const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast(`Pages ${pagesStr || 'All'} downloaded!`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Failed to download PDF', 'error');
  }
};

export const getPDFUrl = (uuid: string): string => {
  const authToken = localStorage.getItem("authToken");
  const tokenParam = authToken ? `?authorization=${encodeURIComponent(authToken)}` : "";
  return `${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content${tokenParam}`;
};



export const fetchPDFUrl = async (uuid: string): Promise<string> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch PDF.");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    throw error;
  }
};


export const fetchItemBundles = async (id: string): Promise<Bundle[]> => {
  const authToken = localStorage.getItem("authToken") || "";

  const headers = authToken
    ? {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": localStorage.getItem("csrfToken") || "",
        Authorization: authToken,
      }
    : {
        "Content-Type": "application/json",
      };

  const response = await axios.get<BundlesResponse>(`${siteConfig.apiEndpoint}/api/core/items/${id}/bundles?size=9999`, {
    headers: headers,
  });

  return response.data._embedded.bundles;
};




export const fetchBitstreams = async (bundleId: string): Promise<Bitstream[]> => {
  const headers = authToken
  ? {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": localStorage.getItem("csrfToken") || "",
      Authorization: authToken,
    }
  : {
      "Content-Type": "application/json",
    };
  const response = await axios.get<BitstreamsResponse>(`${siteConfig.apiEndpoint}/api/core/bundles/${bundleId}/bitstreams?page=0&size=5`, {
    headers: headers,
  });
  return response.data._embedded.bitstreams;
};



export const postBitstream = async (bundleId: string,
  file: File
): Promise<BitstreamUploadResponse> => {

  const formData = new FormData();
  formData.append("file", file);

  try {
    const { data } = await axios.post<BitstreamUploadResponse>(
      `${siteConfig.apiEndpoint}/api/core/bundles/${bundleId}/bitstreams`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-XSRF-TOKEN': csrfToken,
          'Authorization': authToken,
        },
        withCredentials: true,
      }
    );
    return data;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw error;
  }
};



export const removeBitstream = async (patchOperations: PatchOperation[]) => {
  try {
    const response = await axios.patch(
      `${siteConfig.apiEndpoint}/api/core/bitstreams`,
      patchOperations,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
          'Authorization': authToken,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    const errorStatus = error.response?.status || 500;
    if (errorStatus === 400) {
      window.location.href = `/error-400`;
    } else if (errorStatus === 401) {
      window.location.href = `/error-401`;
    } else if (errorStatus === 403) {
      window.location.href = `/error-403`;
    } else if (errorStatus === 422) {
      window.location.href = `/error-422`;
    } else if (errorStatus === 500) {
      window.location.href = `/error-500`;
    } else {
      window.location.href = `/error-404`;
    }
    throw error;
  }
};