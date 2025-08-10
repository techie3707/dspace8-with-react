import axios from "axios";
import { siteConfig } from "../data/data";

const csrfToken = localStorage.getItem("csrfToken") || "";
const authToken = localStorage.getItem("authToken") || "";
// https://demo.dspace.org/server/api/core/collections/e5148339-321b-4a2c-92c6-9e3047a4c6c4/submittersGroup
export const fetchSubmitterGroup = async (uuid: string) => {
    try {
        const response = await axios.get(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/submittersGroup`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
        return response.data;

    }
    catch (error) {
        console.log(error);
    }
}

export const createSubmitterGroup = async (uuid: string, description: string) => {
    try {
        const response = await axios.post(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/submittersGroup`,
            {
                metadata: {
                    "dc.description": [{ value: description }],
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

export const deleteSubmitterGroup = async (uuid: string) => {
    try {
         await axios.delete(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/submittersGroup`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
    }
    catch (error) {
        console.log(error);
    }
}


// https://demo.dspace.org/server/api/core/collections/e5148339-321b-4a2c-92c6-9e3047a4c6c4/workflowGroups/reviewer

export const fetchReviewerGroup = async (uuid: string) => {
    try {
        const response = await axios.get(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/reviewer`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

// https://demo.dspace.org/server/api/core/collections/e5148339-321b-4a2c-92c6-9e3047a4c6c4/workflowGroups/reviewer

export const createReviewerGroup = async (uuid: string, description: string) => {
    try{
        const response = await axios.post(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/reviewer`,
            {
                metadata: {
                    "dc.description": [{ value: description }],
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

export const deleteReviewerGroup = async (uuid: string) => {
    try {
         await axios.delete(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/reviewer`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
    }
    catch (error) {
        console.log(error);
    }
}



// https://demo.dspace.org/server/api/core/collections/e5148339-321b-4a2c-92c6-9e3047a4c6c4/workflowGroups/editor

export const fetchEditorGroup = async (uuid: string) => {
    try {
        const response = await axios.get(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/editor`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}


export const createEditorGroup = async (uuid: string, description: string) => {
    const response = await axios.post(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/editor`,
        {
            metadata: {
                "dc.description": [{ value: description }],
            },
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                "Authorization": authToken
            },
            withCredentials: true,
        }
    );
    return response.data;
}

export const deleteEditorGroup = async (uuid: string) => {
    try {
         await axios.delete(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/editor`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
    }
    catch (error) {
        console.log(error);
    }
}


// https://demo.dspace.org/server/api/core/collections/e5148339-321b-4a2c-92c6-9e3047a4c6c4/workflowGroups/finaleditor

export const fetchFinalEditorGroup = async (uuid: string) => {
    try {
        const response = await axios.get(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/finaleditor`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}



export const createFinalEditorGroup = async (uuid: string, description: string) => {
    const response = await axios.post(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/finaleditor`,
        {
            metadata: {
                "dc.description": [{ value: description }],
            },
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                "Authorization": authToken
            },
            withCredentials: true,
        }
    );
    return response.data;
}

export const deleteFinalEditorGroup = async (uuid: string) => {
    try {
         await axios.delete(`${siteConfig.apiEndpoint}/api/core/collections/${uuid}/workflowGroups/finaleditor`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                    "Authorization": authToken
                },
                withCredentials: true,
            }
        );
    }
    catch (error) {
        console.log(error);
    }
}

