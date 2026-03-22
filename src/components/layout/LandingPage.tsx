"use client";

import { useState } from "react";

interface LandingPageProps {
  onStart: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function LandingPage({ onStart, apiKey, onApiKeyChange }: LandingPageProps) {
  const [showApiInput, setShowApiInput] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    onApiKeyChange(tempKey.trim());
    setShowApiInput(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30 mb-6 animate-glow">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4z" fill="none" stroke="white" strokeWidth="2.5"/>
              <path d="M16 20c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H18c-1.1 0-2-.9-2-2v-8z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5"/>
              <path d="M20 24h8M24 20v8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="14" cy="24" r="2" fill="white"/>
              <circle cx="34" cy="24" r="2" fill="white"/>
              <path d="M10 16l4 4M38 16l-4 4M10 32l4-4M38 32l-4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
              IdiomaLearn
            </span>
          </h1>
          <p className="text-text-secondary text-lg">
            Speak English with Confidence
          </p>
        </div>

        {/* Value props */}
        <div className="space-y-3 mb-10 text-left max-w-sm mx-auto">
          {[
            { icon: "🎙️", text: "Real AI conversations in your professional domain" },
            { icon: "🎯", text: "CEFR-aligned progression from A1 to C2" },
            { icon: "⚡", text: "Instant feedback on grammar, vocabulary & fluency" },
            { icon: "🏆", text: "Gamified learning with XP, badges & streaks" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bg-card/60 backdrop-blur-sm">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-text-secondary text-sm">{item.text}</span>
            </div>
          ))}
        </div>

        {/* API Key Setup */}
        {!apiKey && !showApiInput && (
          <button
            onClick={() => setShowApiInput(true)}
            className="w-full py-3 px-6 rounded-xl bg-bg-card border border-text-muted/20 text-text-secondary hover:border-primary/50 transition-all mb-4 text-sm"
          >
            🔑 Configure OpenRouter API Key
          </button>
        )}

        {showApiInput && (
          <div className="mb-4 p-4 rounded-xl bg-bg-card border border-primary/30 animate-fade-in">
            <p className="text-sm text-text-secondary mb-3">
              Get your free API key at{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-primary underline">
                openrouter.ai/keys
              </a>
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full p-3 rounded-lg bg-bg-dark border border-text-muted/20 text-text-primary text-sm mb-3 focus:border-primary focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveKey}
                disabled={!tempKey.trim()}
                className="flex-1 py-2 rounded-lg bg-primary text-white font-medium text-sm disabled:opacity-50 hover:bg-primary-dark transition-colors"
              >
                Save Key
              </button>
              <button
                onClick={() => setShowApiInput(false)}
                className="px-4 py-2 rounded-lg bg-bg-dark text-text-secondary text-sm hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {apiKey && !showApiInput && (
          <p className="text-sm text-success mb-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success inline-block" /> API Key configured
            <button onClick={() => setShowApiInput(true)} className="text-text-muted underline ml-2 text-xs">
              Change
            </button>
          </p>
        )}

        {/* CTA */}
        <button
          onClick={onStart}
          disabled={!apiKey}
          className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
        >
          Start Learning Now
        </button>

        <p className="text-text-muted text-xs mt-4">
          Free to use with your own OpenRouter key
        </p>
      </div>
    </div>
  );
}
