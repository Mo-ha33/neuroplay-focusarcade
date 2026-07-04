/**
 * audit.ts — NeuroPlay AI Observability & Telemetry Layer
 *
 * Tracks all AI tool calls, session lifecycle events, integration
 * attempts, and error fallbacks for hackathon demo observability.
 *
 * Log format: [ISO timestamp] [LEVEL] [category] message {json}
 */

import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const AUDIT_LOG = path.join(LOG_DIR, "audit.log");
const MAX_LOG_BYTES = 5 * 1024 * 1024; // 5 MB cap

export type AuditCategory =
  | "ai_call"
  | "quiz_gen"
  | "content_process"
  | "sheets_tracker"
  | "calendar_event"
  | "dopamine_report"
  | "session_lifecycle"
  | "error_fallback"
  | "mock_data";

export type AuditLevel = "INFO" | "WARN" | "ERROR" | "SUCCESS";

export interface AuditEntry {
  ts: string;
  level: AuditLevel;
  category: AuditCategory;
  message: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

// In-memory ring buffer for real-time dashboard (last 200 entries)
const RING_BUFFER_SIZE = 200;
const ringBuffer: AuditEntry[] = [];

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimIfNeeded() {
  try {
    if (!fs.existsSync(AUDIT_LOG)) return;
    const stat = fs.statSync(AUDIT_LOG);
    if (stat.size < MAX_LOG_BYTES) return;
    const content = fs.readFileSync(AUDIT_LOG, "utf-8");
    const lines = content.split("\n").filter(Boolean);
    // Keep newest 60%
    const keep = Math.floor(lines.length * 0.6);
    fs.writeFileSync(AUDIT_LOG, lines.slice(-keep).join("\n") + "\n", "utf-8");
  } catch {
    // Non-fatal
  }
}

export function auditLog(
  level: AuditLevel,
  category: AuditCategory,
  message: string,
  meta?: Record<string, unknown>,
  durationMs?: number
): AuditEntry {
  const entry: AuditEntry = {
    ts: new Date().toISOString(),
    level,
    category,
    message,
    durationMs,
    meta,
  };

  // Ring buffer
  ringBuffer.push(entry);
  if (ringBuffer.length > RING_BUFFER_SIZE) {
    ringBuffer.shift();
  }

  // File log
  try {
    ensureLogDir();
    const line = `[${entry.ts}] [${level}] [${category}] ${message}${
      meta ? " " + JSON.stringify(meta) : ""
    }${durationMs !== undefined ? ` (${durationMs}ms)` : ""}\n`;
    fs.appendFileSync(AUDIT_LOG, line, "utf-8");
    trimIfNeeded();
  } catch {
    // Non-fatal: don't crash the app over logging
  }

  // Console mirror
  const consoleFn =
    level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.log;
  consoleFn(`[AUDIT][${category}] ${message}`, meta ?? "");

  return entry;
}

/** Convenience wrappers */
export const audit = {
  info: (cat: AuditCategory, msg: string, meta?: Record<string, unknown>, ms?: number) =>
    auditLog("INFO", cat, msg, meta, ms),
  warn: (cat: AuditCategory, msg: string, meta?: Record<string, unknown>, ms?: number) =>
    auditLog("WARN", cat, msg, meta, ms),
  error: (cat: AuditCategory, msg: string, meta?: Record<string, unknown>, ms?: number) =>
    auditLog("ERROR", cat, msg, meta, ms),
  success: (cat: AuditCategory, msg: string, meta?: Record<string, unknown>, ms?: number) =>
    auditLog("SUCCESS", cat, msg, meta, ms),
};

/** Returns the last N entries from the ring buffer */
export function getRecentAuditLogs(n = 50): AuditEntry[] {
  return ringBuffer.slice(-n);
}

/** Timer helper — call start(), then stop() to get duration */
export function auditTimer() {
  const t0 = Date.now();
  return { stop: () => Date.now() - t0 };
}
