import axios from "axios";
import { siteConfig } from "../data/data";
import { showToast } from "../contexts/ToastProvider";

export const uploadBatchImport = async (
  selectedCollection: string,
  selectedFile: File
): Promise<Awaited<ReturnType<typeof axios.post>>> => {
  const authToken = localStorage.getItem("authToken") || "";
  const csrfToken = localStorage.getItem("csrfToken") || "";

  try {
    const formData = new FormData();

    const properties = [
      { name: "--add" },
      { name: "--zip", value: selectedFile.name },
      { name: "--collection", value: selectedCollection }
    ];
    formData.append("properties", JSON.stringify(properties));

    formData.append("file", selectedFile);

    const response = await axios.post(
      `${siteConfig.apiEndpoint}/api/system/scripts/import/processes`,
      formData,
      {
        headers: {
          "X-XSRF-TOKEN": csrfToken,
          Authorization: authToken,
        },
        withCredentials: true,
      }
    );
    if (response.status === 202) {
      showToast("BThe process was successfully created", "success");
    }
    return response;
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
    throw error;
  }
};
