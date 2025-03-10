import axios from "axios";
import { siteConfig } from "../data/data";


export const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const response = await axios.get(`${siteConfig.apiEndpoint}/api/security/csrf`, {
      withCredentials: true,
    });

    const csrfToken = response.headers["dspace-xsrf-token"];
    return csrfToken || null;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
};

