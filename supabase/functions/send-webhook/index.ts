import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  country: string;
  region: string;
  city: string;
  minimumRating: string;
  websiteStatus: string;
  minReviews?: number;
  includeSocialMedia?: boolean;
  maxResults?: number;
}

// Convert form values to webhook tokens
function convertMinimumRating(rating: string): string {
  if (!rating || rating === "none") return "";
  const ratingMap: Record<string, string> = {
    "2": "two",
    "2.5": "twoAndHalf",
    "3": "three",
    "3.5": "threeAndHalf",
    "4": "four",
    "4.5": "fourAndHalf",
  };
  return ratingMap[rating] || "";
}

function convertWebsiteStatus(status: string): string {
  if (!status || status === "none" || status === "allPlaces") return "allPlaces";
  return status === "with" ? "withWebsite" : "withoutWebsite";
}

// Retry logic with very long waiting - keep trying for several minutes
async function sendWithRetry(
  url: string,
  payload: WebhookPayload,
  maxAttempts = 60
): Promise<{ success: boolean; statusCode?: number; responseBody?: string; attempts: number }> {
  // Progressive delays up to 15 seconds (in ms)
  const delays = [2000, 3000, 5000, 8000, 10000, 15000]; // will repeat last delay
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`Webhook attempt ${attempt + 1} of ${maxAttempts}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.text();
      
      console.log(`Webhook response: ${response.status} - ${responseBody}`);

      // Success on 2xx
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          statusCode: response.status,
          responseBody,
          attempts: attempt + 1,
        };
      }

      // Keep retrying even on 4xx errors - webhook might be starting up
      if (attempt < maxAttempts - 1) {
        const delayIndex = Math.min(attempt, delays.length - 1);
        await new Promise(resolve => setTimeout(resolve, delays[delayIndex]));
      }
    } catch (error) {
      console.error(`Webhook attempt ${attempt + 1} failed:`, error);
      
      // Keep retrying on network errors
      if (attempt < maxAttempts - 1) {
        const delayIndex = Math.min(attempt, delays.length - 1);
        await new Promise(resolve => setTimeout(resolve, delays[delayIndex]));
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          success: false,
          responseBody: errorMessage,
          attempts: attempt + 1,
        };
      }
    }
  }

  return {
    success: false,
    responseBody: "Max retries exceeded",
    attempts: maxAttempts,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    // Parse request body
    const { niche, country, city, minRating, hasWebsite, minReviews, includeSocialMedia, maxResults, webhookUrl } = await req.json();

    // Validate required fields
    if (!country || !city || !niche) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: country, city, niche' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build webhook payload with exact token mapping
    const payload: any = {
      country,
      region: niche,
      city,
      minimumRating: convertMinimumRating(minRating || ""),
      websiteStatus: convertWebsiteStatus(hasWebsite || ""),
    };

    // Add minReviews if provided
    if (minReviews && minReviews.trim() !== '') {
      payload.minReviews = parseInt(minReviews) || 0;
    }

    // Add includeSocialMedia if provided
    if (includeSocialMedia !== undefined) {
      payload.includeSocialMedia = includeSocialMedia;
    }

    // Add maxResults if provided
    if (maxResults !== undefined && maxResults > 0) {
      payload.maxResults = parseInt(maxResults) || 20;
    }

    const targetUrl = webhookUrl || 'https://n8n.srv951959.hstgr.cloud/webhook/map-pro';

    console.log('Sending webhook:', JSON.stringify(payload, null, 2));

    // Send webhook with retry logic
    const result = await sendWithRetry(targetUrl, payload);

    // Parse webhook response
    let webhookData = [];
    if (result.success && result.responseBody) {
      try {
        webhookData = JSON.parse(result.responseBody);
      } catch (e) {
        console.error('Failed to parse webhook response:', e);
      }
    }

    // Log to database
    const logData = {
      user_id: user.id,
      payload: payload,
      webhook_url: targetUrl,
      status: result.success ? 'success' : (result.attempts >= 3 ? 'failed' : 'queued'),
      attempts: result.attempts,
      last_attempt_at: new Date().toISOString(),
      response_code: result.statusCode,
      response_body: result.responseBody,
    };

    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert(logData);

    if (logError) {
      console.error('Failed to log webhook attempt:', logError);
    }

    // If successful, save leads to database
    let savedCount = 0;
    if (result.success && webhookData && Array.isArray(webhookData)) {
      // Generate unique campaign ID for this search
      const campaignId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Transform and save each lead
      const leadsToInsert = webhookData.map((item: any) => ({
        user_id: user.id,
        name: item.title || 'N/A',
        niche: niche,
        city: item.city || city,
        country: item.countryCode || country,
        rating: item.totalScore || null,
        reviews: item.reviewsCount || 0,
        phone: item.phoneUnformatted || null,
        email: (item.emails && item.emails[0]) || null,
        additional_emails: (item.emails && item.emails.length > 1) ? item.emails.slice(1) : null,
        website: item.website || null,
        has_website: item.website ? true : false,
        instagram: (item.instagrams && item.instagrams.length > 0) ? item.instagrams : null,
        facebook: (item.facebooks && item.facebooks.length > 0) ? item.facebooks : null,
        twitter: (item.twitters && item.twitters.length > 0) ? item.twitters : null,
        youtube: (item.youtubes && item.youtubes.length > 0) ? item.youtubes : null,
        tiktok: (item.tiktoks && item.tiktoks.length > 0) ? item.tiktoks : null,
        linkedin: (item.linkedins && item.linkedins.length > 0) ? item.linkedins : null,
        address: `${item.city || city}, ${item.state || ''}, ${item.countryCode || country}`,
        maps_url: item.url || null,
        image_url: item.imageUrl || null,
        last_review_date: item['reviews[0].publishAt'] || null,
        campaign: campaignId,
        source: 'webhook-search',
      }));

      if (leadsToInsert.length > 0) {
        const { data: insertedLeads, error: insertError } = await supabase
          .from('leads')
          .insert(leadsToInsert)
          .select();

        if (insertError) {
          console.error('Failed to save leads:', insertError);
        } else {
          savedCount = insertedLeads?.length || 0;
          console.log(`Saved ${savedCount} leads with campaign ID: ${campaignId}`);
        }
      }
    }

    // Return response
    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `تم حفظ ${savedCount} نتيجة بنجاح في قائمة العملاء`,
          attempts: result.attempts,
          savedCount,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorMessage = result.statusCode && result.statusCode >= 400 && result.statusCode < 500
        ? 'خطأ في البيانات المرسلة. يرجى المحاولة مرة أخرى.'
        : 'واجهنا مشكلة مؤقتة في الإرسال. سنحاول مرة أخرى.';

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: result.responseBody,
          attempts: result.attempts 
        }),
        { status: result.statusCode || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.',
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});