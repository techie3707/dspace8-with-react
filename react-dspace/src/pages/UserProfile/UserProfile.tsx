import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Box,
} from '@mui/material';
import { getUserById } from '../../api/usermanagement';

type UserProfileProps = {
  userId: string;
};

type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
};

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserDetails>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [originalData, setOriginalData] = useState<UserDetails>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id: string) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const user = await getUserById(id, authToken);

      const userDetails: UserDetails = {
        firstName: user.metadata?.['eperson.firstname']?.[0]?.value || '',
        lastName: user.metadata?.['eperson.lastname']?.[0]?.value || '',
        email: user.email || '',
      };

      setUserData(userDetails);
      setOriginalData(userDetails);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserDetails, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setUserData(originalData);
    setIsEditing(false);
  };

  const handleSave = () => {
    setOriginalData(userData);
    setIsEditing(false);
  };

  const handleResetPassword = () => {
    alert("Reset password functionality goes here.");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Field</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>
              {isEditing ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  value={userData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
              ) : (
                userData.firstName
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Name</TableCell>
            <TableCell>
              {isEditing ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  value={userData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              ) : (
                userData.lastName
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>
              {isEditing ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  value={userData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              ) : (
                userData.email
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Box display="flex" justifyContent="space-between" p={2}>
        <Button variant="outlined" color="error" onClick={handleResetPassword}>
          Reset Password
        </Button>
        {isEditing ? (
          <Box>
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 1 }}>
              Save
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        ) : (
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </Box>
    </TableContainer>
  );
};

export default UserProfile;
