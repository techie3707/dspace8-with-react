import React from "react";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const navigate = useNavigate();
  return (
    <Container maxWidth="sm" className="forgot-password-container">
      <Box className="forgot-password-box">
        <Typography variant="h4" className="forgot-password-title">
          Forgot Password
        </Typography>
        <Typography variant="body1" color="textSecondary" className="forgot-password-text">
          Enter your email, and we’ll send you a link to reset your password.
        </Typography>
        <TextField fullWidth label="Email Address" variant="outlined" margin="normal" />
        <Button fullWidth variant="contained" color="primary" className="forgot-password-button">
          Send Reset Link →
        </Button>
        <Box className="back-to-login">
          <Typography variant="body2" color="primary" className="login-link" onClick={() => navigate("/login")}>
            Back to Login
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
