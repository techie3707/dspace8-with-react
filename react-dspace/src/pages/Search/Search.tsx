import React, { useEffect, useState } from 'react';
import { searchObjects, fetchAuthors, fetchItemTypes, fetchDates, fetchHasFile } from '../../api/searchApi';
import './search.css';
import PaginationComponent from '../../components/Pagination/PaginationComponent';



interface Author {
  name: string;
  count: number;
}

interface ItemType {
  type: string;
  count: number;
}

interface DateRange {
  range: string;
  count: number;
}

const Search: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [authorFilter, setAuthorFilter] = useState<string[]>([]);
  const [itemTypeFilter, setItemTypeFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string[]>([]);
  const [hasFileFilter, setHasFileFilter] = useState<boolean | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    author: true,
    itemType: false,
    date: false,
    hasFiles: false,
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(10);
  const [totalData, setTotalData] = useState<number>(0);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [dateRanges, setDateRanges] = useState<DateRange[]>([]);
  const [hasFileCounts, setHasFileCounts] = useState<{ hasFileCount: number; noFileCount: number }>({
    hasFileCount: 0,
    noFileCount: 0,
  });

 

  const fetchFacets = async (filters?: { author?: string[], itemType?: string[], date?: string[], hasFile?: boolean | null }) => {
    try {
      const facetParam = new URLSearchParams();
  
      if (filters?.author?.length) {
        filters.author.forEach((author) => {
          facetParam.append('f.author', `${author},equals`);
        });
      }
  
      if (filters?.itemType?.length) {
        filters.itemType.forEach((itemType) => {
          facetParam.append('f.entityType', `${itemType},equals`);
        });
      }
  
      if (filters?.date?.length) {
        const dateRange = `[${filters.date[0].split(' - ')[0]} TO ${filters.date[0].split(' - ')[1]}]`;
        facetParam.append('f.dateIssued', `${dateRange},equals`);
      }
  
      if (filters?.hasFile !== null && filters?.hasFile !== undefined) {
        facetParam.append('f.has_content_in_original_bundle', `${filters.hasFile},equals`);
      }
  
      console.log('Fetching facets with params:', facetParam.toString());
  
      const authorsResponse = await fetchAuthors((facetParam.toString() ? `&${facetParam.toString()}` : ''), 0, 5);
      const itemTypesResponse = await fetchItemTypes((facetParam.toString() ? `&${facetParam.toString()}` : ''), 0, 5);
      const datesResponse = await fetchDates((facetParam.toString() ? `&${facetParam.toString()}` : ''), 0, 5);
      const hasFileResponse = await fetchHasFile((facetParam.toString() ? `&${facetParam.toString()}` : ''), 0, 5);
  
      setAuthors(authorsResponse._embedded.values.map((value: any) => ({ name: value.label, count: value.count })));
      setItemTypes(itemTypesResponse._embedded.values.map((value: any) => ({ type: value.label, count: value.count })));
      setDateRanges(datesResponse._embedded.values.map((value: any) => ({ range: value.label, count: value.count })));
      setHasFileCounts({
        hasFileCount: hasFileResponse._embedded.values.find((value: any) => value.label === 'true')?.count || 0,
        noFileCount: hasFileResponse._embedded.values.find((value: any) => value.label === 'false')?.count || 0,
      });
    } catch (error) {
      console.error('Error fetching facets:', error);
    }
  };
  
  const handleSearch = async (
    filters: { author?: string[]; subject?: string[]; date?: string[]; itemType?: string[]; hasFile?: boolean | null } = {},
    currentPage: number = page,
    itemsPerPage: number = size,
    resetPage: boolean = false 
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('sort', 'score');
      queryParams.append('configuration', 'default');
  
      if (filters.author && filters.author.length > 0) {
        filters.author.forEach((author) => {
          queryParams.append('f.author', `${author},equals`);
        });
      }
  
      if (filters.subject && filters.subject.length > 0) {
        filters.subject.forEach((subject) => {
          queryParams.append('f.subject', `${subject},equals`);
        });
      }
  
      if (filters.date && filters.date.length > 0) {
        const dateRange = `[${filters.date[0].split(' - ')[0]} TO ${filters.date[0].split(' - ')[1]}]`;
        queryParams.append('f.dateIssued', `${dateRange},equals`);
      }
  
      if (filters.itemType && filters.itemType.length > 0) {
        filters.itemType.forEach((itemType) => {
          queryParams.append('f.entityType', `${itemType},equals`);
        });
      }
  
      if (filters.hasFile !== null && filters.hasFile !== undefined) {
        queryParams.append('f.has_content_in_original_bundle', `${filters.hasFile},equals`);
      }
  
      const pageToFetch = resetPage ? 1 : currentPage;
  
      const data = await searchObjects(inputValue, queryParams.toString(), pageToFetch - 1, itemsPerPage);
      setSearchResults(data.results);
      setTotalData(data.totalElements);
  
      if (resetPage) {
        setPage(1);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    handleSearch();
    fetchFacets();
    console.log(authorFilter);
    
  }, []);

  const handleAuthorFilterChange = (authorName: string, isChecked: boolean) => {
    setAuthorFilter((prev) => {
      const newFilters = isChecked ? [...prev, authorName] : prev.filter((name) => name !== authorName);
      handleSearch({ author: newFilters, itemType: itemTypeFilter, date: dateFilter, hasFile: hasFileFilter }, 1, size, true); 
      fetchFacets({author:newFilters, itemType: itemTypeFilter, date: dateFilter, hasFile: hasFileFilter}); 
      return newFilters;
    });
  };
  
  const handleItemTypeFilterChange = (itemType: string, isChecked: boolean) => {
    setItemTypeFilter((prev) => {
      const newFilters = isChecked ? [...prev, itemType] : prev.filter((type) => type !== itemType);
      handleSearch({ author: authorFilter, itemType: newFilters, date: dateFilter, hasFile: hasFileFilter }, 1, size, true); 
      fetchFacets({ author: authorFilter, itemType: newFilters, date: dateFilter, hasFile: hasFileFilter }); 
      return newFilters;
    });
  };
  
  const handleDateFilterChange = (dateRange: string, isChecked: boolean) => {
    setDateFilter((prev) => {
      const newFilters = isChecked ? [...prev, dateRange] : prev.filter((range) => range !== dateRange);
      handleSearch({ author: authorFilter, itemType: itemTypeFilter, date: newFilters, hasFile: hasFileFilter }, 1, size, true); 
      return newFilters;
    });
  };
  
  const handleHasFileFilterChange = (hasFile: boolean | null) => {
    setHasFileFilter(hasFile);
    handleSearch({ author: authorFilter, itemType: itemTypeFilter, date: dateFilter, hasFile }, 1, size, true); 
    fetchFacets({ author: authorFilter, itemType: itemTypeFilter, date: dateFilter, hasFile }); 
  };
  const getMetadataValue = (metadata: any, field: string): string | null => {
    if (metadata && metadata[field] && metadata[field].length > 0) {
        return metadata[field][0].value;
    }
    return null;
};

  const handlePageChange = (page: number) => {
    setPage(page);
    handleSearch({ author: authorFilter, date: dateFilter, itemType: itemTypeFilter, hasFile: hasFileFilter }, page);
};

  
  const resetFilters = () => {
    setAuthorFilter([]);
    setItemTypeFilter([]);
    setDateFilter([]);
    setHasFileFilter(null);
    handleSearch({}, 1, size, true); 
    fetchFacets(); 
  };

  return (
    <div className="search-container">
      {/* Filters and Results */}
      <div className="filters-and-results">
        {/* Filters Sidebar */}
        <div className="filters">
          <h2>Filters</h2>
          {/* Author Filter */}
          <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>
              <h3>Author</h3>
              <button onClick={() => setExpandedSections((prev) => ({ ...prev, author: !prev.author }))}>
                {expandedSections.author ? '-' : '+'}
              </button>
            </div>
            {expandedSections.author && (
              <div style={{ padding: '10px' }}>
                <ul style={{ listStyle: 'none', padding: '0' }}>
                  {authors.map((author, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={authorFilter.includes(author.name)}
                            onChange={(e) => handleAuthorFilterChange(author.name, e.target.checked)}
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
                <button style={{ width: '100%', padding: '10px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px' }}>
                  Show more
                </button>
              </div>
            )} 
          </div>

          {/* Item Type Filter */}
          <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>
              <h3>Item Type</h3>
              <button onClick={() => setExpandedSections((prev) => ({ ...prev, itemType: !prev.itemType }))}>
                {expandedSections.itemType ? '-' : '+'}
              </button>
            </div>
            {expandedSections.itemType && (
              <div style={{ padding: '10px' }}>
                <ul style={{ listStyle: 'none', padding: '0' }}>
                  {itemTypes.map((itemType, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={itemTypeFilter.includes(itemType.type)}
                            onChange={(e) => handleItemTypeFilterChange(itemType.type, e.target.checked)}
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
                <button style={{ width: '100%', padding: '10px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px' }}>
                  Show more
                </button>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>
              <h3>Date</h3>
              <button onClick={() => setExpandedSections((prev) => ({ ...prev, date: !prev.date }))}>
                {expandedSections.date ? '-' : '+'}
              </button>
            </div>
            {expandedSections.date && (
              <div style={{ padding: '10px' }}>
                <ul style={{ listStyle: 'none', padding: '0' }}>
                  {dateRanges.map((dateRange, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={dateFilter.includes(dateRange.range)}
                            onChange={(e) => handleDateFilterChange(dateRange.range, e.target.checked)}
                          />
                          <span style={{ marginLeft: '10px' }}>{dateRange.range}</span>
                        </div>
                        <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '3px' }}>
                          {dateRange.count}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <button style={{ width: '100%', padding: '10px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px' }}>
                  Show more
                </button>
              </div>
            )}
          </div>

          {/* Has File Filter */}
          <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>
              <h3>Has File</h3>
              <button onClick={() => setExpandedSections((prev) => ({ ...prev, hasFiles: !prev.hasFiles }))}>
                {expandedSections.hasFiles ? '-' : '+'}
              </button>
            </div>
            {expandedSections.hasFiles && (
              <div style={{ padding: '10px' }}>
                <ul style={{ listStyle: 'none', padding: '0' }}>
                  <li style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={hasFileFilter === true}
                        onChange={(e) => handleHasFileFilterChange(e.target.checked ? true : null)}
                      />
                      <span style={{ marginLeft: '10px' }}>Yes</span>
                    </label>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }} onClick={resetFilters}>
            Reset filters
          </button>
        </div>

        {/* Search Results */}
        <div className="search-results">
          {/* Search Input and View Mode Toggle */}
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search the repository ..."
            />
           <button
              className="search-button"
              onClick={() => handleSearch({ author: authorFilter, itemType: itemTypeFilter, date: dateFilter, hasFile: hasFileFilter })}
            >
              Search
            </button>
          </div>

          {/* Search Results Header */}
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

          {/* Search Results List/Grid */}
          {viewMode === 'list' ? (
            <ul className="results-list" style={{ width: '100vh' }}>
              {searchResults.map((result, index) => {
                const metadata = result._embedded.indexableObject.metadata;
                const type = result._embedded.indexableObject.type;
                const title = getMetadataValue(metadata, 'dc.title');
                const abstract = getMetadataValue(metadata, 'dc.description.abstract');
                const date = getMetadataValue(metadata, 'dc.date.issued');
                const author = getMetadataValue(metadata, 'dc.contributor.author');
                const entity = getMetadataValue(metadata, 'dspace.entity.type');
                const publisher = getMetadataValue(metadata, 'dc.publisher');

                // Determine whether to display entity or type
                const displayType = entity || type;

                return (
                  <li key={index}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src="#" alt="No thumbnail Available" style={{ width: '50px', height: '50px', marginRight: '10px', backgroundColor: '#eee' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '3px', marginRight: '10px' }}>{displayType}</span>
                          <h3 style={{ margin: '0' }}>{title}</h3>
                        </div>
                        {date && <p style={{ margin: '0', color: '#666' }}>{`(${publisher},${date}) ${author}`}</p>}
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
          ) : (
            <ul className="results-grid">
              {searchResults.map((result, index) => {
                const metadata = result._embedded.indexableObject.metadata;
                const type = result._embedded.indexableObject.type;
                const title = getMetadataValue(metadata, 'dc.title');
                const abstract = getMetadataValue(metadata, 'dc.description.abstract');
                const date = getMetadataValue(metadata, 'dc.date.issued');
                const author = getMetadataValue(metadata, 'dc.contributor.author');
                const entity = getMetadataValue(metadata, 'dspace.entity.type');
                const publisher = getMetadataValue(metadata, 'dc.publisher');

                const displayType = entity || type;

                return (
                  <li key={index}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src="#" alt="No thumbnail Available" style={{ width: '50px', height: '50px', marginRight: '10px', backgroundColor: '#eee' }} />
                      <div style={{ border: 'none' }}>
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{ border: 'none', backgroundColor: '#eee', padding: '2px 5px' }}>{displayType}</span>
                        </div>
                        <h3 style={{ margin: '0' }}>{title}</h3>
                        {date && <p style={{ margin: '10px 0', color: '#666' }}>{`(${publisher},${date}) ${author}`}</p>}
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

          <PaginationComponent
            totalData={totalData}
            perPage={size}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;