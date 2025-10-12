import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Pagination,
} from "@mui/material";
import axios from "axios";

interface AuditDTO {
  id: string;
  userId: string | null;
  userEmail: string | null;
  operation: string | null;
  entityName: string | null;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
  ipAddress: string | null;
}

const pageSize = 10;

const AuditTrailLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // filters
  const [userId, setUserId] = useState<string>("");
  const [entityName, setEntityName] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const loadLogs = async (
    page: number,
    userId?: string,
    entityName?: string,
    operation?: string,
    startDate?: string,
    endDate?: string
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.get<{
        content: AuditDTO[];
        totalPages: number;
      }>("http://localhost:8080/server/api/audits", {
        params: {
          userId: userId || undefined,
          entityName: entityName || undefined,
          operation: operation || undefined,
          from: startDate ? `${startDate}T00:00:00Z` : undefined,
          to: endDate ? `${endDate}T23:59:59Z` : undefined,
          page: page - 1,
          size: pageSize,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(page, userId, entityName, operation, startDate, endDate);
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    loadLogs(1, userId, entityName, operation, startDate, endDate);
  };

  return (
    <Container className="top_padding">
      {/* Filters */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Entity Name"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            label="Operation"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={12} mt={1}>
          <Button variant="contained" color="primary" onClick={handleFilter}>
            Apply Filters
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "auto", my: 3 }} />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><b>User / Email</b></TableCell>
                  <TableCell><b>Operation</b></TableCell>
                  <TableCell><b>Entity</b></TableCell>
                  <TableCell><b>Entity ID</b></TableCell>
                  <TableCell><b>Old Value</b></TableCell>
                  <TableCell><b>New Value</b></TableCell>
                  <TableCell><b>Timestamp</b></TableCell>
                  <TableCell><b>IP Address</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.userEmail || log.userId || "System"}</TableCell>
                    <TableCell>{log.operation || "N/A"}</TableCell>
                    <TableCell>{log.entityName || "N/A"}</TableCell>
                    <TableCell>{log.entityId || "N/A"}</TableCell>
                    <TableCell>{log.oldValue || "-"}</TableCell>
                    <TableCell>{log.newValue || "-"}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.ipAddress || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}
          />
        </>
      )}
    </Container>
  );
};

export default AuditTrailLogs;
