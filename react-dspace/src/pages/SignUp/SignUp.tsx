import React, { useState } from "react";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import { siteConfig } from "../../data/data";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import { register } from "../../api/authApi";
import Loader from "../loader/loader";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      await register(email);
      window.location.href = "/";
    } catch (err: any) {
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="signup-container">
      <Box className="signup-box">
        <Typography variant="h4" className="signup-title item_header">
          Create an {siteConfig.name} Account
        </Typography>

        {loading && (
          <Typography align="center" style={{ marginTop: 16 }}>
            <Loader />
          </Typography>
        )}

        {error && (
          <Typography color="error" align="center" style={{ marginTop: 16 }}>
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Email Address"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={handleEmailChange}
          error={email.length > 0 && !isValidEmail}
          helperText={email.length > 0 && !isValidEmail ? "Enter a valid email address" : ""}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className="signup-button"
          onClick={handleSignUp}
          disabled={!isValidEmail || loading}
        >
          Sign Up →
        </Button>
        <Box className="already-have-account">
          <Typography variant="body2" color="textSecondary">
            Already have an account?
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            className="login-link"
            onClick={() => navigate("/login")}
          >
            Log in
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp;
