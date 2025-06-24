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
import SecureImage from '../Search/SecureImage';
import { useUserGroups } from '../../contexts/groupTypeContext';
import { getowningCollection } from '../../api/item';




const BookDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<BookDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [originalBitstreams, setOriginalBitstreams] = useState<Bitstream[]>([]);
    const [thumbnailBitstreams, setThumbnailBitstreams] = useState<Bitstream[]>([]);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isAdministrator, groupCategories } = useUserGroups();
    const [collection, setCollection] = useState<any>(null);
    const fetchOwningCollection = async (itemId: string) => {
        try {
            const collection = await getowningCollection(itemId);
            setCollection(collection);
        } catch (error) {
            console.error("Error fetching owning collection:", error);
        }
    }
    useEffect(() => {
        fetchOwningCollection(id || '');
    }, [])


    const displayEditButton = () => {
        const uploadGroups = groupCategories.upload.map(group =>
            group.name.replace('_Upload', '')
        );

        const adminGroups = groupCategories.admin.map(group =>
            group.name.replace('_Admin', '')
        );

        const allAccessGroups = Array.from(new Set([...uploadGroups, ...adminGroups]));
        return allAccessGroups.includes(collection)
    };

    const isAccess = displayEditButton();

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

    const title = getMetadataValue('dc.filenumber') || getMetadataValue('dc.filename');
    const subject = getMetadataValue('dc.subject');
    const sectionname = getMetadataValue('dc.sectionname');
    const Boxnumber = getMetadataValue('dc.boxnumber');
    const Year = getMetadataValue('dc.yearrange');
    const uri = getMetadataValue('dc.identifier.uri');
    const guruname = getMetadataValue('dc.guruname');
    const month = getMetadataValue('dc.month');
    const filetype = getMetadataValue('dc.filetype');
    const Studentname = getMetadataValue('dc.studentname');
    const shishyaname = getMetadataValue('dc.shishyaname');


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
                                <SecureImage
                                    key={bitstream.uuid}
                                    uuid={bitstream.uuid}
                                    className="thumbnail-img img-fluid"
                                    alt="Thumbnail"
                                />

                            ))}
                    </div>

                    <div className='col-lg-8 col-md-12 col-12'>
                        <table className='modern-table w-100'>
                            <tbody>
                                {Boxnumber && (
                                    <tr>
                                        <th>Box Number</th>
                                        <td>{Boxnumber}</td>
                                    </tr>
                                )}

                                {uri && (
                                    <tr>
                                        <th>URI</th>
                                        <td>
                                            <a href={uri} target="_blank" rel="noopener noreferrer">
                                                {uri}
                                            </a>
                                        </td>
                                    </tr>
                                )}

                                {sectionname && (
                                    <tr>
                                        <th>Section Name</th>
                                        <td>{sectionname}</td>
                                    </tr>
                                )}

                                {subject && (
                                    <tr>
                                        <th>Subject</th>
                                        <td>{subject}</td>
                                    </tr>
                                )}

                                {guruname && (
                                    <tr>
                                        <th>Guru Name</th>
                                        <td>{guruname}</td>
                                    </tr>
                                )}

                                {Year && (
                                    <tr>
                                        <th>Year</th>
                                        <td>{Year}</td>
                                    </tr>
                                )}

                                {month && (
                                    <tr>
                                        <th>Month</th>
                                        <td>{month}</td>
                                    </tr>
                                )}

                                {shishyaname && (
                                    <tr>
                                        <th>Shishya Name</th>
                                        <td>{shishyaname}</td>
                                    </tr>
                                )}

                                {filetype && (
                                    <tr>
                                        <th>File Type</th>
                                        <td>{filetype}</td>
                                    </tr>
                                )}

                                {Studentname && (
                                    <tr>
                                        <th>Student Name</th>
                                        <td>{Studentname}</td>
                                    </tr>
                                )}

                                {originalBitstreams.length > 0 && (() => {
                                    const pdfBitstreams = originalBitstreams.filter(bitstream => /.pdf$/i.test(bitstream.name));

                                    //  If only one PDF, show simple list format
                                    if (pdfBitstreams.length === 1 || pdfBitstreams.length === 0) {
                                        return (
                                            <>
                                                <tr>
                                                    <th>Action</th>
                                                    <td>
                                                        <ul className='list-unstyled'>
                                                            {pdfBitstreams.map(bitstream => (
                                                                <li key={bitstream.uuid} className='mb-2'>
                                                                    <button
                                                                        className="custom-btn"
                                                                        onClick={() =>
                                                                            window.open(
                                                                                `/pdf-viewer?uuid=${encodeURIComponent(bitstream.uuid)}&itemId=${encodeURIComponent(id ?? '')}`,
                                                                                '_blank'
                                                                            )
                                                                        }
                                                                    >
                                                                        View PDF
                                                                    </button>

                                                                    <button className='custom-btn' onClick={() => window.open(`/flip-book-viewer?uuid=${bitstream.uuid}`, '_blank')}>
                                                                        View In Flip PDF
                                                                    </button>
                                                                    {isAuthenticated && (
                                                                        <>
                                                                            <button className='custom-btn' onClick={() => downloadPDF(bitstream.uuid, bitstream.name, id || '')}>
                                                                                Download PDF
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                                {isAuthenticated && (isAdministrator || isAccess) && (
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
                                                            {isAuthenticated && (
                                                                <button className='custom-btn' onClick={() => downloadPDF(bitstream.uuid, bitstream.name, id || '')}>
                                                                    Download
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {isAuthenticated && (
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
