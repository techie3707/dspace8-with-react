import axios from 'axios';
import {siteConfig} from '../data/data'

interface ObjectSearchResult {
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

interface FacetResult {
  _embedded: {
    values: Array<{ label: string; count: number }>;
  };
}



export const searchObjects = async (
  query: string,
  queryParams: string,
  page: number = 0,
  size: number = 10
): Promise<{ results: any[]; totalElements: number }> => {
  let apiUrl = `${siteConfig.apiEndpoint}/api/discover/search/objects?sort=score,DESC&page=${page}&size=${size}&${queryParams}`;

  if (query.trim()) {
    apiUrl += `&query=${encodeURIComponent(query)}&embed=thumbnail&embed=item`;
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

export const fetchAuthors = async (query: string,facetParam: string, page: number, size: number): Promise<FacetResult> => {
  let f_url = `${siteConfig.apiEndpoint}/api/discover/facets/author?&page=${page}&size=${size}${facetParam}`;
  if(query){
    f_url += `&query=${encodeURIComponent(query)}`
  }
  const response = await axios.get<FacetResult>(f_url);
  return response.data;
};

export const fetchSubjects = async (query: string, facetParam: string, page: number, size: number): Promise<FacetResult> => {
  let f_url = `${siteConfig.apiEndpoint}/api/discover/facets/subject?&page=${page}&size=${size}${facetParam}`;
  if (query) {
    f_url += `&query=${encodeURIComponent(query)}`;
  }
  const response = await axios.get<FacetResult>(f_url);
  return response.data;
};

export const fetchItemTypes = async (query: string,facetParam: string, page: number, size: number): Promise<FacetResult> => {
  let f_url = `${siteConfig.apiEndpoint}/api/discover/facets/entityType?&page=${page}&size=${size}${facetParam}`;
  if(query){
    f_url += `&query=${encodeURIComponent(query)}`
  }
  const response = await axios.get<FacetResult>(f_url);
  return response.data;
};

export const fetchDates = async (query: string, facetParam: string,page: number, size: number): Promise<FacetResult> => {
  let f_url = `${siteConfig.apiEndpoint}/api/discover/facets/dateIssued?&page=${page}&size=${size}${facetParam}`;
  if(query){
    f_url += `&query=${encodeURIComponent(query)}`
  }
  const response = await axios.get<FacetResult>(f_url);
  return response.data;
};

export const fetchHasFile = async ( query: string,facetParam: string,page: number, size: number): Promise<FacetResult> => {
  let f_url = `${siteConfig.apiEndpoint}/api/discover/facets/has_content_in_original_bundle?&page=${page}&size=${size}${facetParam}`;
  if(query){
    f_url += `&query=${encodeURIComponent(query)}`
  }
  const response = await axios.get<FacetResult>(f_url);
  return response.data;
};