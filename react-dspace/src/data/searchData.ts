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
  title?: string[];
  subject?: string[];
  date?: string[];
  fileType?: string[];
  hasFile?: boolean | null;
  yearrange?: string[];
  boxnumber?: string [];
  guruname?: string [];
  shishyaname?: string [];
  studentname?: string [];
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
  title: 'dc.filenumber',
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
    id: 'title',
    label: 'Title',
    defaultExpanded: false,
    fieldName: 'title',
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
    id: 'fileType',
    label: 'File Type',
    defaultExpanded: false,
    fieldName: 'filetype',
    filterType: 'checkbox'
  },
  {
    id: 'date',
    label: 'Date',
    defaultExpanded: false,
    fieldName: 'dateIssued',
    filterType: 'range'
  },
  // {
  //   id: 'hasFiles',
  //   label: 'Has File',
  //   defaultExpanded: false,
  //   fieldName: 'has_content_in_original_bundle',
  //   filterType: 'boolean'
  // },
   {
    id: 'YearRange',
    label: 'Year Range',
    defaultExpanded: false,
    fieldName: 'yearrange',
    filterType: 'checkbox'
  },
    {
    id: 'BoxNumber',
    label: 'Box Number',
    defaultExpanded: false,
    fieldName: 'boxnumber',
    filterType: 'checkbox'
  },
    {
    id: 'guruname',
    label: 'Guru Name',
    defaultExpanded: false,
    fieldName: 'guruname',
    filterType: 'checkbox'
  },
    {
    id: 'shishyaname',
    label: 'Shishya Name',
    defaultExpanded: false,
    fieldName: 'shishyaname',
    filterType: 'checkbox'
  },
    {
    id: 'studentname',
    label: 'Student Name',
    defaultExpanded: false,
    fieldName: 'studentname',
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