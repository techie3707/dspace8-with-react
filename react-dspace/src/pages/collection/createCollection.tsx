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
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 400, margin: "auto", marginTop: 5 }}>
            <ToastContainer />
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">{`Create a Collection for Community ${titleText}`}</Typography>
            </Box>
            {loading && <Loader />}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required sx={{ mb: 2 }} />
                <TextField label="Description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} required sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={!isFormValid}>
                    Submit
                </Button>
            </Box>
        </Paper>
    );

}
export default CreateCollection;