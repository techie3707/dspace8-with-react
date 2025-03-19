import axios from 'axios';
import { siteConfig } from "../data/data";


const API_BASE_URL = `${siteConfig.apiEndpoint}/api/discover/search/objects`;

export const searchObjects = async (query: string,queryParams:string) => {
  let apiUrl = `${API_BASE_URL}?${queryParams}`;

  if (query.trim()) {
    apiUrl += `&embed=item&configuration=default&query=${encodeURIComponent(query)}`;
  }

  try {
    const response = await axios.get<{ _embedded: { searchResult: { _embedded: { objects: any[] } } } }>(apiUrl);
    return response.data._embedded.searchResult._embedded.objects;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
