import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from "@mui/material";
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
      const authToken = getAuthToken() || "Bearer your_token_here";
      const user = await getUserById(id, authToken);
      setUserData({
        firstName: user.metadata?.["eperson.firstname"]?.[0]?.value || "",
        lastName: user.metadata?.["eperson.lastname"]?.[0]?.value || "",
        email: user.email || ""
      });
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
    setUpdating(true);
    try {
      const authToken = getAuthToken() || "Bearer your_token_here";
      await updateUser(userId, {
        metadata: {
          "eperson.firstname": [{ value: userData.firstName }],
          "eperson.lastname": [{ value: userData.lastName }]
        },
        email: userData.email
      }, authToken);  
  
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
              disabled
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleUpdate} color="primary" disabled={updating || loading}>
          {updating ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUser;
