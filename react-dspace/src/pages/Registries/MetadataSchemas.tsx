import { useEffect, useState } from "react";
import { addMetadataSchema, deleteMetadataSchema, fetchMetadataSchemas } from "../../api/registries";
import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Pagination, TextField, Button, Box } from "@mui/material";
import axios from "axios";

interface MetadataSchema {
    id: number;
    prefix: string;
    namespace: string;
}

const MetadataSchemas = () => {
    const [schemas, setSchemas] = useState<MetadataSchema[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [page, setPage] = useState<number>(1);
    const [selected, setSelected] = useState<number[]>([]);
    const [namespace, setNamespace] = useState("");
    const [name, setName] = useState("");
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);

    const authToken = localStorage.getItem("authToken") || "";
    const csrfToken = localStorage.getItem("csrfToken") || "";

    useEffect(() => {
        setIsSaveEnabled(namespace.trim() !== "" && name.trim() !== "");
    }, [namespace, name]);

    const getSchemas = async () => {
        try {
            const { metadataschemas, totalPages } = await fetchMetadataSchemas(authToken, page - 1, 10);
            setSchemas(metadataschemas);
            setTotalPages(totalPages);
        } catch (error) {
            console.error("Failed to fetch metadata schemas:", error);
        }
    };

    useEffect(() => {
        getSchemas();
    }, []);

    useEffect(() => {
        getSchemas();
    }, [page, authToken]);

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleSelect = (id: number) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleSave = async () => {
        const payload = { prefix: name, namespace };

        try {
            await addMetadataSchema(payload);
            setNamespace("");
            setName("");
            getSchemas();
        } catch (error) {
            console.error("Error saving metadata schema:", error);
        }
    };

    const handleDeleteSelected = async () => {
        try {
            await Promise.all(selected.map((id) => deleteMetadataSchema(id)));
            setSelected([]);
            getSchemas();
        } catch (error) {
            console.error("Error deleting metadata schemas:", error);
        }
    };

    return (
        <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                    label="Namespace *"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" onClick={handleSave} disabled={!isSaveEnabled}>
                    Save
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>ID</TableCell>
                            <TableCell>Namespace</TableCell>
                            <TableCell>Name</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {schemas.map((schema) => (
                            <TableRow key={schema.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selected.includes(schema.id)}
                                        onChange={() => handleSelect(schema.id)}
                                    />
                                </TableCell>
                                <TableCell>{schema.id}</TableCell>
                                <TableCell>{schema.namespace}</TableCell>
                                <TableCell>{schema.prefix}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                <Pagination count={totalPages} page={page} onChange={handleChangePage} />
                <Button variant="contained" color="error" onClick={handleDeleteSelected} disabled={selected.length === 0}>
                    Delete Selected
                </Button>
            </Box>
        </Paper>
    );
};

export default MetadataSchemas;
