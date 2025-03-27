import axios from "axios";
import { siteConfig } from "../data/data";
import { showToast } from "../contexts/ToastProvider";
import { APIResponse, Collection, Community } from "../data/accessAPI";
import { ApiResponse } from "./group";

const authToken = localStorage.getItem("authToken") || "";
const csrfToken = localStorage.getItem("csrfToken") || "";

export const fetchCommunities = async (): Promise<Community[]> => {
    const apiUrl = `${siteConfig.apiEndpoint}/api/core/communities`;

    try {
        const response = await axios.get<APIResponse<Community>>(apiUrl, {
            headers: {
                "Authorization": authToken,
                "X-XSRF-TOKEN": csrfToken,
            },
            withCredentials: true,
        });

        return response.data._embedded?.communities || [];
    } catch (error) {
        console.error("Error fetching communities:", error);
        showToast("Failed to fetch communities", "error");
        return [];
    }
};

export const fetchCollections = async (communityId: string): Promise<Collection[]> => {
    const apiUrl = `${siteConfig.apiEndpoint}/api/core/communities/${communityId}/collections`;

    try {
        const response = await axios.get<APIResponse<Collection>>(apiUrl, {
            headers: {
                "Authorization": authToken,
                "X-XSRF-TOKEN": csrfToken,
            },
            withCredentials: true,
        });

        return response.data._embedded?.collections || [];
    } catch (error) {
        console.error(`Error fetching collections for community ${communityId}:`, error);
        showToast(`Failed to fetch collections for community ${communityId}`, "error");
        return [];
    }
};

export const fetchGroupsList = async () => {
    try {
        const apiUrl = `${siteConfig.apiEndpoint}/api/eperson/groups`;

        const response = await axios.get<ApiResponse>(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                Authorization: authToken,
            },
            withCredentials: true,
        });

        return {
            groups: response.data._embedded?.groups || [],
            totalPages: response.data.page?.totalPages || 1,
        };
    } catch (error) {
        console.error("Error fetching groups:", error);
        return { groups: [], totalPages: 1 };
    }
};