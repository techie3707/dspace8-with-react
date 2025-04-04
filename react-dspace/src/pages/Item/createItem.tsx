import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Box, IconButton, MenuItem, Select, Typography } from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { FormField, formFields } from "../../data/itemFormData";
import { createItem } from "../../api/item";
import Loader from "../loader/loader";

interface CreateItemProps {
    collectionId: string;
}

const CreateItem: React.FC<CreateItemProps> = ({ collectionId }) => {
    const [formData, setFormData] = useState<Record<string, string | Date | null>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dateParts, setDateParts] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
    });
    const [loading, setLoading] = useState(false);

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
                "dc.date.created": selectedDate,
            }));

            return newDateParts;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
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
            await createItem(collectionId, formData);
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
