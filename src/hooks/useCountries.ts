import { useMemo } from 'react';
import countriesData from '@/data/countries.json';
import { useI18n } from '@/contexts/I18nContext';

export interface Country {
  code: string;
  name_en: string;
  name_ar: string;
  flag: string;
}

export const useCountries = () => {
  const { locale } = useI18n();
  
  const countries = useMemo(() => {
    return countriesData.countries as Country[];
  }, []);

  const getCountryDisplay = (country: Country) => {
    if (locale === 'ar') {
      return `${country.flag} ${country.name_ar} — ${country.name_en}`;
    }
    return `${country.flag} ${country.name_en} — ${country.name_ar}`;
  };

  const findCountry = (code: string) => {
    return countries.find(c => c.code === code);
  };

  return { countries, getCountryDisplay, findCountry };
};
