export interface SearchParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
  filters?: SearchFilters;
}
export interface SortOption {
  value: string;
  label: string;
  apiValue: string;
}
export interface SearchFilters {
  author?: string[];
  subject?: string[];
  date?: string[];
  itemType?: string[];
  hasFile?: boolean | null;
}

export interface ResultsPerPageOption {
  value: number;
  label: string;
}

export interface FilterSection {
  id: string;
  label: string;
  defaultExpanded: boolean;
}

export interface MetadataFields {
  title: string;
  abstract: string;
  date: string;
  author: string;
  entityType: string;
  publisher: string;
}

export const sortOptions: SortOption[] = [
  { value: 'relevant', label: 'Most Relevant', apiValue: 'score,DESC' },
  { value: 'title-asc', label: 'Title Ascending', apiValue: 'dc.title,ASC' },
  { value: 'date-desc', label: 'Date Issued Descending', apiValue: 'dc.date.issued,DESC' },
  { value: 'accessioned-desc', label: 'Accessioned Date Descending', apiValue: 'dc.date.accessioned,DESC' }
];

export const resultsPerPageOptions: ResultsPerPageOption[] = [
  { value: 1, label: '1' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' }
];

export const filterSections: FilterSection[] = [
  { id: 'author', label: 'Author', defaultExpanded: true },
  { id: 'subject', label: 'Subject', defaultExpanded: false },
  { id: 'itemType', label: 'Item Type', defaultExpanded: false },
  { id: 'date', label: 'Date', defaultExpanded: false },
  { id: 'hasFiles', label: 'Has File', defaultExpanded: false }
];

export const metadataFields: MetadataFields = {
  title: 'dc.title',
  abstract: 'dc.description.abstract',
  date: 'dc.date.issued',
  author: 'dc.contributor.author',
  entityType: 'dspace.entity.type',
  publisher: 'dc.publisher'
};


export interface Author {
  name: string;
  count: number;
}

export interface ItemType {
  type: string;
  count: number;
}

export interface Subject {
  name: string,
  count: number
}
export interface ObjectSearchResult {
  _embedded: {
    searchResult: {
      _embedded: {
        objects: any[];
      };
      page?: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
      };
    };
  };
}
export interface FacetResult {
  _embedded: {
    values: Array<{ label: string; count: number }>;
  };
}