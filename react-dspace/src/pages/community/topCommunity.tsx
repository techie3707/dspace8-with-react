import { TextField, Button, Box, Typography, Paper, Alert } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useState } from 'react';
import { CreateCommunity } from '../../api/topCommunity';
import { showToast } from "../../contexts/ToastProvider";
import Loader from "../loader/loader";
const TopCommunity = () => {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const isFormValid =
        title.trim() !== "" &&
        description.trim() !== "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        try {
            setLoading(true);
            await CreateCommunity(title, description);
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error("Error creating community:", error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <Paper
  elevation={3}
  sx={{
    p: 4,
    maxWidth: 550,
    mx: "auto",
    mt: 8,
    borderRadius: 4,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    backgroundColor: "#f9f9f9",
  }}
>
  <ToastContainer />
  <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
    <Typography variant="h5" fontWeight="bold" color="secondary">
      Create a Community
    </Typography>
  </Box>

  {loading && <Loader />}

  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
    <TextField
      label="Title"
      fullWidth
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
      sx={{
        mb: 3,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
        },
      }}
    />
    <TextField
      label="Description"
      fullWidth
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      required
      multiline
      rows={4}
      sx={{
        mb: 3,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
        },
      }}
    />
    <Button
      type="submit"
      variant="contained"
      color="primary"
      fullWidth
      disabled={!isFormValid}
      sx={{
        py: 1.5,
        borderRadius: 2,
        fontWeight: "bold",
        textTransform: "none",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        },
      }}
    >
      Submit
    </Button>
  </Box>
</Paper>
    );

}
export default TopCommunity;