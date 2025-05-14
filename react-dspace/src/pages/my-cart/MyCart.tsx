import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    CircularProgress,
    Button,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { getUserById } from '../../api/usermanagement';
import { downloadPDF } from '../../api/bitstream';
import { siteConfig } from '../../data/data';

type MyCartProps = {
    userId: string;
};

type CartItemInfo = {
    fullUuid: string;
    uuid: string;
    name: string;
};

const MyCart: React.FC<MyCartProps> = ({ userId }) => {
    const [cartItems, setCartItems] = useState<CartItemInfo[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUserCart(userId);
        }
    }, [userId]);

    const fetchUserCart = async (id: string) => {
        setLoading(true);
        try {
            const authToken = localStorage.getItem('authToken') || '';
            const user = await getUserById(id, authToken);
            const cartData = user.metadata?.['eperson.cart'] || [];

            const rawCartValues: string[] = cartData.map((entry: any) => entry.value);

            const detailedItems: CartItemInfo[] = await Promise.all(
                rawCartValues.map(async (item: string) => {
                    const [uuid] = item.split('_');
                    try {
                        const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}`);
                        const data = await response.json();
                        const name = data.metadata?.['dc.title']?.[0]?.value || 'Unknown';
                        return { fullUuid: item, uuid, name };
                    } catch (err) {
                        console.error(`Failed to fetch bitstream info for ${uuid}:`, err);
                        return { fullUuid: item, uuid, name: 'Unknown' };
                    }
                })
            );

            setCartItems(detailedItems);
        } catch (error) {
            console.error('Failed to fetch user cart:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper
            sx={{
                width: '100%',
                maxWidth: '700px',
                mx: 'auto',
                mt: 6,
                p: 3,
                borderRadius: 4,
                overflow: 'hidden',
            }}
        >
            <Typography variant="h5" gutterBottom>
                My Cart
            </Typography>

            {cartItems.length === 0 ? (
                <Box textAlign="center" py={4}>
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'grey.500', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Your cart is empty.
                    </Typography>
                    <Button variant="contained" color="primary">
                        Add Books
                    </Button>
                </Box>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>#</strong></TableCell>
                                <TableCell><strong>Document Name</strong></TableCell>
                                <TableCell><strong>Action</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cartItems.map((item, index) => (
                                <TableRow key={item.fullUuid}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => downloadPDF(item.fullUuid, item.name)}
                                        >
                                            Download
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default MyCart;

