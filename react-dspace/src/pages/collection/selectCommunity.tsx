import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './collection.css';
import { fetchCommunities } from '../../api/selectCommunity';

interface Community {
    id: string;
    metadata: {
        [key: string]: Array<{ value: string }>;
    };
}

const SelectCommunity: React.FC = () => {
    const [show, setShow] = useState(true);
    const [searchText, setSearchText] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(10);
    const [communities, setCommunities] = useState<Community[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const showCommunity = async () => {
            setShow(true);
            try {
                const data = await fetchCommunities(page, size);
                setCommunities(data?.communities || []);
            } catch (error) {
                console.error('Error fetching communities:', error);
            }
        }
        showCommunity();
    }, []);

    const getMetadataValue = (metadata: Community['metadata'], field: string): string | null => {
        if (metadata && metadata[field] && metadata[field].length > 0) {
            return metadata[field][0].value;
        }
        return null;
    };

    return (
        <div className="container">
            {show && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3 className="modal-title">New collection</h3>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShow(false);
                                    navigate('/');
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <h6 className="modal-subtitle">Create a new collection in</h6>
                            <div className="search-container">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search for a community"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>

                            <div className="options-container">
                                {communities.map((community, index) => (
                                    <div key={index} className="option-item">
                                        <div
                                            className="college-name"
                                            onClick={() => {
                                                navigate(`/create-collection/${community.id}/${getMetadataValue(community.metadata, 'dc.title')}`);
                                            }}
                                        >
                                            {getMetadataValue(community.metadata, 'dc.title')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectCommunity;