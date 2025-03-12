import React, { useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { siteConfig } from "../../data/data";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      toast.success("Login successful!", { position: "top-right" }); 
      navigate("/");
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Invalid email or password.", { position: "top-right" }); 
      } else {
        toast.error("An error occurred. Please try again.", { position: "top-right" }); 
      }
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" className="login-container">
      <Box className="login-box">
        <Typography variant="h4" className="login-title">
          Log in to {siteConfig.name}
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          fullWidth
          label="Email or Username"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className="login-button"
          onClick={handleLogin}
        >
          Login →
        </Button>
        <FormControlLabel
          control={<Checkbox color="primary" />}
          label="Remember me"
          className="remember-me"
        />
        <Box className="account-section">
          <Typography variant="body2" color="textSecondary">
            Don’t have an account?
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            className="create-account-button"
            onClick={() => navigate("/signUp")}
          >
            Create an {siteConfig.name} account →
          </Button>
        </Box>
        <Typography
          variant="body2"
          color="primary"
          className="forgot-link"
          onClick={() => navigate("/forgotPassword")}
        >
          Forgot your account? Contact {siteConfig.name} support
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
