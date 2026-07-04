/**
 * LanguageToggle.tsx
 * ─────────────────────────────────────────────────────────────
 * Prominent, frictionless Language Toggle Button.
 * Renders: [ 🇺🇸 EN | 🇪🇬 AR ]
 *
 * Design rules:
 *  • Deep Slate Navy background (#0F172A)
 *  • Active language: Electric Cyan (#00E5FF) pill
 *  • Inactive: muted slate
 *  • Soft rounded corners (rounded-full)
 *  • No sharp edges — ADHD-friendly
 */

import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  /** Optional extra class names for positioning */
  className?: string;
  /** Compact mode — smaller for HUD use */
  compact?: boolean;
}

export function LanguageToggle({ className = "", compact = false }: LanguageToggleProps) {
  const { lang, setLanguage } = useLanguage();

  const base = compact
    ? "flex items-center gap-0.5 rounded-full border border-white/10 bg-[#0F172A]/80 backdrop-blur-sm p-0.5"
    : "flex items-center gap-1 rounded-full border border-white/10 bg-[#0F172A]/80 backdrop-blur-sm p-1 shadow-lg";

  const btnBase = compact
    ? "px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 select-none cursor-pointer"
    : "px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 select-none cursor-pointer";

  const activeClass = "bg-[#00E5FF] text-[#0F172A] shadow-[0_0_10px_rgba(0,229,255,0.5)]";
  const inactiveClass = "text-white/50 hover:text-white/80";

  return (
    <div className={`${base} ${className}`} role="group" aria-label="Language selector">
      <button
        className={`${btnBase} ${lang === "en" ? activeClass : inactiveClass}`}
        onClick={() => setLanguage("en")}
        aria-pressed={lang === "en"}
        aria-label="Switch to English"
      >
        🇺🇸 EN
      </button>
      <button
        className={`${btnBase} ${lang === "ar" ? activeClass : inactiveClass}`}
        onClick={() => setLanguage("ar")}
        aria-pressed={lang === "ar"}
        aria-label="Switch to Arabic"
        style={{ fontFamily: "'Cairo', sans-serif" }}
      >
        🇪🇬 AR
      </button>
    </div>
  );
}
