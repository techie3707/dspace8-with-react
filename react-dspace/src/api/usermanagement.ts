import axios from "axios";
import { siteConfig } from "../data/data";
import { fetchCsrfToken, getCsrfToken } from "./csrf";
import { getAuthToken } from "./authToken";

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

export interface UserListResponse {
  _embedded?: {
    epersons: EPerson[];
  };
}

export const userList = async (authToken: string): Promise<EPerson[]> => {
  try {
    const response = await axios.get<UserListResponse>(
      `${siteConfig.apiEndpoint}/api/eperson/epersons`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": authToken,
        },
        withCredentials: true,
      }
    );

    return response.data._embedded?.epersons || [];
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
    const csrfToken = getCsrfToken();

    if (!authToken || !csrfToken) {
      throw new Error("Missing authentication tokens");
    }

    await axios.put(
      `${siteConfig.apiEndpoint}/api/eperson/epersons/${userId}`,
      userData,
      {
        headers: {
          "X-XSRF-TOKEN": csrfToken,
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};




