"use client";

import { SessionData, UserProfile } from "@/types";

interface FeedbackScreenProps {
  session: SessionData;
  profile: UserProfile;
  onClose: () => void;
}

export default function FeedbackScreen({ session, profile, onClose }: FeedbackScreenProps) {
  const { scores, corrections, xp_earned, cefr_estimate, duration_seconds } = session;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  const getScoreBar = (score: number) => {
    if (score >= 80) return "from-success to-success/60";
    if (score >= 60) return "from-warning to-warning/60";
    return "from-error to-error/60";
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "grammar": return "📝";
      case "vocabulary": return "📚";
      case "pronunciation": return "🗣️";
      case "fluency": return "💬";
      case "register": return "🎯";
      default: return "📌";
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header with celebration */}
      <div className="bg-gradient-to-b from-primary/20 to-transparent p-6 text-center">
        <div className="text-5xl mb-3">
          {scores.overall >= 80 ? "🎉" : scores.overall >= 60 ? "👍" : "💪"}
        </div>
        <h1 className="text-2xl font-bold mb-1">Session Complete!</h1>
        <p className="text-text-secondary text-sm">
          {formatDuration(duration_seconds)} · {session.messages.filter((m) => m.role === "user").length} turns
        </p>
      </div>

      <div className="px-4 space-y-6 max-w-lg mx-auto">
        {/* XP earned */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-xp-gold/10 border border-xp-gold/20">
            <span className="text-xp-gold text-xl">⭐</span>
            <span className="text-xp-gold font-bold text-xl">+{xp_earned} XP</span>
          </div>
          <p className="text-sm text-text-muted mt-2">
            CEFR Estimate: <span className="text-primary font-semibold">{cefr_estimate}</span>
          </p>
        </div>

        {/* Overall score */}
        <div className="p-5 rounded-2xl bg-bg-card border border-text-muted/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Overall Score</h2>
            <span className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>{scores.overall}</span>
          </div>

          {/* Score breakdown */}
          <div className="space-y-3">
            {[
              { label: "Fluency", score: scores.fluency, icon: "💬" },
              { label: "Grammar", score: scores.grammar, icon: "📝" },
              { label: "Vocabulary", score: scores.vocabulary, icon: "📚" },
              { label: "Pronunciation", score: scores.pronunciation, icon: "🗣️" },
              { label: "Comprehension", score: scores.comprehension, icon: "👂" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">
                    {item.icon} {item.label}
                  </span>
                  <span className={`text-sm font-semibold ${getScoreColor(item.score)}`}>
                    {item.score}
                  </span>
                </div>
                <div className="h-2 bg-bg-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreBar(item.score)} transition-all duration-1000`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corrections */}
        {corrections.length > 0 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-text-muted/10">
            <h2 className="font-semibold mb-4">Corrections & Tips</h2>
            <div className="space-y-4">
              {corrections.map((correction, i) => (
                <div key={i} className="p-3 rounded-xl bg-bg-dark">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getCategoryIcon(correction.category)}</span>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="text-error line-through">{correction.original}</span>
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-success">→ {correction.corrected}</span>
                      </p>
                      <p className="text-xs text-text-muted mt-1.5">{correction.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation transcript */}
        <details className="p-5 rounded-2xl bg-bg-card border border-text-muted/10">
          <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">
            View Conversation Transcript
          </summary>
          <div className="mt-4 space-y-3">
            {session.messages.filter((m) => m.role !== "system").map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-primary/20 text-text-primary"
                    : "bg-bg-dark text-text-secondary"
                }`}>
                  <span className="text-xs text-text-muted block mb-1">
                    {msg.role === "user" ? "You" : "AI"}
                  </span>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </details>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
