"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { Accent, AvatarGender, SpeechSpeed } from "@/types";

interface UseTTSOptions {
  accent?: Accent;
  gender?: AvatarGender;
  speed?: SpeechSpeed;
  onStart?: () => void;
  onEnd?: () => void;
}

const SPEED_MAP: Record<SpeechSpeed, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.2,
};

export function useTextToSpeech(options: UseTTSOptions = {}) {
  const { accent = "us", gender = "female", speed = "normal", onStart, onEnd } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const findBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    const langMap: Record<Accent, string> = { us: "en-US", uk: "en-GB", au: "en-AU" };
    const targetLang = langMap[accent];

    // Prefer natural/premium voices
    const langVoices = voices.filter((v) => v.lang.startsWith(targetLang.split("-")[0]));
    const exactMatch = langVoices.filter((v) => v.lang === targetLang);

    // Try to match gender by name heuristics
    const genderKeywords = gender === "female"
      ? ["female", "woman", "zira", "samantha", "karen", "moira", "fiona", "google uk english female", "google us english"]
      : ["male", "man", "david", "daniel", "james", "google uk english male"];

    for (const voice of exactMatch.length > 0 ? exactMatch : langVoices) {
      const nameLower = voice.name.toLowerCase();
      if (genderKeywords.some((k) => nameLower.includes(k))) {
        return voice;
      }
    }

    return exactMatch[0] || langVoices[0] || voices[0];
  }, [voices, accent, gender]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = findBestVoice();
      if (voice) utterance.voice = voice;

      utterance.rate = SPEED_MAP[speed];
      utterance.pitch = gender === "female" ? 1.1 : 0.9;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, findBestVoice, speed, gender, onStart, onEnd]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported, voices };
}
