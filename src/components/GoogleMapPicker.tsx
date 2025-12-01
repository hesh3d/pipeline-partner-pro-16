import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleMapPickerProps {
  onLocationChange: (lat: number, lng: number, city?: string, country?: { code: string; name_en: string; name_ar: string; flag: string }) => void;
  onRadiusChange: (radius: number) => void;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number;
  defaultCountry?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const COUNTRY_CAPITALS: Record<string, { lat: number; lng: number }> = {
  SA: { lat: 24.7136, lng: 46.6753 }, // Riyadh
  AE: { lat: 24.4539, lng: 54.3773 }, // Abu Dhabi
  US: { lat: 38.9072, lng: -77.0369 }, // Washington DC
  GB: { lat: 51.5074, lng: -0.1278 }, // London
  JO: { lat: 31.9454, lng: 35.9284 }, // Amman
};

export default function GoogleMapPicker({
  onLocationChange,
  onRadiusChange,
  initialLat,
  initialLng,
  initialRadius = 5,
  defaultCountry = 'SA',
}: GoogleMapPickerProps) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [circle, setCircle] = useState<any>(null);
  const [radius, setRadius] = useState(initialRadius);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const geocoderRef = useRef<any>(null);

  // Fetch user settings for API key
  const { data: settings } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Determine initial center
  const getInitialCenter = () => {
    if (initialLat && initialLng) {
      return { lat: initialLat, lng: initialLng };
    }
    if (defaultCountry && COUNTRY_CAPITALS[defaultCountry]) {
      return COUNTRY_CAPITALS[defaultCountry];
    }
    return { lat: 25.276987, lng: 55.296249 }; // Dubai fallback
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderRef.current || !window.google) return;

    try {
      const result = await new Promise((resolve, reject) => {
        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results: any[], status: string) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });

      const addressComponents = (result as any).address_components;
      let city = '';
      let countryCode = '';
      let countryName = '';

      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('country')) {
          countryCode = component.short_name;
          countryName = component.long_name;
        }
      }

      // Import countries data to get full info
      import('@/data/countries.json').then((countriesData) => {
        const countryInfo = countriesData.countries.find(
          (c: any) => c.code === countryCode
        );
        
        onLocationChange(lat, lng, city, countryInfo || undefined);
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      onLocationChange(lat, lng);
    }
  };

  useEffect(() => {
    const apiKey = settings?.api_secret_key || '';
    
    if (!apiKey) {
      setLoadError(locale === 'ar' 
        ? 'لم يتم تعيين مفتاح Google Maps. انتقل إلى الإعدادات → التكاملات.'
        : 'Google Maps API key not set. Go to Settings → Integrations.'
      );
      return;
    }

    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
      setLoadError(null);
    };
    
    script.onerror = () => {
      setLoadError(
        locale === 'ar'
          ? 'تعذّر تحميل خرائط جوجل. تحقّق من المفتاح أو الفوترة.'
          : "Can't load Google Maps. Check API key or billing."
      );
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [settings?.api_secret_key, retryCount, locale]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    const center = getInitialCenter();
    geocoderRef.current = new window.google.maps.Geocoder();

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#c9e9ff' }],
        },
      ],
    });

    const mapMarker = new window.google.maps.Marker({
      position: center,
      map: googleMap,
      draggable: true,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#7C3AED',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
    });

    const mapCircle = new window.google.maps.Circle({
      map: googleMap,
      center,
      radius: initialRadius * 1000,
      fillColor: '#7C3AED',
      fillOpacity: 0.15,
      strokeColor: '#7C3AED',
      strokeOpacity: 0.4,
      strokeWeight: 2,
    });

    mapMarker.addListener('dragend', () => {
      const position = mapMarker.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      mapCircle.setCenter({ lat, lng });
      reverseGeocode(lat, lng);
    });

    googleMap.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      mapMarker.setPosition({ lat, lng });
      mapCircle.setCenter({ lat, lng });
      reverseGeocode(lat, lng);
    });

    setMap(googleMap);
    setMarker(mapMarker);
    setCircle(mapCircle);

    // Initial reverse geocode
    reverseGeocode(center.lat, center.lng);
  }, [isLoaded, defaultCountry]);

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    onRadiusChange(newRadius);
    
    if (circle) {
      circle.setRadius(newRadius * 1000); // Convert km to meters
    }
  };

  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="w-full min-h-[420px] rounded-2xl border border-border bg-card shadow-elegant flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-sm text-foreground font-medium">{loadError}</p>
            <Button
              variant="outline"
              onClick={() => setRetryCount(c => c + 1)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="w-full min-h-[420px] rounded-2xl border border-border bg-card shadow-elegant flex items-center justify-center">
          <div className="text-center space-y-3">
            <MapPin className="h-12 w-12 text-primary mx-auto animate-pulse" />
            <p className="text-sm text-muted-foreground">{t('search.loadingMap')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="w-full min-h-[420px] rounded-2xl border border-border shadow-elegant overflow-hidden bg-card"
      />
      
      <div className="space-y-3 bg-accent/10 p-5 rounded-xl border border-border/50">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {t('search.searchRadius')}: <span className="text-primary font-bold">{radius} {locale === 'ar' ? 'كم' : 'km'}</span>
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
