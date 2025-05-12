import React, { useEffect, useState } from 'react';
import { siteConfig } from '../../data/data';

type SecureImageProps = {
  uuid: string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
};

const SecureImage: React.FC<SecureImageProps> = ({ uuid, className, style, alt }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      const authToken = localStorage.getItem('authToken');
      const csrfToken = localStorage.getItem('csrfToken');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) headers['Authorization'] = authToken;
      if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;

      try {
        const response = await fetch(`${siteConfig.apiEndpoint}/api/core/bitstreams/${uuid}/content`, {
          method: 'GET',
          headers,
        });
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (error) {
        console.error('Error loading secure image:', error);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [uuid]);

  if (!imageUrl) return null;

  return <img src={imageUrl} className={className} style={style} alt={alt || 'Secure thumbnail'} />;
};

export default SecureImage;
