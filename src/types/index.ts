// ============================================
// IdiomaLearn – Core Type Definitions
// ============================================

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Domain =
  | "finance"
  | "accounting"
  | "tech"
  | "mechanics"
  | "crafts"
  | "sports"
  | "marketing"
  | "health"
  | "general";

export type AvatarGender = "male" | "female";
export type Accent = "us" | "uk" | "au";
export type SpeechSpeed = "slow" | "normal" | "fast";

export type SessionType =
  | "free_conversation"
  | "scenario"
  | "roleplay"
  | "interview"
  | "grammar_drill"
  | "vocabulary"
  | "level_test";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  native_language: string;
  target_language: string;
  domain: Domain;
  secondary_domains: Domain[];
  cefr_level: CEFRLevel;
  target_level: CEFRLevel;
  target_date: string;
  sessions_per_week: number;
  session_duration: number; // minutes
  preferred_time: string;
  avatar_gender: AvatarGender;
  accent: Accent;
  speech_speed: SpeechSpeed;
  xp: number;
  streak_days: number;
  total_minutes_spoken: number;
  badges: string[];
  created_at: string;
  onboarding_complete: boolean;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  audio_url?: string;
  corrections?: Correction[];
  transcript_confidence?: number;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  category: "grammar" | "vocabulary" | "pronunciation" | "fluency" | "register";
}

export interface SessionData {
  id: string;
  user_id: string;
  type: SessionType;
  domain: Domain;
  scenario_title?: string;
  scenario_description?: string;
  messages: ConversationMessage[];
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  scores: SessionScores;
  corrections: Correction[];
  cefr_estimate: CEFRLevel;
  xp_earned: number;
}

export interface SessionScores {
  overall: number;       // 0-100
  fluency: number;       // 0-100
  grammar: number;       // 0-100
  vocabulary: number;    // 0-100
  pronunciation: number; // 0-100
  comprehension: number; // 0-100
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface LearningPlan {
  user_id: string;
  current_level: CEFRLevel;
  target_level: CEFRLevel;
  target_date: string;
  weekly_sessions: PlannedSession[];
  milestones: Milestone[];
}

export interface PlannedSession {
  day: string;
  time: string;
  type: SessionType;
  domain: Domain;
  topic: string;
  duration: number;
}

export interface Milestone {
  target_date: string;
  description: string;
  cefr_target: CEFRLevel;
  completed: boolean;
}

export interface DomainConfig {
  id: Domain;
  name: string;
  nameFr: string;
  icon: string;
  color: string;
  scenarios: ScenarioTemplate[];
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  cefr_min: CEFRLevel;
  domain: Domain;
  system_prompt: string;
  suggested_duration: number;
}
