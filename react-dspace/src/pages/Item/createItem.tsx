import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Box, IconButton, MenuItem, Select, Typography } from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { CreateItemProps, FormField, formFields } from "../../data/itemFormData";
import { createItem, createWorkflowItem, fetchWorkspaceItems, InsertImage } from "../../api/item";
import Loader from "../loader/loader";
import { showToast } from "../../contexts/ToastProvider";
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

const CreateItem: React.FC<CreateItemProps> = ({ collectionId }) => {
    const [formData, setFormData] = useState<Record<string, string | Date | null>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dateParts, setDateParts] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
    });
    const [loading, setLoading] = useState(false);
    const [fileUri, setFileUri] = useState<string | undefined>("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [workspaceId, setWorkspaceId] = useState<string | undefined>(
        searchParams.get('workspaceId') || undefined
    );
    const navigate = useNavigate()
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    useEffect(() => {
        if (!workspaceId) {
            const fetchAndSetWorkspaceId = async () => {
                try {
                    const workspaceItemId = await fetchWorkspaceItems(collectionId);
                    if (!workspaceItemId) {
                        console.error("Workspace ID is undefined.");
                        return;
                    }
                    setWorkspaceId(workspaceItemId);
                    searchParams.set('workspaceId', workspaceItemId);
                    setSearchParams(searchParams);
                } catch (error) {
                    console.error("Error fetching workspace ID:", error);
                }
            };

            fetchAndSetWorkspaceId();
        }
    }, [collectionId, workspaceId, searchParams, setSearchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleDateChange = (type: "year" | "month" | "day", value: number) => {
        setDateParts((prevDateParts) => {
            const newDateParts = { ...prevDateParts, [type]: value };
            const selectedDate = `${newDateParts.year}-${newDateParts.month.toString().padStart(2, "0")}-${newDateParts.day.toString().padStart(2, "0")}`;

            setFormData((prevData) => ({
                ...prevData,
                "dc.date.issued": selectedDate,
            }));

            return newDateParts;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);

            if (file.type === "application/pdf") {
                try {
                    const thumbnailBlob = await generateThumbnailFromPDF(file);
                    const renamedFile = new File([thumbnailBlob], "Thumbnail_TIT_01.jpg", { type: "image/jpeg" });
                    if (workspaceId) {
                        await InsertImage(workspaceId, renamedFile);
                    }
                } catch (error) {
                    console.error("Error generating/uploading thumbnail:", error);
                }
            }
        }
    };
    const generateThumbnailFromPDF = async (pdfFile: File): Promise<Blob> => {
        const url = URL.createObjectURL(pdfFile);

        const loadingTask = pdfjsLib.getDocument({
            url,
            maxImageSize: 1024 * 1024 * 10,
            disableFontFace: true,
        });

        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const scale = 1.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context not available.");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        const thumbCanvas = document.createElement("canvas");
        const thumbContext = thumbCanvas.getContext("2d");
        const thumbWidth = 300;
        const thumbHeight = (thumbWidth / canvas.width) * canvas.height;

        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;

        if (thumbContext) {
            thumbContext.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
        }

        URL.revokeObjectURL(url); 

        return new Promise((resolve, reject) => {
            thumbCanvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error("Failed to convert canvas to blob."))),
                "image/jpeg",
                0.9
            );
        });
    };
 


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = ["dc.title", "dc.contributor.author", "dc.type"];
        const missingFields = requiredFields.filter((field) => !formData[field]);

        if (missingFields.length > 0) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            setLoading(true);

            if (selectedFile && workspaceId) {
                try {
                    const uploadedFileUri = await InsertImage(workspaceId, selectedFile);
                    setFileUri(uploadedFileUri);

                    if (!workspaceId) return;
                    await createItem(workspaceId, formData);

                    console.log('File URI:', uploadedFileUri);
                    if (uploadedFileUri) {
                        await createWorkflowItem(uploadedFileUri);
                        showToast("Item and file submitted successfully!", "success");
                        navigate('/adminSearch')
                    }
                } catch (fileError) {
                    console.error("File upload error:", fileError);
                }
            } else {
                console.error("File or workspace ID not available.");
            }
        } catch (error) {
            alert("Failed to create item. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box className="create-item-container">
            <Typography variant="h5" gutterBottom className="create-item-title">
                Create Item
            </Typography>
            {loading && <Loader />}
            <form onSubmit={handleSubmit}>
                {formFields.map((field: FormField) => (
                    <Box key={field.id}>
                        {field.type === "textarea" ? (
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label={field.label}
                                name={field.name}
                                required={field.required}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{ className: "custom-label" }}
                            />
                        ) : field.type === "date" ? (
                            <Box className="create-item-date-container">
                                {(["year", "month", "day"] as const).map((type) => (
                                    <Box key={type} className="create-item-date-box">
                                        <IconButton onClick={() => handleDateChange(type, dateParts[type] + 1)} size="small">
                                            <ArrowDropUp fontSize="large" />
                                        </IconButton>
                                        <Select
                                            value={dateParts[type]}
                                            onChange={(e) => handleDateChange(type, Number(e.target.value))}
                                            className="create-item-select"
                                        >
                                            {Array.from(
                                                { length: type === "year" ? 200 : type === "month" ? 12 : 31 },
                                                (_, i) => (type === "year" ? new Date().getFullYear() + i - 100 : i + 1)
                                            ).map((val) => (
                                                <MenuItem key={val} value={val}>
                                                    {val}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <IconButton onClick={() => handleDateChange(type, dateParts[type] - 1)} size="small">
                                            <ArrowDropDown fontSize="large" />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Item Type"
                                        name="dc.type"
                                        required
                                        onChange={handleChange}
                                        variant="outlined"
                                        className="item_input-field type_field"
                                        InputLabelProps={{ className: "custom-label" }}
                                    />
                                </Box>
                            </Box>
                        ) : (
                            <TextField
                                fullWidth
                                label={field.label}
                                name={field.name}
                                required={field.required}
                                onChange={handleChange}
                                variant="outlined"
                                className="item_input-field"
                                InputLabelProps={{ className: "custom-label" }}
                            />
                        )}
                    </Box>
                ))}


                <Box className="upload-container" onClick={() => document.getElementById('fileInput')?.click()}>
                    <input type="file" id="fileInput" hidden onChange={handleFileChange} />
                    <Typography variant="body2" className="upload-text">
                        <span className="upload-icon">☁️</span> Upload a File
                    </Typography>
                    <Typography variant="caption" color="gray">
                        Drag and drop files here
                    </Typography>
                </Box>

                <Box className="item-submit_main">
                    {selectedFile && (
                        <Typography variant="body2" sx={{ mt: 1, color: "gray" }}>
                            Selected File: {selectedFile.name}
                        </Typography>
                    )}

                    <Button type="submit" variant="contained" color="primary" className="create-item-submit">
                        Submit
                    </Button>
                </Box>

            </form>
        </Box>
    );
};

export default CreateItem;
