import { useEffect, useState } from 'react';
import { Box, Button, Grid, IconButton, TextField } from '@mui/material';
import { iconsImgs } from '../../utils/images';
import {
    getWorkflowObjects,
    getWorkflowSubmittersFacet,
    getWorkflowItemTypesFacet,
    getWorkflowNamedResourceTypesFacet,
    claimedtask,
    approveClaimedTask,
    deleteClaimedTask,
    rejectClaimedTask
} from '../../api/workflowTask';
import { FilterOption, Filtervalue } from '../../data/workflowdata';
import '../Search/Search.css';
import YearRangeSlider from '../Search/YearRangeSlider';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import { resultsPerPageOptions } from '../../data/searchData';
import { 
  SortOption,
  FacetResponse,
  FacetValue,
  WorkflowObjectsResponse,
  WorkflowItem,
  EnhancedWorkflowItem,
  sortOptions
} from '../../data/workflowTaskData';
import { useNavigate } from 'react-router-dom';
import Loader from '../loader/loader';
import SecureImage from '../Search/SecureImage';

const WorkflowTask = () => {
    const [inputValue, setInputValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(resultsPerPageOptions[3].value);
    const [workflowItems, setWorkflowItems] = useState<EnhancedWorkflowItem[]>([]);
    const [totalData, setTotalData] = useState<number>(0);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [facets, setFacets] = useState<Record<string, FacetValue[]>>({});
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

    const getFilterSuffix = (filterType: string): string => {
        switch (filterType) {
            case 'dateIssued': return ',equals';
            case 'itemtype': return ',equals';
            default: return ',authority';
        }
    };

    const enhancedFilterOptions = FilterOption.map(option => ({
        ...option,
        suffix: getFilterSuffix(option.id)
    }));
    const buildFilterParams = (currentFilters: Record<string, any>) => {
        const params: Record<string, string> = {};

        Object.entries(currentFilters).forEach(([key, values]) => {
            if (values && values.length > 0) {
                const filterOption = enhancedFilterOptions.find(opt => opt.id === key);
                const suffix = filterOption?.suffix || getFilterSuffix(key);

                if (key === 'dateIssued') {
                    const [startYear, endYear] = values[0].split(' - ');
                    params[`f.${key}`] = `[${startYear} TO ${endYear}]${suffix}`;
                } else {
                    const formattedValues = Array.isArray(values)
                        ? values.map(v => {
                            const processedValue = key === 'itemtype'
                                ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
                                : key === 'namedresourcetype'
                                    ? v.replace(/\s+/g, '').toLowerCase()
                                    : key === 'submitter'
                                        ? v.toLowerCase()
                                        : v;
                            return `${processedValue}${suffix}`;
                        }).join(',')
                        : (
                            key === 'itemtype'
                                ? `${values.charAt(0).toUpperCase() + values.slice(1).toLowerCase()}${suffix}`
                                : key === 'namedresourcetype'
                                    ? `${values.replace(/\s+/g, '').toLowerCase()}${suffix}`
                                    : key === 'submitter'
                                        ? `${values.toLowerCase()}${suffix}`
                                        : `${values}${suffix}`
                        );
                    params[`f.${key}`] = formattedValues;
                }
            }
        });

        return params;
    };

    const fetchAllFacets = async (currentFilters: Record<string, any> = filters) => {
        try {
            const filterParams = buildFilterParams(currentFilters);

            const params = {
                query: inputValue,
                page: page - 1,
                size: size,
                sort: getSortParam(),
                configuration: 'workflow',
                ...filterParams
            };

            const [submitters, itemTypes, namedResourceTypes] = await Promise.all([
                getWorkflowSubmittersFacet(params) as FacetResponse,
                getWorkflowItemTypesFacet(params) as FacetResponse,
                getWorkflowNamedResourceTypesFacet(params) as FacetResponse
            ]);

            setFacets({
                submitter: submitters._embedded?.values || [],
                itemtype: itemTypes._embedded?.values || [],
                namedresourcetype: namedResourceTypes._embedded?.values || []
            });
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
            const filterParams = buildFilterParams(currentFilters);

            const params = {
                query: inputValue,
                page: pageToFetch - 1,
                size: itemsPerPage,
                sort: sort,
                configuration: 'workflow',
                ...filterParams
            };

            const result = await getWorkflowObjects(params) as WorkflowObjectsResponse;

            if (result?._embedded?.searchResult?._embedded?.objects) {
                const items: EnhancedWorkflowItem[] = result._embedded.searchResult._embedded.objects.map(
                    obj => ({
                        ...obj._embedded.indexableObject.workflow,
                        ...obj._embedded.indexableObject,
                        taskType: obj._embedded.indexableObject.type as "claimedtask" | "pooltask",
                        id: obj._embedded.indexableObject.id
                    })
                );
                setWorkflowItems(items);
                setTotalData(result._embedded.searchResult.page?.totalElements ?? 0);
                if (resetPage) {
                    setPage(1);
                }
            } else {
                console.error('Error fetching data:', result);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
        fetchAllFacets();
    }, []);

    const loadMoreFacetItems = async (sectionId: string) => {
        const section = FilterOption.find(s => s.id === sectionId);
        if (!section) return;

        const currentPagination = facetPagination[sectionId];
        const nextPage = currentPagination.page + 1;

        try {
            const params = {
                query: inputValue,
                page: page - 1,
                size: size,
                sort: getSortParam(),
                ...buildFilterParams(filters)
            };

            let newValues: FacetValue[] = [];
            switch (sectionId) {
                case 'submitter':
                    newValues = (await getWorkflowSubmittersFacet({ ...params, page: nextPage, size: currentPagination.size }) as FacetResponse)._embedded?.values || [];
                    break;
                case 'itemtype':
                    newValues = (await getWorkflowItemTypesFacet({ ...params, page: nextPage, size: currentPagination.size }) as FacetResponse)._embedded?.values || [];
                    break;
                case 'namedresourcetype':
                    newValues = (await getWorkflowNamedResourceTypesFacet({ ...params, page: nextPage, size: currentPagination.size }) as FacetResponse)._embedded?.values || [];
                    break;
            }

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

    const getMetadata = (item: EnhancedWorkflowItem) => {
        return item._embedded?.workflowitem?.sections?.traditionalpageone || {};
    };

    const resetFilters = () => {
        const newFilters = {};
        setFilters(newFilters);
        fetchAllFacets(newFilters).then(() => {
            handleSearch(newFilters, 1, size, true);
        });
    };

    const updateFilter = (filterType: string, value: any, isChecked: boolean, authorityKey?: string) => {
        setFilters(prev => {
            let newValue;
            const section = FilterOption.find(s => s.id === filterType);

            if (!section) return prev;

            const processedValue = filterType === 'itemtype'
                ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
                : value;

            const filterValue = filterType === 'submitter' && authorityKey
                ? authorityKey
                : processedValue;

            if (section.filterType === 'range') {
                newValue = isChecked ? [filterValue] : [];
            } else {
                newValue = isChecked
                    ? [...(prev[filterType] || []), filterValue]
                    : (prev[filterType] || []).filter((item: string) =>
                        filterType === 'submitter'
                            ? item !== authorityKey && item !== value
                            : item.toLowerCase() !== processedValue.toLowerCase()
                    );
            }

            const newFilters = {
                ...prev,
                [filterType]: newValue,
            };

            fetchAllFacets(newFilters).then(() => {
                handleSearch(newFilters, 1, size, true, getSortParam());
            });

            return newFilters;
        });
    };

    const getSortParam = (): string => {
        const option = sortOptions.find(opt => opt.value === sortOption);
        return option ? option.apiValue : 'lastModified,DESC';
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
                        {facets[section.id].map((option, index) => {
                            const displayLabel = section.id === 'itemtype'
                                ? option.label.charAt(0).toUpperCase() + option.label.slice(1).toLowerCase()
                                : option.label;
                            const isChecked = section.id === 'submitter'
                                ? (filters[section.id] || []).includes(option.authorityKey) ||
                                (filters[section.id] || []).includes(option.label)
                                : (filters[section.id] || []).includes(option.label);

                            return (
                                <li key={index}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => updateFilter(
                                                    section.id,
                                                    option.label,
                                                    e.target.checked,
                                                    option.authorityKey ?? undefined
                                                )}
                                            />
                                            <span style={{ marginLeft: '10px' }}>{displayLabel}</span>
                                        </div>
                                        <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '33px' }}>
                                            {option.count}
                                        </span>
                                    </label>
                                </li>
                            );
                        })}

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

    const handleDeleteClick = async (id: number) => {
        try {
            const reason = window.prompt("Enter rejection reason:", "") || "";
            await rejectClaimedTask(id, reason);
            handleSearch(filters, page, size, false, getSortParam());
        } catch (error) {
            console.error('Error rejecting task:', error);
        }
    };

    const handleClaimTask = async (id: number) => {
        try {
            await claimedtask(id.toString());
            handleSearch(filters, page, size, false, getSortParam());
        } catch (error) {
            console.error('Error claiming task:', error);
        }
    };

    const handleApproveTask = async (id: number) => {
        try {
            await approveClaimedTask(id);
            handleSearch(filters, page, size, false, getSortParam());
        } catch (error) {
            console.error('Error approving task:', error);
        }
    };

    const handleReturnClick = async (id: number) => {
        try {
            await deleteClaimedTask(id);
            handleSearch(filters, page, size, false, getSortParam());
        } catch (error) {
            console.error('Error returning task to pool:', error);
        }
    };

    return (
        <div className="search-container row">
            <div className="filters-and-results">
                <div className='filters-and-setting'>
                    <div className="filters col-3">
                        <div className="Zns0ac"><span className="I75YIf">Filter by</span></div>
                        {enhancedFilterOptions.map(section => {
                            const shouldShowSection =
                                section.filterType === 'range' ||
                                (section.filterType === 'checkbox' && facets[section.id]?.length > 0);
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
                            );
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
                                    const apiSortValue = option ? option.apiValue : 'lastModified,DESC';
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
                                <h2>Workflow tasks</h2>
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
                                workflowItems.map((item, index) => {
                                    const metadata = getMetadata(item);
                                    const title = metadata['dc.title']?.[0]?.value || 'Untitled';
                                    const type = item.taskType === 'claimedtask' ? 'Claimed Task' : 'Pool Task';
                                    const date = metadata['dc.date.issued']?.[0]?.value;
                                    const author = metadata['dc.contributor.author']?.[0]?.value;
                                    const publisher = metadata['dc.publisher']?.[0]?.value;
                                    const abstract = metadata['dc.description.abstract']?.[0]?.value;
                                    const files = item._embedded.workflowitem.sections.upload?.files || [];

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
                                                    backgroundColor: '#f97316',
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
                                                        <i className="fas fa-cube"></i>
                                                    </div>
                                                </div>

                                                {/* Thumbnail */}
                                                <div style={{ display: 'flex', alignItems: 'center', padding: '15px', flex: 1 }}>
                                                    {files.length > 0 && (
                                                        <SecureImage
                                                            uuid={files[0].uuid}
                                                            className="thumbnail-img_list img-fluid"
                                                            style={{
                                                                maxHeight: '100px',
                                                                maxWidth: '100px',
                                                                marginRight: '20px',
                                                                borderRadius: '8px',
                                                                objectFit: 'cover'
                                                            }}
                                                            alt={files[0].metadata['dc.title']?.[0]?.value || 'Thumbnail'}
                                                        />
                                                    )}
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
                                                        <h3 style={{ margin: '0', fontSize: '18px', fontWeight: 600, color: '#333' }}>
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

                                                <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%', marginRight: '10px' }}>
                                                    {item.taskType === 'pooltask' ? (
                                                        <>
                                                            <IconButton
                                                                className='btn_table'
                                                                onClick={() => handleClaimTask(item.id)}
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title='Claim'
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.edit} alt="Edit" />
                                                            </IconButton>
                                                            <IconButton
                                                                className='btn_table'
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title='View'
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.group_icon_black} alt="Supervision" />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconButton
                                                                className='btn_table'
                                                                onClick={() => handleApproveTask(item.id)}
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title='Approve'
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.approved} alt="Edit" />
                                                            </IconButton>
                                                            <IconButton
                                                                className='btn_table'
                                                                onClick={() => handleDeleteClick(item.id)}
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title='Reject'
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.remove} alt="Delete" />
                                                            </IconButton>
                                                            <IconButton
                                                                className='btn_table'
                                                                onClick={() => handleReturnClick(item.id)}
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title='Return To Pool'
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.return1} alt="Supervision" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            </div>
                                        </Grid>
                                    );
                                })
                            ) : (
                                workflowItems.map((item, index) => {
                                    const metadata = getMetadata(item);
                                    const title = metadata['dc.title']?.[0]?.value || 'Untitled';
                                    const type = item.taskType === 'claimedtask' ? 'Claimed Task' : 'Pool Task';
                                    const date = metadata['dc.date.issued']?.[0]?.value;
                                    const abstract = metadata['dc.description.abstract']?.[0]?.value;
                                    const files = item._embedded.workflowitem.sections.upload?.files || [];

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
                                                <h3 className='item_title' style={{ cursor: 'pointer' }}>
                                                    {title}
                                                </h3>

                                                {date && (
                                                    <p className='item_date' style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                                        {date}
                                                    </p>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                                                    {files.length > 0 && (
                                                        <SecureImage
                                                            uuid={files[0].uuid}
                                                            className="thumbnail-img img-fluid"
                                                            style={{ maxHeight: '300px' }}
                                                            alt={files[0].metadata['dc.title']?.[0]?.value || 'Thumbnail'}
                                                        />
                                                    )}
                                                </div>

                                                {abstract && (
                                                    <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                                                        {abstract}
                                                    </p>
                                                )}

                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    {item.taskType === 'pooltask' ? (
                                                        <>
                                                            <IconButton
                                                                className='btn_table'
                                                                onClick={() => handleClaimTask(item.id)}
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title='Claim'
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.complain} alt="complain" />
                                                            </IconButton>
                                                            <IconButton
                                                                className='btn_table'
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title="View"
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.group_icon_black} alt="Supervision" />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconButton
                                                                className='btn_table'
                                                                onClick={() => handleApproveTask(item.id)}
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title='Approve'
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.approved} alt="Edit" />
                                                            </IconButton>
                                                            <IconButton
                                                                className='btn_table'
                                                                onClick={() => handleDeleteClick(item.id)}
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title='Reject'
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.remove} alt="Delete" />
                                                            </IconButton>
                                                            <IconButton
                                                                className='btn_table'
                                                                onClick={() => handleReturnClick(item.id)}
                                                                color="primary"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    cursor: 'pointer',
                                                                    padding: '5px',
                                                                    background: 'none',
                                                                }}
                                                                title="Return To Pool"
                                                            >
                                                                <img className="itemh_icon" src={iconsImgs.return1} alt="Supervision" />
                                                            </IconButton>
                                                        </>
                                                    )}
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
    );
};

export default WorkflowTask;