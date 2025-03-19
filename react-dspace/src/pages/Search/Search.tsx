import React, { useEffect, useState } from 'react';
import { searchObjects } from '../../api/searchApi';
import './Search.css'; // Import the CSS file



interface Author {
    name: string;
    count: number;
}

interface ItemType {
    type: string;
    count: number;
}

const Search: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [authorFilter, setAuthorFilter] = useState<string[]>([]);
    const [subjectFilter, setSubjectFilter] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState<string[]>([]);
    const [itemTypeFilter, setItemTypeFilter] = useState<string[]>([]);
    const [hasFileFilter, setHasFileFilter] = useState<boolean | null>(null);
    const [expandedSections, setExpandedSections] = useState({
        author: true,
        subject: false,
        date: false,
        hasFiles: false,
        itemType: false,
    });
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');


    const handleSearch = async (filters: { author?: string[]; subject?: string[]; date?: string[]; itemType?: string[]; hasFile?: boolean | null } = {}) => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('sort', 'score');
            queryParams.append('configuration', 'default');

            if (filters.author && filters.author.length > 0) {
                queryParams.append('f.author', filters.author.join(',') + ',equals');
            }
            if (filters.subject && filters.subject.length > 0) {
                queryParams.append('f.subject', filters.subject.join(',') + ',equals');
            }
            if (filters.date && filters.date.length > 0) {
                queryParams.append('f.dateIssued', filters.date.join(',') + ',equals'); // Append the date range directly
            }
            if (filters.itemType && filters.itemType.length > 0) {
                queryParams.append('f.entityType', filters.itemType.join(',') + ',equals');
            }
            if (filters.hasFile !== null && filters.hasFile !== undefined) {
                queryParams.append('f.has_content_in_original_bundle', filters.hasFile.toString() + ',equals');
            }

            const results = await searchObjects(inputValue, queryParams.toString());
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        handleSearch();
    }, []);

    const toggleSection = (section: string) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section as keyof typeof expandedSections],
        });
    };

    const getMetadataValue = (metadata: any, field: string): string | null => {
        if (metadata && metadata[field] && metadata[field].length > 0) {
            return metadata[field][0].value;
        }
        return null;
    };

    const extractAuthors = (): Author[] => {
        const authorMap: { [key: string]: number } = {};

        searchResults.forEach((result) => {
            const author = getMetadataValue(result._embedded.indexableObject.metadata, 'dc.contributor.author');
            if (author) {
                if (authorMap[author]) {
                    authorMap[author]++;
                } else {
                    authorMap[author] = 1;
                }
            }
        });

        return Object.keys(authorMap).map((name) => ({
            name,
            count: authorMap[name],
        }));
    };

    const extractItemTypes = (): ItemType[] => {
        const typeMap: { [key: string]: number } = {};

        searchResults.forEach((result) => {
            const type = getMetadataValue(result._embedded.indexableObject.metadata, 'dspace.entity.type');
            if (type) {
                if (typeMap[type]) {
                    typeMap[type]++;
                } else {
                    typeMap[type] = 1;
                }
            }
        });

        return Object.keys(typeMap).map((type) => ({
            type,
            count: typeMap[type],
        }));
    };

    const extractHasFileCounts = () => {
        let hasFileCount = 0;
        let noFileCount = 0;

        searchResults.forEach((result) => {
            if (result._embedded.indexableObject.hasFile) {
                hasFileCount++;
            } else {
                noFileCount++;
            }
        });

        return { hasFileCount, noFileCount };
    };

    const extractDateRanges = () => {
        const dateMap: { [key: string]: number } = {};

        searchResults.forEach((result) => {
            const date = getMetadataValue(result._embedded.indexableObject.metadata, 'dc.date.issued');
            if (date) {
                const year = new Date(date).getFullYear();
                const range = `[${Math.floor(year / 10) * 10} TO ${Math.floor(year / 10) * 10 + 9}]`; // Format as [start TO end]
                if (dateMap[range]) {
                    dateMap[range]++;
                } else {
                    dateMap[range] = 1;
                }
            }
        });

        return Object.keys(dateMap).map((range) => ({
            range,
            count: dateMap[range],
        }));
    };

    const handleAuthorFilterChange = (authorName: string, isChecked: boolean) => {
        setAuthorFilter((prev) => {
            const newFilters = isChecked ? [...prev, authorName] : prev.filter((name) => name !== authorName);
            handleSearch({ author: newFilters, subject: subjectFilter, date: dateFilter, itemType: itemTypeFilter, hasFile: hasFileFilter });
            return newFilters;
        });
    };

    const handleItemTypeFilterChange = (itemType: string, isChecked: boolean) => {
        setItemTypeFilter((prev) => {
            const newFilters = isChecked ? [...prev, itemType] : prev.filter((type) => type !== itemType);
            handleSearch({ author: authorFilter, subject: subjectFilter, date: dateFilter, itemType: newFilters, hasFile: hasFileFilter });
            return newFilters;
        });
    };

    const handleDateFilterChange = (dateRange: string, isChecked: boolean) => {
        setDateFilter((prev) => {
            const newFilters = isChecked ? [...prev, dateRange] : prev.filter((range) => range !== dateRange);
            handleSearch({ author: authorFilter, subject: subjectFilter, date: newFilters, itemType: itemTypeFilter, hasFile: hasFileFilter });
            return newFilters;
        });
    };

    const handleHasFileFilterChange = (hasFile: boolean | null) => {
        setHasFileFilter(hasFile);
        handleSearch({ author: authorFilter, subject: subjectFilter, date: dateFilter, itemType: itemTypeFilter, hasFile });
    };

    const resetFilters = () => {
        setAuthorFilter([]);
        setSubjectFilter([]);
        setDateFilter([]);
        setItemTypeFilter([]);
        setHasFileFilter(null);
        handleSearch();
    };

    //   const getCurrentItems = () => {
    //     const startIndex = (currentPage - 1) * itemsPerPage;
    //     const endIndex = startIndex + itemsPerPage;
    //     return searchResults.slice(startIndex, endIndex);
    //   };

    //   const PaginationControls = () => {
    //     const totalPages = Math.ceil(searchResults.length / itemsPerPage);

    //     return (
    //       <div className="pagination-controls">
    //         {Array.from({ length: totalPages }, (_, i) => (
    //           <button key={i} onClick={() => setCurrentPage(i + 1)}>
    //             {i + 1}
    //           </button>
    //         ))}
    //       </div>
    //     );
    //   };

    const authors = extractAuthors();
    const itemTypes = extractItemTypes();
    const { hasFileCount, noFileCount } = extractHasFileCounts();
    const dateRanges = extractDateRanges();
    console.log("Date Ranges:", dateRanges);


    return (
        <div className="search-container">
            <div className="filters-and-results">
                {/* Filters sidebar */}
                <div className="filters">
                    <h2>Filters</h2>

                    {/* Author Filter */}
                    <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>
                            <h3>Author</h3>
                            <button onClick={() => toggleSection('author')}>
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
                            <button onClick={() => toggleSection('itemType')}>
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
                            <button onClick={() => toggleSection('date')}>
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
                            <button onClick={() => toggleSection('hasFiles')}>
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
                            onClick={() => handleSearch({ author: authorFilter, subject: subjectFilter, date: dateFilter, itemType: itemTypeFilter, hasFile: hasFileFilter })}
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

                    {/* Pagination Controls */}
                    {/* <PaginationControls /> */}
                </div>
            </div>
        </div>
    );
};

export default Search;