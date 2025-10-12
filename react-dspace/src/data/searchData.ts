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
export const formatSubjects = (subjects?: string[]): string[] => {
  if (!subjects) return [];

  return subjects.map((subject) => {
    const firstPart = subject.split(/[&,_]/)[0].trim();
    return firstPart.length > 25 ? firstPart.slice(0, 25) + '...' : firstPart;
  });
};

export interface SearchFilters {
  [key: string]: string[] | boolean | null | undefined;

  author?: string [];
  contenttype?: string [];
  publisher?: string [];
  keyword?: string [];

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
  date: 'dc.date.created',
  author: 'dc.contributor.author',
  entityType: 'dspace.entity.type',
  publisher: 'dc.publisher',
  doctype: 'dc.doctype',
  year: 'dc.year',
  keyword: 'dc.keyword',
  contenttype: 'dc.contenttype',
  description: 'dc.description',

} as const;

export const sortOptions: SortOption[] = [
  { value: 'relevant', label: 'Most Relevant', apiValue: 'score,DESC' },
  { value: 'title-asc', label: 'Title Ascending', apiValue: 'dc.title,ASC' },
  { value: 'title-desc', label: 'Title Descending', apiValue: 'dc.title,DESC' },
  { value: 'accessioned-asc', label: 'Accessioned Date Ascending', apiValue: 'dc.date.issued,ASC' },
  { value: 'accessioned-desc', label: 'Accessioned Date Descending', apiValue: 'dc.date.issued,DESC' }
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
    defaultExpanded: false,
    fieldName: 'author',
    filterType: 'checkbox'
  },
  {
    id: 'contenttype',
    label: 'Content Type',
    defaultExpanded: false,
    fieldName: 'contenttype',
    filterType: 'checkbox'
  },
  {
    id: 'date',
    label: 'Date Created',
    defaultExpanded: false,
    fieldName: 'dateIssued',
    filterType: 'range'
  },
  {
    id: 'publisher',
    label: 'Publisher',
    defaultExpanded: false,
    fieldName: 'publisher',
    filterType: 'checkbox'
  },
  {
    id: 'keyword',
    label: 'Keyword',
    defaultExpanded: false,
    fieldName: 'keyword',
    filterType: 'checkbox'
  },
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
  page?: {
    totalElements: number;
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

const commonOperators: SearchOperator[] = [
  { id: 'equals', label: 'Equals', apiValue: 'equals' },
  { id: 'notEquals', label: 'Not Equals', apiValue: 'notequals' },
  { id: 'contains', label: 'Contains', apiValue: 'contains' },
  { id: 'notContains', label: 'Not Contains', apiValue: 'notcontains' },
  {id: 'authority', label: 'Authority', apiValue: 'authority'},
  {id: 'notauthority', label: 'Not Authority', apiValue: 'notauthority'},
  {id: 'query', label: 'Query', apiValue: 'query'}
]

export const advancedSearchFields: AdvancedSearchField[] = [
  {
    id: 'title',
    label: 'Title',
    fieldName: 'title',
    operators: commonOperators
  },
  {
    id: 'author',
    label: 'Author',
    fieldName: 'author',
    operators: commonOperators
  },
  {
    id: 'subject',
    label: 'Subject',
    fieldName: 'subject',
    operators: commonOperators
  },
  {
    id: 'fileType',
    label: 'File Type',
    fieldName: 'filetype',
    operators: commonOperators
  },
    {
    id: 'fileType',
    label: 'File Type',
    fieldName: 'filetype',
    operators: commonOperators
  }
];

export interface AdvancedFilter {
  id?: string;
  field: string;
  operator: string;
  value: string;
}