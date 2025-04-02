import axios from "axios";
import { siteConfig } from "../data/data";
import { showToast } from "../contexts/ToastProvider";

const csrfToken = localStorage.getItem("csrfToken") || "";

export const fetchCommunities = async (authToken: string) => {
    try {
        const response = await axios.get(
            `${siteConfig.apiEndpoint}/api/core/communities`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    Authorization: authToken,
                },
                withCredentials: true,
            }
        );
        if (response.status === 200) {
            showToast('Communities fetched successfully!', 'success');
        }
        return response.data;
    } catch (error) {
        showToast("Failed to fetch communities", "error");
        throw error;
    }
};
