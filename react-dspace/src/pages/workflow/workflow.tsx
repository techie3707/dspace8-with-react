import React, { useEffect, useState } from 'react'
import { siteConfig } from '../../data/data';
import { Box, Button, Grid, IconButton, TextField } from '@mui/material';
import { iconsImgs } from '../../utils/images';
import { getWorkflowObject, parseSearchParamsFromUrl,  updateUrlWithSearchParams, workflowFacet, workflowFacets } from '../../api/workflow';
import { FilterOption, Filtervalue,   SearchParams,   WorkspaceItem } from '../../data/workflowdata';
import '../Search/Search.css';
import YearRangeSlider from '../Search/YearRangeSlider';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import { resultsPerPageOptions, sortOptions } from '../../data/searchData';
import { useNavigate } from 'react-router-dom';
import Loader from '../loader/loader';
import { Bitstream } from '../../data/bookDetail';
import { fetchBitstreams, fetchItemBundles } from '../../api/bitstream';
import SecureImage from '../Search/SecureImage';

const Workflow = () => {
    const initialParams = parseSearchParamsFromUrl();

    const [inputValue, setInputValue] = useState<string>(initialParams.query || '');
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState<number>((initialParams.page ?? 0) + 1 || 1);
    const [size, setSize] = useState<number>(initialParams.size || resultsPerPageOptions[3].value);
    const [searchResults, setSearchResults] = useState<WorkspaceItem[]>([]);
    const [totalData, setTotalData] = useState<number>(0);
    const [filters, setFilters] = useState<Record<string, any>>(initialParams.filters || {});
    const [facets, setFacets] = useState<Record<string, FilterOption[]>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        FilterOption.reduce((acc, section) => {
            acc[section.id] = section.defaultExpanded;
            return acc;
        }, {} as Record<string, boolean>)
    );
    const [sortOption, setSortOption] = useState(sortOptions[0].value);
    const [facetPagination, setFacetPagination] = useState<Record<string, { page: number, size: number }>>(
            FilterOption.reduce((acc, section) => {
                acc[section.id] = { page: 0, size: 5 }; 
                return acc;
            }, {} as Record<string, { page: number, size: number }>)
        );
    const navigate = useNavigate();
    const [thumbnailsByItem, setThumbnailsByItem] = useState<Record<string, Bitstream[]>>({});
    


    const fetchAllFacets = async (currentFilters: Record<string, any> = filters) => {
        try {
            const params: SearchParams = {
                query: inputValue,
                page: page - 1,
                size: size,
                filters: currentFilters,
                sort: getSortParam(),
            };

            const facetsResponse = await workflowFacets(params);
            setFacets(facetsResponse);
        } catch (error) {
            console.error('Error fetching facets:', error);
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
            };

            updateUrlWithSearchParams(params);

            const result = await getWorkflowObject(params);

            if (result && result.objects) {
                setSearchResults(result.objects);
                setTotalData(result.totalElements);
                if (resetPage) {
                    setPage(1);
                }
            } else {
                console.error('Error fetching data:', result);
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
    }, [])


        useEffect(() => {
            const fetchThumbnails = async () => {
                try {
                    if (searchResults.length > 0) {
                        const thumbnails: Record<string, Bitstream[]> = {};
    
                        for (const result of searchResults) {
                            const uuid = result._embedded?.indexableObject?._embedded?.item.uuid;
                            if (!uuid) continue;
    
                            const bundles = await fetchItemBundles(uuid);
                            if (bundles.length > 0) {
                                const originalBundle = bundles.find(b => b.name === 'ORIGINAL') || bundles[0];
                                const thumbnailBundle = bundles.find(b => b.name === 'THUMBNAIL') || bundles[0];
                                const originalbitstreamsData = await fetchBitstreams(originalBundle.uuid);
                                const thumbnailbitstreamsData = await fetchBitstreams(thumbnailBundle.uuid);
                                // setOriginalBitstreams(originalbitstreamsData);
                                // setThumbnailBitstreams(thumbnailbitstreamsData);
                                thumbnails[uuid] = thumbnailbitstreamsData
                            }
                        }
                        setThumbnailsByItem(thumbnails);
                    }
                } catch (error) {
                    console.error(error);
                }
            };
    
            fetchThumbnails();
        }, [searchResults]);

    const loadMoreFacetItems = async (sectionId: string) => {
        const section = FilterOption.find(s => s.id === sectionId);
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
            // scope: scope,
          };
      
          const newValues = await workflowFacet(
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
    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const getMetadata = (result: WorkspaceItem) => {
        return result?._embedded?.indexableObject?.sections?.traditionalpageone || {};
    };

    const resetFilters = () => {
        const newFilters = {};
        setFilters(newFilters);
        handleSearch(newFilters, 1, size, true);
    };

    const updateFilter = (filterType: string, value: any, isChecked: boolean) => {
        setFilters(prev => {
            let newValue;
            const section = FilterOption.find(s => s.id === filterType);

            if (!section) return prev;

            if (section.filterType === 'range') {
                newValue = isChecked ? [value] : [];
            } else {
                newValue = isChecked
                    ? Array.from(new Map([...(prev[filterType] || []), value].map(item => [item, item])).keys())
                    : (prev[filterType] || []).filter((item: string) => item !== value);
            }

            const newFilters = {
                ...prev,
                [filterType]: newValue,
            };

            handleSearch(newFilters, 1, size, true, getSortParam());
            return newFilters;
        });
    };


    const getSortParam = (): string => {
        const option = sortOptions.find(opt => opt.value === sortOption);
        return option ? option.apiValue : 'score,DESC';
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        handleSearch(filters, newPage, size, false, getSortParam());
    };

    const renderFilterSection = (section: Filtervalue) => {
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
            default:
                return null;
        }
    };
    return (
        <div className="search-container row">
            <div className="filters-and-results">
                <div className='filters-and-setting'>
                    <div className="filters col-3">
                        <div className="Zns0ac"><span className="I75YIf">Filter by</span></div>
                        {FilterOption.map(section => {
                            const shouldShowSection =
                                section.filterType === 'range' ||
                                (section.filterType === 'checkbox' && facets[section.id]?.length > 0)
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
                                <h2>Workflow and Workspace tasks</h2>
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
                        <Loader />
                    ) : (
                        <Grid container spacing={2} className="results-body">
                            {viewMode === 'list' ? (
                                searchResults?.map((result, index) => {
                                    const id = result._embedded?.indexableObject?.id;
                                    const metadata = getMetadata(result);
                                    const type = result._embedded?.indexableObject?.type;
                                    const title = metadata?.['dc.title']?.[0]?.value || 'Unknown Title';
                                    const uuid = result._embedded?.indexableObject?._embedded?.item.uuid;
                                    const abstract = metadata?.['dc.description.abstract']?.[0]?.value;
                                    const date = metadata?.['dc.date.issued']?.[0]?.value;
                                    const author = metadata?.['dc.contributor.author']?.[0]?.value;
                                    const publisher = metadata?.['dc.publisher']?.[0]?.value;
                                    const displayType = metadata?.['dc.type']?.[0]?.value || type;

                                    const handleDeleteClick = () => {
                                        if (id) {
                                            navigate(`/removeWorkflowItem/${id}`);
                                        }
                                    };

                                    const handleEditClick = () => {
                                        if (uuid) {
                                            navigate(`/resourcePolicy/${uuid}`);
                                        }
                                    }
                                    const handleSupervisionClick = () => {
                                        if (id) {
                                            navigate(`/supervisionSelecter/${uuid}`);
                                        }
                                    }

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
                                               <div style={{ display: 'flex', alignItems: 'center', padding: '15px', flex: 1 }}>
                                 {thumbnailsByItem[result._embedded?.indexableObject?._embedded?.item.uuid]
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
                                   </div>
                                                {/* Right Text Section */}
                                 <div style={{ flex: 1, marginTop: '10px' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                     <span style={{
                                       backgroundColor: '#f0f0f0',
                                       padding: '4px 8px',
                                       borderRadius: '4px',
                                       marginRight: '10px',
                                       fontSize: '13px'
                                     }}>
                                       {type}
                                     </span>
                                     <h3
                                       style={{
                                         margin: '0',
                                         cursor: 'pointer',
                                         fontSize: '18px',
                                         fontWeight: 600,
                                         color: '#333',
                                          whiteSpace: 'nowrap',
                                       }}
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
                                                <Box sx={{ display: 'flex', justifyContent: 'end',alignItems: 'center', width: '100%',marginRight: '10px'}}>
                                               <IconButton
                                                    className='btn_table'
                                                    onClick={handleEditClick}
                                                    color="primary"
                                                    style={{
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        padding: '5px',
                                                        background: 'none',
                                                    }}
                                                    title='Edit'
                                                >
                                                    <img className="itemh_icon" src={iconsImgs.edit} alt="Edit" />
                                                </IconButton>
                                                <IconButton
                                                    className='btn_table'
                                                    onClick={handleDeleteClick}
                                                    color="primary"
                                                    style={{
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        padding: '5px',
                                                        background: 'none',
                                                    }}
                                                    title='Delete'
                                                >
                                                    <img className="itemh_icon" src={iconsImgs.remove} alt="Delete" />
                                                </IconButton>
                                                <IconButton
                                                    className='btn_table'
                                                    onClick={handleSupervisionClick}
                                                    color="primary"
                                                    style={{
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        padding: '5px',
                                                        background: 'none',
                                                    }}
                                                    title='Supervision'
                                                >
                                                    <img className="itemh_icon" src={iconsImgs.group_icon_black} alt="Supervision" />
                                                </IconButton>
                                               </Box>
                                            </div>
                                        </Grid>
                                    );
                                })
                            ) : (
                                searchResults?.map((result, index) => {
                                    const id = result._embedded?.indexableObject?.id;
                                    const metadata = getMetadata(result);
                                    const title = metadata?.['dc.title']?.[0]?.value || 'Unknown Title';
                                    const type = result._embedded?.indexableObject?.type;
                                    const uuid = result._embedded?.indexableObject?._embedded?.item.uuid;
                                    const abstract = metadata?.['dc.description.abstract']?.[0]?.value;
                                    const date = metadata?.['dc.date.issued']?.[0]?.value;
                                    const author = metadata?.['dc.contributor.author']?.[0]?.value;
                                    const publisher = metadata?.['dc.publisher']?.[0]?.value;
                                    const displayType = metadata?.['dc.type']?.[0]?.value;

                                    const handleDeleteClick = () => {
                                        if (id) {
                                            navigate(`/removeWorkflowItem/${id}`);
                                        }
                                    };

                                    const handleEditClick = () => {
                                        if (uuid) {
                                            navigate(`/resourcePolicy/${uuid}`);
                                        }
                                    }
                                    const handleSupervisionClick = () => {
                                        if (id) {
                                            navigate(`/supervisionSelecter/${uuid}`);
                                        }
                                    }
                                    return (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                            <div
                                                className="grid_main"
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
                                                    <p className='item_date' style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                                        {date}
                                                    </p>
                                                )}

                                                {/* Thumbnail */}
                                                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                                                   {thumbnailsByItem[result._embedded?.indexableObject?._embedded?.item.uuid]
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
                                                {abstract && (
                                                    <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                                                        {abstract}
                                                    </p>
                                                )}

                                                {/* Navigation Arrow */}
                                               <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                                               <IconButton
                                                    className='btn_table'
                                                    onClick={handleEditClick}
                                                    color="primary"
                                                    style={{
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        padding: '5px',
                                                        background: 'none',
                                                    }}
                                                    title='Edit'
                                                >
                                                    <img className="itemh_icon" src={iconsImgs.edit} alt="Edit" />
                                                </IconButton>
                                                <IconButton
                                                    className='btn_table'
                                                    onClick={handleDeleteClick}
                                                    color="primary"
                                                    style={{
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        padding: '5px',
                                                        background: 'none',
                                                    }}
                                                    title='Delete'
                                                >
                                                    <img className="itemh_icon" src={iconsImgs.remove} alt="Delete" />
                                                </IconButton>
                                                <IconButton
                                                    className='btn_table'
                                                    onClick={handleSupervisionClick}
                                                    color="primary"
                                                    style={{
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        padding: '5px',
                                                        background: 'none',
                                                    }}
                                                    title="Supervision"
                                                >
                                                    <img className="itemh_icon" src={iconsImgs.group_icon_black} alt="Supervision" />
                                                </IconButton>
                                               </Box>
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
    )
}

export default Workflow
