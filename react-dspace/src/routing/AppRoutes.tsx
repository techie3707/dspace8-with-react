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
import AdvanceSearch from "../pages/Search/AdvanceSearch";
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
import UserProfile from "../pages/UserProfile/UserProfile";
import EditItem from "../pages/Item/editItem";
import AddBitstream from "../pages/addBitstream/addBitstream";
import EditCommunity from "../pages/EditCommunityCollection/editCommunity";
import Workflow from "../pages/workflow/workflow";
import RemoveItem from "../pages/workflow/removeItem";
import ResourcePolicy from "../pages/workflow/resourcePolicy";
import SupervisionSelecter from "../pages/workflow/supervisionSelecter";
import CreateResourcePolicy from "../pages/workflow/createResourcePolicy";
import Policies from "../pages/collection/policy";
import CreatePolicy from "../pages/collection/createPolicy";
import MyCart from "../pages/my-cart/MyCart";
import SystemInformation from "../pages/system-information/system-information";
import UserListTable from "../pages/reports/UserListWithGroups";
import ItemReportTable from "../pages/reports/ItemListTable";
import Processes from "../pages/processes/processes";
import AssignRole from "../pages/assignRole/AssignRole";
import WorkflowTask from "../pages/workflow/workflowTask";


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
const UserProfileWrapper = () => {
  const { userId } = useParams<{ userId: string }>();
  if (!userId) return null;

  return <UserProfile userId={userId} />;
};
const UserCartWrapper = () => {
  const { userId } = useParams<{ userId: string }>();
  if (!userId) return null;

  return <MyCart userId={userId} />;
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
        <Route path="/advanceSearch" element={<AdvanceSearch />} />
        <Route path="/items/:id" element={<BookDetails />} />
        <Route path="/error-400" element={<Error400 />} />
        <Route path="/error-401" element={<Error401 />} />
        <Route path="/error-403" element={<Error403 />} />
        <Route path="/error-404" element={<Error404 />} />
        <Route path="/error-422" element={<Error422 />} />
        <Route path="/error-500" element={<Error500 />} />
        <Route path="/pdf-viewer" element={<PDFViewer />} />
        <Route path="/flip-book-viewer" element={<PDFFlipBook />} />
        <Route path="/edit-Community-Collection" element={<EditCommunity />} />
        <Route path="/createPolicies/:uuid" element={<CreatePolicy />} />
        <Route path="/policies/:id" element={<Policies />} />
        <Route path="/assignRole/:id" element={<AssignRole />} />
        <Route path="/edit-item/:itemId" element={<EditItem />} />
        <Route path="/add-bitstream/:itemId" element={<AddBitstream />} />
        <Route path="/workflowSearch" element={<Workflow />} />
        <Route path="/WorkflowTask" element={<WorkflowTask />} />
        <Route path="/removeWorkflowItem/:id" element={<RemoveItem />} />
        <Route path="/resourcePolicy/:id" element={<ResourcePolicy />} />
        <Route path="/processes" element={<Processes />} />
        <Route path="/supervisionSelecter/:uuid" element={<SupervisionSelecter />} />
        <Route path="/createResourcePolicy/:uuid" element={<CreateResourcePolicy />} />
        <Route path="/usermanagement" element={<ProtectedRoute element={<UserManagement />} />} />
        <Route path="/report/user" element={<ProtectedRoute element={<UserListTable />} />} />
        <Route path="/report/item" element={<ProtectedRoute element={<ItemReportTable />} />} />
        <Route path="/userProfile/:userId" element={<ProtectedRoute element={<UserProfileWrapper />} />}/>
        <Route path="/userCart/:userId" element={<ProtectedRoute element={<UserCartWrapper />} />}/>
        <Route path="/metadataSchemas" element={<ProtectedRoute element={<MetadataSchemas />} />} />
        <Route path="/bitstream/:schemaId/:schemaName" element={<ProtectedRoute element={<Bitstream />} />} />
        <Route path="/groups" element={<ProtectedRoute element={<Groups />} />} />
        <Route path="/edit-group" element={<ProtectedRoute element={<EditGroup />} />} />
        <Route path="/batchImport" element={<ProtectedRoute element={<BatchImport />} />} />
        <Route path="/collections/:collectionId/create-item" element={<ProtectedRoute element={<CreateItemWrapper />} />} />
        <Route path="/system-information" element={<ProtectedRoute element={<SystemInformation />} />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
