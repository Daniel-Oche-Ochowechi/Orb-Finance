-- ==============================================================================
-- Orb Finance: Supabase Database Schema
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- Safe to run multiple times (idempotent).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Custom Enum for Submission Status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'waitlist_status') THEN
    CREATE TYPE waitlist_status AS ENUM ('pending', 'approved', 'contacted', 'rejected');
  END IF;
END $$;

-- Create the Waitlist Submissions Table
CREATE TABLE IF NOT EXISTS public.waitlist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  reference_id TEXT NOT NULL UNIQUE,
  status waitlist_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Case-insensitive unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_submissions_email_lower 
ON public.waitlist_submissions (LOWER(email));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_role 
ON public.waitlist_submissions (role);

CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_status 
ON public.waitlist_submissions (status);

CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_created_at 
ON public.waitlist_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_reference_id 
ON public.waitlist_submissions (reference_id);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waitlist_updated_at ON public.waitlist_submissions;
CREATE TRIGGER set_waitlist_updated_at
BEFORE UPDATE ON public.waitlist_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
-- Enable RLS to enforce bank-grade data security
ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;

-- 1. Allow public anon key to INSERT valid submissions only
DROP POLICY IF EXISTS "Allow public insert to waitlist" ON public.waitlist_submissions;
CREATE POLICY "Allow public insert to waitlist"
ON public.waitlist_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) >= 2 AND
  length(trim(email)) >= 5 AND
  role IN ('Bank', 'Fintech or payments company', 'Business', 'Individual')
);

-- 2. Restrict SELECT, UPDATE, DELETE to Service Role (Admin backend only)
-- Public clients cannot read or modify other users' submissions
DROP POLICY IF EXISTS "Allow service role full access to waitlist" ON public.waitlist_submissions;
CREATE POLICY "Allow service role full access to waitlist"
ON public.waitlist_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- Helpful Admin Summary View
-- ==============================================================================
CREATE OR REPLACE VIEW public.waitlist_metrics_summary
WITH (security_invoker = true) AS
SELECT
  count(*)::integer AS total_submissions,
  count(*) FILTER (WHERE role = 'Bank')::integer AS banks_count,
  count(*) FILTER (WHERE role = 'Fintech or payments company')::integer AS fintechs_count,
  count(*) FILTER (WHERE role = 'Business')::integer AS businesses_count,
  count(*) FILTER (WHERE role = 'Individual')::integer AS individuals_count,
  count(*) FILTER (WHERE status = 'pending')::integer AS pending_count,
  count(*) FILTER (WHERE status = 'approved')::integer AS approved_count,
  count(*) FILTER (WHERE status = 'contacted')::integer AS contacted_count,
  count(*) FILTER (WHERE created_at >= (now() - INTERVAL '24 hours'))::integer AS last_24h_count
FROM public.waitlist_submissions;

-- ==============================================================================
-- Contact Inquiries & Direct Messages
-- ==============================================================================
-- Custom Enum for Contact Inquiry Status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status') THEN
    CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'responded', 'archived');
  END IF;
END $$;

-- Create the Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id TEXT NOT NULL UNIQUE,
  status contact_status NOT NULL DEFAULT 'new',
  notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Performance Indexes for Contact Inquiries
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email 
ON public.contact_inquiries (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_category 
ON public.contact_inquiries (category);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status 
ON public.contact_inquiries (status);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at 
ON public.contact_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_reference_id 
ON public.contact_inquiries (reference_id);

-- Auto-update updated_at trigger for contacts
DROP TRIGGER IF EXISTS set_contacts_updated_at ON public.contact_inquiries;
CREATE TRIGGER set_contacts_updated_at
BEFORE UPDATE ON public.contact_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS for contact inquiries
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 1. Allow public anon key to INSERT inquiries only
DROP POLICY IF EXISTS "Allow public insert to contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public insert to contact_inquiries"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) >= 2 AND
  length(trim(email)) >= 5 AND
  length(trim(message)) >= 5
);

-- 2. Restrict SELECT, UPDATE, DELETE to Service Role (Admin backend only)
DROP POLICY IF EXISTS "Allow service role full access to contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow service role full access to contact_inquiries"
ON public.contact_inquiries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Helpful Contact Metrics Summary View
CREATE OR REPLACE VIEW public.contact_metrics_summary
WITH (security_invoker = true) AS
SELECT
  count(*)::integer AS total_inquiries,
  count(*) FILTER (WHERE status = 'new')::integer AS new_count,
  count(*) FILTER (WHERE status = 'in_progress')::integer AS in_progress_count,
  count(*) FILTER (WHERE status = 'responded')::integer AS responded_count,
  count(*) FILTER (WHERE status = 'archived')::integer AS archived_count,
  count(*) FILTER (WHERE category = 'Partnership')::integer AS partnership_count,
  count(*) FILTER (WHERE category = 'Institutional Sandbox')::integer AS sandbox_count,
  count(*) FILTER (WHERE category = 'Integration Support')::integer AS integration_count,
  count(*) FILTER (WHERE created_at >= (now() - INTERVAL '24 hours'))::integer AS last_24h_count
FROM public.contact_inquiries;

-- Explicit Schema & Table Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT INSERT ON public.waitlist_submissions, public.contact_inquiries TO anon, authenticated;
GRANT ALL ON public.waitlist_submissions, public.contact_inquiries TO service_role;
GRANT SELECT ON public.waitlist_metrics_summary, public.contact_metrics_summary TO service_role;

-- ==============================================================================
-- Admin Email OTP Verification Challenges & Supabase Auth Role Setup
-- ==============================================================================
-- Stores hashed, single-use 6-digit email OTP challenges for Supabase Auth admins.
CREATE TABLE IF NOT EXISTS public.admin_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_otp_challenges_email_exp
ON public.admin_otp_challenges (LOWER(email), expires_at DESC);

ALTER TABLE public.admin_otp_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access to admin_otp_challenges" ON public.admin_otp_challenges;
CREATE POLICY "Allow service role full access to admin_otp_challenges"
ON public.admin_otp_challenges
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

GRANT ALL ON public.admin_otp_challenges TO service_role;

-- Secure helper to grant the Supabase Auth 'admin' role in raw_app_meta_data.
-- Create your admin user in Supabase Dashboard -> Authentication -> Users (Email + Password),
-- then run in Supabase SQL Editor:
--   SELECT public.promote_supabase_admin('admin@orbfinance.co');
CREATE OR REPLACE FUNCTION public.promote_supabase_admin(target_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'admin',
    'roles', jsonb_build_array('admin')
  )
  WHERE LOWER(email) = LOWER(trim(target_email));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No Supabase Auth user found with email: %', target_email;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_supabase_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_supabase_admin(TEXT) TO service_role;
