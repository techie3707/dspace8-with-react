import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadBatchImport } from "../../api/batchImport";
import { fetchCollections } from "../../api/collection";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../contexts/ToastProvider";

const BatchImport: React.FC = () => {
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch((error) => console.error("Error fetching collections:", error));
  }, []);

  const handleCollectionChange = (event: SelectChangeEvent<string>) => {
    setSelectedCollection(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCollection || !selectedFile) {
      showToast("Please select a collection and a ZIP file.", "error");
      return;
    }

    setIsLoading(true); 

    try {
      const response = await uploadBatchImport(selectedCollection, selectedFile);

      if (response.status === 202) {
        showToast("Batch import uploaded successfully!", "success");
        navigate("/");
      } else {
        showToast("Upload completed but did not return 202.", "info");
      }
    } catch (error) {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, maxWidth: 600, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Import Batch
      </Typography>
      <Typography variant="body1" gutterBottom>
        Select the Collection to import into. Then, drop or browse to a Simple Archive Format (SAF) zip file that includes the items to import.
      </Typography>

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Select Collection</InputLabel>
        <Select value={selectedCollection} onChange={handleCollectionChange}>
          {collections.map((collection) => (
            <MenuItem key={collection.id} value={collection.id}>
              {collection.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <input type="file" accept=".zip" style={{ display: "none" }} id="file-upload" onChange={handleFileChange} />
      <label htmlFor="file-upload">
        <Box
          sx={{
            border: "2px dashed gray",
            padding: 3,
            textAlign: "center",
            marginTop: 2,
            cursor: "pointer",
            backgroundColor: "#f9f9f9",
          }}
        >
          <CloudUploadIcon fontSize="large" color="action" />
          <Typography variant="body2" gutterBottom>
            {selectedFile ? selectedFile.name : "Drop a batch ZIP to import, or browse"}
          </Typography>
        </Box>
      </label>

      <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={3}>
        <Button variant="contained" color="secondary" disabled={isLoading}>
          Back
        </Button>

        {isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedCollection || !selectedFile || isLoading}
            onClick={handleSubmit}
          >
            Proceed
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default BatchImport;
