"use client";

import { useState } from "react";
import { UserProfile, Domain, Accent, AvatarGender, SpeechSpeed, CEFRLevel } from "@/types";
import { DOMAINS } from "@/lib/constants";

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

type Step = "name" | "domain" | "objective" | "availability" | "avatar" | "apikey" | "ready";

export default function OnboardingFlow({ onComplete, apiKey, onApiKeyChange }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<Domain>("general");
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>("B2");
  const [targetMonths, setTargetMonths] = useState(6);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(5);
  const [sessionDuration, setSessionDuration] = useState(15);
  const [avatarGender, setAvatarGender] = useState<AvatarGender>("female");
  const [accent, setAccent] = useState<Accent>("us");
  const [speechSpeed, setSpeechSpeed] = useState<SpeechSpeed>("normal");
  const [tempKey, setTempKey] = useState(apiKey);

  const steps: Step[] = ["name", "domain", "objective", "availability", "avatar", ...(apiKey ? [] : ["apikey" as Step]), "ready"];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const next = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) setStep(steps[nextIndex]);
  };

  const prev = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) setStep(steps[prevIndex]);
  };

  const handleComplete = () => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + targetMonths);

    const profile: UserProfile = {
      id: crypto.randomUUID(),
      email: "",
      name,
      native_language: "fr",
      target_language: "en",
      domain,
      secondary_domains: [],
      cefr_level: "A2",
      target_level: targetLevel,
      target_date: targetDate.toISOString(),
      sessions_per_week: sessionsPerWeek,
      session_duration: sessionDuration,
      preferred_time: "morning",
      avatar_gender: avatarGender,
      accent,
      speech_speed: speechSpeed,
      xp: 0,
      streak_days: 0,
      total_minutes_spoken: 0,
      badges: [],
      created_at: new Date().toISOString(),
      onboarding_complete: false,
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-text-muted text-xs mt-2 text-center">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Step: Name */}
        {step === "name" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome! What&apos;s your name?</h2>
            <p className="text-text-secondary mb-8">Your AI partner will use it during conversations.</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name..."
              className="w-full p-4 rounded-xl bg-bg-card border border-text-muted/20 text-text-primary text-lg text-center focus:border-primary focus:outline-none mb-6"
              autoFocus
            />
            <button
              onClick={next}
              disabled={!name.trim()}
              className="w-full py-4 rounded-xl bg-primary text-white font-semibold disabled:opacity-40 hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Domain */}
        {step === "domain" && (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">Choose your domain</h2>
            <p className="text-text-secondary mb-6 text-center">Conversations will be tailored to your field.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {DOMAINS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDomain(d.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    domain === d.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-text-muted/10 bg-bg-card hover:border-text-muted/30"
                  }`}
                >
                  <span className="text-2xl block mb-2">{d.icon}</span>
                  <span className="text-sm font-medium block">{d.name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={prev} className="px-6 py-3 rounded-xl bg-bg-card text-text-secondary hover:text-text-primary transition-colors">
                Back
              </button>
              <button onClick={next} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Objective */}
        {step === "objective" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">What&apos;s your goal?</h2>
            <p className="text-text-secondary mb-8">We&apos;ll build a plan to get you there.</p>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-text-muted text-left">Target CEFR level</p>
              <div className="flex gap-2 flex-wrap">
                {(["A2", "B1", "B2", "C1", "C2"] as CEFRLevel[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setTargetLevel(l)}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      targetLevel === l ? "bg-primary text-white" : "bg-bg-card text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <p className="text-sm text-text-muted text-left">Timeframe</p>
              <div className="flex gap-2">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTargetMonths(m)}
                    className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      targetMonths === m ? "bg-secondary text-bg-dark" : "bg-bg-card text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {m} months
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={prev} className="px-6 py-3 rounded-xl bg-bg-card text-text-secondary">Back</button>
              <button onClick={next} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold">Continue</button>
            </div>
          </div>
        )}

        {/* Step: Availability */}
        {step === "availability" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Your availability</h2>
            <p className="text-text-secondary mb-8">How much time can you dedicate?</p>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-text-muted text-left">Sessions per week</p>
              <div className="flex gap-2">
                {[3, 5, 7].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSessionsPerWeek(n)}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      sessionsPerWeek === n ? "bg-primary text-white" : "bg-bg-card text-text-secondary"
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <p className="text-sm text-text-muted text-left">Duration per session</p>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSessionDuration(d)}
                    className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                      sessionDuration === d ? "bg-secondary text-bg-dark" : "bg-bg-card text-text-secondary"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={prev} className="px-6 py-3 rounded-xl bg-bg-card text-text-secondary">Back</button>
              <button onClick={next} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold">Continue</button>
            </div>
          </div>
        )}

        {/* Step: Avatar */}
        {step === "avatar" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Your AI partner</h2>
            <p className="text-text-secondary mb-8">Choose the voice you&apos;ll practice with.</p>

            {/* Avatar preview */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-6 flex items-center justify-center text-4xl animate-glow">
              {avatarGender === "female" ? "👩‍💼" : "👨‍💼"}
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-sm text-text-muted mb-2">Voice</p>
                <div className="flex gap-3 justify-center">
                  {(["female", "male"] as AvatarGender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setAvatarGender(g)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        avatarGender === g ? "bg-primary text-white" : "bg-bg-card text-text-secondary"
                      }`}
                    >
                      {g === "female" ? "👩 Female" : "👨 Male"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-text-muted mb-2">Accent</p>
                <div className="flex gap-2 justify-center">
                  {([["us", "🇺🇸 US"], ["uk", "🇬🇧 UK"], ["au", "🇦🇺 AU"]] as [Accent, string][]).map(([a, label]) => (
                    <button
                      key={a}
                      onClick={() => setAccent(a)}
                      className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        accent === a ? "bg-secondary text-bg-dark" : "bg-bg-card text-text-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-text-muted mb-2">Speed</p>
                <div className="flex gap-2 justify-center">
                  {([["slow", "🐢 Slow"], ["normal", "🏃 Normal"], ["fast", "⚡ Fast"]] as [SpeechSpeed, string][]).map(([s, label]) => (
                    <button
                      key={s}
                      onClick={() => setSpeechSpeed(s)}
                      className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        speechSpeed === s ? "bg-accent text-white" : "bg-bg-card text-text-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={prev} className="px-6 py-3 rounded-xl bg-bg-card text-text-secondary">Back</button>
              <button onClick={next} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold">Continue</button>
            </div>
          </div>
        )}

        {/* Step: API Key (only if not set) */}
        {step === "apikey" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
            <p className="text-text-secondary mb-6">Add your OpenRouter API key to power the AI conversations.</p>
            <div className="p-4 rounded-xl bg-bg-card border border-primary/20 mb-6">
              <p className="text-sm text-text-secondary mb-3">
                Get a free key at{" "}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-primary underline">
                  openrouter.ai/keys
                </a>
              </p>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full p-3 rounded-lg bg-bg-dark border border-text-muted/20 text-text-primary text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={prev} className="px-6 py-3 rounded-xl bg-bg-card text-text-secondary">Back</button>
              <button
                onClick={() => { onApiKeyChange(tempKey.trim()); next(); }}
                disabled={!tempKey.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Ready */}
        {step === "ready" && (
          <div className="text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold mb-3">You&apos;re all set, {name}!</h2>
            <p className="text-text-secondary mb-8">
              Your personalized plan is ready. Target: <span className="text-primary font-semibold">{targetLevel}</span> in{" "}
              <span className="text-secondary font-semibold">{targetMonths} months</span>.
            </p>
            <div className="p-4 rounded-xl bg-bg-card mb-8 text-left space-y-2">
              <p className="text-sm"><span className="text-text-muted">Domain:</span> {DOMAINS.find((d) => d.id === domain)?.icon} {DOMAINS.find((d) => d.id === domain)?.name}</p>
              <p className="text-sm"><span className="text-text-muted">Schedule:</span> {sessionsPerWeek}x/week, {sessionDuration} min sessions</p>
              <p className="text-sm"><span className="text-text-muted">AI Voice:</span> {avatarGender === "female" ? "👩" : "👨"} {accent.toUpperCase()} accent, {speechSpeed} speed</p>
            </div>
            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start My First Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
