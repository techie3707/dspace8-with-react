import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Pagination
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { itemReportApi } from '../../api/itemReport';
import Loader from '../loader/loader';
import { Collection, Community, Item, itemReportField, Metadata } from '../../data/itemReportData';

const ItemReportTable = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [csvLoading, setCsvLoading] = useState<boolean>(false);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await itemReportApi() as Community[];
        
        const Items: Item[] = data.flatMap((community: Community) => 
          community.collections.flatMap((collection: Collection) => 
            collection.items.map((item: Item) => ({
              ...item,
            }))
          )
        );
        
        setItems(Items);
        setTotalPages(Math.ceil(Items.length / itemsPerPage));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching items:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const downloadCSV = () => {
    setCsvLoading(true);
    try {
        const headers = [
            ...itemReportField.map(field => field.header),
        ];

        const rows = items.map((item) => {
            const metadata = item.metadata || {};
            
            const metadataValues = itemReportField.map(field => 
                getMetadataValue(metadata, field.metaData)
            );
            
            return [
                ...metadataValues,
            ];
        });

        const escapeCsvField = (field: string) => {
            if (field.includes('"') || field.includes(',') || field.includes('\n')) {
                return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
        };

        const csvContent = [
            headers.map(escapeCsvField).join(','),
            ...rows.map(row => row.map(escapeCsvField).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'item_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CSV:', error);
    } finally {
        setCsvLoading(false);
    }
};

  const getMetadataValue = (metadata: Metadata, field: string): string => {
    return metadata?.[field]?.[0] || 'N/A';
  };

  const paginatedItems = items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container className="top_padding">
      <Grid container justifyContent="space-between" alignItems="center" className="header_epeople">
        <Typography variant="h4" sx={{ mb: 1 }}>
          Item Report
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={downloadCSV}
          disabled={csvLoading}
          sx={{ mb: 1 }}
        >
          {csvLoading ? <Loader /> : "Download CSV"}
        </Button>
      </Grid>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "auto", my: 3 }} />
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {itemReportField.map((field) => (
                    <TableCell key={field.id}> 
                      <strong>{field.header}</strong>
                    </TableCell>
                  ))}
                  
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((item: Item) => {
                  const metadata = item.metadata || {};
                  return (
                    <TableRow
                      key={item.itemId}
                      sx={{
                        "&:hover": { backgroundColor: "#f0f0f0" },
                        cursor: "default",
                      }}
                    >
                      {itemReportField.map((field) => (
                        <TableCell key={`${item.itemId}-${field.id}`}>
                          {getMetadataValue(metadata, field.metaData)}
                        </TableCell>
                      ))}
                      
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 3 }}
          />
        </>
      )}
    </Container>
  );
};

export default ItemReportTable;