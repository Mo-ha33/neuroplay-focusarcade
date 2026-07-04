/**
 * NeuroPlay AI FocusArcade — RBAC Router
 * =======================================
 * Provides demo-mode authentication for all 4 roles without requiring
 * real OAuth, so hackathon judges can instantly switch between portals.
 *
 * Endpoints:
 *   rbac.demoLogin   — Set a demo role session (no password required for demo)
 *   rbac.me          — Get current session user + role
 *   rbac.listDemoUsers — Return the 4 demo accounts for the login page
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export type RbacRole = "admin" | "teacher" | "student" | "parent";

/** In-memory demo user registry (no DB required for hackathon demo). */
export const DEMO_USERS: Record<RbacRole, DemoUser> = {
  student: {
    id: "demo-student-001",
    name: "Aiden Carter",
    role: "student",
    avatarEmoji: "🧑‍🚀",
    avatarColor: "#00E5FF",
    spacePasscode: "1234",
    tagline: "Space Explorer — Grade 3",
    totalXP: 1850,
    totalStars: 14,
    sessionsCompleted: 7,
    streakDays: 5,
    highScore: 1400,
    classroomName: "Ms. Martinez's Class",
    teacherName: "Sofia Martinez",
    parentName: "James Carter",
  },
  teacher: {
    id: "demo-teacher-001",
    name: "Ms. Sofia Martinez",
    role: "teacher",
    avatarEmoji: "👩‍🏫",
    avatarColor: "#7C4DFF",
    spacePasscode: "5678",
    tagline: "3rd Grade Science — Classroom A",
    classroomName: "Ms. Martinez's Class",
    classroomJoinCode: "SPACE3A",
    studentCount: 10,
    avgClassScore: 72,
    avgFocusTime: 420,
    brainBreaksTriggered: 23,
  },
  parent: {
    id: "demo-parent-001",
    name: "James Carter",
    role: "parent",
    avatarEmoji: "👨‍👩‍👦",
    avatarColor: "#AEEA00",
    spacePasscode: "9012",
    tagline: "Parent of Aiden Carter",
    childName: "Aiden Carter",
    childXP: 1850,
    childStars: 14,
    childSessions: 7,
    childStreak: 5,
    childFocusTimeSec: 3240,
    childLastSession: "2026-07-04T10:30:00Z",
  },
  admin: {
    id: "demo-admin-001",
    name: "Dr. Alex Rivera",
    role: "admin",
    avatarEmoji: "🛡️",
    avatarColor: "#FF6B6B",
    spacePasscode: "0000",
    tagline: "NeuroPlay AI — System Administrator",
    totalUsers: 42,
    totalSessions: 187,
    activeSchools: 3,
    systemHealth: 99.8,
    totalXPAwarded: 94500,
  },
};

export interface DemoUser {
  id: string;
  name: string;
  role: RbacRole;
  avatarEmoji: string;
  avatarColor: string;
  spacePasscode: string;
  tagline: string;
  // Student-specific
  totalXP?: number;
  totalStars?: number;
  sessionsCompleted?: number;
  streakDays?: number;
  highScore?: number;
  classroomName?: string;
  teacherName?: string;
  parentName?: string;
  // Teacher-specific
  classroomJoinCode?: string;
  studentCount?: number;
  avgClassScore?: number;
  avgFocusTime?: number;
  brainBreaksTriggered?: number;
  // Parent-specific
  childName?: string;
  childXP?: number;
  childStars?: number;
  childSessions?: number;
  childStreak?: number;
  childFocusTimeSec?: number;
  childLastSession?: string;
  // Admin-specific
  totalUsers?: number;
  totalSessions?: number;
  activeSchools?: number;
  systemHealth?: number;
  totalXPAwarded?: number;
}

export const rbacRouter = router({
  /** Return the 4 demo accounts for the login page role selector. */
  listDemoUsers: publicProcedure.query(() => {
    return Object.values(DEMO_USERS).map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      avatarEmoji: u.avatarEmoji,
      avatarColor: u.avatarColor,
      tagline: u.tagline,
      spacePasscode: u.spacePasscode,
    }));
  }),

  /** Demo login — validates the Space Passcode and returns the full demo user profile. */
  demoLogin: publicProcedure
    .input(
      z.object({
        role: z.enum(["admin", "teacher", "student", "parent"]),
        spacePasscode: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const user = DEMO_USERS[input.role];
      if (!user) {
        throw new Error("Invalid role");
      }
      if (user.spacePasscode !== input.spacePasscode) {
        throw new Error("Incorrect Space Passcode. Try again! 🚀");
      }
      return { success: true, user };
    }),

  /** Get a demo user profile by role (no auth required for demo mode). */
  getDemoUser: publicProcedure
    .input(z.object({ role: z.enum(["admin", "teacher", "student", "parent"]) }))
    .query(({ input }) => {
      return DEMO_USERS[input.role] ?? null;
    }),
});
