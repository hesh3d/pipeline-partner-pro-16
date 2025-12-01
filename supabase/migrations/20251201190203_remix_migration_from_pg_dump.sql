CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    activity_type text NOT NULL,
    description text NOT NULL,
    lead_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    niche text NOT NULL,
    country text NOT NULL,
    city text NOT NULL,
    keyword text,
    rating numeric,
    reviews integer DEFAULT 0,
    has_website boolean DEFAULT false,
    phone text,
    email text,
    whatsapp text,
    instagram text[],
    has_booking boolean DEFAULT false,
    price_range text,
    open_now boolean,
    hours jsonb,
    address text,
    maps_url text,
    work_status text DEFAULT 'new'::text,
    proposal_sent boolean DEFAULT false,
    website_completed boolean DEFAULT false,
    closed_won boolean DEFAULT false,
    first_meeting_date date,
    deal_price numeric,
    source text,
    campaign text,
    notes text,
    ai_pitch text,
    pitch_locale text DEFAULT 'en'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lat numeric,
    lng numeric,
    radius_km numeric DEFAULT 5,
    custom_niche text,
    website text,
    image_url text,
    last_review_date text,
    is_saved boolean DEFAULT false,
    deleted_at timestamp with time zone,
    facebook text[],
    twitter text[],
    youtube text[],
    tiktok text[],
    linkedin text[],
    additional_emails text[]
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    full_name text,
    agency_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: search_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    niche text NOT NULL,
    country text NOT NULL,
    city text NOT NULL,
    keyword text,
    results_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_settings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    default_country text DEFAULT 'US'::text,
    currency text DEFAULT 'USD'::text,
    dark_mode boolean DEFAULT false,
    weekly_emails boolean DEFAULT true,
    density text DEFAULT 'comfortable'::text,
    close_rate_percent numeric DEFAULT 10.0,
    avg_project_value numeric DEFAULT 2000.0,
    webhook_url text,
    api_secret_key text,
    locale text DEFAULT 'en'::text,
    numerals_policy text DEFAULT 'latin'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    demo_data boolean DEFAULT true
);


--
-- Name: webhook_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    payload jsonb NOT NULL,
    webhook_url text NOT NULL,
    status text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    last_attempt_at timestamp with time zone,
    response_code integer,
    response_body text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: webhook_result_telemetry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_result_telemetry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    action text NOT NULL,
    metadata jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);


--
-- Name: webhook_logs webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_logs
    ADD CONSTRAINT webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: webhook_result_telemetry webhook_result_telemetry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_result_telemetry
    ADD CONSTRAINT webhook_result_telemetry_pkey PRIMARY KEY (id);


--
-- Name: idx_leads_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_deleted_at ON public.leads USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: idx_leads_lat_lng; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_lat_lng ON public.leads USING btree (lat, lng);


--
-- Name: idx_leads_social_media; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_social_media ON public.leads USING btree (instagram, facebook, twitter) WHERE ((instagram IS NOT NULL) OR (facebook IS NOT NULL) OR (twitter IS NOT NULL));


--
-- Name: idx_webhook_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_logs_status ON public.webhook_logs USING btree (status);


--
-- Name: idx_webhook_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_logs_user_id ON public.webhook_logs USING btree (user_id);


--
-- Name: idx_webhook_telemetry_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_telemetry_timestamp ON public.webhook_result_telemetry USING btree ("timestamp" DESC);


--
-- Name: idx_webhook_telemetry_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_telemetry_user_id ON public.webhook_result_telemetry USING btree (user_id);


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_settings update_user_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: webhook_logs update_webhook_logs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_webhook_logs_updated_at BEFORE UPDATE ON public.webhook_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activities activities_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;


--
-- Name: activities activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: leads leads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: search_history search_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: webhook_logs webhook_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_logs
    ADD CONSTRAINT webhook_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webhook_result_telemetry webhook_result_telemetry_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_result_telemetry
    ADD CONSTRAINT webhook_result_telemetry_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: activities Users can create own activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own activities" ON public.activities FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: leads Users can create own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own leads" ON public.leads FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: search_history Users can create own search history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own search history" ON public.search_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: leads Users can delete own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_settings Users can insert own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: webhook_result_telemetry Users can insert their own telemetry; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own telemetry" ON public.webhook_result_telemetry FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: webhook_logs Users can insert their own webhook logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own webhook logs" ON public.webhook_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: leads Users can update own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_settings Users can update own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: activities Users can view own activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own activities" ON public.activities FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: leads Users can view own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: search_history Users can view own search history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own search history" ON public.search_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_settings Users can view own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: webhook_result_telemetry Users can view their own telemetry; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own telemetry" ON public.webhook_result_telemetry FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: webhook_logs Users can view their own webhook logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own webhook logs" ON public.webhook_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: activities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: search_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

--
-- Name: user_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: webhook_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: webhook_result_telemetry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhook_result_telemetry ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


