import { showToast } from "../contexts/ToastProvider";
import { Bitstream, BitstreamsResponse, BitstreamUploadResponse, Bundle, BundlesResponse, PatchOperation } from "../data/bookDetail";
import { siteConfig } from "../data/data";
import axios from "axios";
import { PDFDocument, rgb } from 'pdf-lib';
import { getAuthHeaders } from "./searchApi";
import html2canvas from 'html2canvas';
import ravLogo from '../assets/images/rav-logo.png';
import { fetchItemInfo } from "./item";


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
export const downloadPDF = async (
  uuid: string,
  name: string,
  itemId?: string | null,
  pagesStr?: string | null
) => {
  try {
    const headers: Record<string, string> = {};

    const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) throw new Error("Failed to fetch PDF");

    const pdfBytes = await response.arrayBuffer();
    const fullPdf = await PDFDocument.load(pdfBytes);
    const pageCount = fullPdf.getPageCount();
    const newPdf = await PDFDocument.create();

    if (itemId) {
      const itemResp = await fetch(`${siteConfig.apiEndpoint}/api/core/items/${itemId}`);
      const itemData = await itemResp.json();

      const metadataFields: { [key: string]: string } = {
        "dc.title": "Title",
        "dc.contributor.author": "Author",
        "dc.date.issued": "Date Issued",
        "dc.publisher": "Publisher",
        "dc.identifier.uri": "Link",
      };

      const metadataHtmlRows = Object.entries(metadataFields).map(([key, label]) => {
        const valArr = itemData.metadata[key];
        if (valArr && valArr.length > 0) {
          const value = valArr[0].value;
          return `<tr>
            <th style="text-align:left; padding: 8px;">${label}</th>
            <td style="padding: 8px;">
              ${key === 'dc.identifier.uri' ? `<a href="${value}" target="_blank">${value}</a>` : value}
            </td>
          </tr>`;
        }
        return '';
      }).join('');

      const htmlContent = document.createElement('div');
      htmlContent.style.width = '1123px';  
      htmlContent.style.height = '1587px'; 
      htmlContent.style.padding = '40px';
      htmlContent.style.boxSizing = 'border-box';
      htmlContent.style.backgroundColor = 'white';
      htmlContent.style.fontFamily = 'Arial, sans-serif';

      htmlContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px;">Rashtriya Ayurveda Vidyapeeth</h1>
        </div>
        <table style="width: 100%; font-size: 16px; border-collapse: collapse;">
          ${metadataHtmlRows}
        </table>
      `;

      document.body.appendChild(htmlContent);
      const canvas = await html2canvas(htmlContent, { background: "#fff" });
      const imageDataUrl = canvas.toDataURL('image/png');
      document.body.removeChild(htmlContent);

      const htmlImageBytes = await fetch(imageDataUrl).then(res => res.arrayBuffer());
      const htmlImage = await newPdf.embedPng(htmlImageBytes);
      const htmlPage = newPdf.addPage([htmlImage.width, htmlImage.height]);
      htmlPage.drawImage(htmlImage, {
        x: 0,
        y: 0,
        width: htmlImage.width,
        height: htmlImage.height,
      });
    }

    let pagesToCopy: number[] = [];
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

    const watermarkBytes = await fetch(ravLogo).then(res => res.arrayBuffer());
    const watermarkImage = await newPdf.embedPng(watermarkBytes);
    const watermarkDims = watermarkImage.scale(0.5);

    const copiedPages = await newPdf.copyPages(fullPdf, pagesToCopy);
    copiedPages.forEach((pdfPage) => {
      const { width, height } = pdfPage.getSize();
      pdfPage.drawImage(watermarkImage, {
        x: (width - watermarkDims.width) / 2,
        y: (height - watermarkDims.height) / 2,
        width: watermarkDims.width,
        height: watermarkDims.height,
        opacity: 0.5,
      });
      newPdf.addPage(pdfPage);
    });

    const newPdfBytes = await newPdf.save();
    const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

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