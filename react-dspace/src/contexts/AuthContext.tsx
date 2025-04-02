import React, { createContext, useContext, useEffect, useState } from "react";
import { login as authLogin } from "../api/authApi";
import { showToast } from "./ToastProvider";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Loading state to prevent redirect before checking auth
    const csrfToken = localStorage.getItem("csrfToken") || "";

    useEffect(() => {
        const authToken = localStorage.getItem("authToken");

        if (authToken && !isTokenExpired(authToken)) {
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem("authToken");
            setIsAuthenticated(false);
        }
        setLoading(false); // Set loading to false after checking
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authLogin(email, password);
            if (response) {
                setIsAuthenticated(true);
            }
        } catch (error) {
            showToast("Invalid credentials. Please try again.", "error");
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
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
        showToast("Error decoding JWT", "error");
        return null;
    }
};

const isTokenExpired = (token: string): boolean => {
    const decoded = parseJwt(token);
    return decoded?.exp ? decoded.exp * 1000 < Date.now() : true;
};
