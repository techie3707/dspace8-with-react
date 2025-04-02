import { showToast } from "../contexts/ToastProvider";
import { siteConfig } from "../data/data";

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


