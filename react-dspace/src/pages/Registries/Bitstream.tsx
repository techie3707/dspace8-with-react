import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addMetadataField, deleteBitstream, fetchMetadataFields, MetadataField } from "../../api/metadata";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Checkbox, CircularProgress, Typography, Pagination, TextField, Button, Box
} from "@mui/material";
import { showToast } from "../../contexts/ToastProvider";

const Bitstream: React.FC = () => {
    const { schemaId, schemaName } = useParams<{ schemaId: string; schemaName: string }>();
    const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [page, setPage] = useState<number>(1);
    const rowsPerPage = 10;
    const authToken = localStorage.getItem("authToken") || "";

    const [element, setElement] = useState("");
    const [qualifier, setQualifier] = useState("");
    const [scopeNote, setScopeNote] = useState("");

    useEffect(() => {
        if (!schemaName) return;

        const loadMetadataFields = async () => {
            try {
                const fields = await fetchMetadataFields(schemaName, authToken, page, rowsPerPage);
                setMetadataFields(fields);
            } catch (err) {
                setError("Failed to fetch metadata fields.");
            } finally {
                setLoading(false);
            }
        };

        loadMetadataFields();
    }, [schemaName, authToken, page]);

    const handleSelect = (id: number) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    };

    const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    const handleSave = async () => {
        if (!schemaId || !element.trim()) {
            setError("Schema ID and Element are required.");
            return;
        }

        try {
            setLoading(true);
            await addMetadataField(schemaId ?? "", element, qualifier || null, scopeNote || null);
            setElement("");
            setQualifier("");
            setScopeNote("");
            setError(null);
            const fields = await fetchMetadataFields(schemaName ?? "", authToken, page, rowsPerPage);
            setMetadataFields(fields);
        } catch (err) {
            setError("Failed to add metadata field.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setElement("");
        setQualifier("");
        setScopeNote("");
    };
    const handleDeleteSelected = async () => {
        try {
            await Promise.all(selected.map((id) => deleteBitstream(id)));
            setSelected([]);
            const fields = await fetchMetadataFields(schemaName ?? "", authToken, page, rowsPerPage);
            setMetadataFields(fields);
        } catch (error) {
            showToast("Error deleting metadata fields", "error");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <Box component={Paper} sx={{ padding: 2, marginBottom: 3 }}>
                <Typography sx={{ paddingBottom: 2 }} variant="h6">Create metadata field</Typography>
                <Box display="flex" gap={2}>
                    <TextField
                        label="Element *"
                        value={element}
                        onChange={(e) => setElement(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Qualifier"
                        value={qualifier}
                        onChange={(e) => setQualifier(e.target.value)}
                        fullWidth
                    />
                </Box>
                <TextField
                    label="Scope Note"
                    value={scopeNote}
                    onChange={(e) => setScopeNote(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ marginTop: 2 }}
                />
                <Box display="flex" justifyContent="flex-end" gap={2} sx={{ marginTop: 2 }}>
                    <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
                </Box>
            </Box>

            {loading ? (
                <CircularProgress style={{ marginTop: "20px" }} />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ marginTop: 2, overflowX: "auto" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Select</TableCell>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Field</TableCell>
                                    <TableCell>Scope Notes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {metadataFields.map((field) => {
                                    const prefix = field._embedded?.schema?.prefix || "";
                                    const element = field.element || "";
                                    const qualifier = field.qualifier ? `.${field.qualifier}` : "";
                                    const scopeNote = field.scopeNote || "N/A";
                                    const id = field.id || "";

                                    return (
                                        <TableRow key={field.id}  sx={{
                                            "&:hover": { backgroundColor: "#f0f0f0" }, 
                                            cursor: "pointer", 
                                          }}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.includes(field.id)}
                                                    onChange={() => handleSelect(field.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{id}</TableCell>
                                            <TableCell>{`${prefix}.${element}${qualifier}`}</TableCell>
                                            <TableCell>{scopeNote}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2 }}>
                        <Button variant="contained" color="error" onClick={handleDeleteSelected} disabled={selected.length === 0}>
                            Delete Selected
                        </Button>
                    </Box>
                    <Pagination
                        count={5}
                        page={page}
                        onChange={handleChangePage}
                        sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    />
                </>
            )}
        </div>
    );
};

export default Bitstream;
