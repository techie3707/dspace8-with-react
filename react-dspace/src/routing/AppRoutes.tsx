import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import SignUp from "../pages/SignUp/SignUp";
import UserManagement from "../pages/access-control/userManagement";
import MetadataSchemas from "../pages/Registries/MetadataSchemas";
import Bitstream from "../pages/Registries/Bitstream";
import Groups from "../pages/Group/Group";
import EditGroup from "../pages/Group/EditGroup";
import BatchImport from "../pages/BatchImport/BatchImport";
import { useAuth } from "../contexts/AuthContext";
import Forgot from "../pages/forgot/forgot";
import Register from "../pages/Register/Register";


const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/forgot/:token" element={<Forgot />} />
      <Route path="/register/:token" element={<Register />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/usermanagement" element={<ProtectedRoute element={<UserManagement />} />} />
      <Route path="/metadataSchemas" element={<ProtectedRoute element={<MetadataSchemas />} />} />
      <Route path="/bitstream/:schemaId/:schemaName" element={<ProtectedRoute element={<Bitstream />} />} />
      <Route path="/groups" element={<ProtectedRoute element={<Groups />} />} />
      <Route path="/edit-group" element={<ProtectedRoute element={<EditGroup />} />} />
      <Route path="/batchImport" element={<ProtectedRoute element={<BatchImport />} />} />
    </Routes>
  );
};

export default AppRoutes;
