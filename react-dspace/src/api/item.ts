import axios from "axios";
import { siteConfig } from "../data/data";
import { showToast } from "../contexts/ToastProvider";
import { ItemInfo } from "../pages/Item/editItem";

// const authToken = localStorage.getItem("authToken") || "";
// const csrfToken = localStorage.getItem("csrfToken") || "";

const authToken = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJlaWQiOiI4MmRkN2MzNC01OGQyLTQyNWUtYTVmNS04ZTA1ZmYwN2QxNmEiLCJzZyI6W10sImF1dGhlbnRpY2F0aW9uTWV0aG9kIjoicGFzc3dvcmQiLCJleHAiOjE3NDQxMjgzOTN9.VVFGe31tGA1ubKHKMshjKsnieqflbcOt3zCLVOG6caU";
const csrfToken = "08d69977-d171-4525-83f2-31768f0418d8";

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



export const fetchItemInfo = async (itemId: string) => {
    const apiUrl = `${siteConfig.apiEndpoint}/api/core/items/${itemId}`;
    try {
        const response = await axios.get<ItemInfo>(apiUrl);
        if (response.status !== 200) {
            throw new Error(`Error fetching item details: ${response.statusText}`);
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching item details:", error);
        throw error;
    }
};



interface PatchOperation {
  op: 'add' | 'remove' | 'replace' ;
  path: string;
  value?: any;
}

export const patchItemMetadata = async (itemId: string, patchOperations: PatchOperation[]) => {
  try {
    const response = await axios.patch(
        `${siteConfig.apiEndpoint}/api/core/items/${itemId}`,
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
  } catch (error:any) {
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