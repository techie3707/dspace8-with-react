import React, { useEffect, useState } from 'react';
import {
    searchObjects,
    fetchFacets,
    fetchHasFileCounts,
    parseSearchParamsFromUrl,
    updateUrlWithSearchParams
} from '../../api/searchApi';
import './Search.css';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import YearRangeSlider from '../Search/YearRangeSlider';
import {
    sortOptions,
    resultsPerPageOptions,
    filterSections,
    metadataFields,
    FilterSection,
    SearchParams,
    FilterOption
} from '../../data/searchData';
import { useNavigate } from 'react-router-dom';
import { Button, Grid, TextField } from '@mui/material';
import { iconsImgs } from '../../utils/images';

const Search: React.FC = () => {
    const initialParams = parseSearchParamsFromUrl();

    const [inputValue, setInputValue] = useState<string>(initialParams.query || '');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>(initialParams.filters || {});
    const [facets, setFacets] = useState<Record<string, FilterOption[]>>({});
    const [hasFileCounts, setHasFileCounts] = useState({
        hasFileCount: 0,
        noFileCount: 0
    });

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        filterSections.reduce((acc, section) => {
            acc[section.id] = section.defaultExpanded;
            return acc;
        }, {} as Record<string, boolean>)
    );

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState<number>((initialParams.page ?? 0) + 1 || 1);
    const [size, setSize] = useState<number>(initialParams.size || resultsPerPageOptions[3].value);
    const [totalData, setTotalData] = useState<number>(0);
    const [sortOption, setSortOption] = useState(sortOptions[0].value);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const getSortParam = (): string => {
        const option = sortOptions.find(opt => opt.value === sortOption);
        return option ? option.apiValue : 'score,DESC';
    };

    const fetchAllFacets = async (currentFilters: Record<string, any> = filters) => {
        try {
            const params: SearchParams = {
                query: inputValue,
                page: 0,
                size: 5,
                filters: currentFilters,
                sort: getSortParam()
            };

            const [facetsResponse, hasFileResponse] = await Promise.all([
                fetchFacets(params),
                fetchHasFileCounts(params)
            ]);

            setFacets(facetsResponse);
            setHasFileCounts(hasFileResponse);
        } catch (error) {
            console.error('Error fetching facets:', error);
        }
    };

    const handleSearch = async (
        currentFilters: Record<string, any> = filters,
        currentPage: number = page,
        itemsPerPage: number = size,
        resetPage: boolean = false,
        sort: string = getSortParam()
    ) => {
        setIsLoading(true);
        try {
            const pageToFetch = resetPage ? 1 : currentPage;
            const params: SearchParams = {
                query: inputValue,
                page: pageToFetch - 1,
                size: itemsPerPage,
                sort: sort,
                filters: currentFilters
            };

            updateUrlWithSearchParams(params);

            const data = await searchObjects(params);

            setSearchResults(data.results);
            setTotalData(data.totalElements);

            if (resetPage) {
                setPage(1);
            }

            await fetchAllFacets(currentFilters);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, []);

    const updateFilter = (filterType: string, value: any, isChecked: boolean) => {
        setFilters(prev => {
            let newValue;
            const section = filterSections.find(s => s.id === filterType);

            if (!section) return prev;

            if (section.filterType === 'boolean') {
                newValue = isChecked ? value : null;
            } else if (section.filterType === 'range') {
                newValue = isChecked ? [value] : [];
            } else {
                newValue = isChecked
                    ? Array.from(new Map([...(prev[filterType] || []), value].map(item => [item, item])).keys())
                    : (prev[filterType] || []).filter((item: string) => item !== value);
            }

            const newFilters = {
                ...prev,
                [filterType]: newValue
            };

            handleSearch(newFilters, 1, size, true, getSortParam());

            return newFilters;
        });
    };

    const getMetadataValue = (metadata: any, field: string): string | null => {
        if (metadata && metadata[field] && metadata[field].length > 0) {
            return metadata[field][0].value;
        }
        return null;
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        handleSearch(filters, newPage, size, false, getSortParam());
    };

    const resetFilters = () => {
        const newFilters = {};
        setFilters(newFilters);
        handleSearch(newFilters, 1, size, true);
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const renderFilterSection = (section: FilterSection) => {
        switch (section.filterType) {
            case 'checkbox':
                return (
                    facets[section.id]?.length ? (
                        <ul style={{ listStyle: 'none', padding: '0' }}>
                            {facets[section.id].map((option, index) => (
                                <li key={index} style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={(filters[section.id] || []).includes(option.id)}
                                                onChange={(e) => updateFilter(section.id, option.id, e.target.checked)}
                                            />
                                            <span style={{ marginLeft: '10px' }}>{option.label}</span>
                                        </div>
                                        <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '33px' }}>
                                            {option.count}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    ) : <div>No options found</div>
                );
            case 'range':
                return (
                    <YearRangeSlider
                        onApply={(startYear, endYear) => {
                            const dateRange = `${startYear} - ${endYear}`;
                            updateFilter(section.id, dateRange, true);
                        }}
                    />
                );
            case 'boolean':
                return (
                    <ul style={{ listStyle: 'none', padding: '0' }}>
                        <li style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={filters[section.id] === true}
                                        onChange={(e) => updateFilter(section.id, true, e.target.checked)}
                                    />
                                    <span style={{ marginLeft: '10px' }}>Yes</span>
                                </div>
                                <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '33px' }}>
                                    {hasFileCounts.hasFileCount}
                                </span>
                            </label>
                        </li>
                    </ul>
                );
            default:
                return null;
        }
    };

    return (
        <div className="search-container row">
            <div className="filters-and-results">
                <div className='filters-and-setting col-3'>
                    <div className="filters">
                        <h2>Filters</h2>

                        {filterSections.map(section => (
                            <div key={section.id}>
                                <div>
                                    <h5>{section.label}</h5>
                                    <button onClick={() => toggleSection(section.id)}>
                                        {expandedSections[section.id] ? '-' : '+'}
                                    </button>
                                </div>
                                {expandedSections[section.id] && (
                                    <div style={{ padding: '10px' }}>
                                        {renderFilterSection(section)}
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
                            onClick={resetFilters}
                        >
                            Reset filters
                        </button>
                    </div>

                    <div className="dropdown-container">
                        <h1>Setting</h1>
                        <div>
                            <label htmlFor="sort">Sort By</label>
                            <select
                                id="sort"
                                value={sortOption}
                                onChange={(e) => {
                                    setSortOption(e.target.value);
                                    handleSearch(filters, page, size, false, getSortParam());
                                }}
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="results-per-page">Results per page</label>
                            <select
                                id="results-per-page"
                                value={size}
                                onChange={(e) => {
                                    const newSize = parseInt(e.target.value, 10);
                                    setSize(newSize);
                                    handleSearch(filters, 1, newSize, true, getSortParam());
                                }}
                            >
                                {resultsPerPageOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="search-results col-10">
                    <div className='col-12'>
                    <Grid container alignItems="center" className="search-container">
                        <Grid item xs={8.5} sm={8.5} lg={10}>
                            <TextField
                                label="Search the repository..."
                                variant="outlined"
                                fullWidth
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="search-field"
                                InputLabelProps={{ className: "custom-label" }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(filters, 1, size, true, getSortParam());
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item>
                            <Button
                                className="button_search"
                                variant="contained"
                                onClick={() => handleSearch(filters, 1, size, true, getSortParam())}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </Button>
                        </Grid>
                    </Grid>
                    </div>
                    


                    <div className="results-header col-11">
                        <h2>Search Results</h2>
                        <div>
                        <button
                                className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <img className="sresult_icon" src={iconsImgs.grid} alt="Grid" />
                            </button>
                            <button
                                className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <img className="sresult_icon" src={iconsImgs.list} alt="List" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-indicator">Loading results...</div>
                    ) : (
                        <>
                            {viewMode === 'list' ? (
                                <ul className="results-list" style={{ width: '145vh' }}>
                                    {searchResults.map((result, index) => {
                                        const metadata = result._embedded?.indexableObject?.metadata;
                                        const type = result._embedded?.indexableObject?.type;
                                        const title = getMetadataValue(metadata, metadataFields.title);
                                        const uuid = result._embedded?.indexableObject?.uuid;
                                        const abstract = getMetadataValue(metadata, metadataFields.abstract);
                                        const date = getMetadataValue(metadata, metadataFields.date);
                                        const author = getMetadataValue(metadata, metadataFields.author);
                                        const entity = getMetadataValue(metadata, metadataFields.entityType);
                                        const publisher = getMetadataValue(metadata, metadataFields.publisher);
                                        const displayType = entity || type;

                                        const handleTitleClick = () => {
                                            if (uuid) {
                                                navigate(`/items/${uuid}`);
                                            }
                                        };

                                        return (
                                            <li key={index}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <img
                                                        src="#"
                                                        alt="No thumbnail Available"
                                                        style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            marginRight: '10px',
                                                            backgroundColor: '#eee'
                                                        }}
                                                    />
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                            <span style={{
                                                                backgroundColor: '#eee', padding: '2px 5px', borderRadius: '3px', marginRight: '10px'
                                                            }}>
                                                                {displayType}
                                                            </span>
                                                            <h3
                                                                style={{ margin: '0', cursor: 'pointer' }}
                                                                onClick={handleTitleClick}
                                                            >{title}</h3>
                                                        </div>
                                                        {date && (
                                                            <p style={{ margin: '0', color: '#666' }}>
                                                                {`(${publisher},${date}) ${author}`}
                                                            </p>
                                                        )}
                                                        {abstract && (
                                                            <>
                                                                <p style={{ margin: '10px 0', color: '#666' }}>{abstract}</p>
                                                                <button style={{
                                                                    padding: '5px 10px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px'
                                                                }}>
                                                                    Show more
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <ul className="results-grid" style={{ width: '145vh' }}>
                                    {searchResults.map((result, index) => {
                                        const metadata = result._embedded?.indexableObject?.metadata;
                                        const type = result._embedded?.indexableObject?.type;
                                        const title = getMetadataValue(metadata, metadataFields.title);
                                        const uuid = result._embedded?.indexableObject?.uuid;
                                        const abstract = getMetadataValue(metadata, metadataFields.abstract);
                                        const date = getMetadataValue(metadata, metadataFields.date);
                                        const author = getMetadataValue(metadata, metadataFields.author);
                                        const entity = getMetadataValue(metadata, metadataFields.entityType);
                                        const publisher = getMetadataValue(metadata, metadataFields.publisher);
                                        const displayType = entity || type;
                                        const handleTitleClick = () => {
                                            if (uuid) {
                                                navigate(`/items/${uuid}`);
                                            }
                                        };

                                        return (
                                            <li key={index} className='grid_main'>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <img
                                                        src="#"
                                                        alt="No thumbnail Available"
                                                        style={{ width: '50px', height: '50px', marginRight: '10px', backgroundColor: '#eee' }}
                                                    />
                                                    <div style={{ border: 'none' }}>
                                                        <div style={{ marginBottom: '10px' }}>
                                                            <span style={{
                                                                border: 'none',
                                                                backgroundColor: '#eee',
                                                                padding: '2px 5px'
                                                            }}>
                                                                {displayType}
                                                            </span>
                                                        </div>
                                                        <h3
                                                            style={{ margin: '0', cursor: 'pointer' }}
                                                            onClick={handleTitleClick}
                                                        >{title}</h3>
                                                        {date && (
                                                            <p style={{ margin: '10px 0', color: '#666' }}>
                                                                {`(${publisher},${date}) ${author}`}
                                                            </p>
                                                        )}
                                                        {abstract && (
                                                            <>
                                                                <p style={{ margin: '10px 0', color: '#666' }}>{abstract}</p>
                                                                <button style={{ padding: '5px 10px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px' }}>
                                                                    Show more
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {totalData > 0 && (
                                <PaginationComponent
                                    totalData={totalData}
                                    perPage={size}
                                    currentPage={page}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;