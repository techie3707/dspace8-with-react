import { showToast } from "../contexts/ToastProvider";
import { Bitstream, BitstreamsResponse, BitstreamUploadResponse, Bundle, BundlesResponse, PatchOperation } from "../data/bookDetail";
import { siteConfig } from "../data/data";
import axios from "axios";
const authToken = localStorage.getItem("authToken") || "";
const csrfToken = localStorage.getItem("csrfToken") || "";

export const downloadPDF = async (uuid: string, name: string) => {
  try {
    const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    if (response.status === 200) {
      showToast('PDF downloaded successfully!', 'success');
    }
  } catch (error) {
    showToast('Failed to download PDF', 'error');
  }
};

export const getPDFUrl = (uuid: string): string => {
  return `${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`;
};


export const fetchPDFUrl = async (uuid: string): Promise<string> => {
  try {
    const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`, {
      method: "GET",
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
  const response = await axios.get<BundlesResponse>(`${siteConfig.apiEndpoint}/api/core/items/${id}/bundles?size=9999`);
  return response.data._embedded.bundles;
};

export const fetchBitstreams = async (bundleId: string): Promise<Bitstream[]> => {
  const response = await axios.get<BitstreamsResponse>(`${siteConfig.apiEndpoint}/api/core/bundles/${bundleId}/bitstreams?page=0&size=5`);
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