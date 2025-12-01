import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/contexts/I18nContext';

interface MapPickerProps {
  onLocationChange: (lat: number, lng: number, city?: string, country?: string) => void;
  onRadiusChange: (radius: number) => void;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number;
}

// Temporary non-map implementation to avoid runtime errors with react-leaflet.
// Keeps the same API so we can later plug in a real map implementation.
export default function MapPicker({
  onLocationChange,
  onRadiusChange,
  initialLat = 24.7136,
  initialLng = 46.6753,
  initialRadius = 5,
}: MapPickerProps) {
  const { t } = useI18n();
  const [radius, setRadius] = useState(initialRadius);

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
    onRadiusChange(value[0]);
  };

  const handleMockLocationClick = () => {
    // For now, just send back the initial center.
    onLocationChange(initialLat, initialLng);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('search.mapPicker')}</Label>
        <p className="text-sm text-muted-foreground mb-2">{t('search.mapPickerHint')}</p>
        <button
          type="button"
          onClick={handleMockLocationClick}
          className="w-full h-[300px] rounded-lg border border-dashed border-border bg-gradient-to-br from-background via-muted to-background flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          {t('search.locationPicker')}
        </button>
      </div>

      <div className="space-y-2">
        <Label>
          {t('search.searchRadius')}: {radius} km
        </Label>
        <Slider
          value={[radius]}
          onValueChange={handleRadiusChange}
          min={0.5}
          max={50}
          step={0.5}
          className="w-full"
        />
      </div>
    </div>
  );
}
