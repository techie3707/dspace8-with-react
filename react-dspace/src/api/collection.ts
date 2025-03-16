import axios from "axios";
import { siteConfig } from "../data/data";

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
    console.error("Error fetching collections:", error);
    throw error;
  }
};
