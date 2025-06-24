import React, { useState } from "react";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ForgotPassword.css";
import { forgotPassword } from "../../api/authApi";
import Loader from "../loader/loader";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setLoading(true);
        try {
            setLoading(true);
            await forgotPassword(email);
            toast.success("Password reset link sent to your email.");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" className="forgot-password-container">
             {loading && <Loader />}
            <Box className="forgot-password-box">
                <Typography variant="h4" className="forgot-password-title item_header">
                    Forgot Password
                </Typography>
                <Typography variant="body1" color="textSecondary" className="forgot-password-text">
                    Enter your email, and we’ll send you a link to reset your password.
                </Typography>
                <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="forgot-password-button"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Link →"}
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
