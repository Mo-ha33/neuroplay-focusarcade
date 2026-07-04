import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * NeuroPlay AI FocusArcade — Database Schema
 * ==========================================
 * Extended with 4-tier RBAC: admin | teacher | student | parent
 *
 * Relational structure:
 *   admin ──< classrooms ──< student_profiles >── parent (users)
 *                                │
 *                                └──< game_sessions ──< planet_attempts
 */

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /**
   * 4-tier role ENUM.
   * - admin:   Full system access (Galactic Overseer)
   * - teacher: Classroom management (Command Center)
   * - student: Gamified learning (Space Lab)
   * - parent:  Child focus metrics (Wellness Monitor)
   */
  role: mysqlEnum("role", ["admin", "teacher", "student", "parent"])
    .default("student")
    .notNull(),
  /** Avatar emoji or DiceBear seed for student visual identity. */
  avatarSeed: varchar("avatarSeed", { length: 64 }),
  /** Space Passcode — 4-digit PIN for student frictionless login. */
  spacePasscode: varchar("spacePasscode", { length: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Classrooms ───────────────────────────────────────────────────────────────

export const classrooms = mysqlTable("classrooms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  /** The teacher who owns this classroom. References users.id. */
  teacherId: int("teacherId").notNull(),
  /** Join code for students to self-enroll. */
  joinCode: varchar("joinCode", { length: 8 }).notNull().unique(),
  gradeLevel: varchar("gradeLevel", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = typeof classrooms.$inferInsert;

// ─── Student Profiles ─────────────────────────────────────────────────────────

export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  /** References users.id for the student. */
  userId: int("userId").notNull().unique(),
  /** References classrooms.id. */
  classroomId: int("classroomId"),
  /** References users.id for the parent/guardian. */
  parentId: int("parentId"),
  /** References users.id for the assigned teacher. */
  teacherId: int("teacherId"),
  /** Cumulative XP across all sessions. */
  totalXP: int("totalXP").default(0).notNull(),
  /** Total stars earned across all sessions. */
  totalStars: int("totalStars").default(0).notNull(),
  /** Total sessions completed. */
  sessionsCompleted: int("sessionsCompleted").default(0).notNull(),
  /** Cumulative focus time in seconds. */
  totalFocusTimeSec: int("totalFocusTimeSec").default(0).notNull(),
  /** Current streak in days. */
  streakDays: int("streakDays").default(0).notNull(),
  /** Highest single-session score. */
  highScore: int("highScore").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

// ─── Game Sessions ────────────────────────────────────────────────────────────

export const gameSessions = mysqlTable("game_sessions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: varchar("studentId", { length: 64 }).notNull(),
  studentName: varchar("studentName", { length: 128 }).default("Space Explorer"),
  score: int("score").default(0).notNull(),
  xp: int("xp").default(0).notNull(),
  starsEarned: int("starsEarned").default(0).notNull(),
  correctCount: int("correctCount").default(0).notNull(),
  totalPlanets: int("totalPlanets").default(8).notNull(),
  timeSpentSec: int("timeSpentSec").default(0).notNull(),
  attentionDriftCount: int("attentionDriftCount").default(0).notNull(),
  completed: int("completed", { unsigned: true }).default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

// ─── Planet Attempts ──────────────────────────────────────────────────────────

export const planetAttempts = mysqlTable("planet_attempts", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  planetName: varchar("planetName", { length: 64 }).notNull(),
  correct: int("correct", { unsigned: true }).default(0).notNull(),
  attemptNumber: int("attemptNumber").default(1).notNull(),
  xpAwarded: int("xpAwarded").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlanetAttempt = typeof planetAttempts.$inferSelect;
export type InsertPlanetAttempt = typeof planetAttempts.$inferInsert;

// ─── File Uploads ────────────────────────────────────────────────────────────

export const uploads = mysqlTable("uploads", {
  id: int("id").autoincrement().primaryKey(),
  /** References users.id for the uploader. */
  userId: int("userId").notNull(),
  /** Original file name as uploaded by the user. */
  fileName: varchar("fileName", { length: 512 }).notNull(),
  /** Storage key or URL for the persisted file. */
  fileUrl: text("fileUrl"),
  /**
   * File type category — determines which portal uploaded it and how it's processed.
   * - curriculum_pdf: Teacher-uploaded curriculum for AI quest generation
   * - parent_iep_report: Parent-uploaded IEP or clinical recommendations
   * - student_homework: Student-uploaded homework image/screenshot
   */
  fileType: mysqlEnum("fileType", [
    "curriculum_pdf",
    "parent_iep_report",
    "student_homework",
  ]).notNull(),
  /** MIME type of the uploaded file. */
  mimeType: varchar("mimeType", { length: 128 }),
  /** File size in bytes. */
  fileSizeBytes: int("fileSizeBytes"),
  /**
   * Processing status for AI ingestion pipeline.
   * - pending: Just uploaded, awaiting processing
   * - processing: AI is currently parsing/analyzing
   * - completed: Successfully processed
   * - failed: Processing encountered an error
   */
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"])
    .default("pending")
    .notNull(),
  /** JSON metadata from AI processing (quest output, IEP parameters, XP awarded, etc.) */
  aiMetadata: text("aiMetadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;
