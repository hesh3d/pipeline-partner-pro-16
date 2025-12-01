import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/contexts/I18nContext';
import { ArrowLeft, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 animate-blur-in">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-display font-bold">{lead.name}</h1>
          <p className="text-muted-foreground">
            {lead.niche} • {lead.city}, {lead.country}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Lead Information</CardTitle>
              {!lead.has_website && (
                <Badge className="bg-gradient-primary">{t('leads.noWebsite')}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-medium flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  {lead.rating?.toFixed(1) || 'N/A'} ({lead.reviews} reviews)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{lead.phone || lead.email || 'N/A'}</p>
              </div>
            </div>

            {lead.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{lead.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">{t('leads.pipelineStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="secondary">{lead.work_status}</Badge>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>{t('leads.proposalSent')}</span>
                <span>{lead.proposal_sent ? '✓' : '✗'}</span>
              </p>
              <p className="flex justify-between">
                <span>{t('leads.websiteCompleted')}</span>
                <span>{lead.website_completed ? '✓' : '✗'}</span>
              </p>
              <p className="flex justify-between">
                <span>{t('leads.closedWon')}</span>
                <span>{lead.closed_won ? '✓' : '✗'}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Pitch */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display">{t('leads.notes')}</CardTitle>
            <Button size="sm" className="bg-gradient-primary hover:opacity-90">
              <Zap className="h-4 w-4 mr-2" />
              {t('leads.generatePitch')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about this lead..."
            value={lead.notes || ''}
            rows={6}
            className="resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}