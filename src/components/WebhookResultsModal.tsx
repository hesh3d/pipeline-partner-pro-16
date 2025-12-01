import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/contexts/I18nContext';
import { 
  Copy, 
  ExternalLink, 
  Download, 
  Star, 
  Phone, 
  Globe, 
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  Mail,
  Calendar
} from 'lucide-react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface WebhookResult {
  businessName: string;
  category: string;
  rating: number | null;
  phone: string | null;
  socials: string[];
  website: string | null;
  city: string;
  region: string;
  country: string;
  address: string | null;
  imageUrl?: string | null;
  mapsUrl?: string | null;
  reviewsCount?: number | null;
  lastReviewDate?: string | null;
  email?: string | null;
  rawPayload: any;
}

interface WebhookResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  results?: WebhookResult[];
  error?: string | null;
  searchParams?: {
    niche: string;
    country: string;
    city: string;
  };
  onRetry?: () => void;
}

export default function WebhookResultsModal({
  open,
  onOpenChange,
  isLoading = false,
  results = [],
  error = null,
  searchParams,
  onRetry
}: WebhookResultsModalProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  // Normalize rating to token
  const normalizeRating = (rating: number | null): string => {
    if (!rating) return '';
    if (rating >= 4.5) return 'fourAndHalf';
    if (rating >= 4) return 'four';
    if (rating >= 3.5) return 'threeAndHalf';
    if (rating >= 3) return 'three';
    if (rating >= 2.5) return 'twoAndHalf';
    if (rating >= 2) return 'two';
    return '';
  };

  // Normalize website status
  const normalizeWebsiteStatus = (website: string | null): 'withWebsite' | 'withoutWebsite' => {
    return website && website.trim() !== '' ? 'withWebsite' : 'withoutWebsite';
  };

  // Copy JSON to clipboard
  const handleCopyJSON = async (data: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast({
        title: locale === 'ar' ? 'تم النسخ' : 'Copied',
        description: locale === 'ar' ? 'تم نسخ البيانات بنجاح' : 'Data copied successfully',
      });

      // Log telemetry
      await logTelemetry('copy_json', { result: data.businessName });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل النسخ' : 'Failed to copy',
      });
    }
  };

  // Export all results as JSON
  const handleExportAll = async () => {
    try {
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `webhook-results-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: locale === 'ar' ? 'تم التصدير' : 'Exported',
        description: locale === 'ar' ? 'تم تصدير النتائج بنجاح' : 'Results exported successfully',
      });

      // Log telemetry
      await logTelemetry('export_all', { count: results.length });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل التصدير' : 'Failed to export',
      });
    }
  };

  // Bookmark result
  const handleBookmark = async (result: WebhookResult) => {
    try {
      // Log telemetry
      await logTelemetry('bookmark', { result: result.businessName });
      
      toast({
        title: locale === 'ar' ? 'تمت الإضافة للمفضلة' : 'Bookmarked',
        description: locale === 'ar' ? 'تمت إضافة النتيجة للمفضلة' : 'Result added to bookmarks',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشلت الإضافة' : 'Failed to bookmark',
      });
    }
  };

  // Get social media icon
  const getSocialIcon = (url: string) => {
    if (url.includes('facebook.com')) return Facebook;
    if (url.includes('instagram.com')) return Instagram;
    if (url.includes('twitter.com') || url.includes('x.com')) return Twitter;
    if (url.includes('linkedin.com')) return Linkedin;
    if (url.includes('youtube.com')) return Youtube;
    return Globe;
  };

  // Log telemetry to Lovable Cloud
  const logTelemetry = async (action: string, metadata: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('webhook_result_telemetry').insert({
        user_id: user.id,
        action,
        metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log telemetry:', error);
    }
  };

  // Render star rating
  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground text-sm">N/A</span>;
    
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < fullStars
                ? 'fill-warning text-warning'
                : i === fullStars && hasHalf
                ? 'fill-warning/50 text-warning'
                : 'text-muted'
            )}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-display">
                {locale === 'ar' ? 'نتائج البحث' : 'Search Results'}
                {!isLoading && results.length > 0 && (
                  <Badge variant="secondary" className="ml-3">
                    {results.length} {locale === 'ar' ? 'نتيجة' : 'results'}
                  </Badge>
                )}
              </DialogTitle>
              {searchParams && (
                <DialogDescription className="text-sm">
                  {searchParams.niche} • {searchParams.city}, {searchParams.country}
                </DialogDescription>
              )}
            </div>
            {!isLoading && results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {locale === 'ar' ? 'تصدير الكل' : 'Export All'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium mb-2">
                {locale === 'ar' ? 'جاري استلام النتائج…' : 'Receiving results…'}
              </p>
              <p className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'قد تستغرق العملية عدة دقائق. الرجاء الانتظار…' : 'This may take several minutes. Please wait…'}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-lg font-medium mb-2">
                {locale === 'ar' ? 'حدث خطأ مؤقت' : 'A temporary error occurred'}
              </p>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                {error}
              </p>
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </Button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="rounded-full bg-muted/50 p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">
                {locale === 'ar' ? 'لا نتائج' : 'No results'}
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {locale === 'ar'
                  ? 'لا نتائج. حاول توسيع نطاق البحث أو تأكد من المدخلات.'
                  : 'No results found. Try expanding your search criteria.'}
              </p>
            </div>
          )}

          {/* Results Table */}
          {!isLoading && !error && results.length > 0 && (
            <ScrollArea className="h-[calc(90vh-180px)]">
              <div className="px-6 py-4">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="border rounded-lg hover:border-primary/50 transition-all duration-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                          {/* Business Info */}
                          <div className="col-span-4 min-w-0 flex items-center gap-3">
                            {result.imageUrl && (
                              <a
                                href={result.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                              >
                                <img 
                                  src={result.imageUrl} 
                                  alt={result.businessName}
                                  className="w-12 h-12 rounded-lg object-cover hover:opacity-80 transition-opacity cursor-pointer"
                                />
                              </a>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{result.businessName}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {result.category}
                              </p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="col-span-2">
                            <div className="space-y-0.5">
                              {renderStars(result.rating)}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {result.reviewsCount && (
                                  <span>
                                    {result.reviewsCount} {locale === 'ar' ? 'تقييم' : 'reviews'}
                                  </span>
                                )}
                                {result.lastReviewDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(result.lastReviewDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contact */}
                          <div className="col-span-3 space-y-1">
                            {result.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a 
                                  href={`tel:${result.phone}`}
                                  className="truncate hover:text-primary transition-colors"
                                >
                                  {result.phone}
                                </a>
                              </div>
                            )}
                            {result.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <a 
                                  href={`mailto:${result.email}`}
                                  className="truncate hover:text-primary transition-colors"
                                >
                                  {result.email}
                                </a>
                              </div>
                            )}
                            {result.socials.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {result.socials.slice(0, 3).map((social, i) => {
                                  const SocialIcon = getSocialIcon(social);
                                  return (
                                    <a
                                      key={i}
                                      href={social}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                                      title={social}
                                    >
                                      <SocialIcon className="h-3 w-3" />
                                    </a>
                                  );
                                })}
                                {result.socials.length > 3 && (
                                  <Badge variant="secondary" className="text-[10px] px-1">
                                    +{result.socials.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Website Status */}
                          <div className="col-span-2">
                            {result.website ? (
                              <a
                                href={result.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Badge
                                  variant="default"
                                  className="text-xs cursor-pointer hover:bg-primary/80 transition-colors"
                                >
                                  <Globe className="h-3 w-3 mr-1" />
                                  {locale === 'ar' ? 'لديه موقع' : 'Has Website'}
                                </Badge>
                              </a>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {locale === 'ar' ? 'بدون موقع' : 'No Website'}
                              </Badge>
                            )}
                          </div>

                          {/* Location Arrow */}
                          <div className="col-span-1 flex justify-end">
                            {result.mapsUrl && (
                              <a
                                href={result.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                                title={locale === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyJSON(result)}
                            title={locale === 'ar' ? 'نسخ البيانات' : 'Copy data'}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(result)}
                            title={locale === 'ar' ? 'حفظ' : 'Bookmark'}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
