import React, { useEffect, useState } from 'react';
import { fetchItemDetails } from '../../api/item';
import { fetchBitstreams, fetchItemBundles } from '../../api/bitstream';
import { useNavigate, useParams } from 'react-router-dom';
import './bookDetail.css';
import { Bitstream, BookDetailsData } from '../../data/bookDetail';
import { siteConfig } from '../../data/data';
import { downloadPDF } from '../../api/bitstream';
import { useAuth } from '../../contexts/AuthContext';
import { iconsImgs } from '../../utils/images';
import { IconButton } from '@mui/material';
import Loader from '../loader/loader';




const BookDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<BookDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [originalBitstreams, setOriginalBitstreams] = useState<Bitstream[]>([]);
    const [thumbnailBitstreams, setThumbnailBitstreams] = useState<Bitstream[]>([]);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                if (id) {
                    const itemDetails = await fetchItemDetails(id);
                    setItem(itemDetails);
                    const bundles = await fetchItemBundles(id);
                    if (bundles.length > 0) {
                        const originalBundle = bundles.find(b => b.name === 'ORIGINAL') || bundles[0];
                        const thumbnailBundle = bundles.find(b => b.name === 'THUMBNAIL') || bundles[0];
                        const originalbitstreamsData = await fetchBitstreams(originalBundle.uuid);
                        const thumbnailbitstreamsData = await fetchBitstreams(thumbnailBundle.uuid);
                        setOriginalBitstreams(originalbitstreamsData);
                        setThumbnailBitstreams(thumbnailbitstreamsData);
                    }
                }
            } catch (error) {
                setError("Data not found");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getMetadataValue = (field: string): string | null => {
        if (!item || !item.metadata) return null;
        const metadataField = item.metadata[field as keyof typeof item.metadata];
        return metadataField && metadataField.length > 0 ? metadataField[0].value : null;
    };

    const title = getMetadataValue('dc.title');
    const author = getMetadataValue('dc.contributor.author');
    const description = getMetadataValue('dc.description');
    const abstract = getMetadataValue('dc.description.abstract');
    const dateIssued = getMetadataValue('dc.date.issued');
    const uri = getMetadataValue('dc.identifier.uri');
    const publisher = getMetadataValue('dc.publisher');

    if (isLoading) return <Loader />;
    if (error) return <h3>{error}</h3>;
    if (!item) return <div>Item not found</div>;

    return (
        <>

            <div className='container main_bdtl_div'>
                <div className='d-flex align-items-center mb-3'>
                    <IconButton color="primary" className="back_btn" onClick={() => navigate(-1)} title="back_btn">
                        <img className="back_icon" src={iconsImgs.back_btn} alt="Back" />
                    </IconButton>
                    <h1 className='bdtl_title ms-2'>{title}</h1>
                </div>
                <div className='row'>
                    <div className='col-lg-4 col-md-12 col-12 text-center mb-3'>
                        {thumbnailBitstreams
                            .filter(bitstream => /\.(jpe?g|png)$/i.test(bitstream.name))
                            .slice(0, 1)
                            .map(bitstream => (
                                <img
                                    key={bitstream.uuid}
                                    className='thumbnail-img img-fluid'
                                    src={`${siteConfig.apiEndpoint}/api/core/bitstreams/${bitstream.uuid}/content`}
                                    alt='Thumbnail'
                                />
                            ))}
                    </div>

                    <div className='col-lg-8 col-md-12 col-12'>
                        <table className='modern-table w-100'>
                            <tbody>
                                {abstract && (
                                    <tr>
                                        <th>Abstract</th>
                                        <td>{abstract}</td>
                                    </tr>
                                )}
                                <tr>
                                    <th>URI</th>
                                    <td>
                                        <a href={uri || ''} target="_blank" rel="noopener noreferrer">
                                            {uri}
                                        </a>
                                    </td>
                                </tr>
                                {description && (
                                    <tr>
                                        <th>Description</th>
                                        <td>{description}</td>
                                    </tr>
                                )}
                                {author && (
                                    <tr>
                                        <th>Author</th>
                                        <td>{author}</td>
                                    </tr>
                                )}
                                {publisher && (
                                    <tr>
                                        <th>Publisher</th>
                                        <td>{publisher}</td>
                                    </tr>
                                )}
                                <tr>
                                    <th>Date</th>
                                    <td>{dateIssued}</td>
                                </tr>
                                {originalBitstreams.length > 0 && (() => {
                                    const pdfBitstreams = originalBitstreams.filter(bitstream => /.pdf$/i.test(bitstream.name));

                                    //  If only one PDF, show simple list format
                                    if (pdfBitstreams.length === 1) {
                                        return (
                                            <tr>
                                                <th>Action</th>
                                                <td>
                                                    <ul className='list-unstyled'>
                                                        {pdfBitstreams.map(bitstream => (
                                                            <li key={bitstream.uuid} className='mb-2'>
                                                                <button className='custom-btn' onClick={() => window.open(`/pdf-viewer?uuid=${bitstream.uuid}`, '_blank')}>
                                                                    View PDF
                                                                </button>
                                                                <button className='custom-btn' onClick={() => window.open(`/flip-book-viewer?uuid=${bitstream.uuid}`, '_blank')}>
                                                                    View In Flip PDF
                                                                </button>
                                                                {!isAuthenticated && (
                                                                    <>
                                                                        <button className='custom-btn' onClick={() => downloadPDF(bitstream.uuid, bitstream.name)}>
                                                                            Download PDF
                                                                        </button>
                                                                        <button className='custom-btn'
                                                                            onClick={() => navigate(`/edit-item/${id}`)}>
                                                                            Edit Item
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        );
                                    }
                                    // If multiple PDFs, show table format
                                    return (
                                        <>
                                            <tr>
                                                <th>PDF Files</th>
                                                <th>Actions</th>
                                            </tr>
                                            {pdfBitstreams.map(bitstream => (
                                                <tr key={bitstream.uuid}>
                                                    <td className="pdf-name-cell">
                                                        {bitstream.name}
                                                    </td>
                                                    <td className="action-buttons-cell">
                                                        <div className="d-flex flex-wrap gap-2">
                                                            <button className='custom-btn' onClick={() => window.open(`/pdf-viewer?uuid=${bitstream.uuid}`, '_blank')}>
                                                                View PDF
                                                            </button>
                                                            <button className='custom-btn' onClick={() => window.open(`/flip-book-viewer?uuid=${bitstream.uuid}`, '_blank')}>
                                                                Flip PDF
                                                            </button>
                                                            {!isAuthenticated && (
                                                                <button className='custom-btn' onClick={() => downloadPDF(bitstream.uuid, bitstream.name)}>
                                                                    Download
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {!isAuthenticated && (
                                                <tr>
                                                    <td colSpan={2} className="text-end">
                                                        <button className='custom-btn' style={{ width: '100%' }} onClick={() => navigate(`/edit-item/${id}`)}>
                                                            Edit Item
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
};

export default BookDetails;
