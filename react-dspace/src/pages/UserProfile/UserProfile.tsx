import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { Person, Email, Visibility } from '@mui/icons-material';
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
    alert('Reset password functionality goes here.');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 6,
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {/* Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6e00ff, #b72eff)',
          textAlign: 'center',
          p: 3,
        }}
      >
        <Typography variant="h6" color="white">
          {userData.firstName} {userData.lastName}
        </Typography>
        <Avatar
          sx={{
            mx: 'auto',
            mt: 2,
            width: 64,
            height: 64,
            bgcolor: 'white',
            color: '#6e00ff',
          }}
        >
          <Person />
        </Avatar>
      </Box>

      {/* Profile Info */}
      <Box p={3}>
        {[
          {
            icon: <Person color="primary" />,
            label: 'First Name',
            value: userData.firstName,
            key: 'firstName',
          },
          {
            icon: <Person color="primary" />,
            label: 'Last Name',
            value: userData.lastName,
            key: 'lastName',
          },
          {
            icon: <Email color="primary" />,
            label: 'Email',
            value: userData.email,
            key: 'email',
          },
          {
            icon: <Visibility color="primary" />,
            label: 'Password',
            value: '********',
            key: 'password',
            disabled: true,
          },
        ].map(({ icon, label, value, key, disabled }) => (
          <Box key={key} display="flex" alignItems="center" mb={2}>
            <Box mr={2}>{icon}</Box>
            {isEditing && key !== 'password' ? (
              <TextField
                label={label}
                value={userData[key as keyof UserDetails]}
                onChange={(e) => handleChange(key as keyof UserDetails, e.target.value)}
                variant="standard"
                fullWidth
              />
            ) : (
              <Typography>{value}</Typography>
            )}
          </Box>
        ))}

        {/* Buttons */}
        <Box mt={4} textAlign="center">
          <Button
            onClick={handleResetPassword}
            variant="outlined"
            color="error"
            sx={{ textTransform: 'none', borderRadius: 3, mb: 2 }}
          >
            Reset Password
          </Button>
          <br />
          {isEditing ? (
            <>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  mr: 2,
                  borderRadius: 3,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6e00ff, #b72eff)',
                }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ borderRadius: 3, textTransform: 'none' }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6e00ff, #b72eff)',
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default UserProfile;