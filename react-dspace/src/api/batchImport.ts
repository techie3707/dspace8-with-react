import axios from "axios";
import { siteConfig } from "../data/data";

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
      { name: "--collection", value: selectedCollection },
      { name: "-v", value: true }
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

    return response;
  } catch (error) {
    console.error("Error uploading batch import:", error);
    throw error;
  }
};
