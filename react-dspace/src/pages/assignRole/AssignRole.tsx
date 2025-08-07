import { Box, Button, Container, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchSubmitterGroup,
    createSubmitterGroup,
    deleteSubmitterGroup,
    fetchReviewerGroup,
    createReviewerGroup,
    deleteReviewerGroup,
    fetchEditorGroup,
    createEditorGroup,
    deleteEditorGroup,
    fetchFinalEditorGroup,
    createFinalEditorGroup,
    deleteFinalEditorGroup
} from '../../api/assignRole'
import Loader from '../loader/loader';

interface Group {
    id: string;
    uuid: string;
    name: string;
    metadata: {
        'dc.description': Array<{
            value: string;
            language: null;
            authority: null;
            confidence: number;
            place: number;
        }>;
    };
    _links: {
        self: {
            href: string;
        };
    };
}

interface AssignRoleProps {
    description?: string;
}

function AssignRole({ description = "Default group" }: AssignRoleProps) {
    const [submitterGroup, setSubmitterGroup] = useState<Group | null>(null);
    const [reviewerGroup, setReviewerGroup] = useState<Group | null>(null);
    const [editorGroup, setEditorGroup] = useState<Group | null>(null);
    const [finalEditorGroup, setFinalEditorGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState({
        submitter: false,
        reviewer: false,
        editor: false,
        finalEditor: false
    });
    const Navigate = useNavigate();
    const [error, setError] = useState({
        submitter: null as string | null,
        reviewer: null as string | null,
        editor: null as string | null,
        finalEditor: null as string | null
    });
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            fetchAllGroups();
        }
    }, [id]);

    const fetchAllGroups = async () => {
        if (!id) return;

        try {
            setLoading(prev => ({ ...prev, submitter: true, reviewer: true, editor: true, finalEditor: true }));
            setError({ submitter: null, reviewer: null, editor: null, finalEditor: null });

            const [submitter, reviewer, editor, finalEditor] = await Promise.all([
                fetchSubmitterGroup(id),
                fetchReviewerGroup(id),
                fetchEditorGroup(id),
                fetchFinalEditorGroup(id)
            ]);

            setSubmitterGroup(submitter as Group);
            setReviewerGroup(reviewer as Group);
            setEditorGroup(editor as Group);
            setFinalEditorGroup(finalEditor as Group);
        } catch (err) {
            console.error(err);
            setError({
                submitter: 'Failed to fetch submitter group',
                reviewer: 'Failed to fetch reviewer group',
                editor: 'Failed to fetch editor group',
                finalEditor: 'Failed to fetch final editor group'
            });
        } finally {
            setLoading({ submitter: false, reviewer: false, editor: false, finalEditor: false });
        }
    };

    const handleCreateGroup = async (type: 'submitter' | 'reviewer' | 'editor' | 'finalEditor') => {
        if (!id) return;

        try {
            setLoading(prev => ({ ...prev, [type]: true }));
            setError(prev => ({ ...prev, [type]: null }));

            let newGroup;
            switch (type) {
                case 'submitter':
                    newGroup = await createSubmitterGroup(id, `${description} (submitter)`);
                    setSubmitterGroup(newGroup as Group);
                    break;
                case 'reviewer':
                    newGroup = await createReviewerGroup(id, `${description} (reviewer)`);
                    setReviewerGroup(newGroup as Group);
                    break;
                case 'editor':
                    newGroup = await createEditorGroup(id, `${description} (editor)`);
                    setEditorGroup(newGroup as Group);
                    break;
                case 'finalEditor':
                    newGroup = await createFinalEditorGroup(id, `${description} (final editor)`);
                    setFinalEditorGroup(newGroup as Group);
                    break;
            }
        } catch (err) {
            console.error(err);
            setError(prev => ({ ...prev, [type]: `Failed to create ${type} group` }));
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleDeleteGroup = async (type: 'submitter' | 'reviewer' | 'editor' | 'finalEditor') => {
        if (!id) return;

        try {
            setLoading(prev => ({ ...prev, [type]: true }));
            setError(prev => ({ ...prev, [type]: null }));

            switch (type) {
                case 'submitter':
                    await deleteSubmitterGroup(id);
                    setSubmitterGroup(null);
                    break;
                case 'reviewer':
                    await deleteReviewerGroup(id);
                    setReviewerGroup(null);
                    break;
                case 'editor':
                    await deleteEditorGroup(id);
                    setEditorGroup(null);
                    break;
                case 'finalEditor':
                    await deleteFinalEditorGroup(id);
                    setFinalEditorGroup(null);
                    break;
            }
        } catch (err) {
            console.error(err);
            setError(prev => ({ ...prev, [type]: `Failed to delete ${type} group` }));
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const renderGroupSection = (
        type: 'submitter' | 'reviewer' | 'editor' | 'finalEditor',
        group: Group | null,
        title: string
    ) => {
        const isLoading = loading[type];
        const groupError = error[type];

        return (
            <Box mt={2} sx={{ p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="subtitle1">{title}</Typography>
                {isLoading ? (
                    <Loader />
                ) : groupError ? (
                    <Typography color="error">{groupError}</Typography>
                ) : group ? (
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => Navigate('/edit-group', {
                                state: {
                                    id: group.id,
                                    name: group.name,
                                    description: group.metadata?.['dc.description']?.[0]?.value || "",
                                }
                            })}
                            sx={{ textTransform: 'none', ":hover": { backgroundColor: "transparent" } }}
                        >
                            {group.name}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDeleteGroup(type)}
                            sx={{ ml: 2 }}
                            disabled={isLoading}
                        >
                            Delete
                        </Button>
                    </Box>
                ) : (
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleCreateGroup(type)}
                            sx={{ mt: 1 }}
                            disabled={isLoading}
                        >
                            Create
                        </Button>
                    </Box>
                )}
            </Box>
        );
    };

    if (!id) {
        return <Typography color="error">Collection ID is missing</Typography>;
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h6">Assign Roles</Typography>

            {renderGroupSection('submitter', submitterGroup, "Submitter")}
            {renderGroupSection('reviewer', reviewerGroup, "Reviewer")}
            {renderGroupSection('editor', editorGroup, "Editor")}
            {renderGroupSection('finalEditor', finalEditorGroup, "Final Editor")}
        </Container>
    )
}

export default AssignRole