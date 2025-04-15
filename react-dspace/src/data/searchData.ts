import { Bitstream } from "./bookDetail";
export interface AdvancedFilter {
  field: string;
  operator: string;
  value: string;
}
export interface SearchParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
  scope?: string;
  filters?: SearchFilters;
  advancedFilters?: AdvancedFilter[];
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export interface SearchFilters {
  [key: string]: string[] | boolean | null | undefined;
  author?: string[];
  subject?: string[];
  date?: string[];
  itemType?: string[];
  hasFile?: boolean | null;
}

export interface SortOption {
  value: string;
  label: string;
  apiValue: string;
}

export interface ResultsPerPageOption {
  value: number;
  label: string;
}

export interface FilterSection {
  id: string;
  label: string;
  defaultExpanded: boolean;
  fieldName: string; 
  filterType: 'checkbox' | 'range' | 'boolean';
}

export const metadataFields = {
  title: 'dc.title',
  abstract: 'dc.description.abstract',
  date: 'dc.date.issued',
  author: 'dc.contributor.author',
  entityType: 'dspace.entity.type',
  publisher: 'dc.publisher'
} as const;

export const sortOptions: SortOption[] = [
  { value: 'relevant', label: 'Most Relevant', apiValue: 'score,DESC' },
  { value: 'title-asc', label: 'Title Ascending', apiValue: 'dc.title,ASC' },
  { value: 'title-desc', label: 'Title Descending', apiValue: 'dc.title,DESC' },
  { value: 'date-asc', label: 'Date Issued Ascending', apiValue: 'dc.date.issued,ASC' },
  { value: 'date-desc', label: 'Date Issued Descending', apiValue: 'dc.date.issued,DESC' },
  { value: 'accessioned-asc', label: 'Accessioned Date Ascending', apiValue: 'dc.date.accessioned,ASC' }, 
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
  { 
    id: 'author', 
    label: 'Author', 
    defaultExpanded: true, 
    fieldName: 'author',
    filterType: 'checkbox'
  },
  { 
    id: 'subject', 
    label: 'Subject', 
    defaultExpanded: false, 
    fieldName: 'subject',
    filterType: 'checkbox'
  },
  { 
    id: 'itemType', 
    label: 'Item Type', 
    defaultExpanded: false, 
    fieldName: 'entityType',
    filterType: 'checkbox'
  },
  { 
    id: 'date', 
    label: 'Date', 
    defaultExpanded: false, 
    fieldName: 'dateIssued',
    filterType: 'range'
  },
  { 
    id: 'hasFiles', 
    label: 'Has File', 
    defaultExpanded: false, 
    fieldName: 'has_content_in_original_bundle',
    filterType: 'boolean'
  }
];

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

export interface Bundle {
  name: string;
  _embedded?: {
      bitstreams?: Bitstream[];
  };
}

export interface AdvancedSearchField {
  id: string;
  label: string;
  fieldName: string;
  operators: SearchOperator[];
}

export interface SearchOperator {
  id: string;
  label: string;
  apiValue: string;
}

export const advancedSearchFields: AdvancedSearchField[] = [
  {
    id: 'title',
    label: 'Title',
    fieldName: 'title',
    operators: [
      { id: 'equals', label: 'Equals', apiValue: 'equals' },
      { id: 'notEquals', label: 'Not Equals', apiValue: 'notequals' },
      { id: 'contains', label: 'Contains', apiValue: 'contains' },
      { id: 'notContains', label: 'Not Contains', apiValue: 'notcontains' }
    ]
  },
  {
    id: 'author',
    label: 'Author',
    fieldName: 'author',
    operators: [
      { id: 'equals', label: 'Equals', apiValue: 'equals' },
      { id: 'notEquals', label: 'Not Equals', apiValue: 'notequals' },
      { id: 'contains', label: 'Contains', apiValue: 'contains' },
      { id: 'notContains', label: 'Not Contains', apiValue: 'notcontains' }
    ]
  },
  {
    id: 'subject',
    label: 'Subject',
    fieldName: 'subject',
    operators: [
      { id: 'equals', label: 'Equals', apiValue: 'equals' },
      { id: 'notEquals', label: 'Not Equals', apiValue: 'notequals' },
      { id: 'contains', label: 'Contains', apiValue: 'contains' },
      { id: 'notContains', label: 'Not Contains', apiValue: 'notcontains' }
    ]
  },
  {
    id: 'itemType',
    label: 'Item Type',
    fieldName: 'entityType',
    operators: [
      { id: 'equals', label: 'Equals', apiValue: 'equals' },
      { id: 'notEquals', label: 'Not Equals', apiValue: 'notequals' },
      { id: 'contains', label: 'Contains', apiValue: 'contains' },
      { id: 'notContains', label: 'Not Contains', apiValue: 'notcontains' }
    ]
  }
];