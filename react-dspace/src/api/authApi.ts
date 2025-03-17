import axios from "axios";
import { siteConfig } from "../data/data";
import { setAuthToken } from "./authToken";
import { fetchCsrfToken } from "./csrf";


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
            if (isTokenExpired(authToken)) {
                localStorage.removeItem("authToken");
                throw new Error("Token has expired. Please log in again.");
            }

            setAuthToken(authToken);
            localStorage.setItem("authToken", authToken);
        }

        await fetchCsrfToken();

        return response.data;
    } catch (error: any) {
        console.error("Login failed:", error?.response?.data || error.message);
        throw error;
    }
};


const parseJwt = (token: string): { exp?: number } | null => {
  try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayload = JSON.parse(atob(base64)); 
      return decodedPayload;
  } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const decoded = parseJwt(token);
  return decoded?.exp ? decoded.exp * 1000 < Date.now() : true;
};




