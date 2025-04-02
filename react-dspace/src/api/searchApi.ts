import axios from "axios";
import { siteConfig } from "../data/data";
import { FacetResult, ObjectSearchResult, SearchParams, filterSections, FilterOption, SearchFilters } from "../data/searchData";
import { Bitstream, BitstreamsResponse, BookDetailsData, Bundle, BundlesResponse } from "../data/bookDetail";
import { showToast } from "../contexts/ToastProvider";
// import { BookDetailsData } from "../search/bookDetailsData";


 const buildApiQueryParams = (params: SearchParams): string => {
  const queryParams = new URLSearchParams();
  queryParams.append('configuration', 'default');

  if (params.sort) {
    queryParams.append('sort', params.sort);
  }

  queryParams.append('page', (params.page || 0).toString());
  queryParams.append('size', (params.size || 10).toString());

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach(val => {
          if (key === 'date' && val.includes(' - ')) {
            const dateRange = `[${val.split(' - ')[0]} TO ${val.split(' - ')[1]}]`;
            queryParams.append('f.dateIssued', `${dateRange},equals`);
          } else {
            const fieldName = filterSections.find(s => s.id === key)?.fieldName || key;
            queryParams.append(`f.${fieldName}`, `${val},equals`);
          }
        });
      } else if (typeof value === 'boolean') {
        queryParams.append(`f.has_content_in_original_bundle`, `${value},equals`);
      }
    });
  }

  return queryParams.toString();
};

export const parseSearchParamsFromUrl = (): SearchParams => {
  if (typeof window === 'undefined') {
    return { page: 0, size: 10 };
  }

  const params = new URLSearchParams(window.location.search);
  const filters: SearchFilters = {};

  filterSections.forEach(section => {
    if (section.filterType === 'checkbox') {
      const values = params.getAll(section.id);
      if (values.length) filters[section.id] = values;
    } else if (section.filterType === 'boolean') {
      const value = params.get(section.id);
      if (value) filters[section.id] = value === 'true';
    } else if (section.filterType === 'range') {
      const values = params.getAll(section.id).filter(Boolean);
      if (values.length) filters[section.id] = values;
    }
  });

  return {
    page: parseInt(params.get('page') || '0'),
    size: parseInt(params.get('size') || '10'),
    query: params.get('query') || undefined,
    sort: params.get('sort') || undefined,
    filters: Object.keys(filters).length ? filters : undefined
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
    Object.entries(params.filters).forEach(([key, value]) => {
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach(val => urlParams.append(key, val));
      } else if (typeof value === 'boolean') {
        urlParams.set(key, value.toString());
      }
    });
  }

  // Update URL without reloading
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
};

export const searchObjects = async (
  params: SearchParams
): Promise<{ results: any[]; totalElements: number }> => {
  let apiUrl = `${siteConfig.apiEndpoint}//api/discover/search/objects?${buildApiQueryParams(params)}`;

  if (params.query?.trim()) {
    apiUrl += `&query=${encodeURIComponent(params.query)}`;
  }
  apiUrl += '&embed=thumbnail&embed=item/thumbnail'
  try {
    const response = await axios.get<ObjectSearchResult>(apiUrl);
    if (response.status === 200) {
      showToast( 'Search completed successfully!','success');
    }
    return {
      results: response.data._embedded.searchResult._embedded.objects || [],
      totalElements: response.data._embedded.searchResult.page?.totalElements || 0,
    };
  } catch (error:any) {
    const errorStatus = error.response?.status || 500;
    if(errorStatus === 400){
      window.location.href = `/error-400`;
    }else if(errorStatus === 401){
      window.location.href = `/error-401`;
    }else if(errorStatus === 403){
      window.location.href = `/error-403`;
    }else if(errorStatus === 422){
      window.location.href = `/error-422`;
    }else if(errorStatus === 500){
      window.location.href = `/error-500`;
    }else{
      window.location.href = `/error-404`;
    }
    return {
      results: [],
      totalElements: 0,
    };
  }
};

export const fetchFacet = async (
  facetName: string,
  params: SearchParams
): Promise<FilterOption[]> => {
  let f_url = `${siteConfig.apiEndpoint}/api/discover/facets/${facetName}?${buildApiQueryParams(params)}`;

  if (params.query) {
    f_url += `&query=${encodeURIComponent(params.query)}`;
  }

  const response = await axios.get<FacetResult>(f_url);
  return response.data._embedded?.values?.map((value: any) => ({
    id: value.label,
    label: value.label,
    count: value.count
  })) || [];
};

export const fetchFacets = async (params: SearchParams) => {
  const facetPromises = filterSections.map(section => {
    if (section.filterType === 'checkbox' || section.filterType === 'boolean') {
      return fetchFacet(section.fieldName, params);
    }
    return Promise.resolve([]);
  });

  const results = await Promise.all(facetPromises);

  return filterSections.reduce((acc, section, index) => {
    if (section.filterType === 'checkbox' || section.filterType === 'boolean') {
      acc[section.id] = results[index];
    }
    return acc;
  }, {} as Record<string, FilterOption[]>);
};

export const fetchHasFileCounts = async (params: SearchParams) => {
  const options = await fetchFacet('has_content_in_original_bundle', params);
  return {
    hasFileCount: options.find(o => o.id === 'true')?.count || 0,
    noFileCount: options.find(o => o.id === 'false')?.count || 0
  };
};


export const fetchItemDetails = async (id: string): Promise<BookDetailsData> => {
  const response = await axios.get<BookDetailsData>(`${siteConfig.apiEndpoint}/api/core/items/${id}?embed=thumbnail&embed=accessStatus`);
  return response.data;
};

export const fetchItemBundles = async (id: string): Promise<Bundle[]> => {
  const response = await axios.get<BundlesResponse>(`${siteConfig.apiEndpoint}/api/core/items/${id}/bundles?size=9999`);
  return response.data._embedded.bundles;
};

export const fetchBitstreams = async (bundleId: string): Promise<Bitstream[]> => {
  const response = await axios.get<BitstreamsResponse>(`${siteConfig.apiEndpoint}/api/core/bundles/${bundleId}/bitstreams?page=0&size=5`);
  return response.data._embedded.bitstreams;
};