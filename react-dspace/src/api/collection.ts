import axios from "axios";
import { siteConfig } from "../data/data";
import { showToast } from "../contexts/ToastProvider";

export interface Collection {
  id: string;
  name: string;
}

interface ApiResponse {
  _embedded?: {
    searchResult?: {
      _embedded?: {
        objects: {
          _embedded: {
            indexableObject: {
              uuid: string;
              name: string;
            };
          };
        }[];
      };
    };
  };
}

export const fetchCollections = async (): Promise<Collection[]> => {
  try {
    const authToken = localStorage.getItem("authToken") || "";

    const response = await axios.get<ApiResponse>(
      `${siteConfig.apiEndpoint}/api/discover/search/objects?page=0&size=10&dsoType=COLLECTION`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
      }
    );
    const objects = response.data._embedded?.searchResult?._embedded?.objects || [];
    return objects.map((obj) => ({
      id: obj._embedded.indexableObject.uuid,
      name: obj._embedded.indexableObject.name,
    }));
  } catch (error) {
    showToast("Failed to fetch collections.", "error");
    throw error;
  }
};

const authToken = localStorage.getItem("authToken") || "";
const csrfToken = localStorage.getItem("csrfToken") || "";
export const AddCollection = async (parentId: string, title: string, description: string) => {
  try {
    const response = await axios.post(`${siteConfig.apiEndpoint}/api/core/collections?parent=${parentId}`, {
      metadata: {
        "dc.title": [{ value: title }],
        "dc.description": [{ value: description }],
      }
    },
      {
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
          "Authorization": authToken 
        },
        withCredentials: true
      }
    );
    if (response.status === 201) {
      showToast("Collection created successfully!", "success");
    }
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
  }
}