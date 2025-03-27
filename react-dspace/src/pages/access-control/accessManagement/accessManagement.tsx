import React, { useEffect, useState } from "react";
import "../addUser/addUser.css";
import { fetchCollections, fetchCommunities, fetchGroupsList } from "../../../api/accessManagement";
import { Box, IconButton, Modal, Paper, Typography, FormControlLabel, Checkbox } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Collection } from "../../../data/accessAPI";

interface AccessManagementProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

const AccessManagement: React.FC<AccessManagementProps> = ({ open, onClose, userId }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
    const [collectionPermissions, setCollectionPermissions] = useState<{ [key: string]: string[] }>({});
    const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: Set<string> }>({});

    useEffect(() => {
        const fetchData = async () => {
            const communityData = await fetchCommunities();
            let allCollections: Collection[] = [];

            for (const community of communityData) {
                const collections = await fetchCollections(community.id);
                allCollections = [...allCollections, ...collections];
            }

            setCollections(allCollections);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchGroups = async () => {
            const { groups } = await fetchGroupsList();
            console.log("Group Names:", groups.map(group => group.name));

            const permissionsMap: { [key: string]: string[] } = {};
            groups.forEach(group => {
                const match = group.name.match(/^(.+?)_(.+)$/);
                if (match) {
                    const collectionName = match[1];
                    const permission = match[2].toLowerCase();

                    permissionsMap[collectionName] = permissionsMap[collectionName] || [];
                    permissionsMap[collectionName].push(permission);
                }
            });

            setCollectionPermissions(permissionsMap);
        };

        fetchGroups();
    }, []);

    const handleCollectionToggle = (collectionId: string) => {
        setExpandedCollections(prev => {
            const newSet = new Set(prev);
            newSet.has(collectionId) ? newSet.delete(collectionId) : newSet.add(collectionId);
            return newSet;
        });
    };

    const handleCheckboxChange = (collectionTitle: string, permission: string) => {
        setSelectedPermissions(prev => {
            const newPermissions = { ...prev };
            const updatedSet = new Set(newPermissions[collectionTitle] || []);
    
            if (updatedSet.has(permission)) {
                updatedSet.delete(permission);
            } else {
                updatedSet.add(permission);
            }
    
            return { ...newPermissions, [collectionTitle]: updatedSet };
        });
    };
    

    return (
        <Modal open={open} onClose={onClose}>
            <Paper className="modal-paper">
                <div className="modal-header-container">
                    <Typography className="modal-header">Edit Access Management</Typography>
                    <IconButton onClick={onClose} className="close-icon">
                        <CloseIcon />
                    </IconButton>
                </div>
                <Box component="form" className="modal-form">
                    {collections.map(collection => {
                        const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
                        const permissions = collectionPermissions[collectionTitle] || [];

                        return (
                            <Box key={collection.id} className="collection-container">
                                <Box className="dropdown-header" onClick={() => handleCollectionToggle(collection.id)}>
                                    <Typography className="collection-title">{collectionTitle}</Typography>
                                    <IconButton size="small">
                                        {expandedCollections.has(collection.id) ? <RemoveIcon /> : <AddIcon />}
                                    </IconButton>
                                </Box>
                                {expandedCollections.has(collection.id) && (
                                    <Box className="permissions-container">
                                        {permissions.map(permission => (
                                            <FormControlLabel
                                                key={permission}
                                                control={
                                                    <Checkbox
                                                        checked={selectedPermissions[collectionTitle]?.has(permission) || false}
                                                        onChange={() => handleCheckboxChange(collectionTitle, permission)}
                                                    />
                                                }
                                                label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                    <Box className="modal-footer">
                        <button type="button" className="add-user-btn" onClick={onClose}>
                            <span className="btn-text">Close</span>
                        </button>
                    </Box>
                </Box>
            </Paper>
        </Modal>
    );
};

export default AccessManagement;
