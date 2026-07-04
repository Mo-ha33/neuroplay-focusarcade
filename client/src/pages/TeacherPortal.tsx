// @ts-nocheck
/**
 * NeuroPlay AI FocusArcade — Teacher Portal
 * ==========================================
 * Classroom Command Center: live student progress, engagement metrics,
 * brain break analytics, and weekly trend overview.
 */

import { useLocation } from "wouter";
import { useRbac } from "@/contexts/RbacContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { trpc } from "@/lib/trpc";
import { TeacherUploadZone } from "@/components/uploads";

const STATUS_CONFIG_EN = {
  active:         { color: "#00E5FF", label: "Active",        dot: "🟢" },
  star:           { color: "#FFD700", label: "Star Student",  dot: "⭐" },
  "needs-support":{ color: "#FF6B6B", label: "Needs Support", dot: "🔴" },
};
const STATUS_CONFIG_AR = {
  active:         { color: "#00E5FF", label: "نشط",           dot: "🟢" },
  star:           { color: "#FFD700", label: "طالب متميز",    dot: "⭐" },
  "needs-support":{ color: "#FF6B6B", label: "يحتاج دعم",    dot: "🔴" },
};

export default function TeacherPortal() {
  const { user, logout } = useRbac();
  const [, navigate] = useLocation();
  const { t, isRTL, lang } = useLanguage();
  const fontFamily = lang === "ar" ? "'Cairo', 'Almarai', sans-serif" : "'Comfortaa', 'Poppins', sans-serif";
  const STATUS_CONFIG = lang === "ar" ? STATUS_CONFIG_AR : STATUS_CONFIG_EN;

  const statsQuery = trpc.teacher.getClassroomStats.useQuery();
  const studentsQuery = trpc.teacher.getStudentList.useQuery();
  const trendQuery = trpc.teacher.getWeeklyTrend.useQuery();

  if (!user || user.role !== "teacher") {
    navigate("/login");
    return null;
  }

  const stats = statsQuery.data;
  const students = studentsQuery.data ?? [];
  const trend = trendQuery.data ?? [];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        fontFamily,
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(30,41,59,0.95)",
          borderBottom: "1px solid rgba(124,77,255,0.2)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: isRTL ? "row-reverse" : "row" }}>
          <span style={{ fontSize: 28 }}>👩‍🏫</span>
          <div>
            <div style={{ color: "#7C4DFF", fontWeight: 700, fontSize: 15, fontFamily }}>{user.name}</div>
            <div style={{ color: "#64748B", fontSize: 11, fontFamily }}>
              {user.classroomName} · {lang === "ar" ? "الكود:" : "Code:"} <span style={{ color: "#00E5FF" }}>{user.classroomJoinCode}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexDirection: isRTL ? "row-reverse" : "row" }}>
          <LanguageToggle compact />
          <div style={{ color: "#94A3B8", fontSize: 12, fontFamily }}>
            🟢 <span className="numeric-ltr">{stats?.activeToday ?? "—"}</span> {lang === "ar" ? "نشط اليوم" : "active today"}
          </div>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#64748B",
              fontSize: 11,
              padding: "5px 10px",
              cursor: "pointer",
              fontFamily,
            }}
          >
            {lang === "ar" ? "خروج" : "Logout"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        <h1 style={{ color: "#E2E8F0", fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily }}>
          🏫 {t("teacher_title")}
        </h1>

        {/* AI Curriculum Ingestion Engine */}
        <TeacherUploadZone />

        {/* Stats Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { icon: "👥", label: lang === "ar" ? "الطلاب" : "Students",       value: stats?.studentCount ?? "—",      color: "#00E5FF" },
            { icon: "📊", label: lang === "ar" ? "متوسط الدرجات" : "Avg Score",  value: stats ? `${stats.avgScore}%` : "—", color: "#7C4DFF" },
            { icon: "🏆", label: lang === "ar" ? "المتميزون" : "Top Performers", value: stats?.topPerformers ?? "—",     color: "#FFD700" },
            { icon: "🔴", label: lang === "ar" ? "يحتاج دعم" : "Needs Support",  value: stats?.needsSupport ?? "—",      color: "#FF6B6B" },
            { icon: "🧠", label: lang === "ar" ? "استراحات الدماغ" : "Brain Breaks", value: stats?.totalBrainBreaks ?? "—", color: "#AEEA00" },
            { icon: "⚡", label: lang === "ar" ? "إجمالي XP" : "Total XP",       value: stats ? `${(stats.totalXPAwarded / 1000).toFixed(1)}k` : "—", color: "#AEEA00" },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: "#1E293B",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "16px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 20, fontFamily }} className="numeric-ltr">{s.value}</div>
              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2, fontFamily }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Weekly Trend Bar Chart */}
        <div
          style={{
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: "20px 20px 16px",
            marginBottom: 24,
          }}
        >
          <h3 style={{ color: "#E2E8F0", fontSize: 14, fontWeight: 600, margin: "0 0 16px", fontFamily }}>
            📈 {lang === "ar" ? "اتجاه المشاركة الأسبوعي" : "Weekly Engagement Trend"}
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {trend.map(day => {
              const maxSessions = Math.max(...trend.map(d => d.sessions));
              const barHeight = Math.round((day.sessions / maxSessions) * 70);
              return (
                <div key={day.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ color: "#64748B", fontSize: 10 }}>{day.sessions}</div>
                  <div
                    style={{
                      width: "100%",
                      height: barHeight,
                      background: "linear-gradient(180deg, #7C4DFF, #00E5FF)",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.5s ease",
                    }}
                  />
                  <div style={{ color: "#64748B", fontSize: 10 }}>{day.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student List */}
        <div
          style={{
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 style={{ color: "#E2E8F0", fontSize: 14, fontWeight: 600, margin: 0, fontFamily }}>
              👨‍🎓 {lang === "ar" ? "قائمة الطلاب — المشاركة المباشرة" : "Student Roster — Live Engagement"}
            </h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  {(lang === "ar"
                    ? ["الطالب", "الحالة", "الدرجة", "XP", "النجوم", "الجلسات", "استراحات الدماغ", "آخر نشاط"]
                    : ["Student", "Status", "Score", "XP", "Stars", "Sessions", "Brain Breaks", "Last Active"]
                  ).map(h => (
                    <th key={h} style={{ color: "#64748B", fontWeight: 600, padding: "10px 14px", textAlign: "left", fontSize: 11, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const sc = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;
                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                      }}
                    >
                      <td style={{ padding: "10px 14px", color: "#E2E8F0", fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ color: sc.color, fontSize: 12 }}>{sc.dot} {sc.label}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: s.score >= 85 ? "#AEEA00" : s.score >= 70 ? "#00E5FF" : "#FF6B6B", fontWeight: 700 }}>
                        {s.score}%
                      </td>
                      <td style={{ padding: "10px 14px", color: "#AEEA00" }}>⚡ {s.xp}</td>
                      <td style={{ padding: "10px 14px", color: "#FFD700" }}>⭐ {s.stars}</td>
                      <td style={{ padding: "10px 14px", color: "#94A3B8" }}>{s.sessions}</td>
                      <td style={{ padding: "10px 14px", color: s.brainBreaks >= 5 ? "#FF6B6B" : "#94A3B8" }}>
                        🧠 {s.brainBreaks}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#64748B", fontSize: 11 }}>{s.lastActive}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
