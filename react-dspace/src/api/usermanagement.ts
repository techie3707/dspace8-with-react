import axios from "axios";
import { siteConfig } from "../data/data";
import { fetchCsrfToken, getCsrfToken } from "./csrf";

export interface EPerson {
  id: string;
  uuid: string;
  name: string;
  email: string;
  metadata: {
    'eperson.firstname'?: [{ value: string }];
    'eperson.lastname'?: [{ value: string }];
  };
}


interface UserListResponse {
  _embedded: {
      epersons: EPerson[];
  };
  page?: { 
      size: number;
      totalElements: number;
      totalPages: number;
      number: number;
  };
}


export const userList = async (page: number = 0, size: number = 10, query: string = "") => {
  try {
    const authToken = localStorage.getItem("authToken");
    const csrfToken = localStorage.getItem("csrfToken");
    const response = await axios.get<UserListResponse>(
      `${siteConfig.apiEndpoint}/api/eperson/epersons/search/byMetadata?page=${page}&size=${size}&query=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
          'X-XSRF-TOKEN': csrfToken,
          "Authorization": authToken,
        },
        withCredentials: true,
      }
    );

    return {
      epersons: response.data._embedded?.epersons || [],
      totalPages: response.data.page?.totalPages || 1,
    };
  } catch (error: any) {
    console.error("Error fetching user list:", error?.response?.data || error.message);
    throw error;
  }
};



export const removeUser = async (userId: string) => {
  const authToken = localStorage.getItem("authToken");

  try {
    const csrfToken = localStorage.getItem("csrfToken");
    if (!csrfToken) {
      console.error("CSRF token is missing. Aborting delete request.");
      return false;
    }

    const response = await axios.delete(
      `http://localhost:8080/server/api/eperson/epersons/${userId}`,
      {
        headers: {
          'X-XSRF-TOKEN': csrfToken,
          'Authorization': authToken || '',
        },
        withCredentials: true,
      }
    );

    return response.status === 204;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
};

export const addUser = async (userData: object) => {
  try {
    const authToken = localStorage.getItem("authToken");
    const csrfToken = await fetchCsrfToken();

    const response = await axios.post(
      `${siteConfig.apiEndpoint}/api/eperson/epersons`,
      JSON.stringify(userData),
      {
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken || "",
          Authorization: authToken || "",
        },
        withCredentials: true,
      }
    );

    console.log("User added successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to add user:", error?.response?.data || error.message);
    throw error;
  }
};
export const getUserById = async (userId: string, authToken: string) => {
  try {
    const csrfToken = getCsrfToken() ?? ""; 
    const response = await fetch(`${siteConfig.apiEndpoint}/api/eperson/epersons/${userId}`, {
      method: "GET",
      headers: {
        "X-XSRF-TOKEN": csrfToken, 
        Authorization: authToken,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};
export const updateUser = async (userId: string, userData: Record<string, any>, authToken: string) => {
  try {
    const csrfToken = localStorage.getItem("csrfToken");
    
    if (!authToken || !csrfToken) {
      throw new Error("Missing authentication tokens");
    }

    const patchPayload: any[] = [];

    if (userData.firstName !== undefined) {
      patchPayload.push({
        op: "replace",
        path: "/metadata/eperson.firstname",
        value: userData.firstName,
      });
    }
    if (userData.lastName !== undefined) {
      patchPayload.push({
        op: "replace",
        path: "/metadata/eperson.lastname",
        value: userData.lastName,
      });
    }
    if (userData.email !== undefined) {
      patchPayload.push({
        op: "replace",
        path: "/email",
        value: userData.email,
      });
    }

    for (const patch of patchPayload) {
      await axios.patch(`${siteConfig.apiEndpoint}/api/eperson/epersons/${userId}`, [patch], {
        headers: {
          'X-XSRF-TOKEN': csrfToken,
          'Authorization': authToken || '',
        },
        withCredentials: true,
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};





