import axios from "axios";
import { siteConfig } from "../data/data";
import { showToast } from "../contexts/ToastProvider";

let csrfToken: string | null = localStorage.getItem("csrfToken") || null;

export const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const response = await axios.get(`${siteConfig.apiEndpoint}/api/security/csrf`, {
      withCredentials: true,
    });

    const token = response.headers["dspace-xsrf-token"] || null;
    if (token) {
      setCsrfToken(token);
    }
    return token;
  } catch (error) {
    showToast("Failed to fetch CSRF token", "error");
    return null;
  }
};

export const setCsrfToken = (token: string): void => {
  csrfToken = token;
  localStorage.setItem("csrfToken", token);
};

export const getCsrfToken = (): string | null => csrfToken;
