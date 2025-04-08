import { showToast } from "../contexts/ToastProvider";
import { siteConfig } from "../data/data";
import axios from "axios";

export const downloadPDF = async (uuid: string, name: string) => {
    try {
        const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Failed to download PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        if (response.status === 200) {
            showToast('PDF downloaded successfully!', 'success');
    }
    } catch (error) {
        showToast('Failed to download PDF', 'error');
    }
};

export const getPDFUrl = (uuid: string): string => {
    return `${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`;
};


export const fetchPDFUrl = async (uuid: string): Promise<string> => {
    try {
        const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch PDF.");
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        throw error;
    }
};


interface MetadataValue {
    value: string;
    language: string | null;
    authority: string | null;
    confidence: number;
    place: number;
  }
  
  export interface Bitstream {
    id: string;
    uuid: string;
    metadata: {
      'dc.title': MetadataValue[];
    };
    _embedded: {
      format:{
        _links: {
            self:{
                href: string;
            }
          };
      }
    };
  }

export const fetchBitstreamMetadata = async (bitstreamId: string): Promise<Bitstream> => {
  try {
    const response = await axios.get<Bitstream>(
      `${siteConfig.apiEndpoint}/api/core/bitstreams/${bitstreamId}?embed=bundle/FprimaryBitstream&embed=bundle/FprimaryBitstream/Fitem&embed=format`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching bitstream metadata:', error);
    throw error;
  }
};

interface Format {
    id: string;
    shortDescription: string;
}
interface BitstreamFormatResponse {
    _embedded: {
        bitstreamformats: Format[];
    };
}
 export const fetchFormate = async ():  Promise<Format[]>  => {
    try{
        const response = await axios.get<BitstreamFormatResponse>(`${siteConfig.apiEndpoint}/api/core/bitstreamformats?page=0&size=10`, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
        });
        return response.data._embedded.bitstreamformats;
    } catch (error) {
        console.error('Error fetching bitstream formats:', error);
        throw error;
    }
}

const csrfToken = "cad42f52-a148-4687-ac15-8576964a0124";
const authToken = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJlaWQiOiI4MmRkN2MzNC01OGQyLTQyNWUtYTVmNS04ZTA1ZmYwN2QxNmEiLCJzZyI6W10sImF1dGhlbnRpY2F0aW9uTWV0aG9kIjoicGFzc3dvcmQiLCJleHAiOjE3NDQxMzA0MjV9.616Owf67uiaZ-341yyzTVSwle-MvrLjv9kwF6lkEv4g"
export const updateBitstreamFormat = async (
  bitstreamId: string,
  payload: string
) => {
//   const authToken = localStorage.getItem('authToken') || '';
//   const csrfToken = localStorage.getItem('csrfToken') || '';

  try {
    const response = await axios.put(
      `${siteConfig.apiEndpoint}/api/core/bitstreams/${bitstreamId}/format`,
      payload,
      {
        headers: {
          'Content-Type': 'text/uri-list',
          'X-XSRF-TOKEN': csrfToken,
          'Authorization': authToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating bitstream format:', error);
    throw error;
  }
};