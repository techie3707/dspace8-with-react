import React, { createContext, useContext, useEffect, useState } from "react";
import { login as authLogin } from "../api/authApi"; 
import { useCsrf } from "../contexts/CsrfContext";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const { csrfToken } = useCsrf(); 
    useEffect(() => {
        const authToken = localStorage.getItem("authToken");
        setIsAuthenticated(!!authToken);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authLogin(email, password, csrfToken ?? ""); 
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
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
