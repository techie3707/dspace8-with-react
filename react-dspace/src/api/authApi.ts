import axios from "axios";
import { siteConfig } from "../data/data";
import { setAuthToken } from "./authToken";
import { fetchCsrfToken } from "./csrf";
import { showToast } from "../contexts/ToastProvider";

const csrfToken = localStorage.getItem("csrfToken") || "";
const authToken = localStorage.getItem("authToken") || "";
export const login = async (email: string, password: string) => {
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

    if (response.status === 200) {
      showToast("Login successful!", "success");
      window.location.href = "/";
    }

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
    return response;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        showToast("Invalid User ID or Password!", "error");
      } else if (error.response.status === 403) {
        showToast("Access Denied! You don't have permission.", "warning");
      } else {
        showToast("Login failed. Please try again.", "error");
      }
    } else {
      showToast("Network error. Please check your connection.", "error");
    }

    throw error;
  }
};


export const forgotPassword = async (email: string) => {
  try {

    const response = await axios.post(
      `${siteConfig.apiEndpoint}/api/eperson/registrations?accountRequestType=register`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        withCredentials: true,
      }
    );

    if (response.status === 201) {
      return { success: true, message: "Password reset link sent to your email." };
    } else {
      throw new Error("Failed to send password reset request.");
    }
  } catch (error: any) {
    showToast("Invalid credentials. Please try again.", "error");
    throw error;
  }
};


export const register = async (email: string) => {
  try {

    const response = await axios.post(
      `${siteConfig.apiEndpoint}/api/eperson/registrations?accountRequestType=register`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        withCredentials: true,
      }
    );

    if (response.status === 201) {
      showToast('Registration link sent to your email.', 'success');
      return { success: true, message: "Password reset link sent to your email." };
    } else {
      throw new Error("Failed to send password reset request.");
    }
  } catch (error: any) {
    showToast("Invalid credentials. Please try again.", "error");
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(
      `${siteConfig.apiEndpoint}/api/authn/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
          Authorization: authToken,
        },
        withCredentials: true,
      }
    );

    if (response.status === 204) {
      localStorage.removeItem("authToken");
    }
  } catch (error) {
    showToast("Logout failed. Please try again.", "error");
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
    // console.error("Error decoding JWT:", error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const decoded = parseJwt(token);
  return decoded?.exp ? decoded.exp * 1000 < Date.now() : true;
};




