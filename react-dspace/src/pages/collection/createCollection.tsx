import { TextField, Button, Box, Typography, Paper, Alert } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useState } from 'react';
import { showToast } from "../../contexts/ToastProvider";
import { AddCollection } from "../../api/collection";
import { useParams } from "react-router-dom";
import Loader from "../loader/loader";
const CreateCollection = () => {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const { communityId } = useParams<{ communityId: string }>();
    const {titleText} = useParams<{ titleText: string }>();
    const [loading, setLoading] = useState<boolean>(false);

    const isFormValid =
        title.trim() !== "" &&
        description.trim() !== "";

    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!isFormValid) return;
         try {
            if (!communityId) {
                throw new Error("Community ID is required");
            }
            setLoading(true);
            await AddCollection(communityId, title, description);
            setTitle('');
            setDescription('');
         }catch(error){
            showToast("Error creating collection", "error");
    } finally {
            setLoading(false);
    }
}
    return (
        <Paper
  elevation={3}
  sx={{
    p: 4,
    maxWidth: 600,
    mx: "auto",
    mt: 8,
    borderRadius: 4,
    backgroundColor: "#fdfdfd",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  }}
>
  <ToastContainer />
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    mb={2}
  >
    <Typography variant="h5" fontWeight="bold" color="primary">
      {`Create a Collection for Community ${titleText}`}
    </Typography>
  </Box>

  {loading && <Loader />}

  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
          backgroundColor: "#fff",
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
          backgroundColor: "#fff",
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
        fontSize: "1rem",
        transition: "all 0.3s ease",
        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
        "&:hover": {
          boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
          backgroundColor: "primary.dark",
        },
      }}
    >
      Submit
    </Button>
  </Box>
</Paper>
    );

}
export default CreateCollection;