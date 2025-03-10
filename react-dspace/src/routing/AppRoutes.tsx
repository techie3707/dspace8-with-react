import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import SignUp from "../pages/SignUp/SignUp";
import UserManagement from "../pages/access-control/userManagement";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/usermanagement" element={< UserManagement/>} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/signUp" element={<SignUp />} />
    </Routes>
  );
};

export default AppRoutes;
