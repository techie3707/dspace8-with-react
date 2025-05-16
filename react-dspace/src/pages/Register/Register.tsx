import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper, Alert, IconButton, Grid } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CloseIcon from "@mui/icons-material/Close";
import { fetchUserByEmail, userRegister } from "../../api/forgotPassword";
import { login } from "../../api/authApi";
import Loader from "../loader/loader";

const Register: React.FC = () => {
    const { token } = useParams();
    const [email, setEmail] = useState("");
    const [epersonId, setEpersonId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const isFormValid =
        password.length >= 8 &&
        password === confirmPassword &&
        firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        phone.trim() !== "";

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
            await userRegister(firstName, lastName, phone, email, password, token!);
            toast.success("User registered successfully.");
            await login(email, password);
            window.location.href = "/"; 
        } catch (err: any) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
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

    if (loading) return <Typography><Loader /> </Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
<Paper
  elevation={6}
  sx={{
    padding: 4,
    maxWidth: 500,
    margin: "auto",
    marginTop: 8,
    marginBottom:6,
    borderRadius: 3,
    backgroundColor: "#fafafa",
  }}
>
  <ToastContainer />

  <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
    <Typography variant="h5" fontWeight="bold">
      User Registration
    </Typography>
 
  </Box>

  <Box component="form" onSubmit={handleSubmit}>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="First Name"
          fullWidth
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Last Name"
          fullWidth
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </Grid>
    </Grid>

    <TextField
      label="Email Address"
      fullWidth
      value={email}
      disabled
      sx={{ mt: 2 }}
    />

    <TextField
      label="Phone Number"
      fullWidth
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      required
      sx={{ mt: 2 }}
    />

    <TextField
      label="New Password"
      type="password"
      fullWidth
      value={password}
      onChange={handlePasswordChange}
      required
      error={!!passwordError}
      helperText={passwordError}
      sx={{ mt: 2 }}
    />

    <TextField
      label="Confirm Password"
      type="password"
      fullWidth
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
      error={password !== confirmPassword}
      helperText={password !== confirmPassword ? "Passwords do not match." : ""}
      sx={{ mt: 2 }}
    />

    {!isFormValid && (
      <Alert severity="error" sx={{ mt: 2 }}>
        All fields are required. Passwords must match and be at least 8 characters.
      </Alert>
    )}

    <Button
      type="submit"
      variant="contained"
      fullWidth
      color="primary"
      disabled={!isFormValid}
      sx={{
        mt: 3,
        textTransform: "none",
        fontWeight: "bold",
        py: 1.5,
        borderRadius: 2,
      }}
    >
      Register
    </Button>
  </Box>
</Paper>


    );
};

export default Register;
