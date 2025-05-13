import React, { useState } from "react";
import { TextField, Button, Box, Typography, Modal, Paper, IconButton } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./addUser.css";
import CloseIcon from "@mui/icons-material/Close";
import { addUser } from "../../../api/usermanagement";
import Loader from "../../loader/loader";
import AccessManagement from "../accessManagement/accessManagement";
import { addMemberToGroup } from "../../../api/group";
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
    const [loading, setLoading] = useState(false)
    const [accessModalOpen, setAccessModalOpen] = useState<boolean>(false);
    const [selectedGroups, setSelectedGroups] = useState<{ uuid: string; groupName: string }[]>([]);
    const [formValid, setFormValid] = useState(false);


     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newFormData);
        
        setFormValid(
            newFormData.firstname.trim() !== "" && 
            newFormData.lastname.trim() !== "" && 
            newFormData.email.trim() !== ""
        );
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
            setLoading(true);
            const createdUser = await addUser(userData) as { id: string };

            if (selectedGroups.length > 0) {
                await Promise.all(
                    selectedGroups.map(group =>
                        addMemberToGroup(group.uuid, createdUser.id)
                    )
                );
            }
            fetchUsers();
            onClose();
             setFormData({
                firstname: "",
                lastname: "",
                email: "",
            });
            setSelectedGroups([]);
        } catch (error) {
            toast.error("Failed to add user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccess = () => {
        setAccessModalOpen(true);
    }

    const handleAccessSubmit = (groups?: { uuid: string; groupName: string }[]) => {
        if (groups) {
            setSelectedGroups(groups);
        }
        setAccessModalOpen(false);
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
                {loading && <Loader />}
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
                    <Box sx={{ display: 'flex'}}>
                        <button
                            type="button"
                            onClick={handleAccess}
                            className="add-user-btn"
                            style={{  position: 'relative',right:'12px', marginTop: '30px'}} 
                        >
                            <span className="btn-text">Collection Wise Permission</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="add-user-btn"
                            style={{  position: 'relative', left:'12px', marginTop: '30px',transition: 'none'}}>
                            <span className="btn-text">Add User</span>
                            <span className="btn-icon">→</span>
                        </button>
                    </Box>
                </Box>
                <AccessManagement
                    open={accessModalOpen}
                    onClose={handleAccessSubmit}
                    userId={null}
                />
            </Paper>

        </Modal>
    );
};

export default AddUser;
