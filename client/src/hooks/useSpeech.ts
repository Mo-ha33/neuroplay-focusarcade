/**
 * useSpeech — Web Speech API (SpeechSynthesis) hook
 * ──────────────────────────────────────────────────
 * Provides text-to-speech for ADHD / neurodivergent accessibility.
 * Gracefully degrades: if the browser does not support SpeechSynthesis,
 * `isSupported` is false and all functions are no-ops.
 *
 * Strict TypeScript — zero `any` types.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeechOptions {
  /** BCP-47 language tag, defaults to "en-US" */
  lang?: string;
  /** Speech rate 0.1–10, defaults to 0.9 (slightly slower for children) */
  rate?: number;
  /** Pitch 0–2, defaults to 1.1 (slightly higher, friendlier) */
  pitch?: number;
  /** Volume 0–1, defaults to 1 */
  volume?: number;
}

export interface UseSpeechReturn {
  /** Whether the browser supports SpeechSynthesis */
  isSupported: boolean;
  /** Whether speech is currently playing */
  isSpeaking: boolean;
  /** Speak the given text */
  speak: (text: string, options?: SpeechOptions) => void;
  /** Stop any current speech */
  stop: () => void;
  /** Toggle speak/stop for the same text */
  toggle: (text: string, options?: SpeechOptions) => void;
}

const DEFAULT_OPTIONS: Required<SpeechOptions> = {
  lang: "en-US",
  rate: 0.9,
  pitch: 1.1,
  volume: 1,
};

export function useSpeech(): UseSpeechReturn {
  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string>("");

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    currentTextRef.current = "";
  }, [isSupported]);

  const speak = useCallback(
    (text: string, options?: SpeechOptions) => {
      if (!isSupported) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const merged: Required<SpeechOptions> = { ...DEFAULT_OPTIONS, ...options };

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = merged.lang;
      utterance.rate = merged.rate;
      utterance.pitch = merged.pitch;
      utterance.volume = merged.volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        currentTextRef.current = text;
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        currentTextRef.current = "";
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        currentTextRef.current = "";
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  const toggle = useCallback(
    (text: string, options?: SpeechOptions) => {
      if (!isSupported) return;
      if (isSpeaking && currentTextRef.current === text) {
        stop();
      } else {
        speak(text, options);
      }
    },
    [isSupported, isSpeaking, speak, stop]
  );

  return { isSupported, isSpeaking, speak, stop, toggle };
}
