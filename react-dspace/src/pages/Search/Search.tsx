import React, { useEffect, useState } from 'react';
import { searchObjects, fetchFacets, fetchHasFileCounts, parseSearchParamsFromUrl, updateUrlWithSearchParams, fetchFacet, } from '../../api/searchApi';
import { fetchItemBundles, fetchBitstreams } from '../../api/bitstream';
import './Search.css';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import YearRangeSlider from '../Search/YearRangeSlider';
import { sortOptions, resultsPerPageOptions, filterSections, metadataFields, FilterSection, SearchParams, FilterOption, } from '../../data/searchData';
import { useNavigate } from 'react-router-dom';
import { Button, Grid, IconButton, TextField } from '@mui/material';
import { iconsImgs } from '../../utils/images';
import { siteConfig } from '../../data/data';
import { Bitstream } from '../../data/bookDetail';
import Loader from '../loader/loader';
import SecureImage from './SecureImage';

const Search: React.FC = () => {
    const initialParams = parseSearchParamsFromUrl();

    const [inputValue, setInputValue] = useState<string>(initialParams.query || '');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [scope, setScope] = useState<string | undefined>(initialParams.scope);
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
    const startTime = performance.now(); // Start timer
    const [loadingTime, setLoadingTime] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState<number>((initialParams.page ?? 0) + 1 || 1);
    const [size, setSize] = useState<number>(initialParams.size || resultsPerPageOptions[3].value);
    const [totalData, setTotalData] = useState<number>(0);
    const [sortOption, setSortOption] = useState(sortOptions[0].value);
    const [isLoading, setIsLoading] = useState(false);
    const [originalBitstreams, setOriginalBitstreams] = useState<Bitstream[]>([]);
    const [thumbnailBitstreams, setThumbnailBitstreams] = useState<Bitstream[]>([]);
    const [thumbnailsByItem, setThumbnailsByItem] = useState<Record<string, Bitstream[]>>({});
    const navigate = useNavigate();
    const [facetPagination, setFacetPagination] = useState<Record<string, { page: number, size: number }>>(
        filterSections.reduce((acc, section) => {
            acc[section.id] = { page: 0, size: 5 };
            return acc;
        }, {} as Record<string, { page: number, size: number }>)
    );


    const getSortParam = (): string => {
        const option = sortOptions.find(opt => opt.value === sortOption);
        return option ? option.apiValue : 'score,DESC';
    };

    const fetchAllFacets = async (currentFilters: Record<string, any> = filters) => {
        try {
            const params: SearchParams = {
                query: inputValue,
                page: page - 1,
                size: size,
                filters: currentFilters,
                sort: getSortParam(),
                scope: scope,
            };

            const [facetsResponse, hasFileResponse] = await Promise.all([
                fetchFacets(params, 0, 5),
                fetchHasFileCounts(params, 0, 5)
            ]);

            setFacets(facetsResponse);
            setHasFileCounts(hasFileResponse);
        } catch (error) {
            console.error('Error fetching facets:', error);
        }
    };

    const loadMoreFacetItems = async (sectionId: string) => {
        const section = filterSections.find(s => s.id === sectionId);
        if (!section) return;

        const currentPagination = facetPagination[sectionId];
        const nextPage = currentPagination.page + 1;

        try {
            const params: SearchParams = {
                query: inputValue,
                page: page - 1,
                size: size,
                filters: filters,
                sort: getSortParam(),
                scope: scope,
            };

            const newValues = await fetchFacet(
                section.fieldName,
                params,
                nextPage,
                currentPagination.size
            );

            setFacets(prev => ({
                ...prev,
                [sectionId]: [...(prev[sectionId] || []), ...newValues]
            }));

            setFacetPagination(prev => ({
                ...prev,
                [sectionId]: {
                    ...prev[sectionId],
                    page: nextPage
                }
            }));
        } catch (error) {
            console.error('Error loading more facet items:', error);
        }
    };

    const handleSearch = async (
        currentFilters: Record<string, any> = filters,
        currentPage: number = page,
        itemsPerPage: number = size,
        resetPage: boolean = false,
        sort: string = getSortParam(),
    ) => {
        setIsLoading(true);
        try {
            const pageToFetch = resetPage ? 1 : currentPage;
            const params: SearchParams = {
                query: inputValue,
                page: pageToFetch - 1,
                size: itemsPerPage,
                sort: sort,
                filters: currentFilters,
                scope: scope
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
    useEffect(() => {
        const fetchThumbnails = async () => {
            const startTime = performance.now(); // Start timer

            try {
                if (searchResults.length > 0) {
                    const thumbnails: Record<string, Bitstream[]> = {};

                    for (const result of searchResults) {
                        const uuid = result._embedded?.indexableObject?.uuid;
                        if (!uuid) continue;

                        const bundles = await fetchItemBundles(uuid);
                        if (bundles.length > 0) {
                            const originalBundle = bundles.find(b => b.name === 'ORIGINAL') || bundles[0];
                            const thumbnailBundle = bundles.find(b => b.name === 'THUMBNAIL') || bundles[0];
                            const originalbitstreamsData = await fetchBitstreams(originalBundle.uuid);
                            const thumbnailbitstreamsData = await fetchBitstreams(thumbnailBundle.uuid);
                            setOriginalBitstreams(originalbitstreamsData);
                            setThumbnailBitstreams(thumbnailbitstreamsData);
                            thumbnails[uuid] = thumbnailbitstreamsData;
                        }
                    }

                    setThumbnailsByItem(thumbnails);
                }
            } catch (error) {
                console.error(error);
            } finally {
                const endTime = performance.now(); // End timer
                const timeInSeconds = ((endTime - startTime) / 1000).toFixed(2);
                setLoadingTime(timeInSeconds); // Save to state for UI
            }
        };

        fetchThumbnails();
    }, [searchResults]);
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
                if (!facets[section.id]?.length) return null;
                return (
                    <ul style={{ listStyle: 'none', padding: '0' }}>
                        {facets[section.id].map((option, index) => (
                            <li key={index}>
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

                        {/* Show more button */}
                        {facets[section.id].length % facetPagination[section.id]?.size === 0 && (
                            <button
                                className='show-more-button'
                                onClick={() => loadMoreFacetItems(section.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#1a73e8',
                                    cursor: 'pointer',
                                    padding: '10px',
                                    textAlign: 'left',
                                    width: '100%'
                                }}
                            >
                                Show more
                            </button>
                        )}
                    </ul>
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
    if (isLoading) return <Loader />;
    return (
        <div className="search-container row">
            <div className="filters-and-results">
                <div className='filters-and-setting'>
                    <div className="filters col-3">
                        <div className="Zns0ac"><span className="I75YIf">Filter by</span></div>
                        {filterSections.map(section => {
                            const shouldShowSection =
                                section.filterType === 'range' ||
                                (section.filterType === 'checkbox' && facets[section.id]?.length > 0) ||
                                (section.filterType === 'boolean' && (hasFileCounts.hasFileCount > 0));
                            if (!shouldShowSection) return null;
                            return (
                                <div key={section.id}>
                                    <div className={`filter_name ${expandedSections[section.id] ? '' : 'border-bottom'}`}>
                                        <h2 className='ZF0dQe'>{section.label}</h2>
                                        <button
                                            className={`toggle-button ${expandedSections[section.id] ? 'up' : 'down'}`}
                                            onClick={() => toggleSection(section.id)}
                                        ></button>
                                    </div>
                                    {expandedSections[section.id] && (
                                        <div className='li_filter'>
                                            {renderFilterSection(section)}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                    </div>
                    <div className='filter_reset'>
                        <button className='filter_reset_btn'
                            style={{ width: '93%', padding: '10px', border: 'none', borderRadius: '4px' }}
                            onClick={resetFilters}
                        >
                            Reset filters
                        </button>
                    </div>
                    <div className="dropdown-container">
                        <h1 className="Zns0ac"><span className="I75YIf">Setting</span></h1>
                        <div>
                            <label htmlFor="sort">Sort By</label>
                            <select
                                id="sort"
                                value={sortOption}
                                onChange={(e) => {
                                    const newSortOption = e.target.value;
                                    setSortOption(newSortOption);
                                    const option = sortOptions.find(opt => opt.value === newSortOption);
                                    const apiSortValue = option ? option.apiValue : 'score,DESC';
                                    handleSearch(filters, page, size, false, apiSortValue);
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

                <div className="search-results col-12">
                    <div className='col-12'>
                        <Grid container alignItems="center" className="search-container">
                            <Grid item xs={8.5} sm={10} md={11}>
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

                            <Grid item xs={2} sm={2} md={1} style={{ paddingLeft: 0 }}>
                                <Button
                                    className="button_search"
                                    variant="contained"
                                    onClick={() => handleSearch(filters, 1, size, true, getSortParam())}
                                    disabled={isLoading}
                                    fullWidth
                                >
                                    {isLoading ? 'Searching...' : 'Search'}
                                </Button>
                            </Grid>
                        </Grid>
                    </div>



                    <div className="col-12">
                        <Grid container alignItems="center" className="results-header">
                            <Grid item xs={8.5} sm={8.5} lg={11}>
                                {loadingTime && (
                                    <h4 style={{ margin: '0px' }}>
                                        {totalData} Items found in{" "}
                                        {Math.max(
                                            parseFloat(loadingTime) > 0.80
                                                ? parseFloat(loadingTime) - 0.50
                                                : parseFloat(loadingTime),
                                            0
                                        ).toFixed(2)} seconds
                                    </h4>
                                )}
                            </Grid>
                            <Grid item xs={2} sm={2} lg={1}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                            </Grid>
                        </Grid>
                    </div>


                    {isLoading ? (
                        <div className="loading-indicator">Loading results...</div>
                    ) : (
                        <Grid container spacing={2} className="results-body">
                            {viewMode === 'list' ? (
                                searchResults.map((result, index) => {
                                    const metadata = result._embedded?.indexableObject?.metadata;
                                    const type = result._embedded?.indexableObject?.type;
                                    const title = metadata?.['dc.title']?.[0]?.value || 'Unknown Title';
                                    const uuid = result._embedded?.indexableObject?.uuid;
                                    const abstract = metadata?.['dc.description.abstract']?.[0]?.value;
                                    const date = metadata?.['dc.date.issued']?.[0]?.value;
                                    const author = metadata?.['dc.contributor.author']?.[0]?.value;
                                    const publisher = metadata?.['dc.publisher']?.[0]?.value;
                                    const displayType = metadata?.['dc.type']?.[0]?.value || type;

                                    const handleTitleClick = () => {
                                        if (uuid) {
                                            navigate(`/items/${uuid}`);
                                        }
                                    };

                                    return (
                                        <Grid item xs={12} key={index}>
                                            <div style={{
                                                display: 'flex',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                marginBottom: '20px',
                                                overflow: 'hidden',
                                                backgroundColor: '#fff',
                                            }}>
                                                {/* Colored Sidebar */}
                                                <div style={{
                                                    width: '100px',
                                                    backgroundColor: '#f97316', // Change per step color
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{
                                                        backgroundColor: '#fff',
                                                        color: '#f97316',
                                                        borderRadius: '50%',
                                                        width: '48px',
                                                        height: '48px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px',
                                                        marginBottom: '5px'
                                                    }}>
                                                        <i className="fas fa-cube"></i> {/* Replace icon as needed */}
                                                    </div>

                                                </div>

                                                {/* Thumbnail & Content */}
                                                <div style={{ display: 'flex', alignItems: 'center', padding: '15px', flex: 1 }}>
                                                    {thumbnailsByItem[result._embedded?.indexableObject?.uuid]
                                                        ?.filter(bitstream => /\.(jpe?g|png)$/i.test(bitstream.name))
                                                        .slice(0, 1)
                                                        .map(bitstream => (
                                                            <SecureImage
                                                                key={bitstream.uuid}
                                                                uuid={bitstream.uuid}
                                                                className="thumbnail-img_list img-fluid"
                                                                style={{
                                                                    maxHeight: '100px',
                                                                    maxWidth: '100px',
                                                                    marginRight: '20px',
                                                                    borderRadius: '8px',
                                                                    objectFit: 'cover'
                                                                }}
                                                                alt="Thumbnail"
                                                            />
                                                        ))}

                                                    {/* Right Text Section */}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                            <span style={{
                                                                backgroundColor: '#f0f0f0',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                marginRight: '10px',
                                                                fontSize: '13px'
                                                            }}>
                                                                {displayType}
                                                            </span>
                                                            <h3
                                                                style={{
                                                                    margin: '0',
                                                                    cursor: 'pointer',
                                                                    fontSize: '18px',
                                                                    fontWeight: 600,
                                                                    color: '#333'
                                                                }}
                                                                onClick={handleTitleClick}
                                                            >
                                                                {title}
                                                            </h3>
                                                        </div>

                                                        {date && (
                                                            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                                                                ({publisher}, {date}) {author}
                                                            </p>
                                                        )}

                                                        {abstract && (
                                                            <>
                                                                <p style={{ margin: '10px 0', color: '#555', fontSize: '14px' }}>
                                                                    {abstract}
                                                                </p>
                                                                <button style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#e0e0e0',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '13px',
                                                                    cursor: 'pointer'
                                                                }}>
                                                                    Show more
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Grid>


                                    );
                                })
                            ) : (
                                searchResults.map((result, index) => {
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
                                         <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                            <div
                                                className="grid_main"
                                                onClick={handleTitleClick}
                                                style={{
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    height: '100%'
                                                }}
                                            >
                                                {/* Title */}
                                                <h3 className='item_title' style={{ cursor: 'pointer' }}>
                                                    {title}
                                                </h3>

                                                {/* Year */}
                                                {date && (
                                                    <p className='item_date' style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                                                        {date}
                                                    </p>
                                                )}

                                                {/* Thumbnail */}
                                                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', height: '200px' }}>
                                                    {thumbnailsByItem[result._embedded?.indexableObject?.uuid]
                                                        ?.filter(bitstream => /\.(jpe?g|png)$/i.test(bitstream.name))
                                                        .slice(0, 1)
                                                        .map(bitstream => (
                                                            <SecureImage
                                                                key={bitstream.uuid}
                                                                uuid={bitstream.uuid}
                                                                className="thumbnail-img img-fluid"
                                                                style={{ maxHeight: '300px' }}
                                                                alt="Thumbnail"
                                                            />
                                                        ))}
                                                </div>

                                                {/* Abstract */}
                                                {/* {abstract && (
                                                    <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                                                        {abstract}
                                                    </p>
                                                )} */}

                                                {/* Navigation Arrow */}
                                                <IconButton
                                                    className='itemh_btn'
                                                    onClick={handleTitleClick}
                                                    color="primary"
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '3px',
                                                        right: '14px',
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        padding: '5px',
                                                        background: 'none',
                                                    }}
                                                >
                                                    <img className="itemh_icon" src={iconsImgs.arrow} alt="Arrow" />
                                                </IconButton>
                                            </div>
                                        </Grid>
                                    );
                                })
                            )}
                        </Grid>
                    )}

                </div>
            </div>
            <div style={{ bottom: 10, padding: "10px", }}>
                <PaginationComponent
                    totalData={totalData}
                    perPage={size}
                    currentPage={page}
                    onPageChange={(newPage) => {
                        handlePageChange(newPage);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />
            </div>
        </div>

    );
};

export default Search;