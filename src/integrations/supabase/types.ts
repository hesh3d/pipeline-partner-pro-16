export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          lead_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          lead_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          lead_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          additional_emails: string[] | null
          address: string | null
          ai_pitch: string | null
          campaign: string | null
          city: string
          closed_won: boolean | null
          country: string
          created_at: string
          custom_niche: string | null
          deal_price: number | null
          deleted_at: string | null
          email: string | null
          facebook: string[] | null
          first_meeting_date: string | null
          has_booking: boolean | null
          has_website: boolean | null
          hours: Json | null
          id: string
          image_url: string | null
          instagram: string[] | null
          is_saved: boolean | null
          keyword: string | null
          last_review_date: string | null
          lat: number | null
          linkedin: string[] | null
          lng: number | null
          maps_url: string | null
          name: string
          niche: string
          notes: string | null
          open_now: boolean | null
          phone: string | null
          pitch_locale: string | null
          price_range: string | null
          proposal_sent: boolean | null
          radius_km: number | null
          rating: number | null
          reviews: number | null
          source: string | null
          tiktok: string[] | null
          twitter: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          website_completed: boolean | null
          whatsapp: string | null
          work_status: string | null
          youtube: string[] | null
        }
        Insert: {
          additional_emails?: string[] | null
          address?: string | null
          ai_pitch?: string | null
          campaign?: string | null
          city: string
          closed_won?: boolean | null
          country: string
          created_at?: string
          custom_niche?: string | null
          deal_price?: number | null
          deleted_at?: string | null
          email?: string | null
          facebook?: string[] | null
          first_meeting_date?: string | null
          has_booking?: boolean | null
          has_website?: boolean | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          instagram?: string[] | null
          is_saved?: boolean | null
          keyword?: string | null
          last_review_date?: string | null
          lat?: number | null
          linkedin?: string[] | null
          lng?: number | null
          maps_url?: string | null
          name: string
          niche: string
          notes?: string | null
          open_now?: boolean | null
          phone?: string | null
          pitch_locale?: string | null
          price_range?: string | null
          proposal_sent?: boolean | null
          radius_km?: number | null
          rating?: number | null
          reviews?: number | null
          source?: string | null
          tiktok?: string[] | null
          twitter?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          website_completed?: boolean | null
          whatsapp?: string | null
          work_status?: string | null
          youtube?: string[] | null
        }
        Update: {
          additional_emails?: string[] | null
          address?: string | null
          ai_pitch?: string | null
          campaign?: string | null
          city?: string
          closed_won?: boolean | null
          country?: string
          created_at?: string
          custom_niche?: string | null
          deal_price?: number | null
          deleted_at?: string | null
          email?: string | null
          facebook?: string[] | null
          first_meeting_date?: string | null
          has_booking?: boolean | null
          has_website?: boolean | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          instagram?: string[] | null
          is_saved?: boolean | null
          keyword?: string | null
          last_review_date?: string | null
          lat?: number | null
          linkedin?: string[] | null
          lng?: number | null
          maps_url?: string | null
          name?: string
          niche?: string
          notes?: string | null
          open_now?: boolean | null
          phone?: string | null
          pitch_locale?: string | null
          price_range?: string | null
          proposal_sent?: boolean | null
          radius_km?: number | null
          rating?: number | null
          reviews?: number | null
          source?: string | null
          tiktok?: string[] | null
          twitter?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          website_completed?: boolean | null
          whatsapp?: string | null
          work_status?: string | null
          youtube?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency_name: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          agency_name?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          agency_name?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          keyword: string | null
          niche: string
          results_count: number | null
          user_id: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          keyword?: string | null
          niche: string
          results_count?: number | null
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          keyword?: string | null
          niche?: string
          results_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          api_secret_key: string | null
          avg_project_value: number | null
          close_rate_percent: number | null
          created_at: string
          currency: string | null
          dark_mode: boolean | null
          default_country: string | null
          demo_data: boolean | null
          density: string | null
          id: string
          locale: string | null
          numerals_policy: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
          weekly_emails: boolean | null
        }
        Insert: {
          api_secret_key?: string | null
          avg_project_value?: number | null
          close_rate_percent?: number | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          default_country?: string | null
          demo_data?: boolean | null
          density?: string | null
          id?: string
          locale?: string | null
          numerals_policy?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
          weekly_emails?: boolean | null
        }
        Update: {
          api_secret_key?: string | null
          avg_project_value?: number | null
          close_rate_percent?: number | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          default_country?: string | null
          demo_data?: boolean | null
          density?: string | null
          id?: string
          locale?: string | null
          numerals_policy?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
          weekly_emails?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_attempt_at: string | null
          payload: Json
          response_body: string | null
          response_code: number | null
          status: string
          updated_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          payload: Json
          response_body?: string | null
          response_code?: number | null
          status: string
          updated_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          payload?: Json
          response_body?: string | null
          response_code?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
      webhook_result_telemetry: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
