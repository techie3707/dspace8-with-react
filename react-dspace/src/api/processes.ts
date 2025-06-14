import { showToast } from "../contexts/ToastProvider";
import { siteConfig } from "../data/data";
import axios from "axios";
interface ProcessItem {
    processId: number,
    scriptName: string,
    endTime: string,
}
export interface Process {
    _embedded: {
        processes: ProcessItem[]
    },
    page: {
        size: number,
        totalElements: number,
        totalPages: number,
        number: number
    }
}
const authToken = localStorage.getItem("authToken");

export const failedProcess = async (page: number, size: number) => {
    const apiUrl = `${siteConfig.apiEndpoint}/api/system/processes/search/byProperty?page=${page}&size=${size}&sort=endTime,ASC&processStatus=FAILED`;
    const response = await axios.get<Process>(apiUrl, {
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": localStorage.getItem("csrfToken") || "",
            Authorization: authToken
        },
        withCredentials: true,
    })
    return { processes: response.data._embedded?.processes || [], 
        totalPages: response.data.page?.totalPages };
}


export const runningProcess = async (page: number, size: number) => {
  
    const apiUrl = `${siteConfig.apiEndpoint}/api/system/processes/search/byProperty?page=0&size=5&sort=creationTime,DESC&processStatus=RUNNING`;
    const response = await axios.get<Process>(apiUrl, {
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": localStorage.getItem("csrfToken"),
            Authorization: authToken
        },
        withCredentials: true,
    })
    return { processes: response.data._embedded?.processes || [], 
        totalPages: response.data.page.totalPages };
} 


export const scheduledProcess = async (page: number, size: number) => {
    const apiUrl = `${siteConfig.apiEndpoint}/api/system/processes/search/byProperty?page=${page}&size=${size}&sort=creationTime,ASC&processStatus=SCHEDULED`;
    const response = await axios.get<Process>(apiUrl, {
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": localStorage.getItem("csrfToken"),
            Authorization: authToken
        },
        withCredentials: true,
    })
    return { processes: response.data._embedded?.processes || [] , 
        totalPages: response.data.page.totalPages };
} 


export const completedProcess = async (page: number, size: number) => {
    const apiUrl = `${siteConfig.apiEndpoint}/api/system/processes/search/byProperty?page=${page}&size=${size}&sort=creationTime,DESC&processStatus=COMPLETED`;
    const response = await axios.get<Process>(apiUrl, {
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": localStorage.getItem("csrfToken"),
            Authorization: authToken
        },
        withCredentials: true,
    })
    return { processes: response.data._embedded?.processes || [], 
        totalPages: response.data.page.totalPages };
} 

export const removeProcess = async (processId: number) => {
    const response = await axios.delete(`${siteConfig.apiEndpoint}/api/system/processes/${processId}`, {
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": localStorage.getItem("csrfToken"),
            Authorization: authToken
        },
        withCredentials: true,
    })
    if (response.status === 204) {
        showToast("process deleted successfully","success");
    }
}