import { useMemo } from 'react';
import citiesData from '@/data/cities.json';

export const useCities = (countryCode: string) => {
  const cities = useMemo(() => {
    const data = citiesData as Record<string, string[]>;
    return data[countryCode] || [];
  }, [countryCode]);

  return { cities };
};
