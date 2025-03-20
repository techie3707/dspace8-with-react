import axios from 'axios';
import { siteConfig } from "../data/data";

interface ObjectSearchResult {
  _embedded: {
    searchResult: {
      _embedded: {
        objects: any[];
      }
      page?: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
      }
    }
  }

}

export const searchObjects = async (query: string, queryParams: string, page: number = 0, size: number = 10) => {
  let apiUrl = `${siteConfig.apiEndpoint}/api/discover/search/objects?sort=score,DESC&page=${page}&size=${size}&embed=item&${queryParams}`;

  if (query.trim()) {
    apiUrl += `&configuration=default&embed=item&configuration=default&query=${encodeURIComponent(query)}`;
  }

  try {
    const response = await axios.get<ObjectSearchResult>(apiUrl);
    return {
      results: response.data._embedded.searchResult._embedded.objects || [],
      totalElements: response.data._embedded.searchResult.page?.totalElements || 1,
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};