import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button, Pagination } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { fetchGroups, Group } from "../../api/group";
import AddGroup from "./AddGroup";
import { useNavigate } from "react-router-dom";

const Groups = () => {
    const authToken = localStorage.getItem("authToken") || "";
    const [groups, setGroups] = useState<Group[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [openAddGroup, setOpenAddGroup] = useState<boolean>(false);
    const pageSize = 5;
    const navigate = useNavigate();

    const loadGroups = async (page: number, query: string) => {
        const data = await fetchGroups(authToken, page - 1, pageSize, query);
        setGroups(data.groups);
        setTotalPages(data.totalPages);
    };

    useEffect(() => {
        loadGroups(page, searchQuery);
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        loadGroups(1, searchQuery);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    const handleEditClick = (group: Group) => {
        navigate("/edit-group", {
            state: {
                id: group.id,
                name: group._embedded?.object?.name || group.name,
                description: group.metadata?.["dc.description"]?.[0]?.value || "",
            },
        });
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddGroup(true)}
                >
                    Add Group
                </Button>

                <TextField
                    label="Search Groups"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleSearch}>
                    Search
                </Button>
            </div>

            <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Description</b></TableCell>
                            <TableCell><b>Action</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.map((group) => (
                            <TableRow key={group.id}>
                                <TableCell>{group._embedded?.object?.name || group.name}</TableCell>
                                <TableCell>
                                    {group.metadata?.["dc.description"]?.[0]?.value || ""}
                                </TableCell>

                                <TableCell>
                                    <IconButton onClick={() => handleEditClick(group)}>
                                        <EditIcon />
                                    </IconButton>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                sx={{ display: "flex", justifyContent: "center", marginTop: "15px" }}
            />

            <AddGroup
                open={openAddGroup}
                onClose={() => setOpenAddGroup(false)}
                onGroupAdded={() => loadGroups(page, searchQuery)}
            />
        </div>
    );
};

export default Groups;
