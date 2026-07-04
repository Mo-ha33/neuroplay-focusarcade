// @ts-nocheck
/**
 * NeuroPlay AI FocusArcade — Admin Portal
 * ========================================
 * Galactic Overseer: system-wide analytics, user management,
 * school overview, health monitoring, and activity log.
 */

import { useLocation } from "wouter";
import { useRbac } from "@/contexts/RbacContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { trpc } from "@/lib/trpc";

const ROLE_BADGE: Record<string, { color: string; bg: string }> = {
  admin:   { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" },
  teacher: { color: "#7C4DFF", bg: "rgba(124,77,255,0.12)" },
  student: { color: "#00E5FF", bg: "rgba(0,229,255,0.12)" },
  parent:  { color: "#AEEA00", bg: "rgba(174,234,0,0.12)" },
};

const STATUS_DOT: Record<string, string> = {
  active:         "🟢",
  star:           "⭐",
  "needs-support":"🔴",
};

export default function AdminPortal() {
  const { user, logout } = useRbac();
  const [, navigate] = useLocation();
  const { t, isRTL, lang } = useLanguage();
  const fontFamily = lang === "ar" ? "'Cairo', 'Almarai', sans-serif" : "'Comfortaa', 'Poppins', sans-serif";

  const overviewQuery = trpc.admin.getSystemOverview.useQuery();
  const usersQuery = trpc.admin.getAllUsers.useQuery();
  const schoolsQuery = trpc.admin.getAllSchools.useQuery();
  const activityQuery = trpc.admin.getRecentActivity.useQuery();
  const healthQuery = trpc.admin.getSystemHealth.useQuery();
  const trendQuery = trpc.admin.getDailyTrend.useQuery();

  if (!user || user.role !== "admin") {
    navigate("/login");
    return null;
  }

  const ov = overviewQuery.data;
  const users = usersQuery.data ?? [];
  const schools = schoolsQuery.data ?? [];
  const activity = activityQuery.data ?? [];
  const health = healthQuery.data;
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
          borderBottom: "1px solid rgba(255,107,107,0.2)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: isRTL ? "row-reverse" : "row" }}>
          <span style={{ fontSize: 28 }}>🛡️</span>
          <div>
            <div style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 15, fontFamily }}>{user.name}</div>
            <div style={{ color: "#64748B", fontSize: 11, fontFamily }}>{lang === "ar" ? "مشرف النظام · نيوروبلاي AI" : "System Administrator · NeuroPlay AI"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexDirection: isRTL ? "row-reverse" : "row" }}>
          <LanguageToggle compact />
          <div style={{
            background: "rgba(174,234,0,0.1)",
            border: "1px solid rgba(174,234,0,0.3)",
            borderRadius: 8,
            padding: "4px 10px",
            color: "#AEEA00",
            fontSize: 11,
            fontWeight: 600,
          }}>
            ✅ System Health: {ov?.systemHealth ?? "—"}%
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
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        <h1 style={{ color: "#E2E8F0", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
          🌌 Galactic Overseer — System Command
        </h1>

        {/* System KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { icon: "👥", label: "Total Users",      value: ov?.totalUsers ?? "—",                          color: "#00E5FF" },
            { icon: "🎮", label: "Total Sessions",   value: ov?.totalSessions ?? "—",                       color: "#7C4DFF" },
            { icon: "🏫", label: "Active Schools",   value: ov?.activeSchools ?? "—",                       color: "#AEEA00" },
            { icon: "🟢", label: "Live Sessions",    value: ov?.activeSessionsNow ?? "—",                   color: "#AEEA00" },
            { icon: "⚡", label: "XP Awarded",       value: ov ? `${((ov.totalXPAwarded ?? 0) / 1000).toFixed(1)}k` : "—", color: "#FFD700" },
            { icon: "🧠", label: "Brain Breaks",     value: ov?.totalBrainBreaks ?? "—",                    color: "#FF6B6B" },
            { icon: "📊", label: "Avg Score",        value: ov ? `${ov.avgSystemScore}%` : "—",             color: "#00E5FF" },
            { icon: "📋", label: "Sheets Rows",      value: ov?.googleSheetsRows ?? "—",                    color: "#AEEA00" },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: "#1E293B",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "14px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 18 }}>{s.value}</div>
              <div style={{ color: "#64748B", fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Daily Trend */}
          <div
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: "18px 16px",
            }}
          >
            <h3 style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600, margin: "0 0 14px" }}>
              📈 Daily Active Users (7 Days)
            </h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
              {trend.map(day => {
                const maxStudents = Math.max(...trend.map(d => d.students));
                const barH = Math.round((day.students / maxStudents) * 60);
                return (
                  <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ color: "#64748B", fontSize: 9 }}>{day.students}</div>
                    <div
                      style={{
                        width: "100%",
                        height: barH,
                        background: "linear-gradient(180deg, #FF6B6B, #7C4DFF)",
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                    <div style={{ color: "#64748B", fontSize: 9 }}>{day.date.slice(-5)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health */}
          <div
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: "18px 16px",
            }}
          >
            <h3 style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600, margin: "0 0 14px" }}>
              🔧 Service Health
            </h3>
            {health && Object.entries(health).map(([svc, info]) => (
              <div
                key={svc}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ color: "#94A3B8", fontSize: 12, textTransform: "capitalize" }}>{svc}</span>
                <span style={{ color: info.status === "healthy" ? "#AEEA00" : "#FF6B6B", fontSize: 11, fontWeight: 600 }}>
                  {info.status === "healthy" ? "✅ Healthy" : "❌ Down"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Schools */}
          <div
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: "18px 16px",
            }}
          >
            <h3 style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600, margin: "0 0 14px" }}>
              🏫 Active Schools
            </h3>
            {schools.map(s => (
              <div
                key={s.id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: "#AEEA00", fontSize: 12, fontWeight: 700 }}>{s.avgScore}% avg</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ color: "#64748B", fontSize: 11 }}>👥 {s.students} students</span>
                  <span style={{ color: "#64748B", fontSize: 11 }}>👩‍🏫 {s.teachers} teachers</span>
                  <span style={{ color: "#AEEA00", fontSize: 11 }}>🟢 {s.activeSessions} live</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Log */}
          <div
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: "18px 16px",
            }}
          >
            <h3 style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600, margin: "0 0 14px" }}>
              📡 Live Activity Feed
            </h3>
            {activity.map((a, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.5 }}>{a.event}</div>
                <div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div
          style={{
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600, margin: 0 }}>
              👤 All Users
            </h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                {["Name", "Role", "Status", "Last Seen"].map(h => (
                  <th key={h} style={{ color: "#64748B", fontWeight: 600, padding: "10px 16px", textAlign: "left", fontSize: 11 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const rb = ROLE_BADGE[u.role] ?? ROLE_BADGE.student;
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                    }}
                  >
                    <td style={{ padding: "10px 16px", color: "#E2E8F0", fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        background: rb.bg,
                        color: rb.color,
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", color: "#94A3B8", fontSize: 12 }}>
                      {STATUS_DOT[u.status] ?? "⚪"} {u.status}
                    </td>
                    <td style={{ padding: "10px 16px", color: "#64748B", fontSize: 11 }}>{u.lastSeen}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
