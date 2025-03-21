import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Box, IconButton, MenuItem, Select, Typography } from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { FormField, formFields } from "../../data/itemFormData";
import { createItem } from "../../api/item";

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
            await createItem(collectionId, formData);
        } catch (error) {
            alert("Failed to create item. Please try again.");
        }
    };

    return (
        <Box sx={{ maxWidth: 500, margin: "auto", p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Create Item
            </Typography>
            <form onSubmit={handleSubmit}>
                {formFields.map((field: FormField) => (
                    <Box key={field.id} sx={{ mb: 2 }}>
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
                            />
                        ) : field.type === "date" ? (
                            <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                                {(["year", "month", "day"] as const).map((type) => (
                                    <Box key={type} display="flex" flexDirection="column" alignItems="center">
                                        <IconButton onClick={() => handleDateChange(type, dateParts[type] + 1)}>
                                            <ArrowDropUp />
                                        </IconButton>
                                        <Select
                                            value={dateParts[type]}
                                            onChange={(e) => handleDateChange(type, Number(e.target.value))}
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
                                        <IconButton onClick={() => handleDateChange(type, dateParts[type] - 1)}>
                                            <ArrowDropDown />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <TextField
                                fullWidth
                                label={field.label}
                                name={field.name}
                                required={field.required}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        )}
                    </Box>
                ))}
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Item Type"
                        name="dc.type"
                        required
                        onChange={handleChange}
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Button variant="contained" component="label" fullWidth>
                        Upload File
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                    {selectedFile && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Selected File: {selectedFile.name}
                        </Typography>
                    )}
                </Box>

                <Button type="submit" variant="contained" color="primary">
                    Submit
                </Button>
            </form>
        </Box>
    );
};

export default CreateItem;
