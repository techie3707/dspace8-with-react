import axios from "axios";
import { siteConfig } from "../data/data";


export interface Group {
    id: string;
    uuid: string;
    name: string;
    metadata?: {
        ["dc.description"]?: { value: string }[];
    };
    _embedded?: {
        object?: {
            name?: string;
            metadata?: {
                ["dc.description"]?: { value: string }[];
            };
        };
    };
}

export interface ApiResponse {
    _embedded?: {
        groups?: Group[];
    };
    page?: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}
export interface GroupMetadata {
    "dc.description": { value: string }[];
}

export interface GroupPayload {
    name: string;
    metadata: GroupMetadata;
}
export interface EPerson {
    id: string;
    uuid: string;
    name: string;
    metadata: {
        "eperson.firstname"?: { value: string }[];
        "eperson.lastname"?: { value: string }[];
    };
    email: string;
}

export interface APIResponse {
    epersons(epersons: any): unknown;
    totalPages(totalPages: any): unknown;
    _embedded: {
        epersons: EPerson[];
    };
    page: {
        number: number;
        size: number;
        totalPages: number;
        totalElements: number;
    };
}
const authToken = localStorage.getItem("authToken") || "";
const csrfToken = localStorage.getItem("csrfToken") || "";
export const fetchGroups = async (
    authToken: string,
    page: number = 0,
    size: number = 10,
    query: string = ""
) => {
    try {
        const apiUrl = `${siteConfig.apiEndpoint}/api/eperson/groups/search/byMetadata?page=${page}&size=${size}&query=${encodeURIComponent(query)}&embed=object`;

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


export const addGroup = async (groupData: GroupPayload): Promise<boolean> => {
    try {

        const apiUrl = `${siteConfig.apiEndpoint}/api/eperson/groups`;

        const response = await axios.post(apiUrl, groupData, {
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                "Authorization": authToken,
            },
            withCredentials: true,
        });

        return response.status === 201;
    } catch (error) {
        console.error("Error creating group:", error);
        return false;
    }
};



export const fetchGroupMembers = async (groupId: string, page: number = 0, size: number = 5): Promise<APIResponse> => {
    try {
        const response = await axios.get<APIResponse>(
            `${siteConfig.apiEndpoint}/api/eperson/groups/${groupId}/epersons?page=${page}&size=${size}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching group members:", error);
        throw error;
    }
};

export const fetchNonMembers = async (groupId: string, page: number = 0, size: number = 5, query: string = ""): Promise<APIResponse> => {
    try {
        const response = await axios.get<APIResponse>(
            `${siteConfig.apiEndpoint}/api/eperson/epersons/search/isNotMemberOf?page=${page}&size=${size}&query=${encodeURIComponent(query)}&group=${groupId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching non-members:", error);
        throw error;
    }
};

export const addMemberToGroup = async (groupId: string, epersonId: string) => {
    try {
        const payload = `${siteConfig.apiEndpoint}/api/eperson/epersons/${epersonId}`;
        const response = await axios.post(
            `${siteConfig.apiEndpoint}/api/eperson/groups/${groupId}/epersons`,
            payload,
            {
                headers: {
                    "Content-Type": "text/uri-list",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken,
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding member to group:", error);
        throw error;
    }
};

export const removeMemberToGroup = async (groupId: string, epersonId: string) => {
    try {
        const response = await axios.delete(
            `${siteConfig.apiEndpoint}/api/eperson/groups/${groupId}/epersons/${epersonId}`,
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
        console.error("Error removing member to group:", error);
        throw error;
    }
};

export const editGroupDetail = async (groupId: string, groupName: string, groupDescription: string) => {

    try {
        const response = await axios.patch(
            `${siteConfig.apiEndpoint}/api/eperson/groups/${groupId}`,
            [
                { op: "add", path: "/metadata/dc.description", value: groupDescription },
                { op: "replace", path: "/name", value: groupName }
            ],
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
        console.error("Error updating group details:", error);
        throw error;
    }
};

export const deleteGroup = async (groupId: string) => {

    try {
        const response = await axios.delete(
            `${siteConfig.apiEndpoint}/api/eperson/groups/${groupId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken,
                    "X-XSRF-TOKEN": csrfToken,
                    
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting group :", error);
        throw error;
    }
};


