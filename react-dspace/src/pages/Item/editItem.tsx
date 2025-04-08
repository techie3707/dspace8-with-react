import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchItemInfo, patchItemMetadata } from "../../api/item";
import Loader from "../loader/loader";
import { Button, Container, Typography } from "@mui/material";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    IconButton,
    Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Bitstream } from "../../data/bookDetail";
import { fetchBitstreams, fetchItemBundles } from "../../api/searchApi";
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useNavigate } from "react-router-dom";

interface MetadataValue {
    value: string;
}

interface Metadata {
    [key: string]: MetadataValue[];
}

interface ItemLinks {
    thumbnail: { href: string };
    self: { href: string };
}

export interface ItemInfo {
    id: string;
    uuid: string;
    name: string;
    metadata: Metadata;
    type: string;
    _links: ItemLinks;
}

const EditItem = () => {
    const { itemId } = useParams<{ itemId: string }>();
    const [itemInfo, setItemInfo] = useState<ItemInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<{
        key: string;
        index: number;
    } | null>(null);
    const [originalItemInfo, setOriginalItemInfo] = useState<ItemInfo | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");
    const [pendingUpdates, setPendingUpdates] = useState<any[]>([]);
    const [originalBitstreams, setOriginalBitstreams] = useState<Bitstream[]>([]);
    const [thumbnailBitstreams, setThumbnailBitstreams] = useState<Bitstream[]>([]);
    const Navigate = useNavigate();

    useEffect(() => {
        const fetchItemData = async () => {
            if (!itemId) return;
            try {
                setLoading(true);
                const data = await fetchItemInfo(itemId);
                setItemInfo(data);
                setOriginalItemInfo(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching item info:", err);
                setError("Failed to fetch item information");
            } finally {
                setLoading(false);
            }
        };

        fetchItemData();
    }, [itemId]);

    const handleEditClick = (key: string, index: number, currentValue: string) => {
        setEditingField({ key, index });
        setEditedValue(currentValue);
    };

    const handleSaveClick = () => {
        if (!editingField || !itemInfo) return;

        const { key, index } = editingField;
        const originalValue = itemInfo.metadata[key][index].value;

        if (editedValue !== originalValue) {
            const newUpdate = {
                op: "replace",
                path: `/metadata/${key}/${index}`,
                value: {
                    ...itemInfo.metadata[key][index],
                    value: editedValue
                }
            };

            setPendingUpdates([...pendingUpdates, newUpdate]);

            const updatedMetadata = { ...itemInfo.metadata };
            const updatedValues = [...updatedMetadata[key]];

            updatedValues[index] = {
                ...updatedValues[index],
                value: editedValue
            };

            updatedMetadata[key] = updatedValues;

            setItemInfo({
                ...itemInfo,
                metadata: updatedMetadata
            });
        }

        setEditingField(null);
        setEditedValue("");
    };


    const handleDeleteClick = (key: string, index: number) => {
        if (!itemInfo) return;

        const deleteOperation = {
            op: "remove",
            path: `/metadata/${key}/${index}`
        };

        setPendingUpdates([...pendingUpdates, deleteOperation]);

        let updatedMetadata = { ...itemInfo.metadata };
        const updatedValues = [...updatedMetadata[key]];
        updatedValues.splice(index, 1);

        if (updatedValues.length === 0) {
            const { [key]: _, ...rest } = updatedMetadata;
            updatedMetadata = rest;
        } else {
            updatedMetadata[key] = updatedValues;
        }

        setItemInfo({
            ...itemInfo,
            metadata: updatedMetadata
        });
    };

    const handleSaveAll = async () => {
        if (!itemInfo || pendingUpdates.length === 0) return;

        try {
            setLoading(true);
            await patchItemMetadata(itemInfo.id, pendingUpdates);
            setPendingUpdates([]);
            setError(null);
            Navigate(`/edit-item/${itemId}`);
        } catch (err) {
            console.error("Error updating item:", err);
            setError("Failed to update item");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = () => {
        setEditingField(null);
        setEditedValue("");
    };

    const handleDiscardAll = () => {
        if (!originalItemInfo) return;

        setItemInfo(originalItemInfo);
        setPendingUpdates([]);
        setEditingField(null);
        setEditedValue("");
    };
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedValue(e.target.value);
    };

    useEffect(() => {
           const fetchThumbnails = async () => {
               try {
                   setLoading(true);
                   
   
                       
                           if (!itemId) return;
   
                           const bundles = await fetchItemBundles(itemId);
                           if (bundles.length > 0) {
                               const originalBundle = bundles.find(b => b.name === 'ORIGINAL') || bundles[0];
                               const thumbnailBundle = bundles.find(b => b.name === 'THUMBNAIL') || bundles[0];
                               const originalbitstreamsData = await fetchBitstreams(originalBundle.uuid);
                               const thumbnailbitstreamsData = await fetchBitstreams(thumbnailBundle.uuid);
                               setOriginalBitstreams(originalbitstreamsData);
                               setThumbnailBitstreams(thumbnailbitstreamsData);
                   }
               } catch (error) {
                   console.error(error);
               } finally {
                   setLoading(false);
               }
           };
   
           fetchThumbnails();
       }, []);
    const handleShowBitstream = async () => {
       
    };

    if (loading && !editingField) {
        return <Loader />;
    }

    if (!itemInfo) {
        return <div className="no-data">No item information available</div>;
    }

    return (
        <Container>
            <Container sx={{ marginBottom: "30px" }} >
                <Typography variant="h4" gutterBottom>Edit Item: {itemInfo.name}</Typography>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        color="success"
                        disabled={pendingUpdates.length === 0 || loading}
                        onClick={handleSaveAll}
                        sx={{ marginBottom: "20px" }}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDiscardAll}
                        disabled={pendingUpdates.length === 0 || loading}
                        sx={{ marginLeft: "10px", marginBottom: "20px" }}
                    >
                        Discard
                    </Button>
                </Box>

                <TableContainer component={Paper} sx={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginTop: 2
                }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell><b>Field</b></TableCell>
                                <TableCell><b>Values</b></TableCell>
                                <TableCell><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(itemInfo.metadata).map(([key, values], rowIndex) => (
                                <TableRow
                                    key={key}
                                    sx={{ backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff', }}
                                >
                                    <TableCell>
                                        <strong>{key}</strong>
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {values.map((value, i) => (
                                                editingField?.key === key && editingField?.index === i ? (
                                                    <TextField
                                                        key={`${key}-${i}-edit`}
                                                        variant="outlined"
                                                        size="small"
                                                        value={editedValue}
                                                        onChange={handleValueChange}
                                                        disabled={loading}
                                                        sx={{ minWidth: 200 }}
                                                    />
                                                ) : (
                                                    <Typography
                                                        key={`${key}-${i}`}
                                                        variant="body2"
                                                        sx={{
                                                            maxWidth: 300,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            marginBottom: 1,
                                                        }}
                                                    >
                                                        {value.value}
                                                    </Typography>
                                                )
                                            ))}
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {values.map((value, i) => (
                                                editingField?.key === key && editingField?.index === i ? (
                                                    <Box key={`${key}-${i}-actions`} sx={{ display: 'flex', gap: 1 }}>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={handleSaveClick}
                                                            disabled={loading}
                                                            title="Save"
                                                            size="small"
                                                        >
                                                            <SaveIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={handleCancelClick}
                                                            disabled={loading}
                                                            title="Cancel"
                                                            size="small"
                                                        >
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ) : (
                                                    <Box key={`${key}-${i}-actions`} sx={{ display: 'flex', gap: 1 }}>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleEditClick(key, i, value.value)}
                                                            disabled={loading}
                                                            title="Edit"
                                                            size="small"
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDeleteClick(key, i)}
                                                            disabled={loading}
                                                            title="Delete"
                                                            size="small"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                )
                                            ))}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
            <Container>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleShowBitstream}
                    sx={{ marginLeft: "10px", marginBottom: "20px" }}
                >
                    Show Bitstream
                </Button>
                <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "gray", color: "white" }}>
                            
                                <TableCell><b>Name</b></TableCell>
                                <TableCell><b>Format</b></TableCell>
                                <TableCell><b>Actions</b></TableCell>
                                 
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell colSpan={2}>
                                    <Typography variant="h6">BUNDLE: ORIGINAL</Typography>
                                </TableCell>
                                <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => Navigate(`/add-bitstream/${itemId}`)}
                                                title="View"
                                                size="small"
                                            >
                                                <GetAppRoundedIcon />
                                            </IconButton>
                                        </Box>
                                </TableCell>
                            </TableRow>
                        </TableBody>

                        <TableBody>
                            {originalBitstreams.map((bitstream) => (
                                
                                <TableRow key={bitstream.uuid}>
                                    
                                    <TableCell>
                                        <Typography variant="body2">
                                            {bitstream.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell></TableCell>
                                        
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => window.open(bitstream._links.content.href, "_blank")}
                                                title="View"
                                                size="small"
                                            >
                                                <DownloadRoundedIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
            </Container>
        </Container>

    );
};

export default EditItem;