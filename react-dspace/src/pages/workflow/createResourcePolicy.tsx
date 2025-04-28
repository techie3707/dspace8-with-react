import { Box, Container, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Pagination } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { actionType, policies, ResourcePolicyData } from '../../data/workflowdata';
import { EPerson, userList } from '../../api/usermanagement';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AddResourcePolicy } from '../../api/workflow';



const CreateResourcePolicy = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ResourcePolicyData>({
        name: "",
        description: null,
        policyType: "",
        action: "",
        startDate: null,
        endDate: null,
        type: {
            value: "resourcepolicy"
        }
    });
    const [selectedEperson, setSelectedEperson] = useState<string>("");
    const [users, setUsers] = useState<EPerson[]>([]);
    const [loading, setLoading] = useState<boolean>(true); 
    const [page, setPage] = useState<number>(1);
    const [size] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { uuid } = useParams<{ uuid: string }>();

    const fetchUsers = async (page: number, size: number, query: string) => {
        setLoading(true);
        try {
            const data = await userList(page - 1, size, query);
            setUsers(data.epersons);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page, size, searchQuery);
    }, [page, size]);

    const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectEperson = (epersonId: string) => {
        setSelectedEperson(epersonId);
    };

    const handleSubmit = async () => {
        if (!uuid || !selectedEperson) {
            alert("Please select a resource and an eperson");
            return;
        }

        try {
            const response = await AddResourcePolicy(uuid, selectedEperson, JSON.stringify(formData));
            navigate(-1);
            
        } catch (error) {
            console.error("Error creating resource policy:", error);
            alert("Failed to create resource policy");
        }
    };

    const handleCancel = () => {
        navigate(-1); 
    };

    return (
        <Container>
            <Typography variant="h4">
                {`Create new resource policy`}
            </Typography>
            <Grid item xs={8.5} sm={10.5} lg={11} >
                <InputLabel>Name</InputLabel>
                <TextField
                    name="name"
                    label="Enter Name"
                    variant="outlined"
                    fullWidth
                    value={formData.name}
                    onChange={handleInputChange}
                    className="search-field"
                    InputLabelProps={{ className: "custom-label" }}
                />
            </Grid>
            <Grid item xs={8.5} sm={10.5} lg={11} >
                <InputLabel>Description</InputLabel>
                <TextField
                    name="description"
                    label="Enter description"
                    variant="outlined"
                    fullWidth
                    value={formData.description || ""}
                    onChange={handleInputChange}
                />
            </Grid>
            <Box>
                <FormControl fullWidth sx={{ marginTop: 2 }}>
                    <InputLabel id="policy-type">Select the policy type *</InputLabel>
                    <Select
                        labelId='policy-type'
                        name="policyType"
                        value={formData.policyType}
                        label="policy-type"
                        onChange={handleSelectChange}
                    >
                        {policies && policies.map((policy) => (
                            <MenuItem key={policy.id} value={policy.id}>{policy.value}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box>
                <FormControl fullWidth sx={{ marginTop: 2 }}>
                    <InputLabel id="action-type">Select the action *</InputLabel>
                    <Select
                        labelId='action-type'
                        name="action"
                        value={formData.action}
                        label="action-type"
                        onChange={handleSelectChange}
                    >
                        {actionType && actionType.map((action) => (
                            <MenuItem key={action.id} value={action.id}>{action.value}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Grid item xs={8.5} sm={10.5} lg={11} sx={{ mt: 2 }}>
                <InputLabel>The eperson or group that will be granted the permission</InputLabel>
                <TextField
                    label="Selected eperson"
                    variant="outlined"
                    fullWidth
                    value={selectedEperson}
                    InputProps={{
                        readOnly: true,
                    }}
                />
            </Grid>
            <TableContainer
                component={Paper}
                sx={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", mt: 2 }}
            >
                <Box sx={{ mt: 1, display: "flex", justifyContent: "end", gap: 2 }}>
                    <Button variant='contained'>Search for eperson</Button>
                    <Button variant='contained'>Search for group</Button>
                </Box>
                <Grid container alignItems="center" className="search-container" sx={{ p: 2 }}>
                    <Grid item xs={8.5} sm={10} md={11}>
                        <TextField
                            label="Search the repository..."
                            variant="outlined"
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-field"
                            InputLabelProps={{ className: "custom-label" }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    fetchUsers(1, size, searchQuery);
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={2} sm={2} md={1} style={{ paddingLeft: 0 }}>
                        <Button
                            className="button_search"
                            variant="contained"
                            onClick={() => fetchUsers(1, size, searchQuery)}
                            disabled={loading}
                            fullWidth
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow
                                key={user.id}
                                sx={{
                                    "&:hover": { backgroundColor: "#f0f0f0" },
                                    cursor: "pointer",
                                    backgroundColor: selectedEperson === user.id ? "#e0e0e0" : "inherit"
                                }}
                            >
                                <TableCell>
                                    {user.id}
                                </TableCell>
                                <TableCell>
                                    {user.metadata?.["eperson.firstname"]?.[0]?.value + " " + user.metadata?.["eperson.lastname"]?.[0]?.value}
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        variant="outlined"
                                        onClick={() => handleSelectEperson(user.id)}
                                    >
                                        {selectedEperson === user.id ? "Selected" : "Select"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.policyType || !formData.action || !selectedEperson}
                >
                    Save
                </Button>
            </Box>
        </Container>
    )
}

export default CreateResourcePolicy