import { useCountries, Country } from '@/hooks/useCountries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/I18nContext';

interface CountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CountrySelect({ value, onValueChange, placeholder, className }: CountrySelectProps) {
  const { countries, getCountryDisplay } = useCountries();
  const { t } = useI18n();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder || t('search.selectCountry')} />
      </SelectTrigger>
      <SelectContent className="max-h-[350px]">
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {getCountryDisplay(country)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
