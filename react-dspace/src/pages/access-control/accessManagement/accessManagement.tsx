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
    FormControl,
    RadioGroup,
    Radio,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Collection } from "../../../data/accessAPI";
import { addMemberToGroup, Group, removeMemberToGroup } from "../../../api/group";

interface AccessManagementProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

const AccessManagement: React.FC<AccessManagementProps> = ({ open, onClose, userId }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [collectionPermissions, setCollectionPermissions] = useState<{
        [key: string]: { permission: string; groupName: string; uuid: string }[]
    }>({});

    const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: Set<string> }>({});
    const [selectedGroups, setSelectedGroups] = useState<{ uuid: string; groupName: string }[]>([]);
    const [initialUserGroups, setInitialUserGroups] = useState<{ uuid: string; groupName: string }[]>([]);
    const [groupsList, setGroupsList] = useState<Group[]>([]);
    const [selectedPermissionLevel, setSelectedPermissionLevel] = useState<string>("");

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

                // Set the initial permission level if user has groups
                if (userGroups.length > 0) {
                    const firstPermission = userGroups[0].name.split('_')[1].toLowerCase();
                    setSelectedPermissionLevel(firstPermission);
                }
            } catch (error) {
                console.error("Error fetching user groups:", error);
            }
        };
        fetchUserAssignedGroups();
    }, [userId]);



    const handlePermissionLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPermissionLevel(event.target.value);
    };

    const handleCollectionCheckboxChange = (collectionTitle: string, isChecked: boolean) => {
        const permissionGroups = collectionPermissions[collectionTitle]?.filter(
            g => g.permission === selectedPermissionLevel
        );

        if (!permissionGroups || permissionGroups.length === 0) {
            console.warn(`No groups found for collection: ${collectionTitle} with permission: ${selectedPermissionLevel}`);
            return;
        }

        setSelectedPermissions(prevPermissions => {
            const newPermissions = { ...prevPermissions };
            if (!newPermissions[collectionTitle]) {
                newPermissions[collectionTitle] = new Set();
            }

            const updatedSet = new Set(newPermissions[collectionTitle]);
            if (isChecked) {
                updatedSet.add(selectedPermissionLevel);
            } else {
                updatedSet.delete(selectedPermissionLevel);
            }

            return { ...newPermissions, [collectionTitle]: updatedSet };
        });

        setSelectedGroups(prevGroups => {
            if (isChecked) {
                // Add all groups for this permission level
                const groupsToAdd = permissionGroups.map(g => ({ uuid: g.uuid, groupName: g.groupName }));
                return [...prevGroups, ...groupsToAdd];
            } else {
                // Remove all groups for this permission level
                const groupUuidsToRemove = new Set(permissionGroups.map(g => g.uuid));
                return prevGroups.filter(g => !groupUuidsToRemove.has(g.uuid));
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

    const permissionTypes = Array.from(
        new Set(
            Object.values(collectionPermissions)
                .flatMap(perms => perms.map(p => p.permission))
        )
    );

    // Filter collections to show only those that have the selected permission level
    const filteredCollections = collections.filter(collection => {
        const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
        return collectionPermissions[collectionTitle]?.some(p => p.permission === selectedPermissionLevel);
    });

    return (
        <Modal open={open} onClose={onClose}>
            <Paper
                sx={{ maxWidth: "90%", maxHeight: "90%", overflow: "auto" }}
                className="modal-paper">
                <div className="modal-header-container">
                    <Typography className="modal-header">Edit Access Management</Typography>
                    <IconButton onClick={onClose} className="close-icon">
                        <CloseIcon />
                    </IconButton>
                </div>

                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Permission Level:</Typography>
                    <FormControl>
                        <RadioGroup
                            row
                            aria-labelledby="permission-level-radio-buttons"
                            name="permission-level"
                            value={selectedPermissionLevel}
                            onChange={handlePermissionLevelChange}
                        >
                            {permissionTypes.map(permission => (
                                <FormControlLabel
                                    key={permission}
                                    value={permission}
                                    control={<Radio />}
                                    label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Box>

                <Box component="form" className="modal-form">
                    {selectedPermissionLevel && filteredCollections.map(collection => {
                        const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
                        const isChecked = selectedPermissions[collectionTitle]?.has(selectedPermissionLevel) || false;

                        return (
                            <Box key={collection.id} className="collection-container">
                                <Box className="dropdown-header">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isChecked}
                                                onChange={(e) => handleCollectionCheckboxChange(collectionTitle, e.target.checked)}
                                            />
                                        }
                                        label={
                                            <Typography className="collection-title">
                                                {collectionTitle}
                                            </Typography>
                                        }
                                    />
                                </Box>
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