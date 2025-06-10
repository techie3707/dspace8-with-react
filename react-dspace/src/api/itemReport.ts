import { siteConfig } from "../data/data";
import axios from "axios";

export const itemReportApi = async () => {
    const authToken = localStorage.getItem("authToken");
    const csrfToken = localStorage.getItem("csrfToken");
    try {
        const responce = await axios.get(
            `${siteConfig.apiEndpoint}/api/report/community`,
            {
                headers: {
                    'Authorization': authToken || '',
                },
                withCredentials: true,
            });
        return responce.data;
    } catch (error) {
        console.error("Error fetching item report:", error);
    }
}