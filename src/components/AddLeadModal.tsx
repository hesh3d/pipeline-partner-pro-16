import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/contexts/I18nContext';
import { useNiches } from '@/hooks/useNiches';
import CountrySelect from '@/components/CountrySelect';
import { useCities } from '@/hooks/useCities';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Save, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated?: () => void;
}

export default function AddLeadModal({ open, onOpenChange, onLeadCreated }: AddLeadModalProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { niches, getNicheDisplay, addCustomNiche } = useNiches();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    customNiche: '',
    country: '',
    city: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    website: '',
    hasWebsite: false,
    rating: '',
    reviews: '',
    workStatus: 'new',
    source: '',
    campaign: '',
    notes: '',
    dealPrice: '',
    lat: null as number | null,
    lng: null as number | null,
  });

  const { cities } = useCities(formData.country);

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

  const handleSave = async (andOpen = false) => {
    if (!formData.name || !formData.niche || !formData.country || !formData.city) {
      toast({
        title: t('common.error'),
        description: 'Please fill required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Save custom niche if provided
      if (formData.customNiche) {
        addCustomNiche(formData.customNiche);
      }

      const selectedNiche = niches.find((n) => n.id === formData.niche);
      const nicheValue = formData.customNiche || getNicheDisplay(selectedNiche!);

      const leadData = {
        user_id: user?.id,
        name: formData.name,
        niche: nicheValue,
        custom_niche: formData.customNiche || null,
        country: formData.country,
        city: formData.city,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        instagram: formData.instagram ? [formData.instagram] : null,
        website: formData.website || null,
        has_website: formData.hasWebsite,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        reviews: formData.reviews ? parseInt(formData.reviews) : null,
        work_status: formData.workStatus,
        source: formData.source || null,
        campaign: formData.campaign || null,
        notes: formData.notes || null,
        deal_price: formData.dealPrice ? parseFloat(formData.dealPrice) : null,
        lat: formData.lat,
        lng: formData.lng,
      };

      const { data, error } = await supabase.from('leads').insert(leadData).select().single();

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Lead created successfully',
      });

      onLeadCreated?.();
      onOpenChange(false);

      // Reset form
      setFormData({
        name: '',
        niche: '',
        customNiche: '',
        country: '',
        city: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        website: '',
        hasWebsite: false,
        rating: '',
        reviews: '',
        workStatus: 'new',
        source: '',
        campaign: '',
        notes: '',
        dealPrice: '',
        lat: null,
        lng: null,
      });

      if (andOpen && data) {
        navigate(`/lead/${data.id}`);
      }
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to create lead',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">+ Add Lead</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Niche *</Label>
              <Select value={formData.niche} onValueChange={(value) => setFormData({ ...formData, niche: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select niche" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {niches.map((niche) => (
                    <SelectItem key={niche.id} value={niche.id}>
                      {getNicheDisplay(niche)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customNiche">Custom Niche</Label>
              <Input
                id="customNiche"
                value={formData.customNiche}
                onChange={(e) => setFormData({ ...formData, customNiche: e.target.value })}
                placeholder="Enter custom niche"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <CountrySelect
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value, city: '' })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Website Toggle */}
          <div className="flex items-center justify-between">
            <Label>Has Website</Label>
            <Switch checked={formData.hasWebsite} onCheckedChange={(checked) => setFormData({ ...formData, hasWebsite: checked })} />
          </div>

          {/* Rating & Reviews */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                placeholder="4.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviews">Reviews</Label>
              <Input
                id="reviews"
                type="number"
                value={formData.reviews}
                onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                placeholder="120"
              />
            </div>
          </div>

          {/* Pipeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workStatus">Stage</Label>
              <Select value={formData.workStatus} onValueChange={(value) => setFormData({ ...formData, workStatus: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealPrice">Deal Price ({settings?.currency || 'USD'})</Label>
              <Input
                id="dealPrice"
                type="number"
                value={formData.dealPrice}
                onChange={(e) => setFormData({ ...formData, dealPrice: e.target.value })}
                placeholder="2000"
              />
            </div>
          </div>

          {/* Source & Campaign */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Google Maps, Manual, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign</Label>
              <Input
                id="campaign"
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                placeholder="Q1 2025"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Lead
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving} className="bg-gradient-primary">
            <ExternalLink className="h-4 w-4 mr-2" />
            Save & Open Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
