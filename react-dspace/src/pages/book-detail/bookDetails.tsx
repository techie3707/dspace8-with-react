import React, { useEffect, useState } from 'react';
import { fetchBitstreams, fetchItemBundles, fetchItemDetails } from '../../api/searchApi';
import { useNavigate, useParams } from 'react-router-dom';
import './bookDetail.css';
import { Bitstream, BookDetailsData } from '../../data/bookDetail';
import { siteConfig } from '../../data/data';
import { downloadPDF } from '../../api/bitstream';
import { useAuth } from '../../contexts/AuthContext';




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

    if (isLoading) return <div>Loading...</div>;
    if (error) return <h3>{error}</h3>;
    if (!item) return <div>Item not found</div>;

    return (
        <div className='full-section'>
            <button onClick={() => navigate(-1)}> ← Back to result</button>
            <h1>{title}</h1>
            <div className='container' style={{ display: 'flex', justifyContent: "center" }}>
                <div className='left-section'>
                    {thumbnailBitstreams
                        .filter(bitstream => /\.jpe?g|\.png$/i.test(bitstream.name))
                        .map(bitstream => (
                            <img
                                key={bitstream.uuid}
                                style={{ width: "200px", height: "300px" }}
                                src={`${siteConfig.apiEndpoint}/api/core/bitstreams/${bitstream.uuid}/content`}
                            />
                        ))}

                    {originalBitstreams.length > 0 && (
                        <div>
                            <h4>Files</h4>
                            <ul>
                                {originalBitstreams
                                    .filter(bitstream => /.pdf$/i.test(bitstream.name))
                                    .map(bitstream => (
                                        <li key={bitstream.uuid}>
                                            <p>{bitstream.metadata['dc.title']?.[0]?.value || bitstream.name}</p>
                                            <button
                                                onClick={() => window.open(`/pdf-viewer?uuid=${bitstream.uuid}`, '_blank')}
                                            >
                                                View PDF
                                            </button>

                                            <button
                                                onClick={() => window.open(`/flip-book-viewer?uuid=${bitstream.uuid}`, '_blank')}
                                            >
                                                View In Flip PDF
                                            </button>

                                            {isAuthenticated && (
                                                <button onClick={() => downloadPDF(bitstream.uuid, bitstream.name)}>
                                                    Download PDF
                                                </button>
                                            )}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}


                    <div>
                        <h4>Date</h4>
                        <h6>{dateIssued}</h6>
                    </div>

                    {author && (
                        <div>
                            <h3>Author</h3>
                            {author}
                        </div>
                    )}

                    {publisher && (
                        <div>
                            <h3>Publisher</h3>
                            {publisher}
                        </div>
                    )}
                </div>

                <div className='right-section'>
                    {abstract && (
                        <div>
                            <h3>Abstract</h3>
                            <p>{abstract}</p>
                        </div>
                    )}

                    <div>
                        <h3>URI</h3>
                        <p>
                            <a href={uri || ''} target="_blank" rel="noopener noreferrer">
                                {uri}
                            </a>
                        </p>
                    </div>

                    {description && (
                        <div>
                            <h3>Description</h3>
                            <p>{description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
