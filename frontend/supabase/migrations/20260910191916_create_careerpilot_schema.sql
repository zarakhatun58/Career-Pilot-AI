/*
# CareerPilot AI — Core Database Schema

Creates the primary tables for the CareerPilot AI career platform.

## New Tables

1. `resumes` — Stores user resumes with structured content as JSONB.
   - `id` (uuid PK)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `title` (text)
   - `template` (text: classic-ats, modern-professional, minimal, software-engineer)
   - `content` (jsonb: full resume data including personal info, experience, education, skills, etc.)
   - `ats_score` (int, nullable)
   - `status` (text: draft, published)
   - `created_at`, `updated_at` (timestamps)

2. `ats_analyses` — Stores ATS resume analysis results.
   - `id` (uuid PK)
   - `user_id` (uuid, owner)
   - `resume_id` (uuid FK to resumes, nullable)
   - `job_title` (text)
   - `company_name` (text)
   - `job_description` (text)
   - `overall_score` (int)
   - `keyword_match_score` (int)
   - `skills_match_score` (int)
   - `experience_alignment_score` (int)
   - `formatting_score` (int)
   - `matching_keywords` (text[])
   - `missing_keywords` (text[])
   - `recommendations` (jsonb)
   - `created_at` (timestamp)

3. `saved_jobs` — Bookmarked job postings per user.
   - `id` (uuid PK)
   - `user_id` (uuid, owner)
   - `job_id` (text, external job identifier)
   - `job_data` (jsonb: cached job posting data)
   - `created_at` (timestamp)

4. `applications` — Job application tracker.
   - `id` (uuid PK)
   - `user_id` (uuid, owner)
   - `job_id` (text)
   - `job_data` (jsonb)
   - `resume_id` (uuid FK, nullable)
   - `cover_letter` (text, nullable)
   - `status` (text: saved, preparing, applied, screening, interview, offer, rejected, withdrawn)
   - `notes` (text, nullable)
   - `source_url` (text, nullable)
   - `applied_at` (timestamp, nullable)
   - `created_at`, `updated_at` (timestamps)

5. `profile_optimizations` — Profile optimization analysis results.
   - `id` (uuid PK)
   - `user_id` (uuid, owner)
   - `platform` (text: linkedin, naukri, indeed)
   - `current_headline` (text)
   - `suggested_headline` (text)
   - `current_summary` (text)
   - `suggested_summary` (text)
   - `suggestions` (jsonb)
   - `completeness_score` (int)
   - `created_at` (timestamp)

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD policies (authenticated users access only their own rows).
- All `user_id` columns default to `auth.uid()`.

## Indexes
- Indexes on `user_id` for all tables.
- Index on `resumes.status`, `applications.status`.
- Unique constraint on `saved_jobs(user_id, job_id)` to prevent duplicate saves.
*/

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Resume',
  template text NOT NULL DEFAULT 'modern-professional',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  ats_score integer,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resumes" ON resumes;
CREATE POLICY "select_own_resumes" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_resumes" ON resumes;
CREATE POLICY "insert_own_resumes" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_resumes" ON resumes;
CREATE POLICY "update_own_resumes" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_resumes" ON resumes;
CREATE POLICY "delete_own_resumes" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ATS analyses table
CREATE TABLE IF NOT EXISTS ats_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  job_title text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  job_description text NOT NULL DEFAULT '',
  overall_score integer NOT NULL DEFAULT 0,
  keyword_match_score integer NOT NULL DEFAULT 0,
  skills_match_score integer NOT NULL DEFAULT 0,
  experience_alignment_score integer NOT NULL DEFAULT 0,
  formatting_score integer NOT NULL DEFAULT 0,
  matching_keywords text[] DEFAULT '{}',
  missing_keywords text[] DEFAULT '{}',
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ats_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ats_analyses" ON ats_analyses;
CREATE POLICY "select_own_ats_analyses" ON ats_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ats_analyses" ON ats_analyses;
CREATE POLICY "insert_own_ats_analyses" ON ats_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ats_analyses" ON ats_analyses;
CREATE POLICY "update_own_ats_analyses" ON ats_analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ats_analyses" ON ats_analyses;
CREATE POLICY "delete_own_ats_analyses" ON ats_analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Saved jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  job_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_jobs" ON saved_jobs;
CREATE POLICY "select_own_saved_jobs" ON saved_jobs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_jobs" ON saved_jobs;
CREATE POLICY "insert_own_saved_jobs" ON saved_jobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_jobs" ON saved_jobs;
CREATE POLICY "delete_own_saved_jobs" ON saved_jobs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  job_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter text,
  status text NOT NULL DEFAULT 'saved',
  notes text,
  source_url text,
  applied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Profile optimizations table
CREATE TABLE IF NOT EXISTS profile_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'linkedin',
  current_headline text DEFAULT '',
  suggested_headline text DEFAULT '',
  current_summary text DEFAULT '',
  suggested_summary text DEFAULT '',
  suggestions jsonb DEFAULT '[]'::jsonb,
  completeness_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profile_optimizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile_optimizations" ON profile_optimizations;
CREATE POLICY "select_own_profile_optimizations" ON profile_optimizations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile_optimizations" ON profile_optimizations;
CREATE POLICY "insert_own_profile_optimizations" ON profile_optimizations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile_optimizations" ON profile_optimizations;
CREATE POLICY "update_own_profile_optimizations" ON profile_optimizations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile_optimizations" ON profile_optimizations;
CREATE POLICY "delete_own_profile_optimizations" ON profile_optimizations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(status);
CREATE INDEX IF NOT EXISTS idx_ats_analyses_user_id ON ats_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_profile_optimizations_user_id ON profile_optimizations(user_id);
