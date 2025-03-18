import axios from "axios";
import { siteConfig } from "../data/data";

interface RegistrationResponse {
    email: string;
    user: string; 
    type: string;
}
const csrfToken = localStorage.getItem("csrfToken") || "";
export const fetchUserByEmail = async (token: string) => {
    try {
        const response = await axios.get<RegistrationResponse>(
            `http://localhost:8080/server/api/eperson/registrations/search/findByToken?token=${token}`
        );

        return {
            email: response.data.email,
            epersonId: response.data.user
        };
    } catch (error) {
        throw new Error("Invalid token or expired link.");
    }
};

export const resetPassword = async (epersonId: string, newPassword: string, token: string) => {
    try {
        const response = await axios.patch(
            `${siteConfig.apiEndpoint}/api/eperson/epersons/${epersonId}?token=${token}`,

            [
                { op: "add", path: "/password", value: { new_password: newPassword } }
            ],
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
};

export const userRegister = async (
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    password: string,
    token: string
) => {
    try {
        const response = await axios.post(
            `${siteConfig.apiEndpoint}/api/eperson/epersons?token=${token}`,
            {
                canLogIn: true,
                email: email,
                requireCertificate: false,
                password: password,
                metadata: {
                    "eperson.firstname": [{ value: firstName }],
                    "eperson.lastname": [{ value: lastName }],
                    "eperson.phone": [{ value: phone }],
                    "eperson.language": [{ value: "en" }],
                    "dspace.agreements.end-user": [{ value: "true" }],
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
};
