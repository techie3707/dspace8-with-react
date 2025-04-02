import axios from "axios";
import { siteConfig } from "../data/data";
import { showToast } from "../contexts/ToastProvider";

const authToken = localStorage.getItem("authToken") || "";
const csrfToken = localStorage.getItem("csrfToken") || "";

export const createItem = async (
    collectionId: string,
    formData: { [key: string]: string | Date | null }
) => {
    const apiUrl = `${siteConfig.apiEndpoint}/api/core/items?owningCollection=${collectionId}`;

    const metadata: Record<string, { value: string; language: string; authority: null; confidence: number }[]> = {};

    Object.entries(formData).forEach(([key, value]) => {
        if (value) {
            metadata[key] = [
                {
                    value: value.toString(),
                    language: "en",
                    authority: null,
                    confidence: -1
                }
            ];
        }
    });

    const payload = {
        name: formData["dc.title"]?.toString() || "Untitled Item",
        metadata,
        inArchive: true,
        discoverable: true,
        withdrawn: false,
        type: "item",
    };

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                "Authorization": authToken,
            },
            withCredentials: true,
        });
        if (response.status === 201) {
            showToast("Item created successfully!", "success");
        } else {
            showToast(`Error: ${response.statusText}`, "error");
        }

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
