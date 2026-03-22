"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UserProfile, SessionData, SessionType, Domain, ConversationMessage, ScenarioTemplate, SessionScores } from "@/types";
import { SYSTEM_PROMPTS, DOMAINS } from "@/lib/constants";
import { streamChat, chatCompletion } from "@/lib/openrouter";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface ConversationScreenProps {
  profile: UserProfile;
  sessionType: SessionType;
  domain: Domain;
  scenario?: ScenarioTemplate;
  apiKey: string;
  onEnd: (session: SessionData) => void;
  onBack: () => void;
}

export default function ConversationScreen({
  profile,
  sessionType,
  domain,
  scenario,
  apiKey,
  onEnd,
  onBack,
}: ConversationScreenProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentAiText, setCurrentAiText] = useState("");
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  const startTimeRef = useRef(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({
    accent: profile.accent,
    gender: profile.avatar_gender,
    speed: profile.speech_speed,
    onEnd: () => setIsAiSpeaking(false),
  });

  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition({
    language: "en-US",
    continuous: true,
    interimResults: true,
  });

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAiText]);

  // Start conversation on mount
  useEffect(() => {
    initiateConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSystemPrompt = () => {
    if (sessionType === "level_test") {
      return SYSTEM_PROMPTS.levelTest(profile.name);
    }
    const domainName = DOMAINS.find((d) => d.id === domain)?.name || domain;
    const scenarioDesc = scenario?.description || `Free conversation about ${domainName}`;
    return SYSTEM_PROMPTS.conversation(profile.cefr_level, domainName, scenarioDesc, profile.name);
  };

  const initiateConversation = async () => {
    setIsThinking(true);
    const systemMsg: ConversationMessage = {
      id: crypto.randomUUID(),
      role: "system",
      content: getSystemPrompt(),
      timestamp: Date.now(),
    };

    let aiText = "";
    setCurrentAiText("");

    await streamChat(
      [{ role: "system", content: systemMsg.content }],
      {
        onToken: (token) => {
          aiText += token;
          setCurrentAiText(aiText);
          setIsThinking(false);
        },
        onComplete: (fullText) => {
          const aiMsg: ConversationMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: fullText,
            timestamp: Date.now(),
          };
          setMessages([aiMsg]);
          setCurrentAiText("");
          setIsAiSpeaking(true);
          speak(fullText);
          setTurnCount(1);
        },
        onError: (error) => {
          console.error("AI error:", error);
          setIsThinking(false);
          const errorMsg: ConversationMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Hi there! Let's start our conversation. How are you doing today?",
            timestamp: Date.now(),
          };
          setMessages([errorMsg]);
          speak(errorMsg.content);
        },
      },
      apiKey
    );
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: ConversationMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    resetTranscript();
    setIsThinking(true);

    // Build chat history for context
    const chatHistory = [
      { role: "system" as const, content: getSystemPrompt() },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: text.trim() },
    ];

    let aiText = "";
    setCurrentAiText("");

    await streamChat(
      chatHistory,
      {
        onToken: (token) => {
          aiText += token;
          setCurrentAiText(aiText);
          setIsThinking(false);
        },
        onComplete: (fullText) => {
          const aiMsg: ConversationMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: fullText,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          setCurrentAiText("");
          setIsAiSpeaking(true);
          speak(fullText);
          setTurnCount((prev) => prev + 1);
        },
        onError: (error) => {
          console.error("AI error:", error);
          setIsThinking(false);
        },
      },
      apiKey
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isThinking, apiKey]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      // Send the transcript if we have one
      const finalText = transcript.trim();
      if (finalText) {
        setTimeout(() => handleSendMessage(finalText), 300);
      }
    } else {
      stopSpeaking();
      setIsAiSpeaking(false);
      resetTranscript();
      startListening();
    }
  };

  const handleEndSession = async () => {
    setIsEnding(true);
    setIsSessionActive(false);
    stopListening();
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);

    // Generate feedback
    const conversationText = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    let scores: SessionScores = { overall: 70, fluency: 70, grammar: 70, vocabulary: 70, pronunciation: 70, comprehension: 70 };
    let xpEarned = 20;
    let corrections: any[] = [];
    let cefrEstimate = profile.cefr_level;

    try {
      const feedbackPrompt = SYSTEM_PROMPTS.feedback(conversationText, profile.cefr_level);
      const feedbackJson = await chatCompletion(
        [{ role: "user", content: feedbackPrompt }],
        apiKey,
        { maxTokens: 1500, temperature: 0.2 }
      );

      // Parse the JSON from the response
      const jsonMatch = feedbackJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const feedback = JSON.parse(jsonMatch[0]);
        scores = feedback.scores || scores;
        xpEarned = feedback.xp_earned || xpEarned;
        corrections = feedback.corrections || [];
        cefrEstimate = feedback.cefr_estimate || cefrEstimate;
      }
    } catch (e) {
      console.error("Feedback generation error:", e);
    }

    const session: SessionData = {
      id: crypto.randomUUID(),
      user_id: profile.id,
      type: sessionType,
      domain,
      scenario_title: scenario?.title,
      scenario_description: scenario?.description,
      messages,
      started_at: new Date(startTimeRef.current).toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      scores,
      corrections,
      cefr_estimate: cefrEstimate,
      xp_earned: xpEarned,
    };

    onEnd(session);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-bg-card/80 backdrop-blur-sm border-b border-text-muted/10">
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">{formatTime(elapsedSeconds)}</span>
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`text-sm px-2 py-1 rounded ${showSubtitles ? "text-primary" : "text-text-muted"}`}
          >
            CC
          </button>
        </div>
        <button
          onClick={handleEndSession}
          disabled={isEnding}
          className="px-4 py-1.5 rounded-lg bg-error/20 text-error text-sm font-medium hover:bg-error/30 transition-colors disabled:opacity-50"
        >
          {isEnding ? "Analyzing..." : "End Session"}
        </button>
      </div>

      {/* Avatar & conversation area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl mb-3 ${isAiSpeaking || isSpeaking ? "animate-glow" : ""}`}>
            {profile.avatar_gender === "female" ? "👩‍💼" : "👨‍💼"}
          </div>
          {(isAiSpeaking || isSpeaking) && (
            <div className="flex items-center gap-1 h-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full sound-wave-bar"
                  style={{ animationDelay: `${i * 0.15}s`, height: "4px" }}
                />
              ))}
            </div>
          )}
          {scenario && (
            <p className="text-xs text-text-muted mt-2 text-center max-w-[250px]">
              {scenario.title}: {scenario.description}
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-4 max-w-lg mx-auto">
          {messages.filter((m) => m.role !== "system").map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-bg-card text-text-primary rounded-bl-md border border-text-muted/10"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming AI response */}
          {currentAiText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3.5 rounded-2xl rounded-bl-md bg-bg-card text-text-primary text-sm leading-relaxed border border-primary/20">
                {currentAiText}
                <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse" />
              </div>
            </div>
          )}

          {/* Thinking indicator */}
          {isThinking && !currentAiText && (
            <div className="flex justify-start">
              <div className="p-3.5 rounded-2xl rounded-bl-md bg-bg-card border border-text-muted/10">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Subtitles */}
      {showSubtitles && (isAiSpeaking || isSpeaking) && messages.length > 0 && (
        <div className="px-4 py-2 bg-bg-dark/90 backdrop-blur text-center">
          <p className="text-sm text-text-secondary italic">
            {messages[messages.length - 1]?.role === "assistant" ? messages[messages.length - 1]?.content : ""}
          </p>
        </div>
      )}

      {/* User transcript preview */}
      {isListening && (transcript || interimTranscript) && (
        <div className="px-4 py-2 bg-primary/5 border-t border-primary/20">
          <p className="text-sm text-center">
            <span className="text-text-primary">{transcript}</span>
            <span className="text-text-muted"> {interimTranscript}</span>
          </p>
        </div>
      )}

      {/* Bottom controls */}
      <div className="p-6 bg-bg-card/80 backdrop-blur-lg border-t border-text-muted/10">
        <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
          {/* Mic button */}
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-error/30 animate-pulse-ring" />
            )}
            <button
              onClick={handleMicToggle}
              disabled={isThinking || isEnding || !isSupported}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all transform active:scale-95 disabled:opacity-40 ${
                isListening
                  ? "bg-error text-white shadow-lg shadow-error/30"
                  : "bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50"
              }`}
            >
              {isListening ? "⏹" : "🎙️"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-3">
          {!isSupported
            ? "Speech recognition not supported in this browser"
            : isListening
            ? "Listening... Tap to send"
            : isSpeaking || isAiSpeaking
            ? "AI is speaking... Tap mic to interrupt"
            : "Tap the mic to speak"}
        </p>
      </div>
    </div>
  );
}
