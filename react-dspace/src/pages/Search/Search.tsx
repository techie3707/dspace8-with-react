import React, { useEffect, useState } from 'react';
import { 
  searchObjects, 
  fetchSubjects, 
  fetchAuthors, 
  fetchItemTypes,  
  fetchHasFile,
  parseSearchParamsFromUrl,
  updateUrlWithSearchParams
 
} from '../../api/searchApi';
import './Search.css';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import YearRangeSlider from './YearRangeSlider';
import { Author, Subject, ItemType, SearchFilters } from '../../data/searchData';
import { 
  sortOptions, 
  resultsPerPageOptions, 
  filterSections, 
  metadataFields,
  FilterSection,
  SearchParams
} from '../../data/searchData';

const Search: React.FC = () => {
  const initialParams = parseSearchParamsFromUrl();
  
  const [inputValue, setInputValue] = useState<string>(initialParams.query || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    author: initialParams.filters?.author || [],
    subject: initialParams.filters?.subject || [],
    date: initialParams.filters?.date || [],
    itemType: initialParams.filters?.itemType || [],
    hasFile: initialParams.filters?.hasFile
  });
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    filterSections.reduce((acc, section) => {
      acc[section.id] = section.defaultExpanded;
      return acc;
    }, {} as Record<string, boolean>)
  );
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState<number>((initialParams.page ?? 0)+ 1 || 1);
  const [size, setSize] = useState<number>(initialParams.size || resultsPerPageOptions[3].value);
  const [totalData, setTotalData] = useState<number>(0);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [hasFileCounts, setHasFileCounts] = useState({
    hasFileCount: 0,
    noFileCount: 0
  });
  const [sortOption, setSortOption] = useState(sortOptions[0].value);
  const [isLoading, setIsLoading] = useState(false);

  const getSortParam = (): string => {
    const option = sortOptions.find(opt => opt.value === sortOption);
    return option ? option.apiValue : 'score,DESC';
  };

  const fetchFacets = async (currentFilters: SearchFilters = filters) => {
    try {
      const params: SearchParams = {
        query: inputValue,
        page: 0,
        size: 5,
        filters: currentFilters,
        sort: getSortParam()
      };
      
      const [
        authorsResponse,
        itemTypesResponse,
        hasFileResponse,
        subjectsResponse
      ] = await Promise.all([
        fetchAuthors(params),
        fetchItemTypes(params),
        fetchHasFile(params),
        fetchSubjects(params)
      ]);
  
      setAuthors(authorsResponse._embedded?.values?.map((value: any) => ({ name: value.label, count: value.count })) || []);
      setItemTypes(itemTypesResponse._embedded?.values?.map((value: any) => ({ type: value.label, count: value.count })) || []);
      setSubjects(subjectsResponse._embedded?.values?.map((value: any) => ({ name: value.label, count: value.count })) || []);
      setHasFileCounts({
        hasFileCount: hasFileResponse._embedded?.values?.find((value: any) => value.label === 'true')?.count || 0,
        noFileCount: hasFileResponse._embedded?.values?.find((value: any) => value.label === 'false')?.count || 0,
      });
    } catch (error) {
      console.error('Error fetching facets:', error);
    }
  };

  const handleSearch = async (
    currentFilters: SearchFilters = filters,
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
      
      // Update URL with current search params
      updateUrlWithSearchParams(params);
      
      const data = await searchObjects(params);
      
      setSearchResults(data.results);
      setTotalData(data.totalElements);
  
      if (resetPage) {
        setPage(1);
      }

      // Fetch updated facets
      await fetchFacets(currentFilters);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  },[]);

  const updateFilter = (filterType: keyof SearchFilters, value: any, isChecked: boolean) => {
    setFilters(prev => {
      let newValue;
      
      if (filterType === 'hasFile') {
        newValue = isChecked ? value : null;
      } else if (filterType === 'date') {
        newValue = isChecked ? [value] : [];
      } else {
        newValue = isChecked 
          ? [...(prev[filterType] || []), value] 
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
    const newFilters = {
      author: [],
      subject: [],
      date: [],
      itemType: [],
      hasFile: null
    };
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
    switch (section.id) {
      case 'author':
        return (
          authors.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0' }}>
              {authors.map((author, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={(filters.author || []).includes(author.name)}
                        onChange={(e) => updateFilter('author', author.name, e.target.checked)}
                      />
                      <span style={{ marginLeft: '10px' }}>{author.name}</span>
                    </div>
                    <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '33px' }}>
                      {author.count}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : <div>No authors found</div>
        );
      case 'subject':
        return (
          subjects.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0' }}>
              {subjects.map((subject, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={(filters.subject || []).includes(subject.name)}
                        onChange={(e) => updateFilter('subject', subject.name, e.target.checked)}
                      />
                      <span style={{ marginLeft: '10px' }}>{subject.name}</span>
                    </div>
                    <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '33px' }}>
                      {subject.count}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : <div>No subjects found</div>
        );
      case 'itemType':
        return (
          itemTypes.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0' }}>
              {itemTypes.map((itemType, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={(filters.itemType || []).includes(itemType.type)}
                        onChange={(e) => updateFilter('itemType', itemType.type, e.target.checked)}
                      />
                      <span style={{ marginLeft: '10px' }}>{itemType.type}</span>
                    </div>
                    <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '33px' }}>
                      {itemType.count}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : <div>No item types found</div>
        );
      case 'date':
        return (
          <YearRangeSlider
            onApply={(startYear, endYear) => {
              const dateRange = `${startYear} - ${endYear}`;
              updateFilter('date', dateRange, true);
            }}
          />
        );
      case 'hasFiles':
        return (
          <ul style={{ listStyle: 'none', padding: '0' }}>
            <li style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filters.hasFile === true}
                    onChange={(e) => updateFilter('hasFile', true, e.target.checked)}
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
    <div className="search-container">
      <div className="filters-and-results">
        <div className='filters-and-setting'>
          <div className="filters">
            <h2>Filters</h2>
            
            {filterSections.map(section => (
              <div key={section.id} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>
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

        <div className="search-results">
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search the repository ..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(filters, 1, size, true, getSortParam());
                }
              }}
            />
            <button
              className="search-button"
              onClick={() => {
                handleSearch(filters, 1, size, true, getSortParam());
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="results-header">
            <h2>Search Results</h2>
            <div>
              <button
                className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-indicator">Loading results...</div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <ul className="results-list" style={{ width: '100vh' }}>
                  {searchResults.map((result, index) => {
                    const metadata = result._embedded?.indexableObject?.metadata;
                    const type = result._embedded?.indexableObject?.type;
                    const title = getMetadataValue(metadata, metadataFields.title);
                    const abstract = getMetadataValue(metadata, metadataFields.abstract);
                    const date = getMetadataValue(metadata, metadataFields.date);
                    const author = getMetadataValue(metadata, metadataFields.author);
                    const entity = getMetadataValue(metadata, metadataFields.entityType);
                    const publisher = getMetadataValue(metadata, metadataFields.publisher);
                    const displayType = entity || type;

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
                              <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '3px', marginRight: '10px' 
                              }}>
                                {displayType}
                              </span>
                              <h3 style={{ margin: '0' }}>{title}</h3>
                            </div>
                            {date && (
                              <p style={{ margin: '0', color: '#666' }}>
                                {`(${publisher},${date}) ${author}`}
                              </p>
                            )}
                            {abstract && (
                              <>
                                <p style={{ margin: '10px 0', color: '#666' }}>{abstract}</p>
                                <button style={{ padding: '5px 10px',  backgroundColor: '#f0f0f0',  border: 'none', borderRadius: '4px' 
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
                <ul className="results-grid">
                  {searchResults.map((result, index) => {
                    const metadata = result._embedded?.indexableObject?.metadata;
                    const type = result._embedded?.indexableObject?.type;
                    const title = getMetadataValue(metadata, metadataFields.title);
                    const abstract = getMetadataValue(metadata, metadataFields.abstract);
                    const date = getMetadataValue(metadata, metadataFields.date);
                    const author = getMetadataValue(metadata, metadataFields.author);
                    const entity = getMetadataValue(metadata, metadataFields.entityType);
                    const publisher = getMetadataValue(metadata, metadataFields.publisher);
                    const displayType = entity || type;

                    return (
                      <li key={index}>
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
                            <h3 style={{ margin: '0' }}>{title}</h3>
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