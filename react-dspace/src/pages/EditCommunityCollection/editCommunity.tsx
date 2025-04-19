import React, { useEffect, useState } from 'react'
import { fetchCommunities, fetchCollectionsItem, deleteCommunity, editCommunity } from '../../api/communities';
import { Box, Container, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, Collapse } from '@mui/material';
import { iconsImgs } from '../../utils/images';
import { deleteCollection, editCollection } from '../../api/collection';
import { Collection, Community, CommunityResponse, EmbeddedCollections } from '../../data/communityData';
import Loader from '../loader/loader';


const EditCommunity = () => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [expandedCommunity, setExpandedCommunity] = useState<string | null>(null);
    const [collections, setCollections] = useState<Record<string, Collection[]>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    const fetchCommunityData = async () => {
        try {
            const response = await fetchCommunities();
            const communityData = response as CommunityResponse;
            setCommunitiesWithEditingState(communityData._embedded.communities);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to fetch communities');
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchCommunityData();
    }, []);

    const setCommunitiesWithEditingState = (communities: Community[]) => {
        setCommunities(communities.map(community => ({
            ...community,
            isEditing: false,
            editedTitle: community.metadata["dc.title"]?.[0]?.value || ''
        })));
    };

    const handleEditClick = (uuid: string) => {
        setCommunities(communities.map(community => {
            if (community.uuid === uuid) {
                return {
                    ...community,
                    isEditing: true,
                    editedTitle: community.metadata["dc.title"]?.[0]?.value || ''
                };
            }
            return community;
        }));
    };

    const handleSaveClick = async (uuid: string) => {
        try {
            const community = communities.find(c => c.uuid === uuid);
            if (!community) return;

            const originalTitle = community.metadata["dc.title"]?.[0]?.value || '';

            // Compare with edited title
            if (community.editedTitle === originalTitle) {
                // If no changes, just cancel editing mode
                setCommunities(communities.map(value => {
                    if (value.uuid === uuid) {
                        return {
                            ...value,
                            isEditing: false
                        };
                    }
                    return value;
                }));
                return;
            }

            await editCommunity(uuid, community.editedTitle || '');
            setCommunities(communities.map(value => {
                if (value.uuid === uuid) {
                    return {
                        ...value,
                        isEditing: false,
                        metadata: {
                            ...value.metadata,
                            "dc.title": [{ ...value.metadata["dc.title"][0], value: value.editedTitle || '' }]
                        }
                    };
                }
                return value;
            }));

        } catch (err) {
            console.error('Failed to update community', err);
        }
    };

    const handleCancelClick = (uuid: string) => {
        setCommunities(communities.map(community => {
            if (community.uuid === uuid) {
                return {
                    ...community,
                    isEditing: false,
                    editedTitle: community.metadata["dc.title"]?.[0]?.value || ''
                };
            }
            return community;
        }));
    };

    const handleTitleChange = (uuid: string, value: string) => {
        setCommunities(communities.map(community => {
            if (community.uuid === uuid) {
                return {
                    ...community,
                    editedTitle: value
                };
            }
            return community;
        }));
    };

    const handleDeleteClick = async (uuid: string) => {
        try {
            await deleteCommunity(uuid);
            setCommunities(communities.filter(community => community.uuid !== uuid));
        } catch (err) {
            console.error('Failed to delete community', err);
        }
    };

    const handleShowCollection = async (uuid: string) => {
        try {
            if (!collections[uuid]) {
                const response = await fetchCollectionsItem(uuid);
                const collectionData = response as EmbeddedCollections;
                const collectionsWithEditingState = collectionData._embedded.collections.map(collection => ({
                    ...collection,
                    isEditing: false,
                    editedTitle: collection.metadata["dc.title"]?.[0]?.value || ''
                }));

                setCollections(prev => ({
                    ...prev,
                    [uuid]: collectionsWithEditingState
                }));
            }
            setExpandedCommunity(expandedCommunity === uuid ? null : uuid);
        } catch (err) {
            setError('Failed to fetch collections');
        }
    };

    const handleCollectionEditClick = (communityUuid: string, collectionUuid: string) => {
        setCollections(prev => {
            const updatedCollections = { ...prev };
            updatedCollections[communityUuid] = updatedCollections[communityUuid].map(collection => {
                if (collection.uuid === collectionUuid) {
                    return {
                        ...collection,
                        isEditing: true,
                        editedTitle: collection.metadata["dc.title"]?.[0]?.value || ''
                    };
                }
                return collection;
            });
            return updatedCollections;
        });
    };

    const handleCollectionSaveClick = async (communityUuid: string, collectionUuid: string) => {
        try {
            const collection = collections[communityUuid]?.find(value => value.uuid === collectionUuid);
            if (!collection) return;

            const originalTitle = collection.metadata["dc.title"]?.[0]?.value || '';

            if (collection.editedTitle === originalTitle) {
                setCollections(prev => {
                    const updatedCollections = { ...prev };
                    updatedCollections[communityUuid] = updatedCollections[communityUuid].map(community => {
                        if (community.uuid === collectionUuid) {
                            return {
                                ...community,
                                isEditing: false
                            };
                        }
                        return community;
                    });
                    return updatedCollections;
                });
                return;
            }

            await editCollection(collectionUuid, collection.editedTitle || '');

            setCollections(prev => {
                const updatedCollections = { ...prev };
                updatedCollections[communityUuid] = updatedCollections[communityUuid].map(community => {
                    if (community.uuid === collectionUuid) {
                        return {
                            ...community,
                            isEditing: false,
                            metadata: {
                                ...community.metadata,
                                "dc.title": [{ ...community.metadata["dc.title"][0], value: community.editedTitle || '' }]
                            }
                        };
                    }
                    return community;
                });
                return updatedCollections;
            });
        } catch (err) {
            console.error('Failed to update collection', err);
        }
    };

    const handleCollectionCancelClick = (communityUuid: string, collectionUuid: string) => {
        setCollections(prev => {
            const updatedCollections = { ...prev };
            updatedCollections[communityUuid] = updatedCollections[communityUuid].map(collection => {
                if (collection.uuid === collectionUuid) {
                    return {
                        ...collection,
                        isEditing: false,
                        editedTitle: collection.metadata["dc.title"]?.[0]?.value || ''
                    };
                }
                return collection;
            });
            return updatedCollections;
        });
    };

    const handleCollectionTitleChange = (communityUuid: string, collectionUuid: string, value: string) => {
        setCollections(prev => {
            const updatedCollections = { ...prev };
            updatedCollections[communityUuid] = updatedCollections[communityUuid].map(collection => {
                if (collection.uuid === collectionUuid) {
                    return {
                        ...collection,
                        editedTitle: value
                    };
                }
                return collection;
            });
            return updatedCollections;
        });
    };

    const handleCollectionDeleteClick = async (communityUuid: string, collectionUuid: string) => {
        try {
            await deleteCollection(collectionUuid);

            setCollections(prev => {
                const updatedCollections = { ...prev };
                updatedCollections[communityUuid] = updatedCollections[communityUuid].filter(
                    collection => collection.uuid !== collectionUuid
                );
                return updatedCollections;
            });
        } catch (err) {
            console.error('Failed to delete collection', err);
        }
    };

    return (
        <Container className=''>
            <Typography variant="h4">Edit Community</Typography>
            {isLoading && <Loader />}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && (
                <TableContainer component={Paper} sx={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginTop: 2
                }}>
                    <Table sx={{ mb: 2 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell ><b>Communities</b></TableCell>
                                <TableCell sx={{ display: 'flex', justifyContent: 'center' }}><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {communities.map((community) => (
                                <React.Fragment key={community.uuid}>
                                    <TableRow sx={{
                                        "&:hover": { backgroundColor: "#f0f0f0" },
                                        cursor: "pointer",
                                    }}>
                                        <TableCell>
                                            {community.isEditing ? (
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    value={community.editedTitle}
                                                    onChange={(e) => handleTitleChange(community.uuid, e.target.value)}
                                                    fullWidth
                                                />
                                            ) : (
                                                community.metadata["dc.title"]?.[0]?.value || 'No Title Available'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                {community.isEditing ? (
                                                    <Box sx={{border: '1px solid #ddd'}}>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleSaveClick(community.uuid)}
                                                            title="Save"
                                                        >
                                                            <img className="table_icon" src={iconsImgs.save} alt="Save" />
                                                        </IconButton>
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={() => handleCancelClick(community.uuid)}
                                                            title="Cancel"
                                                        >
                                                            <img className="table_icon" src={iconsImgs.cancel} alt="Cancel" />
                                                        </IconButton>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{border: '1px solid #ddd'}}>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleEditClick(community.uuid)}
                                                            title="Edit"
                                                        >
                                                            <img className="table_icon" src={iconsImgs.edit} alt="Edit" />
                                                        </IconButton>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDeleteClick(community.uuid)}
                                                            title="Delete"
                                                        >
                                                            <img className="table_icon" src={iconsImgs.remove} alt="Remove" />
                                                        </IconButton>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleShowCollection(community.uuid)}
                                                            title="View Collections"
                                                            sx={{ ml: 3 }}
                                                        >
                                                            {expandedCommunity === community.uuid ? <img className="table_icon" src={iconsImgs.minus} alt="Minus" /> : <img className="table_icon" src={iconsImgs.add} alt="Add" />}
                                                        </IconButton>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow >
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                            <Collapse in={expandedCommunity === community.uuid} timeout="auto" unmountOnExit>
                                                <Box margin={1}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Collections
                                                    </Typography>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                                                <TableCell><b>Collection Name</b></TableCell>
                                                                <TableCell><b>Actions</b></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {collections[community.uuid]?.map((collection) => (
                                                                <TableRow
                                                                    sx={{
                                                                        "&:hover": { backgroundColor: "#f0f0f0" },
                                                                        cursor: "pointer",
                                                                    }}
                                                                    key={collection.uuid}>
                                                                    <TableCell>
                                                                        {collection.isEditing ? (
                                                                            <TextField
                                                                                value={collection.editedTitle}
                                                                                onChange={(e) => handleCollectionTitleChange(community.uuid, collection.uuid, e.target.value)}
                                                                                fullWidth
                                                                            />
                                                                        ) : (
                                                                            collection.metadata["dc.title"]?.[0]?.value || 'No Title Available'
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                                            {collection.isEditing ? (
                                                                                <>
                                                                                    <IconButton
                                                                                        color="primary"
                                                                                        onClick={() => handleCollectionSaveClick(community.uuid, collection.uuid)}
                                                                                        title="Save"
                                                                                    >
                                                                                        <img className="table_icon" src={iconsImgs.save} alt="Save" />
                                                                                    </IconButton>
                                                                                    <IconButton
                                                                                        color="secondary"
                                                                                        onClick={() => handleCollectionCancelClick(community.uuid, collection.uuid)}
                                                                                        title="Cancel"
                                                                                    >
                                                                                        <img className="table_icon" src={iconsImgs.cancel} alt="Cancel" />
                                                                                    </IconButton>
                                                                                </>
                                                                            ) : (
                                                                                <Box >
                                                                                    <IconButton
                                                                                        color="primary"
                                                                                        onClick={() => handleCollectionEditClick(community.uuid, collection.uuid)}
                                                                                        title="Edit"
                                                                                    >
                                                                                        <img className="table_icon" src={iconsImgs.edit} alt="Edit" />
                                                                                    </IconButton>
                                                                                    <IconButton
                                                                                        color="error"
                                                                                        onClick={() => handleCollectionDeleteClick(community.uuid, collection.uuid)}
                                                                                        title="Delete"
                                                                                    >
                                                                                        <img className="table_icon" src={iconsImgs.remove} alt="Remove" />
                                                                                    </IconButton>
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

export default EditCommunity;