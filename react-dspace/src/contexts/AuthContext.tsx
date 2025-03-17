import React, { createContext, useContext, useEffect, useState } from "react";
import { login as authLogin } from "../api/authApi";


interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const csrfToken = localStorage.getItem("csrfToken") || "";

    useEffect(() => {
        const authToken = localStorage.getItem("authToken");

        if (authToken && !isTokenExpired(authToken)) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            localStorage.removeItem("authToken");
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authLogin(email, password, csrfToken ?? "");
            if (response) {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
    };

    return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const parseJwt = (token: string): { exp?: number } | null => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));
        return decodedPayload;
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
};

const isTokenExpired = (token: string): boolean => {
    const decoded = parseJwt(token);
    return decoded?.exp ? decoded.exp * 1000 < Date.now() : true;
};
