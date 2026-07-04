/**
 * NeuroPlay AI FocusArcade — Admin Router
 * ========================================
 * Provides system-wide analytics, user management, and health monitoring
 * for the Admin Portal (Galactic Overseer).
 */

import { publicProcedure, router } from "../_core/trpc";
import { DEMO_USERS } from "./rbacRouter";

const MOCK_SCHOOLS = [
  { id: 1, name: "Starlight Elementary",  students: 18, teachers: 2, avgScore: 79, activeSessions: 4, status: "active" },
  { id: 2, name: "Cosmos Academy",        students: 14, teachers: 1, avgScore: 83, activeSessions: 2, status: "active" },
  { id: 3, name: "Galaxy STEM School",    students: 10, teachers: 1, avgScore: 71, activeSessions: 1, status: "active" },
];

const MOCK_RECENT_ACTIVITY = [
  { time: "2 min ago",  event: "Isabella Thomas completed Solar System Lab — Score: 97% 🏆" },
  { time: "8 min ago",  event: "New student joined: Mason Taylor (Starlight Elementary)" },
  { time: "15 min ago", event: "Brain Break triggered for Liam Johnson (3rd time today)" },
  { time: "22 min ago", event: "Dopamine Report sent to James Carter for Aiden Carter" },
  { time: "1 hr ago",   event: "Teacher Ms. Martinez assigned new quiz to Classroom A" },
  { time: "2 hr ago",   event: "System health check passed — all services nominal ✅" },
];

export const adminRouter = router({
  /** Get system-wide overview statistics. */
  getSystemOverview: publicProcedure.query(() => {
    const admin = DEMO_USERS.admin;
    return {
      totalUsers: admin.totalUsers,
      totalSessions: admin.totalSessions,
      activeSchools: admin.activeSchools,
      systemHealth: admin.systemHealth,
      totalXPAwarded: admin.totalXPAwarded,
      activeSessionsNow: 7,
      avgSystemScore: 76,
      totalBrainBreaks: 89,
      dopamineReportsSent: 34,
      googleSheetsRows: 187,
      uptime: "99.8%",
      lastDeployment: "2026-07-04T08:00:00Z",
    };
  }),

  /** Get all schools with their stats. */
  getAllSchools: publicProcedure.query(() => {
    return MOCK_SCHOOLS;
  }),

  /** Get all users with their roles (paginated mock). */
  getAllUsers: publicProcedure.query(() => {
    return [
      { id: "demo-admin-001",   name: "Dr. Alex Rivera",    role: "admin",   status: "active", lastSeen: "Now" },
      { id: "demo-teacher-001", name: "Ms. Sofia Martinez", role: "teacher", status: "active", lastSeen: "Now" },
      { id: "demo-teacher-002", name: "Mr. James Chen",     role: "teacher", status: "active", lastSeen: "1h ago" },
      { id: "demo-parent-001",  name: "James Carter",       role: "parent",  status: "active", lastSeen: "30m ago" },
      { id: "demo-parent-002",  name: "Maria Williams",     role: "parent",  status: "active", lastSeen: "2h ago" },
      { id: "demo-student-001", name: "Aiden Carter",       role: "student", status: "active", lastSeen: "Now" },
      { id: "demo-student-002", name: "Emma Williams",      role: "student", status: "active", lastSeen: "Now" },
      { id: "demo-student-003", name: "Liam Johnson",       role: "student", status: "needs-support", lastSeen: "Yesterday" },
      { id: "demo-student-004", name: "Isabella Thomas",    role: "student", status: "star",   lastSeen: "Now" },
      { id: "demo-student-005", name: "Noah Davis",         role: "student", status: "needs-support", lastSeen: "3d ago" },
    ];
  }),

  /** Get recent system activity log. */
  getRecentActivity: publicProcedure.query(() => {
    return MOCK_RECENT_ACTIVITY;
  }),

  /** Get system health metrics. */
  getSystemHealth: publicProcedure.query(() => {
    return {
      database: { status: "healthy", latencyMs: 12, uptime: "99.9%" },
      googleSheets: { status: "healthy", lastSync: "2 min ago", rowsLogged: 187 },
      notifications: { status: "healthy", sent: 34, failed: 0 },
      aiService: { status: "healthy", model: "gpt-4o-mini", avgResponseMs: 340 },
      server: { status: "healthy", memoryMB: 128, cpuPercent: 4.2 },
    };
  }),

  /** Get daily active users trend. */
  getDailyTrend: publicProcedure.query(() => {
    return [
      { date: "Jun 28", students: 8,  sessions: 12, avgScore: 74 },
      { date: "Jun 29", students: 10, sessions: 16, avgScore: 77 },
      { date: "Jun 30", students: 9,  sessions: 14, avgScore: 72 },
      { date: "Jul 01", students: 12, sessions: 19, avgScore: 79 },
      { date: "Jul 02", students: 11, sessions: 17, avgScore: 81 },
      { date: "Jul 03", students: 14, sessions: 23, avgScore: 83 },
      { date: "Jul 04", students: 7,  sessions: 11, avgScore: 86 },
    ];
  }),
});
