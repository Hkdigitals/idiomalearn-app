"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import LandingPage from "@/components/layout/LandingPage";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import Dashboard from "@/components/dashboard/Dashboard";
import ConversationScreen from "@/components/chat/ConversationScreen";
import FeedbackScreen from "@/components/chat/FeedbackScreen";
import { UserProfile, SessionData, SessionType, Domain, ScenarioTemplate } from "@/types";

type AppView = "landing" | "onboarding" | "dashboard" | "session" | "feedback" | "settings";

export default function Home() {
  const [profile, setProfile, isLoaded] = useLocalStorage<UserProfile | null>("idiomalearn_profile", null);
  const [apiKey, setApiKey, apiKeyLoaded] = useLocalStorage<string>("idiomalearn_openrouter_key", "");
  const [view, setView] = useState<AppView>("landing");
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [sessionConfig, setSessionConfig] = useState<{
    type: SessionType;
    domain: Domain;
    scenario?: ScenarioTemplate;
  } | null>(null);

  useEffect(() => {
    if (isLoaded && apiKeyLoaded) {
      if (profile?.onboarding_complete && apiKey) {
        setView("dashboard");
      } else if (profile && !profile.onboarding_complete) {
        setView("onboarding");
      } else {
        setView("landing");
      }
    }
  }, [isLoaded, apiKeyLoaded, profile, apiKey]);

  const handleStartOnboarding = () => setView("onboarding");

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile({ ...newProfile, onboarding_complete: true });
    setView("dashboard");
  };

  const handleStartSession = (type: SessionType, domain: Domain, scenario?: ScenarioTemplate) => {
    setSessionConfig({ type, domain, scenario });
    setView("session");
  };

  const handleSessionEnd = (session: SessionData) => {
    setCurrentSession(session);
    // Update profile stats
    if (profile) {
      setProfile({
        ...profile,
        xp: profile.xp + session.xp_earned,
        total_minutes_spoken: profile.total_minutes_spoken + Math.floor(session.duration_seconds / 60),
      });
    }
    setView("feedback");
  };

  const handleFeedbackClose = () => {
    setCurrentSession(null);
    setSessionConfig(null);
    setView("dashboard");
  };

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Loading IdiomaLearn...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {view === "landing" && (
        <LandingPage
          onStart={handleStartOnboarding}
          apiKey={apiKey}
          onApiKeyChange={handleSetApiKey}
        />
      )}
      {view === "onboarding" && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          apiKey={apiKey}
          onApiKeyChange={handleSetApiKey}
        />
      )}
      {view === "dashboard" && profile && (
        <Dashboard
          profile={profile}
          onStartSession={handleStartSession}
          onUpdateProfile={setProfile}
          apiKey={apiKey}
          onApiKeyChange={handleSetApiKey}
        />
      )}
      {view === "session" && profile && sessionConfig && (
        <ConversationScreen
          profile={profile}
          sessionType={sessionConfig.type}
          domain={sessionConfig.domain}
          scenario={sessionConfig.scenario}
          apiKey={apiKey}
          onEnd={handleSessionEnd}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "feedback" && currentSession && profile && (
        <FeedbackScreen
          session={currentSession}
          profile={profile}
          onClose={handleFeedbackClose}
        />
      )}
    </main>
  );
}
