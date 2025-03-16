import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    TextField, Button, Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Grid
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { addMemberToGroup, deleteGroup, editGroupDetail, EPerson, fetchGroupMembers, fetchNonMembers, removeMemberToGroup } from "../../api/group";

const EditGroup = () => {
    const location = useLocation();
    const { id, name, description } = location.state || {};

    const [groupName, setGroupName] = useState(name || "");
    const [groupDescription, setGroupDescription] = useState(description || "");
    const [isModified, setIsModified] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [members, setMembers] = useState<EPerson[]>([]);
    const [memberPage, setMemberPage] = useState(1);
    const [memberTotalPages, setMemberTotalPages] = useState(1);
    const [memberSize] = useState(5);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [nonMembers, setNonMembers] = useState<EPerson[]>([]);
    const [nonMemberPage, setNonMemberPage] = useState(1);
    const [nonMemberTotalPages, setNonMemberTotalPages] = useState(1);
    const [nonMemberSize] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        loadMembers();
    }, [id, memberPage, memberSize]);

    useEffect(() => {
        loadNonMembers();
    }, [id, nonMemberPage, nonMemberSize, searchTerm]);

    const loadMembers = async () => {
        try {
            const response = await fetchGroupMembers(id, memberPage - 1, memberSize);
            setMembers(response._embedded?.epersons || []);
            setMemberTotalPages(response.page?.totalPages || 1);
        } catch (error) {
            console.error("Error fetching group members:", error);
        }
    };

    const loadNonMembers = async () => {
        try {
            const response = await fetchNonMembers(id, nonMemberPage - 1, nonMemberSize, searchQuery);
            setNonMembers(response._embedded?.epersons || []);
            setNonMemberTotalPages(response.page?.totalPages || 1);
        } catch (error) {
            console.error("Error fetching non-members:", error);
        }
    };

    const handleAddMember = async (epersonId: string) => {
        try {
            await addMemberToGroup(id, epersonId);
            const updatedMembers = await fetchGroupMembers(id, memberPage - 1, memberSize);
            setMembers(updatedMembers._embedded?.epersons || []);
            setMemberTotalPages(updatedMembers.page?.totalPages || 1);

            const updatedNonMembers = await fetchNonMembers(id, nonMemberPage - 1, nonMemberSize);
            setNonMembers(updatedNonMembers._embedded?.epersons || []);
            setNonMemberTotalPages(updatedNonMembers.page?.totalPages || 1);
        } catch (error) {
            console.error("Failed to add member:", error);
        }
    };

    const handleRemoveMember = async (epersonId: string) => {
        try {
            await removeMemberToGroup(id, epersonId);
            const updatedMembers = await fetchGroupMembers(id, memberPage - 1, memberSize);
            setMembers(updatedMembers._embedded?.epersons || []);
            setMemberTotalPages(updatedMembers.page?.totalPages || 1);

            const updatedNonMembers = await fetchNonMembers(id, nonMemberPage - 1, nonMemberSize);
            setNonMembers(updatedNonMembers._embedded?.epersons || []);
            setNonMemberTotalPages(updatedNonMembers.page?.totalPages || 1);
        } catch (error) {
            console.error("Failed to remove member:", error);
        }
    };
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(e.target.value);
        setIsModified(true);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGroupDescription(e.target.value);
        setIsModified(true);
    };

    const handleSave = async () => {
        try {
            await editGroupDetail(id, groupName, groupDescription);
            setIsModified(false);
        } catch (error) {
            console.error("Error updating group details:", error);
        }
    };
    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteGroup(id);
            setIsModified(false);
            navigate("/groups");
        } catch (error) {
            console.error("Error deleting group:", error);
        }
    };


    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };


    const handleSearch = () => {
        setSearchTerm(searchQuery); // This will trigger the useEffect and fetch new data
    };
    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Edit Group
            </Typography>

            <TextField
                fullWidth
                label="Group Name"
                value={groupName}
                onChange={handleNameChange}
                sx={{ marginTop: 2 }}
            />

            <TextField
                fullWidth
                label="Description"
                value={groupDescription}
                onChange={handleDescriptionChange}
                sx={{ marginTop: 2 }}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <Button variant="contained" color="secondary" onClick={() => navigate("/groups")}>
                    Back
                </Button>

                <Button variant="contained" color="primary" onClick={handleSave} disabled={!isModified}>
                    Save
                </Button>

                {/* <Button variant="contained" color="error" onClick={handleDeleteClick}>
                    Delete Group
                </Button> */}
            </Box>

            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete the group?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Yes, Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Members Table */}
            <Typography variant="h6" sx={{ marginTop: 3 }}>Current Members</Typography>
            <TableContainer component={Paper} sx={{ marginTop: 1 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.length > 0 ? (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        {member.metadata?.["eperson.firstname"]?.[0]?.value}{" "}
                                        {member.metadata?.["eperson.lastname"]?.[0]?.value}
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <IconButton color="error" onClick={() => handleRemoveMember(member.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No members found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Pagination
                count={memberTotalPages}
                page={memberPage}
                onChange={(_event, value) => setMemberPage(value)}
                sx={{ display: "flex", justifyContent: "center", marginTop: "15px" }}
            />

            {/* Non-Members Table */}
            <Typography variant="h6" sx={{ marginTop: 3 }}>Non-Members</Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                    <TextField
                        label="Search people..."
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleSearch}>
                        Search
                    </Button>
                </Grid>
            </Grid>
            <TableContainer component={Paper} sx={{ marginTop: 1 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {nonMembers.length > 0 ? (
                            nonMembers.map((nonMember) => (
                                <TableRow key={nonMember.id}>
                                    <TableCell>
                                        {nonMember.metadata?.["eperson.firstname"]?.[0]?.value}{" "}
                                        {nonMember.metadata?.["eperson.lastname"]?.[0]?.value}
                                    </TableCell>
                                    <TableCell>{nonMember.email}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleAddMember(nonMember.id)}>
                                            <AddIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No non-members found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Pagination
                count={nonMemberTotalPages}
                page={nonMemberPage}
                onChange={(_event, value) => setNonMemberPage(value)}
                sx={{ display: "flex", justifyContent: "center", marginTop: "15px" }}
            />
        </Box>
    );
};

export default EditGroup;
