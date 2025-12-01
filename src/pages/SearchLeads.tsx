import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/I18nContext';
import { Search, MapPin, Building2, Globe2, Star, Filter, X, Plus } from 'lucide-react';
import { useCountries } from '@/hooks/useCountries';
import { useCities } from '@/hooks/useCities';
import { useNiches } from '@/hooks/useNiches';
import GoogleMapPicker from '@/components/GoogleMapPicker';
import CountrySelect from '@/components/CountrySelect';
import AddLeadModal from '@/components/AddLeadModal';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
export default function SearchLeads() {
  const { t, locale } = useI18n();
  const { countries, getCountryDisplay } = useCountries();
  const { niches, getNicheDisplay } = useNiches();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    niche: '',
    customNiche: '',
    country: '',
    city: '',
    keyword: '',
    minRating: 'none',
    hasWebsite: 'none',
    lat: 24.7136,
    lng: 46.6753,
    radiusKm: 5,
    minReviews: '',
    includeSocialMedia: 'none',
    maxResults: '20'
  });
  const {
    cities
  } = useCities(formData.country);
  const handleLocationChange = (lat: number, lng: number, city?: string, country?: any) => {
    setFormData({
      ...formData,
      lat,
      lng,
      ...(city && {
        city
      }),
      ...(country && {
        country: country.code
      })
    });
  };
  const handleRadiusChange = (radius: number) => {
    setFormData({
      ...formData,
      radiusKm: radius
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.niche || !formData.country || !formData.city) {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: "الرجاء ملء جميع الحقول المطلوبة (المجال، البلد، المدينة)",
      });
      return;
    }

    setIsSubmitting(true);

    // Show loading toast
    const loadingToast = toast({
      title: "جاري البحث...",
      description: "قد تستغرق العملية عدة دقائق، الرجاء الانتظار",
      duration: Infinity,
    });

    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
        });
        return;
      }

      // Get full names for niche and country
      const selectedNiche = niches.find(n => n.id === formData.niche);
      const selectedCountry = countries.find(c => c.code === formData.country);
      
      const nicheName = selectedNiche ? getNicheDisplay(selectedNiche) : formData.niche;
      // Always send country name in English to webhook
      const countryName = selectedCountry ? selectedCountry.name_en : formData.country;

      // Call edge function to send webhook
      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: {
          niche: nicheName,
          country: countryName,
          city: formData.city,
          minRating: formData.minRating === 'none' ? '' : formData.minRating,
          hasWebsite: formData.hasWebsite === 'none' ? 'allPlaces' : formData.hasWebsite,
          minReviews: formData.minReviews,
          includeSocialMedia: formData.includeSocialMedia === 'yes' ? true : formData.includeSocialMedia === 'no' ? false : false,
          maxResults: parseInt(formData.maxResults) || 20,
        },
      });

      if (error) {
        console.error('Webhook error:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى",
        });
        return;
      }

      if (data?.success) {
        loadingToast.dismiss();
        
        toast({
          title: "تم الحفظ بنجاح ✓",
          description: data.message || `تم حفظ ${data.savedCount || 0} نتيجة في قائمة العملاء`,
          duration: 5000,
        });

        // Reset form
        setFormData({
          ...formData,
          niche: '',
          city: '',
          keyword: '',
          minRating: 'none',
          hasWebsite: 'none',
          minReviews: '',
          includeSocialMedia: 'none',
          maxResults: '20'
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const activeFiltersCount = [formData.keyword, formData.minReviews, formData.includeSocialMedia !== 'none' ? formData.includeSocialMedia : ''].filter(Boolean).length;
  return <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 animate-blur-in">
        <h1 className="text-5xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
          {t('search.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('search.description')}
        </p>
        <Button 
          variant="outline" 
          onClick={() => setAddModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Lead Manually
        </Button>
      </div>

      <AddLeadModal 
        open={addModalOpen} 
        onOpenChange={setAddModalOpen}
        onLeadCreated={() => {}}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Map Section */}
        <Card className="shadow-elegant border-border/50 overflow-hidden hover-lift">
          <CardHeader className="bg-accent/5">
            <CardTitle className="font-display text-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/50">
                <MapPin className="h-5 w-5 text-accent-foreground" />
              </div>
              {t('search.locationPicker')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <GoogleMapPicker onLocationChange={handleLocationChange} onRadiusChange={handleRadiusChange} initialLat={formData.lat} initialLng={formData.lng} initialRadius={formData.radiusKm} defaultCountry={formData.country} />
          </CardContent>
        </Card>

        {/* Basic Info Section */}
        <Card className="shadow-elegant border-border/50 hover-lift">
          <CardHeader className="bg-primary/5">
            <CardTitle className="font-display text-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/50">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              {t('search.basicInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Niche */}
              <div className="space-y-3">
                <Label htmlFor="niche" className="text-sm font-semibold flex items-center gap-2">
                  {t('search.niche')}
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>
                </Label>
                <Select value={formData.niche} onValueChange={value => setFormData({
                ...formData,
                niche: value
              })}>
                  <SelectTrigger className="h-12 bg-background border-border/50 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder={t('search.selectNiche')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[350px] bg-card border-border/50">
                    {niches.map((niche) => <SelectItem key={niche.id} value={niche.id} className="cursor-pointer hover:bg-accent/50">
                        {getNicheDisplay(niche)}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Niche */}
              <div className="space-y-3">
                <Label htmlFor="customNiche" className="text-sm font-semibold">
                  {t('search.customNiche')}
                </Label>
                <Input id="customNiche" value={formData.customNiche} onChange={e => setFormData({
                ...formData,
                customNiche: e.target.value
              })} placeholder={t('search.customNichePlaceholder')} className="h-12 border-border/50 hover:border-primary/50 transition-colors" />
              </div>

              {/* Country */}
              <div className="space-y-3">
                <Label htmlFor="country" className="text-sm font-semibold flex items-center gap-2">
                  <Globe2 className="h-4 w-4" />
                  {t('search.country')}
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>
                </Label>
                <CountrySelect 
                  value={formData.country}
                  onValueChange={value => setFormData({
                    ...formData,
                    country: value,
                    city: ''
                  })}
                  className="h-12 bg-background border-border/50 hover:border-primary/50 transition-colors"
                />
              </div>

              {/* City */}
              <div className="space-y-3">
                <Label htmlFor="city" className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('search.city')}
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>
                </Label>
                <Select value={formData.city} onValueChange={value => setFormData({
                ...formData,
                city: value
              })} disabled={!formData.country}>
                  <SelectTrigger className="h-12 bg-background border-border/50 hover:border-primary/50 transition-colors disabled:opacity-50">
                    <SelectValue placeholder={t('search.selectCity')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[350px] bg-card border-border/50">
                    {cities.map(city => <SelectItem key={city} value={city} className="cursor-pointer hover:bg-accent/50">
                        {city}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Results */}
              <div className="space-y-3">
                <Label htmlFor="maxResults" className="text-sm font-semibold">
                  عدد النتائج المطلوبة
                </Label>
                <Input 
                  id="maxResults" 
                  type="number" 
                  min="1"
                  max="50"
                  value={formData.maxResults} 
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (value > 50) {
                      setFormData({ ...formData, maxResults: '50' });
                    } else if (value < 1) {
                      setFormData({ ...formData, maxResults: '1' });
                    } else {
                      setFormData({ ...formData, maxResults: e.target.value });
                    }
                  }}
                  placeholder="20" 
                  className="h-12 border-border/50 hover:border-primary/50 transition-colors" 
                />
                <p className="text-xs text-muted-foreground">الحد الأقصى: 50 نتيجة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters Toggle */}
        <Button type="button" variant="outline" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full h-14 group border-2 border-dashed hover:border-primary transition-all duration-300">
          <Filter className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12" />
          {showAdvanced ? t('common.hideAdvanced') : t('search.advancedFilters')}
          {activeFiltersCount > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{activeFiltersCount}</Badge>}
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && <Card className="shadow-elegant border-border/50 hover-lift animate-fade-in">
            <CardHeader className="bg-accent/5">
              <CardTitle className="font-display text-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/50">
                  <Star className="h-5 w-5 text-accent-foreground" />
                </div>
                {t('search.advancedFilters')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Keyword */}
                <div className="space-y-3">
                  <Label htmlFor="keyword" className="text-sm font-semibold">
                    {t('search.keyword')}
                  </Label>
                  <Input id="keyword" value={formData.keyword} onChange={e => setFormData({
                ...formData,
                keyword: e.target.value
              })} placeholder={t('search.keywordPlaceholder')} className="h-12 border-border/50 hover:border-primary/50 transition-colors" />
                </div>

                {/* Min Rating */}
                <div className="space-y-3">
                  <Label htmlFor="minRating" className="text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    {t('search.minRating')}
                  </Label>
                <Select value={formData.minRating} onValueChange={value => setFormData({
                ...formData,
                minRating: value
              })}>
                    <SelectTrigger className="h-12 bg-background border-border/50 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder={t('search.anyRating')} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      <SelectItem value="none" className="cursor-pointer hover:bg-accent/50">{t('search.anyRating')}</SelectItem>
                      {[
                        { display: '+2', value: '2' },
                        { display: '+2.5', value: '2.5' },
                        { display: '+3', value: '3' },
                        { display: '+3.5', value: '3.5' },
                        { display: '+4', value: '4' },
                        { display: '+4.5', value: '4.5' }
                      ].map(rating => <SelectItem key={rating.value} value={rating.value} className="cursor-pointer hover:bg-accent/50">
                          {rating.display}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Has Website */}
                <div className="space-y-3">
                  <Label htmlFor="hasWebsite" className="text-sm font-semibold">
                    {t('search.hasWebsite')}
                  </Label>
                <Select value={formData.hasWebsite} onValueChange={value => setFormData({
                ...formData,
                hasWebsite: value
              })}>
                    <SelectTrigger className="h-12 bg-background border-border/50 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder={t('search.doesNotMatter')} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      <SelectItem value="none" className="cursor-pointer hover:bg-accent/50">{t('search.doesNotMatter')}</SelectItem>
                      <SelectItem value="with" className="cursor-pointer hover:bg-accent/50">{t('search.hasWebsiteYes')}</SelectItem>
                      <SelectItem value="without" className="cursor-pointer hover:bg-accent/50">{t('search.hasWebsiteNo')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Reviews */}
                <div className="space-y-3">
                  <Label htmlFor="minReviews" className="text-sm font-semibold">
                    {t('search.minReviews')}
                  </Label>
                  <Input id="minReviews" type="number" value={formData.minReviews} onChange={e => setFormData({
                ...formData,
                minReviews: e.target.value
              })} placeholder="0" className="h-12 border-border/50 hover:border-primary/50 transition-colors" />
                </div>

                {/* Include Social Media */}
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="includeSocialMedia" className="text-sm font-semibold">
                    {t('search.includeSocialMedia')}
                  </Label>
                  <Select value={formData.includeSocialMedia} onValueChange={value => setFormData({
                ...formData,
                includeSocialMedia: value
              })}>
                    <SelectTrigger className="h-12 bg-background border-border/50 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder={t('search.doesNotMatter')} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      <SelectItem value="none" className="cursor-pointer hover:bg-accent/50">{t('search.doesNotMatter')}</SelectItem>
                      <SelectItem value="yes" className="cursor-pointer hover:bg-accent/50">{t('common.yes')}</SelectItem>
                      <SelectItem value="no" className="cursor-pointer hover:bg-accent/50">{t('common.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>}

        {/* Submit Button */}
        <Button 
          type="submit" 
          size="lg" 
          disabled={isSubmitting}
          className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:shadow-elegant transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
          {isSubmitting ? 'جاري الإرسال...' : t('search.searchLeads')}
        </Button>
      </form>
    </div>;
}