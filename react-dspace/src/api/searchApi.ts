import axios from "axios";
import { siteConfig } from "../data/data";
import { FacetResult, ObjectSearchResult, SearchParams } from "../data/searchData";



const buildApiQueryParams = (params: SearchParams): string => {
  const queryParams = new URLSearchParams();
  queryParams.append('configuration', 'default');

  if (params.sort) {
    queryParams.append('sort', params.sort);
  }

  queryParams.append('page', (params.page || 0).toString());
  queryParams.append('size', (params.size || 10).toString());

  if (params.filters) {
    const { filters } = params;
    
    if (filters.author?.length) {
      filters.author.forEach(author => {
        queryParams.append('f.author', `${author},equals`);
      });
    }

    if (filters.subject?.length) {
      filters.subject.forEach(subject => {
        queryParams.append('f.subject', `${subject},equals`);
      });
    }

    if (filters.date?.length) {
      const dateRange = `[${filters.date[0].split(' - ')[0]} TO ${filters.date[0].split(' - ')[1]}]`;
      queryParams.append('f.dateIssued', `${dateRange},equals`);
    }

    if (filters.itemType?.length) {
      filters.itemType.forEach(itemType => {
        queryParams.append('f.entityType', `${itemType},equals`);
      });
    }

    if (filters.hasFile !== null && filters.hasFile !== undefined) {
      queryParams.append('f.has_content_in_original_bundle', `${filters.hasFile},equals`);
    }
  }

  return queryParams.toString();
};

export const parseSearchParamsFromUrl = (): SearchParams => {
  if (typeof window === 'undefined') {
    return { page: 0, size: 10 };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    page: parseInt(params.get('page') || '0'),
    size: parseInt(params.get('size') || '10'),
    query: params.get('query') || undefined,
    sort: params.get('sort') || undefined,
    filters: {
      author: params.getAll('author'),
      subject: params.getAll('subject'),
      date: params.getAll('date').filter(Boolean),
      itemType: params.getAll('itemType'),
      hasFile: params.get('hasFile') === 'true' ? true : 
               params.get('hasFile') === 'false' ? false : undefined
    }
  };
};

export const updateUrlWithSearchParams = (params: SearchParams) => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams();
  
  urlParams.set('page', (params.page || 0).toString());
  urlParams.set('size', (params.size || 10).toString());
  
  if (params.query) {
    urlParams.set('query', params.query);
  }
  
  if (params.sort) {
    urlParams.set('sort', params.sort);
  }
  
  if (params.filters) {
    params.filters.author?.forEach(a => urlParams.append('author', a));
    params.filters.subject?.forEach(s => urlParams.append('subject', s));
    params.filters.date?.forEach(d => urlParams.append('date', d));
    params.filters.itemType?.forEach(i => urlParams.append('itemType', i));
    if (params.filters?.hasFile !== null && params.filters?.hasFile !== undefined) {
      urlParams.set('hasFile', params.filters.hasFile.toString());
    }
  }
  
  // Update URL without reloading
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
};

export const searchObjects = async (
  params: SearchParams
): Promise<{ results: any[]; totalElements: number }> => {
  let apiUrl = `${siteConfig.apiEndpoint}/api/discover/search/objects?${buildApiQueryParams(params)}`;

  if (params.query?.trim()) {
    apiUrl += `&query=${encodeURIComponent(params.query)}&embed=thumbnail&embed=item`;
  }

  try {
    const response = await axios.get<ObjectSearchResult>(apiUrl);
    return {
      results: response.data._embedded.searchResult._embedded.objects || [],
      totalElements: response.data._embedded.searchResult.page?.totalElements || 0,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const fetchFacetData = async (
  facetName: string,
  params: SearchParams
): Promise<FacetResult> => {
  let f_url = `${siteConfig.apiEndpoint}/api/discover/facets/${facetName}?${buildApiQueryParams(params)}`;
  
  if (params.query) {
    f_url += `&query=${encodeURIComponent(params.query)}`;
  }

  const response = await axios.get<FacetResult>(f_url);
  return response.data;
};

export const fetchAuthors = async (params: SearchParams): Promise<FacetResult> => {
  return fetchFacetData('author', params);
};

export const fetchSubjects = async (params: SearchParams): Promise<FacetResult> => {
  return fetchFacetData('subject', params);
};

export const fetchItemTypes = async (params: SearchParams): Promise<FacetResult> => {
  return fetchFacetData('entityType', params);
};

export const fetchDates = async (params: SearchParams): Promise<FacetResult> => {
  return fetchFacetData('dateIssued', params);
};

export const fetchHasFile = async (params: SearchParams): Promise<FacetResult> => {
  return fetchFacetData('has_content_in_original_bundle', params);
};

