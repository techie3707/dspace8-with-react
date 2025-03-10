import React, { useEffect, useState } from "react";
import { Container, Grid, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import "./userManagement.css";
import { userList } from "../../api/usermanagement";
import { EPerson } from "../../api/usermanagement";
import { getAuthToken } from "../../api/authToken";

const UserManagement = () => {
  const [users, setUsers] = useState<EPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const authToken = getAuthToken() || "Bearer your_token_here"; // Fallback value if token is null
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userList(authToken);
        setUsers(data); // Now directly assigns correctly typed data
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>EPeople</Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <TextField label="Metadata" variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Search people..." variant="outlined" fullWidth />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary">Search</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined">Browse All</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="success">+ Add User</Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "auto", my: 3 }} />
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>First Name</b></TableCell>
                <TableCell><b>Last Name</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.metadata?.['eperson.firstname']?.[0]?.value || 'N/A'}</TableCell>
                  <TableCell>{user.metadata?.['eperson.lastname']?.[0]?.value || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <IconButton color="primary"><Edit /></IconButton>
                    <IconButton color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default UserManagement;
