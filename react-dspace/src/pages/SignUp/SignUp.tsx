import React from "react";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import { siteConfig } from "../../data/data";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";


const SignUp = () => {
    const navigate = useNavigate();
  return (
    <Container maxWidth="sm" className="signup-container">
      <Box className="signup-box">
        <Typography variant="h4" className="signup-title">
          Create an {siteConfig.name} Account
        </Typography>
        <TextField fullWidth label="Full Name" variant="outlined" margin="normal" />
        <TextField fullWidth label="Email Address" variant="outlined" margin="normal" />
        <TextField fullWidth label="Password" type="password" variant="outlined" margin="normal" />
        <TextField fullWidth label="Confirm Password" type="password" variant="outlined" margin="normal" />
        <Button fullWidth variant="contained" color="primary" className="signup-button">
          Sign Up →
        </Button>
        <Box className="already-have-account">
          <Typography variant="body2" color="textSecondary">
            Already have an account?
          </Typography>
          <Typography variant="body2" color="primary" className="login-link"  onClick={() => navigate("/login")}>
            Log in
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp;
