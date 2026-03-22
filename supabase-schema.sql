-- ============================================
-- IdiomaLearn – Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL,
  native_language TEXT DEFAULT 'fr',
  target_language TEXT DEFAULT 'en',
  domain TEXT DEFAULT 'general',
  secondary_domains TEXT[] DEFAULT '{}',
  cefr_level TEXT DEFAULT 'A2',
  target_level TEXT DEFAULT 'B2',
  target_date TIMESTAMPTZ,
  sessions_per_week INTEGER DEFAULT 5,
  session_duration INTEGER DEFAULT 15,
  preferred_time TEXT DEFAULT 'morning',
  avatar_gender TEXT DEFAULT 'female',
  accent TEXT DEFAULT 'us',
  speech_speed TEXT DEFAULT 'normal',
  xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_session_date DATE,
  total_minutes_spoken INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  domain TEXT NOT NULL,
  scenario_title TEXT,
  scenario_description TEXT,
  messages JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  scores JSONB DEFAULT '{}',
  corrections JSONB DEFAULT '[]',
  cefr_estimate TEXT,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(auth_id);

-- RPC: Add XP (atomic increment)
CREATE OR REPLACE FUNCTION add_xp(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET xp = xp + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Update streak
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
BEGIN
  SELECT last_session_date INTO v_last_date FROM profiles WHERE id = p_user_id;

  IF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE profiles SET streak_days = streak_days + 1, last_session_date = CURRENT_DATE, updated_at = NOW() WHERE id = p_user_id;
  ELSIF v_last_date < CURRENT_DATE - INTERVAL '1 day' OR v_last_date IS NULL THEN
    UPDATE profiles SET streak_days = 1, last_session_date = CURRENT_DATE, updated_at = NOW() WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()));
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()));
