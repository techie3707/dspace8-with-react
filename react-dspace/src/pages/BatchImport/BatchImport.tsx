import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { uploadBatchImport } from "../../api/batchImport";
import { fetchCollections } from "../../api/collection";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../contexts/ToastProvider";
import { useUserGroups } from "../../contexts/groupTypeContext";

const BatchImport: React.FC = () => {
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationChecked, setValidationChecked] = useState(false);
  const [workflowChecked, setWorkflowChecked] = useState(false);
  const navigate = useNavigate();
  
  const { groupCategories, isAdministrator } = useUserGroups();

  const getCollectionsToDisplay = () => {
    if (isAdministrator) {
      return collections;
    }

    const uploadGroups = groupCategories.upload.map(group => 
      group.name.replace('_Upload', '')
    );
    
    const adminGroups = groupCategories.admin.map(group =>
      group.name.replace('_Admin', '')
    );

    const allAccessGroups = Array.from(new Set([...uploadGroups, ...adminGroups]));    
    return collections.filter(collection => 
      allAccessGroups.includes(collection.name)
    );
  };

  const collectionsToDisplay = getCollectionsToDisplay();

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch((error) => console.error("Error fetching collections:", error));
  }, []);

  const handleCollectionChange = (event: SelectChangeEvent<string>) => {
    setSelectedCollection(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".zip")) {
      setSelectedFile(file);
    } else {
      showToast("Only .zip files are allowed.", "error");
      setSelectedFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCollection || !selectedFile) {
      showToast("Please select a collection and a ZIP file.", "error");
      return;
    }

    setIsLoading(true);

    try {
      let properties;
      
      if (!validationChecked && !workflowChecked) {
        // Both unchecked
        properties = [
          { name: "--add" },
          { name: "--zip", value: selectedFile.name },
          { name: "--collection", value: selectedCollection }
        ];
      } else if (validationChecked && !workflowChecked) {
        // Only validation checked
        properties = [
          { name: "--add" },
          { name: "--zip", value: selectedFile.name },
          { name: "--collection", value: selectedCollection },
          { name: "-v", value: true }
        ];
      } else if (!validationChecked && workflowChecked) {
        // Only workflow checked
        properties = [
          { name: "--add" },
          { name: "--zip", value: selectedFile.name },
          { name: "--collection", value: selectedCollection },
          { name: "-w", value: true }
        ];
      } else {
        // Both checked
        properties = [
          { name: "-a", value: true },
          { name: "-c", value: selectedCollection },
          { name: "-z", value: selectedFile.name },
          { name: "-w", value: true }
        ];
      }

      const response = await uploadBatchImport(selectedCollection, selectedFile, properties);

      if (response.status === 202) {
        alert("ZIP file uploaded successfully!");
        navigate("/");
      }
    } catch (error) {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, maxWidth: 600, margin: "auto", marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        Import Batch
      </Typography>
      <Typography variant="body1" gutterBottom>
        Select the Collection to import into. Then, drop or browse to a Simple Archive Format (SAF) zip file that includes the items to import.
      </Typography>

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <Select
          value={selectedCollection}
          onChange={handleCollectionChange}
          displayEmpty
          renderValue={
            selectedCollection !== ''
              ? () => collectionsToDisplay.find(col => col.id === selectedCollection)?.name
              : () => <span style={{ color: '#aaa' }}>Select Collection</span>
          }
        >
          {collectionsToDisplay.map((collection) => (
            <MenuItem key={collection.id} value={collection.id}>
              {collection.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={validationChecked}
              onChange={e => setValidationChecked(e.target.checked)}
            />
          }
          label="Validation"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={workflowChecked}
              onChange={e => setWorkflowChecked(e.target.checked)}
            />
          }
          label="Workflow"
        />
      </Box>

      <label htmlFor="file-upload" className="b_import_label">
        <Box
          className="upload-container"
          sx={{
            border: "2px dashed gray",
            padding: 3,
            textAlign: "center",
            marginTop: 2,
            cursor: "pointer",
            backgroundColor: "#f9f9f9",
          }}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            type="file"
            id="file-upload"
            accept=".zip"
            hidden
            onChange={handleFileChange}
          />
          <Typography variant="body2" className="upload-text">
            <span className="upload-icon">☁️</span> Upload a ZIP File
          </Typography>
          <Typography variant="caption" color="gray">
            {selectedFile ? selectedFile.name : "Only .zip files are allowed"}
          </Typography>
        </Box>
      </label>

      <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={3}>
        <Button variant="contained" color="secondary" onClick={() => navigate(-1)} disabled={isLoading}>
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