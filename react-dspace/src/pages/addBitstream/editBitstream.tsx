import React, { useEffect, useState } from 'react';
import { Bitstream, fetchBitstreamMetadata, fetchFormate, updateBitstreamFormat } from '../../api/bitstream';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Button } from '@mui/material';

const EditBitstream: React.FC = () => {
    const [bitstream, setBitstream] = useState<Bitstream | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [editedValue, setEditedValue] = useState<string>(''); 
    const [formats, setFormats] = useState<any[]>([]); 
    const [selectedFormat, setSelectedFormat] = useState<string>('');
    const [selectedHref, setSelectedHref] = useState<string>(''); 
    const { bitstreamId } = useParams<{ bitstreamId: string }>();
    const {itemId} = useParams<{itemId: string}>()
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!bitstreamId) {
                    console.error('Bitstream ID is not available.');
                    return;
                }
                const data = await fetchBitstreamMetadata(bitstreamId);
                console.log(data, 'data');
                setBitstream(data);


                const title = data.metadata['dc.title']?.[0]?.value || '';
                setEditedValue(title);
            } catch (error) {
                console.error('Failed to fetch bitstream:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchFormats = async () => {
            try {
                const response = await fetchFormate(); 
                setFormats(response);
            } catch (error) {
                console.error('Failed to fetch formats:', error);
            }
        };

        fetchData();
        fetchFormats();
    }, [bitstreamId]);

    const handleFormatChange = (value: string) => {
        setSelectedFormat(value);

        const selectedFormatObject = formats.find((format: any) => format.shortDescription === value);
        if (selectedFormatObject) {
            setSelectedHref(selectedFormatObject._links.self.href); 
            console.log('Selected href:', selectedFormatObject._links.self.href); 
        }
    };

    const handleSave = async () => {
        if (!bitstreamId || !selectedHref) {
            console.error('Bitstream ID or selected format href is missing.');
            return;
        }

        try {
            await updateBitstreamFormat(bitstreamId, selectedHref);
            console.log('Bitstream format updated successfully.');
            navigate(`/edit-item/${itemId}}`); 
        } catch (error) {
            console.error('Failed to update bitstream format:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!bitstream) return <div>No bitstream data found</div>;

    return (
        <Container sx={{display:"flex", flexDirection:"column", gap:3, padding: 3, maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h2">Bitstream Metadata</Typography>
            <TextField
                variant="outlined"
                size="small"
                value={editedValue} 
                onChange={(e) => setEditedValue(e.target.value)} 
                disabled={loading}
                sx={{ minWidth: 200, maxWidth:600}}
            />
            <FormControl sx={{ minWidth: 200,maxWidth:550, marginTop: 2 }}>
                <InputLabel id="format-select-label">Bitstream Format</InputLabel>
                <Select
                    labelId="format-select-label"
                    value={selectedFormat}
                    onChange={(e) => handleFormatChange(e.target.value)} 
                >
                    {formats.map((format) => (
                        <MenuItem key={format.id} value={format.shortDescription}>
                            {format.shortDescription}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ marginTop: 2, maxWidth:200, marginLeft: 5 }}
                disabled={!selectedHref}
            >
                Save
            </Button>
        </Container>
    );
};

export default EditBitstream;