import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { getAuthToken } from "../../../api/authToken";
import { getUserById, updateUser } from "../../../api/usermanagement";

interface EditUserProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  fetchUsers: () => void;
}

const EditUser: React.FC<EditUserProps> = ({ open, onClose, userId, fetchUsers }) => {
  const [userData, setUserData] = useState({ firstName: "", lastName: "", email: "" });
  const [originalData, setOriginalData] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id: string) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken") || "";
      const user = await getUserById(id, authToken);
      const userDetails = {
        firstName: user.metadata?.["eperson.firstname"]?.[0]?.value || "",
        lastName: user.metadata?.["eperson.lastname"]?.[0]?.value || "",
        email: user.email || "",
      };
      setUserData(userDetails);
      setOriginalData(userDetails); 
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const updatedFields: any = {};
  
    if (userData.firstName !== originalData.firstName) {
      updatedFields.firstName = userData.firstName;
    }
    if (userData.lastName !== originalData.lastName) {
      updatedFields.lastName = userData.lastName;
    }
    if (userData.email !== originalData.email) {
      updatedFields.email = userData.email;
    }
  
    if (Object.keys(updatedFields).length === 0) {
      console.log("No changes detected.");
      return;
    }
  
    setUpdating(true);
    try {
      const authToken = localStorage.getItem("authToken") || "";
      await updateUser(userId, updatedFields, authToken); // Ensure authToken is passed
      fetchUsers();
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setUpdating(false);
    }
  };
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "auto", my: 3 }} />
        ) : (
          <>
            <TextField
              label="First Name"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleUpdate} color="primary" disabled={updating || loading}>
          {updating ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUser;
