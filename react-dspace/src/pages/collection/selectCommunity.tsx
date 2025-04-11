import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './collection.css';
import { fetchCommunities } from '../../api/selectCommunity';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import Loader from '../loader/loader';

interface Community {
    id: string;
    metadata: {
        [key: string]: Array<{ value: string }>;
    };
}

const SelectCommunity: React.FC = () => {
    const [searchText, setSearchText] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(10);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [totalData, setTotalData] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const navigate = useNavigate();

    const fetchData = async (page: number, size: number, searchValue: string = '') => {
        try {
            setLoading(true);
            const data = await fetchCommunities(page, size, searchValue);
            setCommunities(data?.communities || []);
            setTotalData(data?.totalElements || 0);
        } catch (error) {
            console.error('Error fetching communities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            fetchData(page, size, searchText);
        }, 500); 
        setSearchTimeout(timeout);
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [page, size, searchText]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchText(value);
        setPage(0); 
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage - 1);
    };

    const getMetadataValue = (metadata: Community['metadata'], field: string): string | null => {
        if (metadata && metadata[field] && metadata[field].length > 0) {
            return metadata[field][0].value;
        }
        return null;
    };

    return (
        <div className='container'>
            <div className='header'>
                <h1>New collection</h1>
                <h4>Create a new collection in</h4>
            </div>
            {loading && <Loader />}
            <input 
                className='input' 
                type="text" 
                value={searchText}
                onChange={handleSearchChange}
                placeholder="Search communities..."
            />
            <div className="list-container">
                {communities.map((community, index) => (
                   <div
                   key={index}
                   className="option-items cursor-pointer"
                   onClick={() => {
                     navigate(`/create-collection/${community.id}/${getMetadataValue(community.metadata, 'dc.title')}`);
                   }}
                 >
                   <div className="option-item">
                     {getMetadataValue(community.metadata, 'dc.title')}
                   </div>
                 </div>
                ))}
            </div>
            <div className="pagination-container">
                <PaginationComponent
                    totalData={totalData}
                    perPage={size}
                    currentPage={page + 1}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default SelectCommunity;