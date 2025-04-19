import axios from "axios";
import { siteConfig } from "../data/data";
import { showToast } from "../contexts/ToastProvider";

const authToken = localStorage.getItem("authToken") || "";
const csrfToken = localStorage.getItem("csrfToken") || "";

export const fetchCommunities = async () => {
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
        
        return response.data;
    } catch (error) {
        showToast("Failed to fetch communities", "error");
        throw error;
    }
};

export const fetchCollectionsItem = async(uuid:string) =>{
    const apiUrl = `${siteConfig.apiEndpoint}/api/core/communities/${uuid}/collections`
    try{
        const response = await axios.get(apiUrl);
        return response.data
    }catch(error){
        console.error('Failed to fatch collection',error)
    }

}

export const deleteCommunity = async (uuid: string) => {
    try {
        const response = await axios.delete(`${siteConfig.apiEndpoint}/api/core/communities/${uuid}`, {
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                Authorization: authToken,
            },
            withCredentials: true,
        });
        if (response.status === 204) {
            showToast('Community deleted successfully!', 'success');
        }
    }catch(error){
        console.error('Failed to delete community',error)
    }
}

export const editCommunity = async (uuid: string, title: string) => {
    try {
        const response = await axios.patch(`${siteConfig.apiEndpoint}/api/core/communities/${uuid}`, 
           [ {op: "replace", path: "/metadata/dc.title", value: {value: `${title}`, language: null}}],
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
            showToast('Community updated successfully!', 'success');
        }
    }catch(error){
        console.error('Failed to update community',error)
    } 

}