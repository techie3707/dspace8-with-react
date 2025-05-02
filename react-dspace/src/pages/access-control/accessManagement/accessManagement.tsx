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
    Collapse,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Collection, Community } from "../../../data/accessAPI";
import { addMemberToGroup, Group, removeMemberToGroup } from "../../../api/group";
import { iconsImgs } from "../../../utils/images";

interface AccessManagementProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

interface CommunityWithCollections extends Community {
    collections: Collection[];
    expanded: boolean;
}

const AccessManagement: React.FC<AccessManagementProps> = ({ open, onClose, userId }) => {
    const [communities, setCommunities] = useState<CommunityWithCollections[]>([]);
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
                const communitiesWithCollections: CommunityWithCollections[] = await Promise.all(
                    communityData.map(async (community) => {
                        const collections = await fetchCollections(community.id);
                        return {
                            ...community,
                            collections,
                            expanded: false
                        };
                    })
                );
                setCommunities(communitiesWithCollections);
            } catch (error) {
                console.error("Error fetching communities and collections:", error);
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

    const toggleCommunityExpand = (communityId: string) => {
        setCommunities(prevCommunities =>
            prevCommunities.map(community =>
                community.id === communityId
                    ? { ...community, expanded: !community.expanded }
                    : community
            )
        );
    };

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
    
        setSelectedPermissions(prev => {
            const newPermissions = { ...prev };
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
    
        setSelectedGroups(prev => {
            const groupUuidsToModify = new Set(permissionGroups.map(g => g.uuid));
            if (isChecked) {
                const groupsToAdd = permissionGroups.filter(g => 
                    !prev.some(existing => existing.uuid === g.uuid)
                );
                return [...prev, ...groupsToAdd];
            } else {
                return prev.filter(g => !groupUuidsToModify.has(g.uuid));
            }
        });
    };

    const handleSelectAll = (community: CommunityWithCollections) => {
        // Filter collections that have the selected permission level
        const filteredCollections = community.collections.filter(collection => {
            const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
            return collectionPermissions[collectionTitle]?.some(p => p.permission === selectedPermissionLevel);
        });

        // Check if all collections are already selected
        const allSelected = filteredCollections.every(collection => {
            const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
            return selectedPermissions[collectionTitle]?.has(selectedPermissionLevel);
        });

        // Update selected permissions and groups for all collections in the community
        filteredCollections.forEach(collection => {
            const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
            handleCollectionCheckboxChange(collectionTitle, !allSelected);
        });
    };

    const isAllSelected = (community: CommunityWithCollections): boolean => {
        const filteredCollections = community.collections.filter(collection => {
            const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
            return collectionPermissions[collectionTitle]?.some(p => p.permission === selectedPermissionLevel);
        });

        return filteredCollections.length > 0 && filteredCollections.every(collection => {
            const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
            return selectedPermissions[collectionTitle]?.has(selectedPermissionLevel);
        });
    };

    const handleGroupChanges = async (): Promise<void> => {
        const prevGroupsSet = new Set(initialUserGroups.map(g => g.uuid));
        const newGroupsSet = new Set(selectedGroups.map(g => g.uuid));
    
        const addedGroups = selectedGroups.filter(g => !prevGroupsSet.has(g.uuid));
        const removedGroups = initialUserGroups.filter(g => !newGroupsSet.has(g.uuid));
    
        if (addedGroups.length === 0 && removedGroups.length === 0) {
            onClose();
            return;
        }
    
        try {
            await Promise.all(addedGroups.map(async (group) => {
                try {
                    await addMemberToGroup(group.uuid, userId);
                } catch (error) {
                    console.error(`Failed to add user to group ${group.groupName}:`, error);
                }
            }));
    
            await Promise.all(removedGroups.map(async (group) => {
                try {
                    await removeMemberToGroup(group.uuid, userId);
                } catch (error) {
                    console.error(`Failed to remove user from group ${group.groupName}:`, error);
                }
            }));
    
            onClose();
        } catch (error) {
            console.error("Error updating user groups:", error);
        }
    };

    const permissionTypes = Array.from(
        new Set(
            Object.values(collectionPermissions)
                .flatMap(perms => perms.map(p => p.permission))
    ));

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
                    <List>
                        {communities.map(community => {
                            const filteredCollections = community.collections.filter(collection => {
                                const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
                                return collectionPermissions[collectionTitle]?.some(p => p.permission === selectedPermissionLevel);
                            });

                            if (filteredCollections.length === 0) return null;

                            const allSelected = isAllSelected(community);

                            return (
                                <React.Fragment key={community.id}>
                                    <ListItem>
                                        <ListItemButton onClick={() => toggleCommunityExpand(community.id)}>
                                            <ListItemText primary={community.metadata["dc.title"]?.[0]?.value} />
                                            <ListItemIcon>
                                                {community.expanded ? <img className="table_icon" src={iconsImgs.minus} alt="Minus" /> : <img className="table_icon" src={iconsImgs.add} alt="Add" />}
                                            </ListItemIcon>
                                        </ListItemButton>
                                    </ListItem>
                                    <Collapse in={community.expanded} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            <ListItem sx={{ pl: 4 }}>
                                            <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={allSelected}
                                                    onClick={() => handleSelectAll(community)}
                                                />
                                            }
                                            label= 'Select All'
                                        />
                                            </ListItem>
                                            {filteredCollections.map(collection => {
                                                const collectionTitle = collection.metadata?.["dc.title"]?.[0]?.value || "Unnamed Collection";
                                                const isCollectionChecked = selectedPermissions[collectionTitle]?.has(selectedPermissionLevel) || false;

                                                return (
                                                    <ListItem key={collection.id} sx={{ pl: 8 }}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={isCollectionChecked}
                                                                    onChange={(e) => handleCollectionCheckboxChange(collectionTitle, e.target.checked)}
                                                                />
                                                            }
                                                            label={collectionTitle}
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Collapse>
                                </React.Fragment>
                            );
                        })}
                    </List>
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