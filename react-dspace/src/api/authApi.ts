import axios from "axios";
import { siteConfig } from "../data/data";
import { setAuthToken } from "./authToken"; 

export const login = async (email: string, password: string, csrfToken: string) => {
  try {
    
    const response = await axios.post(
      `${siteConfig.apiEndpoint}/api/authn/login`,
      { user: email, password },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-XSRF-TOKEN": csrfToken,
        },
        withCredentials: true,
      }
    );



    const authToken = response.headers["authorization"];
    if (authToken) {
      setAuthToken(authToken);
    }

    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error?.response?.data || error.message);
    throw error;
  }
};
