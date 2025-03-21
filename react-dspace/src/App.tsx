import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Content from "./layout/Content/Content";
import Sidebar from "./layout/Sidebar/Sidebar";
import { SidebarProvider } from "./contexts/sidebarContext";
import { CsrfProvider } from "./contexts/CsrfContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthTokenProvider } from "./contexts/AuthTokenContext";

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth(); 

  return (
    <SidebarProvider>
      <div className="app">
        {!isAuthenticated && <Sidebar />}
        <Content /> 
      </div>
    </SidebarProvider>
  );
};

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <CsrfProvider>
        <AuthTokenProvider>
          <AuthProvider>
            <Router> 
              <AppContent />
            </Router>
          </AuthProvider>
        </AuthTokenProvider>
      </CsrfProvider>
    </React.StrictMode>
  );
};

export default React.memo(App);
