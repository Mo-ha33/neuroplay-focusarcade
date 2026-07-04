/**
 * LanguageContext.tsx
 * ─────────────────────────────────────────────────────────────
 * Bilingual EN / AR engine for NeuroPlay AI FocusArcade.
 *
 * Features:
 *  • Stores active language in localStorage for persistence
 *  • Dynamically applies dir="rtl" | dir="ltr" to <html>
 *  • Injects Cairo (Arabic) or Comfortaa (English) font class on <body>
 *  • Exposes t(key) translation helper and toggleLanguage()
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { en, type TranslationKey } from "@/locales/en";
import { ar } from "@/locales/ar";

// ── Types ──────────────────────────────────────────────────────
export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

interface LanguageContextValue {
  lang: Language;
  dir: Direction;
  isRTL: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

// ── Context ────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("neuroplay_lang");
      return stored === "ar" ? "ar" : "en";
    } catch {
      return "en";
    }
  });

  const dir: Direction = lang === "ar" ? "rtl" : "ltr";
  const isRTL = lang === "ar";

  // Apply dir + font class to <html> and <body> on every language change
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Direction
    html.setAttribute("dir", dir);
    html.setAttribute("lang", lang);

    // Font class — Cairo for Arabic, Comfortaa for English
    if (lang === "ar") {
      body.classList.add("lang-ar");
      body.classList.remove("lang-en");
    } else {
      body.classList.add("lang-en");
      body.classList.remove("lang-ar");
    }

    // Persist
    try {
      localStorage.setItem("neuroplay_lang", lang);
    } catch {
      // ignore
    }
  }, [lang, dir]);

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLangState(prev => (prev === "en" ? "ar" : "en"));
  }, []);

  // Translation function — falls back to English key if Arabic string is missing
  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = lang === "ar" ? ar : en;
      return (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, dir, isRTL, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}
