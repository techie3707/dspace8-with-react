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
import { getAuthHeaders } from '../../api/searchApi';

type MyCartProps = {
    userId: string;
};

type CartItemInfo = {
    fullUuid: string;
    uuid: string;
    name: string;
    date: string;
    pages: string | null;

};
type SortKey = 'name' | 'date' | null;
type SortConfig = {
    key: SortKey;
    direction: 'asc' | 'desc';
};

const MyCart: React.FC<MyCartProps> = ({ userId }) => {
    const [cartItems, setCartItems] = useState<CartItemInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

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
                    const parts = item.split('_');
                    const uuid = parts[0];
                    const date = parts[1] || 'N/A';
                    const pages = parts.length > 2 ? parts.slice(2).join('_') : null;

                    try {
                        const headers = getAuthHeaders();
                        const response = await fetch(
                            `${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}`,
                            {
                                method: 'GET',
                                headers: headers,
                            }
                        );
                        const data = await response.json();
                        const name = data.metadata?.['dc.title']?.[0]?.value || 'Unknown';

                        return { fullUuid: item, uuid, name, date, pages };
                    } catch (err) {
                        console.error(`Failed to fetch bitstream info for ${uuid}:`, err);
                        return { fullUuid: item, uuid, name: 'Unknown', date, pages };
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

    const handleSort = (key: SortKey) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const sortedItems = [...cartItems].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortSymbol = (key: SortKey) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
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
                                <TableCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                    <strong>Document Name{getSortSymbol('name')}</strong>
                                </TableCell>
                                <TableCell onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                                    <strong>Date Added{getSortSymbol('date')}</strong>
                                </TableCell>
                                <TableCell><strong>Action</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedItems.map((item, index) => (
                                <TableRow key={item.fullUuid}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() =>
                                                item.pages
                                                    ? downloadPDF(item.uuid, item.name, item.pages)
                                                    : downloadPDF(item.uuid, item.name)
                                            }
                                        >
                                            Download
                                        </Button>
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

