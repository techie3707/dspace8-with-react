import axios from "axios";
import { siteConfig } from "../data/data";

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

        console.log("Communities API response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching communities:", error);
        throw error;
    }
};
