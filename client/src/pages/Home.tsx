/**
 * NeuroPlay AI FocusArcade — Main Landing Page / Homepage
 * =========================================================
 * ADHD-friendly hackathon MVP landing page.
 * Features:
 *   - Glowing hackathon MVP badge with bilingual (EN/AR) sub-headline
 *   - 3-card Curriculum Module Grid: active Solar System Lab + 2 locked roadmap modules
 *   - LTR/RTL bilingual toggle (EN ↔ AR)
 *   - Direct wiring into SpaceLabGame on "Launch Space Lab 🚀"
 *
 * Design system: Deep Slate Navy (#0F172A) bg · Electric Cyan (#00E5FF) ·
 *                Playful Purple (#7C4DFF) · Energetic Lime Green (#AEEA00)
 *                Comfortaa / Poppins fonts · zero sharp edges
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SpaceLabGame } from "@/components/game/SpaceLabGame";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "en" | "ar";

interface ModuleCard {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  statusEn: string;
  statusAr: string;
  btnEn: string;
  btnAr: string;
  tooltipEn?: string;
  tooltipAr?: string;
  active: boolean;
  borderColor: string;
  glowColor: string;
  statusColor: string;
  opacity: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODULES: ModuleCard[] = [
  {
    id: "solar-system",
    icon: "🪐",
    titleEn: "Science: Solar System Lab",
    titleAr: "علوم: معمل المجموعة الشمسية",
    descEn: "Drag the planets to their orbits! Can you place all 8 correctly?",
    descAr: "اسحب الكواكب إلى مداراتها! هل تستطيع وضع الـ 8 بشكل صحيح؟",
    statusEn: "⚡ ACTIVE LAB — READY TO PLAY",
    statusAr: "⚡ المعمل النشط — جاهز للعب",
    btnEn: "Launch Space Lab 🚀",
    btnAr: "🚀 انطلق إلى معمل الفضاء",
    active: true,
    borderColor: "#00E5FF",
    glowColor: "rgba(0,229,255,0.35)",
    statusColor: "#00E5FF",
    opacity: 1,
  },
  {
    id: "fractions",
    icon: "🍕",
    titleEn: "Visual Math: Fractions & Logic",
    titleAr: "رياضيات بصرية: الكسور والمنطق",
    descEn: "Slice, match, and conquer fractions through visual puzzles.",
    descAr: "قطّع وطابق واكسب الكسور من خلال ألغاز بصرية.",
    statusEn: "🔒 LOCKED — PHASE 2 SCALING",
    statusAr: "🔒 مقفل — المرحلة الثانية",
    btnEn: "Coming in Phase 2",
    btnAr: "قادم في المرحلة الثانية",
    tooltipEn: "Scheduled for Q3 deployment after STEM clinical validation.",
    tooltipAr: "مجدول للنشر في الربع الثالث بعد التحقق السريري من STEM.",
    active: false,
    borderColor: "#7C4DFF",
    glowColor: "rgba(124,77,255,0.2)",
    statusColor: "#7C4DFF",
    opacity: 0.7,
  },
  {
    id: "history",
    icon: "⏳",
    titleEn: "Interactive History: Timelines",
    titleAr: "تاريخ تفاعلي: الجداول الزمنية",
    descEn: "Build civilisation timelines with drag-and-drop story cards.",
    descAr: "ابنِ جداول زمنية للحضارات باستخدام بطاقات القصص.",
    statusEn: "🔒 LOCKED — PHASE 3 SCALING",
    statusAr: "🔒 مقفل — المرحلة الثالثة",
    btnEn: "Coming in Phase 3",
    btnAr: "قادم في المرحلة الثالثة",
    tooltipEn: "Autonomous timeline generator coming soon.",
    tooltipAr: "مولّد الجداول الزمنية الذاتي قادم قريباً.",
    active: false,
    borderColor: "#475569",
    glowColor: "rgba(71,85,105,0.15)",
    statusColor: "#64748B",
    opacity: 0.7,
  },
];

// ─── StarField ────────────────────────────────────────────────────────────────

/** Floating star particles rendered on the hero background */
function StarField() {
  const stars = [
    { id: 0, top: "8%", left: "12%", size: 2, delay: "0s", dur: "3s" },
    { id: 1, top: "15%", left: "78%", size: 3, delay: "0.5s", dur: "2.5s" },
    { id: 2, top: "22%", left: "45%", size: 1.5, delay: "1s", dur: "4s" },
    { id: 3, top: "35%", left: "90%", size: 2, delay: "0.3s", dur: "3.5s" },
    { id: 4, top: "42%", left: "5%", size: 2.5, delay: "1.5s", dur: "2s" },
    { id: 5, top: "55%", left: "60%", size: 1, delay: "0.8s", dur: "4.5s" },
    { id: 6, top: "65%", left: "28%", size: 3, delay: "0.2s", dur: "3s" },
    { id: 7, top: "72%", left: "85%", size: 1.5, delay: "1.2s", dur: "2.8s" },
    { id: 8, top: "80%", left: "15%", size: 2, delay: "0.6s", dur: "3.2s" },
    { id: 9, top: "88%", left: "50%", size: 2.5, delay: "1.8s", dur: "2.2s" },
    { id: 10, top: "5%", left: "35%", size: 1, delay: "0.4s", dur: "5s" },
    { id: 11, top: "18%", left: "62%", size: 2, delay: "1.1s", dur: "3.8s" },
    { id: 12, top: "30%", left: "20%", size: 1.5, delay: "0.9s", dur: "4.2s" },
    { id: 13, top: "48%", left: "75%", size: 3, delay: "0.7s", dur: "2.6s" },
    { id: 14, top: "60%", left: "40%", size: 1, delay: "1.4s", dur: "3.6s" },
    { id: 15, top: "75%", left: "95%", size: 2, delay: "0.1s", dur: "4.8s" },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {stars.map(s => (
        <div
          key={s.id}
          className="animate-twinkle"
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#E2E8F0",
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
    </div>
  );
}

// ─── ModuleCardItem ───────────────────────────────────────────────────────────

/** A single curriculum module card */
function ModuleCardItem({
  card,
  lang,
  onLaunch,
}: {
  card: ModuleCard;
  lang: Lang;
  onLaunch: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const title = lang === "ar" ? card.titleAr : card.titleEn;
  const desc = lang === "ar" ? card.descAr : card.descEn;
  const status = lang === "ar" ? card.statusAr : card.statusEn;
  const btn = lang === "ar" ? card.btnAr : card.btnEn;
  const tooltip = lang === "ar" ? card.tooltipAr : card.tooltipEn;

  const cardBoxShadow = hovered && card.active
    ? `0 0 40px ${card.glowColor}, 0 0 80px ${card.glowColor}`
    : card.active
    ? `0 0 20px ${card.glowColor}`
    : "none";

  const cardBorder = card.active
    ? card.borderColor
    : `${card.borderColor}66`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowTooltip(false); }}
      style={{
        position: "relative",
        background: card.active
          ? "linear-gradient(135deg, rgba(0,229,255,0.08), rgba(124,77,255,0.08))"
          : "rgba(30,41,59,0.6)",
        border: `2px solid ${cardBorder}`,
        borderRadius: 24,
        padding: "28px 24px",
        textAlign: "center",
        opacity: card.opacity,
        transition: "all 0.3s ease",
        boxShadow: cardBoxShadow,
        transform: hovered && card.active ? "translateY(-4px)" : "translateY(0)",
        animation: card.active ? "cardPulse 3s ease-in-out infinite" : undefined,
        cursor: card.active ? "pointer" : "default",
        flex: "1 1 280px",
        minWidth: 260,
        maxWidth: 360,
      }}
      onClick={() => card.active && onLaunch(card.id)}
    >
      {/* Planet icon */}
      <div
        style={{
          fontSize: 56,
          marginBottom: 14,
          display: "inline-block",
          animation: card.active ? "float 3s ease-in-out infinite" : undefined,
          filter: card.active ? `drop-shadow(0 0 12px ${card.borderColor})` : "none",
        }}
      >
        {card.icon}
      </div>

      {/* Title */}
      <h3
        style={{
          color: card.active ? card.borderColor : "#94A3B8",
          fontSize: 17,
          fontWeight: 700,
          margin: "0 0 10px",
          lineHeight: 1.3,
          fontFamily: "'Comfortaa', sans-serif",
          direction: lang === "ar" ? "rtl" : "ltr",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          color: "#64748B",
          fontSize: 13,
          margin: "0 0 18px",
          lineHeight: 1.6,
          direction: lang === "ar" ? "rtl" : "ltr",
        }}
      >
        {desc}
      </p>

      {/* Status badge */}
      <div
        style={{
          display: "inline-block",
          background: `${card.statusColor}18`,
          border: `1px solid ${card.statusColor}55`,
          borderRadius: 100,
          padding: "5px 14px",
          color: card.statusColor,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          marginBottom: 20,
          textTransform: "uppercase",
        }}
      >
        {status}
      </div>

      {/* Action button */}
      <div style={{ position: "relative" }}>
        <button
          disabled={!card.active}
          onClick={e => {
            e.stopPropagation();
            if (card.active) onLaunch(card.id);
          }}
          onMouseEnter={() => !card.active && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          style={{
            width: "100%",
            background: card.active
              ? "linear-gradient(135deg, #00E5FF, #7C4DFF)"
              : "rgba(255,255,255,0.05)",
            border: card.active ? "none" : `1px solid ${card.borderColor}44`,
            borderRadius: 100,
            color: card.active ? "#0F172A" : "#475569",
            fontSize: 15,
            fontWeight: 800,
            padding: "14px 20px",
            cursor: card.active ? "pointer" : "not-allowed",
            fontFamily: "'Comfortaa', sans-serif",
            transition: "all 0.2s ease",
            boxShadow: card.active ? "0 0 24px rgba(0,229,255,0.4)" : "none",
            transform: hovered && card.active ? "scale(1.03)" : "scale(1)",
          }}
        >
          {btn}
        </button>

        {/* Tooltip for locked cards */}
        {showTooltip && tooltip && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "10px 14px",
              color: "#94A3B8",
              fontSize: 12,
              lineHeight: 1.5,
              width: 240,
              zIndex: 50,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              direction: lang === "ar" ? "rtl" : "ltr",
              textAlign: lang === "ar" ? "right" : "left",
            }}
          >
            {tooltip}
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: 10,
                height: 10,
                background: "#1E293B",
                borderRight: "1px solid rgba(255,255,255,0.12)",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [, navigate] = useLocation();
  const [lang, setLang] = useState<Lang>("en");
  const [launchGame, setLaunchGame] = useState(false);

  // Persist language preference
  useEffect(() => {
    const saved = localStorage.getItem("neuroplay-lang") as Lang | null;
    if (saved === "en" || saved === "ar") setLang(saved);
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "ar" : "en";
    setLang(next);
    localStorage.setItem("neuroplay-lang", next);
  };

  const handleLaunch = (moduleId: string) => {
    if (moduleId === "solar-system") {
      setLaunchGame(true);
    }
  };

  if (launchGame) {
    return <SpaceLabGame />;
  }

  const isRtl = lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        fontFamily: "'Comfortaa', 'Poppins', sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* ── Top Nav Bar ─────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(15,23,42,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,229,255,0.12)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🧠</span>
          <div>
            <div
              style={{
                color: "#00E5FF",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              NeuroPlay AI
            </div>
            <div style={{ color: "#475569", fontSize: 10, marginTop: 1 }}>
              FocusArcade
            </div>
          </div>
        </div>

        {/* Nav actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={toggleLang}
            aria-label={isRtl ? "Switch to English" : "التبديل إلى العربية"}
            style={{
              background: "rgba(124,77,255,0.12)",
              border: "1px solid rgba(124,77,255,0.35)",
              borderRadius: 100,
              color: "#7C4DFF",
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "'Comfortaa', sans-serif",
            }}
          >
            {isRtl ? "🌐 EN" : "🌐 عربي"}
          </button>

          <button
            onClick={() => navigate("/login")}
            style={{
              background: "linear-gradient(135deg, #00E5FF, #7C4DFF)",
              border: "none",
              borderRadius: 100,
              color: "#0F172A",
              fontSize: 12,
              fontWeight: 800,
              padding: "8px 18px",
              cursor: "pointer",
              fontFamily: "'Comfortaa', sans-serif",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isRtl ? "تسجيل الدخول 🔑" : "Login 🔑"}
          </button>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          padding: "72px 24px 56px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <StarField />

        {/* Radial glow backdrop */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, rgba(124,77,255,0.06) 50%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
          {/* ── Hackathon MVP Badge ──────────────────────────────────────────── */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,229,255,0.08)",
              border: "1.5px solid rgba(0,229,255,0.5)",
              borderRadius: 100,
              padding: "8px 20px",
              marginBottom: 28,
              animation: "badgePulse 2.5s ease-in-out infinite",
              boxShadow: "0 0 20px rgba(0,229,255,0.25), 0 0 40px rgba(0,229,255,0.1)",
            }}
          >
            <span style={{ fontSize: 16 }}>🚀</span>
            <span
              style={{
                color: "#00E5FF",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textShadow: "0 0 12px rgba(0,229,255,0.8)",
              }}
            >
              {isRtl
                ? "MVP نشط للهاكاثون: معمل علوم STEM"
                : "Active Hackathon MVP: STEM Science Lab"}
            </span>
          </div>

          {/* ── Main Title ──────────────────────────────────────────────────── */}
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 0 20px",
              background: "linear-gradient(135deg, #00E5FF 30%, #7C4DFF 70%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "'Comfortaa', sans-serif",
            }}
          >
            NeuroPlay AI FocusArcade
          </h1>

          {/* ── Bilingual Sub-headline ──────────────────────────────────────── */}
          <div style={{ maxWidth: 600, margin: "0 auto 36px" }}>
            {/* English */}
            <p
              style={{
                color: "#94A3B8",
                fontSize: 16,
                lineHeight: 1.7,
                margin: "0 0 12px",
                direction: "ltr",
                textAlign: "center",
                opacity: isRtl ? 0.6 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              <em>
                Transforming complex science curriculums into tactile,
                drag-and-drop micro-quests. Currently exploring:{" "}
                <strong style={{ color: "#00E5FF" }}>The Solar System.</strong>
              </em>
            </p>

            {/* Divider */}
            <div
              style={{
                width: 40,
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(124,77,255,0.5), transparent)",
                margin: "0 auto 12px",
                borderRadius: 2,
              }}
            />

            {/* Arabic */}
            <p
              style={{
                color: "#94A3B8",
                fontSize: 15,
                lineHeight: 1.8,
                margin: 0,
                direction: "rtl",
                textAlign: "center",
                fontFamily: "'Cairo', 'Comfortaa', sans-serif",
                opacity: isRtl ? 1 : 0.6,
                transition: "opacity 0.3s ease",
              }}
            >
              <em>
                تحويل مناهج العلوم المعقدة إلى تجارب فضاء تفاعلية مخصصة لأدمغة
                الـ ADHD. الوحدة النشطة حالياً:{" "}
                <strong style={{ color: "#00E5FF" }}>معمل المجموعة الشمسية.</strong>
              </em>
            </p>
          </div>

          {/* ── Quick-launch CTA ─────────────────────────────────────────────── */}
          <button
            onClick={() => setLaunchGame(true)}
            style={{
              background: "linear-gradient(135deg, #00E5FF, #7C4DFF)",
              border: "none",
              borderRadius: 100,
              color: "#0F172A",
              fontSize: 18,
              fontWeight: 800,
              padding: "18px 48px",
              cursor: "pointer",
              boxShadow: "0 0 32px rgba(0,229,255,0.5), 0 0 64px rgba(0,229,255,0.2)",
              fontFamily: "'Comfortaa', sans-serif",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              animation: "heroCtaPulse 3s ease-in-out infinite",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.boxShadow = "0 0 48px rgba(0,229,255,0.7), 0 0 80px rgba(0,229,255,0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 32px rgba(0,229,255,0.5), 0 0 64px rgba(0,229,255,0.2)";
            }}
          >
            {isRtl ? "🚀 ابدأ المهمة الآن" : "🚀 Start Mission Now"}
          </button>

          <p style={{ color: "#334155", fontSize: 12, marginTop: 20, letterSpacing: "0.05em" }}>
            {isRtl ? "↓ استكشف خارطة المناهج ↓" : "↓ Explore the Curriculum Map ↓"}
          </p>
        </div>
      </section>

      {/* ── Section Divider ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 800, margin: "0 auto 48px", padding: "0 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3))",
            }}
          />
          <span
            style={{
              color: "#475569",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {isRtl ? "🗺️ خارطة المناهج" : "🗺️ Curriculum Map"}
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "linear-gradient(90deg, rgba(0,229,255,0.3), transparent)",
            }}
          />
        </div>
      </div>

      {/* ── Module Grid ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {MODULES.map(card => (
            <ModuleCardItem
              key={card.id}
              card={card}
              lang={lang}
              onLaunch={handleLaunch}
            />
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#334155",
            fontSize: 12,
            marginTop: 36,
            lineHeight: 1.6,
            direction: isRtl ? "rtl" : "ltr",
          }}
        >
          {isRtl
            ? "🔬 يتم التحقق السريري من الوحدات المقفلة قبل النشر · NeuroPlay AI FocusArcade · ADHD-Friendly Learning"
            : "🔬 Locked modules undergo clinical validation before deployment · NeuroPlay AI FocusArcade · ADHD-Friendly Learning"}
        </p>
      </section>

      {/* ── Inline keyframes ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes badgePulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0,229,255,0.25), 0 0 40px rgba(0,229,255,0.1);
            border-color: rgba(0,229,255,0.5);
          }
          50% {
            box-shadow: 0 0 32px rgba(0,229,255,0.55), 0 0 64px rgba(0,229,255,0.25);
            border-color: rgba(0,229,255,0.9);
          }
        }
        @keyframes cardPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0,229,255,0.2); }
          50% { box-shadow: 0 0 40px rgba(0,229,255,0.45), 0 0 80px rgba(0,229,255,0.15); }
        }
        @keyframes heroCtaPulse {
          0%, 100% { box-shadow: 0 0 32px rgba(0,229,255,0.5), 0 0 64px rgba(0,229,255,0.2); }
          50% { box-shadow: 0 0 48px rgba(0,229,255,0.7), 0 0 96px rgba(0,229,255,0.35); }
        }
      `}</style>
    </div>
  );
}
