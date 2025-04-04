import React, { useEffect, useState } from "react";
import "../addUser/addUser.css";
import {
    fetchCollections,
    fetchCommunities,
    fetchGroupsList,
    fetchUserGroupsList,
} from "../../../api/accessManagement";
import {
    Box,
    IconButton,
    Modal,
    Paper,
    Typography,
    FormControlLabel,
    Checkbox,
    Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Collection } from "../../../data/accessAPI";
import { addMemberToGroup, Group, removeMemberToGroup } from "../../../api/group";
import { showToast } from "../../../contexts/ToastProvider";

interface AccessManagementProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

const AccessManagement: React.FC<AccessManagementProps> = ({ open, onClose, userId }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
    const [collectionPermissions, setCollectionPermissions] = useState<{
        [key: string]: { permission: string; groupName: string; uuid: string }[]
    }>({});

    const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: Set<string> }>({});
    const [selectedGroups, setSelectedGroups] = useState<{ uuid: string; groupName: string }[]>([]);
    const [initialUserGroups, setInitialUserGroups] = useState<{ uuid: string; groupName: string }[]>([]);
    const [groupsList, setGroupsList] = useState<Group[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const communityData = await fetchCommunities();
                let allCollections: Collection[] = [];
                for (const community of communityData) {
                    const collections = await fetchCollections(community.id);
                    allCollections = [...allCollections, ...collections];
                }
                setCollections(allCollections);
            } catch (error) {
                console.error("Error fetching collections:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { groups } = await fetchGroupsList();
                setGroupsList(groups);

                const permissionsMap: {
                    [key: string]: { permission: string; groupName: string; uuid: string }[]
                } = {};

                groups.forEach(group => {
                    const match = group.name.match(/^(.+?)_(.+)$/);
                    if (match) {
                        const collectionName = match[1];
                        const permission = match[2].toLowerCase();

                        if (!permissionsMap[collectionName]) {
                            permissionsMap[collectionName] = [];
                        }

                        permissionsMap[collectionName].push({
                            permission,
                            groupName: group.name,
                            uuid: group.uuid,
                        });
                    }
                });
                setCollectionPermissions(permissionsMap);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        };
        fetchGroups();
    }, []);

    useEffect(() => {
        const fetchUserAssignedGroups = async () => {
            if (!userId) return;
            try {
                const response = await fetchUserGroupsList(userId);
                const userGroups: Group[] = response.groups || [];
                const updatedPermissions: { [key: string]: Set<string> } = {};
                const userGroupsArray = userGroups.map(group => ({ uuid: group.uuid, groupName: group.name }));

                setInitialUserGroups(userGroupsArray);
                setSelectedGroups(userGroupsArray);

                userGroups.forEach(group => {
                    const match = group.name.match(/^(.+?)_(.+)$/);
                    if (match) {
                        const collectionTitle = match[1];
                        const permission = match[2].toLowerCase();
                        if (!updatedPermissions[collectionTitle]) {
                            updatedPermissions[collectionTitle] = new Set();
                        }
                        updatedPermissions[collectionTitle].add(permission);
                    }
                });
                setSelectedPermissions(updatedPermissions);
            } catch (error) {
                console.error("Error fetching user groups:", error);
            }
        };
        fetchUserAssignedGroups();
    }, [userId]);

    const handleCollectionToggle = (collectionId: string) => {
        setExpandedCollections(prev => {
            const newSet = new Set(prev);
            newSet.has(collectionId) ? newSet.delete(collectionId) : newSet.add(collectionId);
            return newSet;
        });
    };

    const handleCheckboxChange = (collectionTitle: string, permission: string) => {
        const group = collectionPermissions[collectionTitle]?.find(g => g.permission === permission);
        if (!group) {
            console.warn(`Group not found for collection: ${collectionTitle}, permission: ${permission}`);
            return;
        }

        setSelectedPermissions(prevPermissions => {
            const newPermissions = { ...prevPermissions };
            if (!newPermissions[collectionTitle]) {
                newPermissions[collectionTitle] = new Set();
            }

            const updatedSet = new Set(newPermissions[collectionTitle]);
            if (updatedSet.has(permission)) {
                updatedSet.delete(permission);
            } else {
                updatedSet.add(permission);
            }

            return { ...newPermissions, [collectionTitle]: updatedSet };
        });

        setSelectedGroups(prevGroups => {
            const groupExists = prevGroups.some(g => g.uuid === group.uuid);
            if (groupExists) {
                return prevGroups.filter(g => g.uuid !== group.uuid);
            } else {
                return [...prevGroups, { uuid: group.uuid, groupName: group.groupName }];
            }
        });
    };
    const handleGroupChanges = async (): Promise<void> => {
        const prevGroupsSet = new Set(initialUserGroups.map(g => g.groupName));
        const newGroupsSet = new Set(selectedGroups.map(g => g.groupName));
    
        const addedGroups = selectedGroups.filter(g => !prevGroupsSet.has(g.groupName));
        const removedGroups = initialUserGroups.filter(g => !newGroupsSet.has(g.groupName));
    
        if (addedGroups.length === 0 && removedGroups.length === 0) {
            onClose();
            return;
        }
    
        try {
            for (const group of addedGroups) {
                await addMemberToGroup(group.uuid, userId);
                await new Promise(res => setTimeout(res, 300));
            }
    
            for (const group of removedGroups) {
                await removeMemberToGroup(group.uuid, userId);
                await new Promise(res => setTimeout(res, 300));
            }
    
            onClose();
        } catch (error) {
            console.error("Error updating user groups:", error);
        }
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
                                        {permissions.map(permissionObj => (
                                            <FormControlLabel
                                                key={permissionObj.permission}
                                                control={
                                                    <Checkbox
                                                        checked={selectedPermissions[collectionTitle]?.has(permissionObj.permission) || false}
                                                        onChange={() => handleCheckboxChange(collectionTitle, permissionObj.permission)}
                                                    />
                                                }
                                                label={permissionObj.permission.charAt(0).toUpperCase() + permissionObj.permission.slice(1)}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                    <Box className="modal-footer">
                        <button type="submit" className="add-user-btn" onClick={handleGroupChanges}>
                            <span className="btn-text">Give Access</span>
                            <span className="btn-icon">→</span>
                        </button>
                    </Box>
                </Box>



            </Paper>
        </Modal>
    );
};

export default AccessManagement;
