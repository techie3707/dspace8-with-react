import { siteConfig } from "../data/data";
import axios from "axios";


interface MetadataSchema {
    id: number;
    prefix: string;
    namespace: string;
    type: string;
    _links: {
        self: { href: string };
    };
}

interface MetadataSchemaResponse {
    _embedded: {
        metadataschemas: MetadataSchema[];
    };
    page?: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}

export const fetchMetadataSchemas = async (authToken: string, page: number = 0, size: number = 20) => {
    try {
        const response = await axios.get<MetadataSchemaResponse>(
            `${siteConfig.apiEndpoint}/api/core/metadataschemas?page=${page}&size=${size}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken,
                },
                withCredentials: true,
            }
        );

        return {
            metadataschemas: response.data._embedded?.metadataschemas || [],
            totalPages: response.data.page?.totalPages || 1,
        };
    } catch (error: any) {
        console.error("Error fetching metadata schemas:", error?.response?.data || error.message);
        throw error;
    }
};

export const addMetadataSchema = async (payload: { prefix: string; namespace: string }) => {
    try {
        const authToken = localStorage.getItem("authToken") || "";
        const csrfToken = localStorage.getItem("csrfToken") || "";

        const response = await axios.post(
            `${siteConfig.apiEndpoint}/api/core/metadataschemas`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    Authorization: authToken,
                },
                withCredentials: true,
            }
        );

        console.log("Metadata schema added successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create metadata schema:", error?.response?.data || error.message);
        throw error;
    }
};

export const deleteMetadataSchema = async (id: number) => {
    try {
        const authToken = localStorage.getItem("authToken") || "";
        const csrfToken = localStorage.getItem("csrfToken") || "";
        await axios.delete(`${siteConfig.apiEndpoint}/api/core/metadataschemas/${id}`, {
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
