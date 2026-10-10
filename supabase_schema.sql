-- ==============================================================================
-- Orb Finance: Supabase Database Schema
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

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
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
CREATE POLICY "Allow service role full access to waitlist"
ON public.waitlist_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- Helpful Admin Summary View
-- ==============================================================================
CREATE OR REPLACE VIEW public.waitlist_metrics_summary AS
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
