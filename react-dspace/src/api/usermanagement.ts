import axios from "axios";
import { siteConfig } from "../data/data";

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

