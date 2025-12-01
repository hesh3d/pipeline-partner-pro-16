import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/contexts/I18nContext';
import { Settings as SettingsIcon, Save, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const currencies = ['USD', 'EUR', 'GBP', 'SAR', 'AE D', 'KWD', 'QAR'];
const countries = ['US', 'GB', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM'];

export default function Settings() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(false);

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

  const [formData, setFormData] = useState({
    default_country: 'US',
    currency: 'USD',
    weekly_emails: true,
    density: 'comfortable',
    close_rate_percent: 10,
    avg_project_value: 2000,
    webhook_url: '',
    api_secret_key: '',
    demo_data: true,
  });
  
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        default_country: settings.default_country || 'US',
        currency: settings.currency || 'USD',
        weekly_emails: settings.weekly_emails ?? true,
        density: settings.density || 'comfortable',
        close_rate_percent: settings.close_rate_percent || 10,
        avg_project_value: settings.avg_project_value || 2000,
        webhook_url: settings.webhook_url || '',
        api_secret_key: settings.api_secret_key || '',
        demo_data: settings.demo_data ?? true,
      });
    }
  }, [settings]);

  const validateGoogleMapsKey = async () => {
    if (!formData.api_secret_key) {
      toast({
        title: 'Error',
        description: 'Please enter an API key first',
        variant: 'destructive',
      });
      return;
    }

    setValidatingKey(true);
    setKeyValidationResult(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=25.276987,55.296249&key=${formData.api_secret_key}`
      );
      const data = await response.json();

      if (data.status === 'OK') {
        setKeyValidationResult('success');
        toast({
          title: 'Success',
          description: 'Google Maps API key is valid!',
        });
      } else {
        setKeyValidationResult('error');
        toast({
          title: 'Error',
          description: `API key validation failed: ${data.error_message || data.status}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setKeyValidationResult('error');
      toast({
        title: 'Error',
        description: 'Failed to validate API key',
        variant: 'destructive',
      });
    } finally {
      setValidatingKey(false);
    }
  };

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  const updateSettings = useMutation({
    mutationFn: async (data: any) => {
      if (settings) {
        const { error } = await supabase
          .from('user_settings')
          .update(data)
          .eq('user_id', user?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .insert({ ...data, user_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-blur-in">
        <h1 className="text-4xl font-display font-bold mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Preferences */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            {t('settings.preferences')}
          </CardTitle>
          <CardDescription>Configure your default settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('settings.defaultCountry')}</Label>
              <Select
                value={formData.default_country}
                onValueChange={(value) => setFormData({ ...formData, default_country: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.currency')}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.darkMode')}</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.weeklyEmails')}</Label>
              <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
            </div>
            <Switch
              checked={formData.weekly_emails}
              onCheckedChange={(checked) => setFormData({ ...formData, weekly_emails: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Demo Mode</Label>
              <p className="text-sm text-muted-foreground">
                Generate mock results instantly without webhook configuration
              </p>
            </div>
            <Switch
              checked={formData.demo_data}
              onCheckedChange={(checked) => setFormData({ ...formData, demo_data: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Assumptions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">{t('settings.revenue')}</CardTitle>
          <CardDescription>Used to calculate Leads Worth metric</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('dashboard.closeRate')} (%)</Label>
            <Input
              type="number"
              value={formData.close_rate_percent}
              onChange={(e) =>
                setFormData({ ...formData, close_rate_percent: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('dashboard.avgProjectValue')}</Label>
            <Input
              type="number"
              value={formData.avg_project_value}
              onChange={(e) =>
                setFormData({ ...formData, avg_project_value: parseFloat(e.target.value) })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="shadow-card border-primary/20">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Google Maps & Places API
          </CardTitle>
          <CardDescription>
            Configure your Google Maps API key for location search features.
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-primary hover:underline mt-1"
            >
              Get your API key from Google Cloud Console →
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={formData.api_secret_key}
              onChange={(e) => setFormData({ ...formData, api_secret_key: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Required APIs: Maps JavaScript API, Places API, Geocoding API
            </p>
          </div>
          <Button
            variant="outline"
            onClick={validateGoogleMapsKey}
            disabled={validatingKey || !formData.api_secret_key}
            className="w-full"
          >
            {validatingKey ? 'Validating...' : 'Validate Key'}
            {keyValidationResult === 'success' && ' ✓'}
            {keyValidationResult === 'error' && ' ✗'}
          </Button>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">{t('settings.webhooks')}</CardTitle>
          <CardDescription>Configure webhook for n8n, Make, or Zapier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.webhookUrl')}</Label>
            <Input
              placeholder="https://..."
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="w-full bg-gradient-primary hover:opacity-90"
        disabled={updateSettings.isPending}
      >
        <Save className="h-4 w-4 mr-2" />
        {updateSettings.isPending ? t('common.loading') : t('common.save')}
      </Button>
    </div>
  );
}