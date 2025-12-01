import { Country } from '@/hooks/useCountries';

interface DemoLeadParams {
  niche: string;
  customNiche?: string;
  country: Country;
  city: string;
  lat: number;
  lng: number;
  radiusKm: number;
  minReviews?: number;
  openNow?: boolean;
  hasWhatsapp?: boolean;
  hasInstagram?: boolean;
  hasBooking?: boolean;
  priceRange?: string;
}

interface DemoLead {
  id: string;
  name: string;
  niche: string;
  custom_niche?: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
  address: string;
  rating: number;
  reviews: number;
  has_website: boolean;
  has_booking: boolean;
  open_now: boolean;
  price_range: string;
  work_status: string;
  source: string;
  created_at: string;
}

const businessPrefixes: Record<string, string[]> = {
  'Dental Clinics': ['Smile', 'Bright', 'Modern', 'Family', 'Advanced', 'Elite'],
  'Beauty Salons': ['Glam', 'Beauty', 'Elegance', 'Style', 'Luxury', 'Chic'],
  'Barber Shops': ['Classic', 'Modern', 'Gentleman', 'Elite', 'Premium', 'Royal'],
  'Restaurants': ['Golden', 'Tasty', 'Royal', 'Grand', 'Delicious', 'Prime'],
  'Cafés': ['Cozy', 'Urban', 'Morning', 'Daily', 'Corner', 'Central'],
  'Gyms & Fitness': ['Power', 'Fit', 'Strong', 'Active', 'Elite', 'Pro'],
  'Law Firms': ['Legal', 'Justice', 'Crown', 'Prime', 'Elite', 'Premier'],
  'default': ['Premier', 'Quality', 'Professional', 'Elite', 'Modern', 'Best'],
};

const phoneFormats: Record<string, (n: string) => string> = {
  SA: (n) => `+966 5${n}`,
  AE: (n) => `+971 5${n}`,
  US: (n) => `+1 ${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`,
  GB: (n) => `+44 20 ${n.slice(0, 4)} ${n.slice(4)}`,
  default: (n) => `+${n}`,
};

function jitterCoordinate(coord: number, radiusKm: number): number {
  const offset = (Math.random() - 0.5) * (radiusKm / 111); // ~111km per degree
  return coord + offset;
}

function generateBusinessName(niche: string, customNiche?: string): string {
  const actualNiche = customNiche || niche;
  const prefixes = businessPrefixes[niche] || businessPrefixes['default'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const nicheWord = actualNiche.split(' ')[0];
  return `${prefix} ${nicheWord}`;
}

function generatePhone(countryCode: string): string {
  const randomDigits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const formatter = phoneFormats[countryCode] || phoneFormats['default'];
  return formatter(randomDigits);
}

function generateAddress(city: string, country: string): string {
  const streetNumber = Math.floor(Math.random() * 999) + 1;
  const streets = ['Main St', 'High St', 'Park Ave', 'Market St', 'King St', 'Queen St'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  return `${streetNumber} ${street}, ${city}, ${country}`;
}

export function generateDemoLeads(params: DemoLeadParams): DemoLead[] {
  const count = Math.floor(Math.random() * 51) + 10; // 10-60 leads
  const leads: DemoLead[] = [];

  for (let i = 0; i < count; i++) {
    const rating = Math.random() * 2 + 3; // 3-5 stars
    const reviews = Math.floor(Math.random() * 200) + (params.minReviews || 0);
    const hasWebsite = Math.random() < 0.3; // 30% have websites
    const hasWhatsapp = params.hasWhatsapp !== false ? Math.random() < 0.7 : false;
    const hasInstagram = params.hasInstagram !== false ? Math.random() < 0.6 : false;
    const hasBooking = params.hasBooking !== false ? Math.random() < 0.4 : false;
    const openNow = params.openNow !== false ? Math.random() < 0.7 : Math.random() < 0.5;

    // Apply filters
    if (params.minReviews && reviews < params.minReviews) continue;
    if (params.hasWhatsapp && !hasWhatsapp) continue;
    if (params.hasInstagram && !hasInstagram) continue;
    if (params.hasBooking && !hasBooking) continue;
    if (params.openNow && !openNow) continue;

    const businessName = generateBusinessName(params.niche, params.customNiche);
    const phone = generatePhone(params.country.code);
    const lat = jitterCoordinate(params.lat, params.radiusKm);
    const lng = jitterCoordinate(params.lng, params.radiusKm);

    leads.push({
      id: `demo-${Date.now()}-${i}`,
      name: businessName,
      niche: params.niche,
      custom_niche: params.customNiche,
      country: params.country.code,
      city: params.city,
      lat,
      lng,
      phone,
      email: hasWebsite ? `info@${businessName.toLowerCase().replace(/\s+/g, '')}.com` : undefined,
      whatsapp: hasWhatsapp ? phone : undefined,
      instagram: hasInstagram ? `@${businessName.toLowerCase().replace(/\s+/g, '')}` : undefined,
      address: generateAddress(params.city, params.country.name_en),
      rating: parseFloat(rating.toFixed(1)),
      reviews,
      has_website: hasWebsite,
      has_booking: hasBooking,
      open_now: openNow,
      price_range: params.priceRange || ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
      work_status: 'new',
      source: 'demo',
      created_at: new Date().toISOString(),
    });
  }

  return leads;
}
