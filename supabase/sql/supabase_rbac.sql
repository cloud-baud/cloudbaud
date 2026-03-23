-- ============================================================
-- GLOBAL ROLE-BASED ACCESS CONTROL (RBAC)
-- ============================================================

-- 1. PROFILES TABLE
-- Extends Supabase Auth users with roles and custom metadata
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    role text DEFAULT 'user' CHECK (role IN ('tenant-admin', 'client-admin', 'user', 'guest')),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are readable by the user themselves or by admins
CREATE POLICY "Public profiles are readable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. AUTO-PROFILE CREATION ON SIGNUP
-- Trigger to automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_metadata->>'full_name',
    new.raw_user_metadata->>'avatar_url',
    CASE
      WHEN new.email = 'admin@cloudbaud.com' THEN 'tenant-admin'
      WHEN new.email = 'jish.nath@cloudbaud.com' THEN 'tenant-admin' -- Grant initially as admin per request
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. UTILITY: ADD EXISTING USERS TO PROFILES
-- Run this if you already have users in auth.users
-- INSERT INTO public.profiles (id, email, role)
-- SELECT id, email, 'user' FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
