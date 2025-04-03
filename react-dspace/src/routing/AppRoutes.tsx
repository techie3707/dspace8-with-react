import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
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
import Search from "../pages/Search/Search";
import { ToastProvider } from "../contexts/ToastProvider";
import CreateItem from "../pages/Item/createItem";
import BookDetails from "../pages/book-detail/bookDetails";
import PDFViewer from "../pages/PDFViewer/PDFViewer";
import PDFFlipBook from "../pages/flipBookViewer/PDFFlipBook";
import Error400 from "../pages/error/error400";
import Error401 from "../pages/error/error401";
import Error403 from "../pages/error/error403";
import Error422 from "../pages/error/error422";
import Error404 from "../pages/error/error404";
import Error500 from "../pages/error/error500";
import TopCommunity from "../pages/community/topCommunity";
import SelectCommunity from "../pages/collection/selectCommunity";
import CreateCollection from "../pages/collection/createCollection";



const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const CreateItemWrapper = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  return collectionId ? <CreateItem collectionId={collectionId} /> : <div>Invalid Collection</div>;
};

const AppRoutes = () => {
  return (
    <>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/forgot/:token" element={<Forgot />} />
        <Route path="/register/:token" element={<Register />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/adminSearch" element={<Search />} />
        <Route path="/items/:id" element={<BookDetails />} />
        <Route path="/error-400" element={<Error400 />} />   
        <Route path="/error-401" element={<Error401 />} />   
        <Route path="/error-403" element={<Error403 />} />   
        <Route path="/error-404" element={<Error404 />} />   
        <Route path="/error-422" element={<Error422 />} />   
        <Route path="/error-500" element={<Error500 />} />   
        <Route path="/pdf-viewer" element={<PDFViewer />} />
        <Route path="/flip-book-viewer" element={<PDFFlipBook />} />
        <Route path="/create-community" element={<TopCommunity />} />
        <Route path="/select-Community" element={<SelectCommunity />} />
        <Route path="/create-collection/:communityId/:titleText" element={<CreateCollection />} />
        <Route path="/usermanagement" element={<ProtectedRoute element={<UserManagement />} />} />
        <Route path="/metadataSchemas" element={<ProtectedRoute element={<MetadataSchemas />} />} />
        <Route path="/bitstream/:schemaId/:schemaName" element={<ProtectedRoute element={<Bitstream />} />} />
        <Route path="/groups" element={<ProtectedRoute element={<Groups />} />} />
        <Route path="/edit-group" element={<ProtectedRoute element={<EditGroup />} />} />
        <Route path="/batchImport" element={<ProtectedRoute element={<BatchImport />} />} />
        <Route path="/collections/:collectionId/create-item" element={<ProtectedRoute element={<CreateItemWrapper />} />}  />
      </Routes>
    </>
  );
};

export default AppRoutes;
