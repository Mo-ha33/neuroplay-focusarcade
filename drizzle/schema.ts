import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Game Sessions — tracks each student's play session
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

// Planet Attempts — tracks each drag-and-drop attempt
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
