import axios from "axios";
import { siteConfig } from "../data/data";


export interface MetadataSchema {
    prefix: string;
}

export interface MetadataField {
    id: number;
    element: string;
    qualifier: string | null;
    scopeNote: string | null;
    _embedded?: {
        schema?: MetadataSchema;
    };
}

export interface ApiResponse {
    _embedded?: {
        metadatafields?: MetadataField[];
    };
}

export const fetchMetadataFields = async (
    schemaName: string,
    authToken: string,
    page: number,
    size: number
): Promise<MetadataField[]> => {
    try {
        const response = await axios.get<ApiResponse>(
            `${siteConfig.apiEndpoint}/api/core/metadatafields/search/bySchema?page=${page}&size=${size}&schema=${schemaName}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken,
                },
                withCredentials: true,
            }
        );

        return response.data._embedded?.metadatafields || [];
    } catch (error) {
        console.error("Failed to fetch metadata fields:", error);
        throw new Error("Failed to fetch metadata fields.");
    }
};

export const addMetadataField = async (
    schemaId: string,
    element: string,
    qualifier: string | null,
    scopeNote: string | null
): Promise<MetadataField> => {
    try {
        const authToken = localStorage.getItem("authToken") || "";
        const csrfToken = localStorage.getItem("csrfToken") || "";
        const response = await axios.post<MetadataField>(
            `${siteConfig.apiEndpoint}/api/core/metadatafields?schemaId=${schemaId}`,
            {
                element,
                qualifier,
                scopeNote,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken,
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to add metadata field:", error);
        throw new Error("Failed to add metadata field.");
    }
};
export const deleteBitstream = async (id: number) => {
    try {
        const authToken = localStorage.getItem("authToken") || "";
        const csrfToken = localStorage.getItem("csrfToken") || "";
        await axios.delete(`${siteConfig.apiEndpoint}/api/core/metadatafields/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                Authorization: authToken,
            },
            withCredentials: true,
        });
    } catch (error) {
        console.error(`Error deleting metadata schema with ID ${id}:`, error);
        throw error; 
    }
};


