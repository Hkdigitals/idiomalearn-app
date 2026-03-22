"use client";

import { useState } from "react";
import { UserProfile, SessionType, Domain, ScenarioTemplate } from "@/types";
import { DOMAINS, CEFR_LEVELS, ALL_BADGES } from "@/lib/constants";

interface DashboardProps {
  profile: UserProfile;
  onStartSession: (type: SessionType, domain: Domain, scenario?: ScenarioTemplate) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function Dashboard({ profile, onStartSession, onUpdateProfile, apiKey, onApiKeyChange }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"home" | "scenarios" | "progress" | "settings">("home");
  const [showSettings, setShowSettings] = useState(false);

  const currentDomain = DOMAINS.find((d) => d.id === profile.domain) || DOMAINS[0];
  const currentLevelInfo = CEFR_LEVELS.find((l) => l.level === profile.cefr_level);
  const nextLevel = CEFR_LEVELS[CEFR_LEVELS.findIndex((l) => l.level === profile.cefr_level) + 1];
  const xpProgress = nextLevel ? ((profile.xp - (currentLevelInfo?.xpRequired || 0)) / (nextLevel.xpRequired - (currentLevelInfo?.xpRequired || 0))) * 100 : 100;

  const unlockedBadges = ALL_BADGES.filter((b) => {
    if (b.id === "first-session" && profile.total_minutes_spoken > 0) return true;
    if (b.id.startsWith("streak-")) {
      const days = parseInt(b.condition.split(">= ")[1]);
      return profile.streak_days >= days;
    }
    if (b.id.startsWith("xp-")) {
      const xp = parseInt(b.condition.split(">= ")[1]);
      return profile.xp >= xp;
    }
    return false;
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hello, {profile.name} 👋</h1>
          <p className="text-text-secondary text-sm">
            {currentDomain.icon} {currentDomain.name} · Level {profile.cefr_level}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-bg-card text-sm">
            <span className="text-xp-gold">⭐</span>
            <span className="font-semibold">{profile.xp} XP</span>
          </div>
          {profile.streak_days > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-bg-card text-sm">
              <span>🔥</span>
              <span className="font-semibold">{profile.streak_days}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="px-4">
        {activeTab === "home" && (
          <div className="animate-fade-in space-y-6">
            {/* Level progress card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-bg-card to-bg-card-hover border border-text-muted/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-text-muted">Current Level</p>
                  <p className="text-2xl font-bold text-primary">{profile.cefr_level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-muted">Target</p>
                  <p className="text-2xl font-bold text-secondary">{profile.target_level}</p>
                </div>
              </div>
              <div className="h-2.5 bg-bg-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{ width: `${Math.min(xpProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-text-muted mt-2">
                {nextLevel ? `${nextLevel.xpRequired - profile.xp} XP to ${nextLevel.level}` : "Maximum level reached!"}
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-bg-card text-center">
                <p className="text-2xl font-bold text-primary">{profile.total_minutes_spoken}</p>
                <p className="text-xs text-text-muted">Min spoken</p>
              </div>
              <div className="p-4 rounded-xl bg-bg-card text-center">
                <p className="text-2xl font-bold text-secondary">{profile.streak_days}</p>
                <p className="text-xs text-text-muted">Day streak</p>
              </div>
              <div className="p-4 rounded-xl bg-bg-card text-center">
                <p className="text-2xl font-bold text-accent">{unlockedBadges.length}</p>
                <p className="text-xs text-text-muted">Badges</p>
              </div>
            </div>

            {/* Quick start buttons */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Start a session</h2>
              <div className="space-y-3">
                <button
                  onClick={() => onStartSession("free_conversation", profile.domain)}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 text-left hover:border-primary/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold flex items-center gap-2">🎙️ Free Conversation</p>
                      <p className="text-sm text-text-secondary mt-1">Talk freely about {currentDomain.name}</p>
                    </div>
                    <span className="text-primary text-2xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>

                <button
                  onClick={() => onStartSession("level_test", profile.domain)}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/5 border border-secondary/20 text-left hover:border-secondary/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold flex items-center gap-2">📝 Level Test</p>
                      <p className="text-sm text-text-secondary mt-1">Assess your current CEFR level</p>
                    </div>
                    <span className="text-secondary text-2xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Badges preview */}
            {unlockedBadges.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Recent badges</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {unlockedBadges.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex-shrink-0 p-3 rounded-xl bg-bg-card text-center min-w-[80px]">
                      <span className="text-2xl block">{b.icon}</span>
                      <p className="text-xs text-text-secondary mt-1">{b.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "scenarios" && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-semibold">Scenarios — {currentDomain.icon} {currentDomain.name}</h2>
            {currentDomain.scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onStartSession("scenario", profile.domain, scenario)}
                className="w-full p-4 rounded-xl bg-bg-card border border-text-muted/10 text-left hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{scenario.title}</p>
                    <p className="text-sm text-text-secondary mt-1">{scenario.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{scenario.cefr_min}+</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-bg-dark text-text-muted">{scenario.suggested_duration} min</span>
                    </div>
                  </div>
                  <span className="text-text-muted text-xl">→</span>
                </div>
              </button>
            ))}

            {/* Other domains */}
            <h3 className="text-md font-semibold mt-6 text-text-secondary">Explore other domains</h3>
            <div className="grid grid-cols-2 gap-3">
              {DOMAINS.filter((d) => d.id !== profile.domain).map((d) => (
                <button
                  key={d.id}
                  onClick={() => onStartSession("free_conversation", d.id)}
                  className="p-3 rounded-xl bg-bg-card border border-text-muted/10 text-left hover:border-text-muted/30 transition-all"
                >
                  <span className="text-xl">{d.icon}</span>
                  <p className="text-sm font-medium mt-1">{d.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-lg font-semibold">Your Progress</h2>

            {/* CEFR Level card */}
            <div className="p-5 rounded-2xl bg-bg-card">
              <h3 className="font-medium text-text-secondary mb-4">CEFR Level Overview</h3>
              <div className="flex gap-1">
                {CEFR_LEVELS.map((l) => {
                  const isReached = CEFR_LEVELS.indexOf(l) <= CEFR_LEVELS.findIndex((cl) => cl.level === profile.cefr_level);
                  const isCurrent = l.level === profile.cefr_level;
                  return (
                    <div key={l.level} className="flex-1 text-center">
                      <div className={`h-2 rounded-full mb-2 ${isReached ? "bg-gradient-to-r from-primary to-secondary" : "bg-bg-dark"}`} />
                      <p className={`text-xs font-semibold ${isCurrent ? "text-primary" : isReached ? "text-text-secondary" : "text-text-muted"}`}>
                        {l.level}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="p-5 rounded-2xl bg-bg-card space-y-4">
              <h3 className="font-medium text-text-secondary">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{profile.xp}</p>
                  <p className="text-xs text-text-muted">Total XP</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary">{profile.total_minutes_spoken}</p>
                  <p className="text-xs text-text-muted">Minutes spoken</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">{profile.streak_days}</p>
                  <p className="text-xs text-text-muted">Current streak</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-xp-gold">{unlockedBadges.length}/{ALL_BADGES.length}</p>
                  <p className="text-xs text-text-muted">Badges</p>
                </div>
              </div>
            </div>

            {/* All badges */}
            <div className="p-5 rounded-2xl bg-bg-card">
              <h3 className="font-medium text-text-secondary mb-4">All Badges</h3>
              <div className="grid grid-cols-3 gap-3">
                {ALL_BADGES.map((b) => {
                  const isUnlocked = unlockedBadges.some((ub) => ub.id === b.id);
                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-xl text-center transition-all ${
                        isUnlocked ? "bg-bg-card-hover" : "bg-bg-dark opacity-40"
                      }`}
                    >
                      <span className="text-2xl block">{isUnlocked ? b.icon : "🔒"}</span>
                      <p className="text-xs mt-1 font-medium">{b.name}</p>
                      <p className="text-xs text-text-muted">{b.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-semibold">Settings</h2>

            <div className="p-4 rounded-xl bg-bg-card space-y-4">
              <div>
                <label className="text-sm text-text-muted block mb-1">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
                  className="w-full p-3 rounded-lg bg-bg-dark border border-text-muted/20 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-text-muted block mb-1">Primary Domain</label>
                <select
                  value={profile.domain}
                  onChange={(e) => onUpdateProfile({ ...profile, domain: e.target.value as Domain })}
                  className="w-full p-3 rounded-lg bg-bg-dark border border-text-muted/20 text-text-primary focus:border-primary focus:outline-none"
                >
                  {DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-text-muted block mb-1">AI Voice</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateProfile({ ...profile, avatar_gender: "female" })}
                    className={`flex-1 py-2 rounded-lg text-sm ${profile.avatar_gender === "female" ? "bg-primary text-white" : "bg-bg-dark text-text-secondary"}`}
                  >
                    👩 Female
                  </button>
                  <button
                    onClick={() => onUpdateProfile({ ...profile, avatar_gender: "male" })}
                    className={`flex-1 py-2 rounded-lg text-sm ${profile.avatar_gender === "male" ? "bg-primary text-white" : "bg-bg-dark text-text-secondary"}`}
                  >
                    👨 Male
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-muted block mb-1">Accent</label>
                <div className="flex gap-2">
                  {([["us", "🇺🇸 US"], ["uk", "🇬🇧 UK"], ["au", "🇦🇺 AU"]] as [string, string][]).map(([a, label]) => (
                    <button
                      key={a}
                      onClick={() => onUpdateProfile({ ...profile, accent: a as any })}
                      className={`flex-1 py-2 rounded-lg text-sm ${profile.accent === a ? "bg-secondary text-bg-dark" : "bg-bg-dark text-text-secondary"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-text-muted block mb-2">OpenRouter API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full p-3 rounded-lg bg-bg-dark border border-text-muted/20 text-text-primary text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-card/95 backdrop-blur-lg border-t border-text-muted/10 px-2 py-2 z-50">
        <div className="flex justify-around max-w-md mx-auto">
          {([
            { id: "home", icon: "🏠", label: "Home" },
            { id: "scenarios", icon: "🎬", label: "Scenarios" },
            { id: "progress", icon: "📊", label: "Progress" },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ] as { id: typeof activeTab; icon: string; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1.5 px-4 rounded-xl transition-all ${
                activeTab === tab.id ? "text-primary" : "text-text-muted"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
