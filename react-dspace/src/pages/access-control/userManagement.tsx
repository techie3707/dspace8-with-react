import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
} from "@mui/material";
import { Edit, Delete, Lock } from "@mui/icons-material";
import { removeUser, userList } from "../../api/usermanagement";
import { EPerson } from "../../api/usermanagement";
import { getAuthToken } from "../../api/authToken";
import AddUser from "./addUser/addUser";
import EditUser from "./editUser/editUser";
import "./userManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState<EPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addUserModalOpen, setAddUserModalOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editUserModalOpen, setEditUserModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<EPerson | null>(null);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const authToken = getAuthToken() || "Bearer your_token_here";

  const fetchUsers = async (page: number, size: number, query: string) => {
    setLoading(true);
    try {
      const data = await userList(authToken, page - 1, size, query);
      setUsers(data.epersons);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, size, searchQuery);
  }, [page, size]);

  const handleDeleteClick = (user: EPerson) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (userId: string) => {
    setSelectedUserId(userId);
    setEditUserModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      const success = await removeUser(selectedUser.id);
      if (success) {
        await fetchUsers(page, size, searchQuery);
      }
      setDeleteModalOpen(false);
    }
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        EPeople
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <TextField label="Metadata" variant="outlined" fullWidth />
        </Grid>
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
          <Button variant="contained" color="primary" onClick={() => fetchUsers(1, size, searchQuery)}>
            Search
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined">Browse All</Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="success"
            onClick={() => setAddUserModalOpen(true)}
          >
            + Add User
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "auto", my: 3 }} />
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><b>First Name</b></TableCell>
                  <TableCell><b>Last Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.metadata?.["eperson.firstname"]?.[0]?.value || "N/A"}
                    </TableCell>
                    <TableCell>
                      {user.metadata?.["eperson.lastname"]?.[0]?.value || "N/A"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditClick(user.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(user)}>
                        <Delete />
                      </IconButton>
                      <IconButton color="secondary">
                        <Lock />
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
            onChange={handleChangePage}
            sx={{ display: "flex", justifyContent: "center", mt: 2 }}
          />
        </>
      )}

      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {" "}
            <strong>{selectedUser?.metadata?.["eperson.firstname"]?.[0]?.value || "User"}</strong> {" "}
            (<em>{selectedUser?.email}</em>)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AddUser
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        fetchUsers={() => fetchUsers(page, size, searchQuery)} />
      <EditUser
        open={editUserModalOpen}
        onClose={() => setEditUserModalOpen(false)}
        userId={selectedUserId || ""}
        fetchUsers={() => fetchUsers(page, size, searchQuery)}
      />

    </Container>
  );
};

export default UserManagement;
