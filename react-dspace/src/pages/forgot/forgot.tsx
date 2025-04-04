import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper, Alert } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CloseIcon from "@mui/icons-material/Close";
import { fetchUserByEmail, resetPassword } from "../../api/forgotPassword";
import { login } from "../../api/authApi";
import Loader from "../loader/loader";

const Forgot: React.FC = () => {
  const { token } = useParams();
  const [email, setEmail] = useState("");
  const [epersonId, setEpersonId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isFormValid = password.length >= 8 && password === confirmPassword;

  useEffect(() => {
    const loadUserData = async () => {
      if (!token) {
        setError("Invalid or missing token.");
        setLoading(false);
        return;
      }
      try {
        const { email, epersonId } = await fetchUserByEmail(token);
        setEmail(email);
        setEpersonId(epersonId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      if (!epersonId) {
        throw new Error("User ID not found. Unable to reset password.");
      }
      await resetPassword(epersonId, password, token!);
      toast.success("Password reset successfully!");
       await login(email, password);
       window.location.href = "/"; 
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  if (loading) return <Typography><Loader /></Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper elevation={3} sx={{ padding: 3, maxWidth: 400, margin: "auto", marginTop: 5 }}>
      <ToastContainer />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Reset Password</Typography>
        <CloseIcon />
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField label="Email address" fullWidth value={email} disabled sx={{ mb: 2 }} />

        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={password}
          onChange={handlePasswordChange}
          required
          error={!!passwordError}
          helperText={passwordError}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          error={password !== confirmPassword}
          helperText={password !== confirmPassword ? "Passwords do not match." : ""}
          sx={{ mb: 2 }}
        />

        {!isFormValid && <Alert severity="error">Passwords must match and be at least 8 characters.</Alert>}

        <Button type="submit" variant="contained" color="primary" fullWidth disabled={!isFormValid}>
          Submit
        </Button>
      </Box>
    </Paper>
  );
};

export default Forgot;
