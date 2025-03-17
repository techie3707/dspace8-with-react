import React, { useState } from "react";
import { TextField, Button, Box, Typography, Modal, Paper, IconButton } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./addUser.css";
import CloseIcon from "@mui/icons-material/Close";
import { addUser } from "../../../api/usermanagement";
interface AddUserProps {
    open: boolean;
    onClose: () => void;
    fetchUsers: () => void;
}

const AddUser: React.FC<AddUserProps> = ({ open, onClose, fetchUsers }) => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const userData = {
            name: formData.email,
            metadata: {
                "eperson.firstname": [
                    { value: formData.firstname, language: null, authority: "", confidence: -1 }
                ],
                "eperson.lastname": [
                    { value: formData.lastname, language: null, authority: "", confidence: -1 }
                ]
            },
            email: formData.email,
            canLogIn: true,
            requireCertificate: false,
            selfRegistered: true,
            type: "eperson"
        };

        try {
            await addUser(userData);
            toast.success("User added successfully!");
            fetchUsers();
            onClose();
        } catch (error) {
            toast.error("Failed to add user. Please try again.");
        }
    };
    return (
        <Modal open={open} onClose={onClose}>
            <Paper className="modal-paper">
                <div className="modal-header-container">
                    <Typography className="modal-header">Add New User</Typography>
                    <IconButton onClick={onClose} className="close-icon">
                        <CloseIcon />
                    </IconButton>
                </div>

                <Box component="form" onSubmit={handleSubmit} className="modal-form">
                    <TextField
                        label="First Name"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        fullWidth
                        required
                        className="custom-textfield"
                    />

                    <TextField
                        label="Last Name"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        fullWidth
                        required
                        className="custom-textfield"
                    />

                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        fullWidth
                        required
                        className="custom-textfield"
                    />
                    <Box className="modal-footer">
                        <button type="submit" className="add-user-btn">
                            <span className="btn-text">Add User</span>
                            <span className="btn-icon">→</span>
                        </button>
                    </Box>

                </Box>
            </Paper>

        </Modal>
    );
};

export default AddUser;
