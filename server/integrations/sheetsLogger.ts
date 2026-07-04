/**
 * NeuroPlay AI — Google Sheets Focus Tracker Integration
 *
 * Logs real-time behavioural metrics to the teacher dashboard spreadsheet
 * upon every session completion. Each row follows the schema:
 *   [Timestamp, Student_ID, Student_Name, Score_%, Time_Spent_Sec,
 *    Attention_Drift_Count, Correct_Count, Total_XP, Stars_Earned, Module]
 */

import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const FOCUS_TRACKER_SHEET_ID =
  process.env.FOCUS_TRACKER_SHEET_ID ||
  "1yYdSF05oIuZtOq0CluqiNPl-gTgNH7zAyZIcVqaO-Jg";

export interface FocusMetrics {
  studentId: string;
  studentName: string;
  scorePercent: number;
  timeSpentSec: number;
  attentionDriftCount: number;
  correctCount: number;
  totalXP: number;
  starsEarned: number;
  module?: string;
}

/**
 * Appends a single row of focus metrics to the Google Sheets tracker.
 * Uses the `gws` CLI which is pre-authenticated in the sandbox environment.
 */
export async function logFocusMetrics(metrics: FocusMetrics): Promise<void> {
  const timestamp = new Date().toISOString();
  const module = metrics.module || "Solar System Lab";

  const row = [
    timestamp,
    metrics.studentId,
    metrics.studentName,
    `${Math.round(metrics.scorePercent)}%`,
    metrics.timeSpentSec,
    metrics.attentionDriftCount,
    metrics.correctCount,
    metrics.totalXP,
    metrics.starsEarned,
    module,
  ];

  const body = JSON.stringify({
    values: [row],
  });

  const params = JSON.stringify({
    spreadsheetId: FOCUS_TRACKER_SHEET_ID,
    range: "Focus Tracker!A:J",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
  });

  try {
    const { stdout, stderr } = await execFileAsync("gws", [
      "sheets",
      "spreadsheets",
      "values",
      "append",
      "--params",
      params,
      "--json",
      body,
    ]);

    if (stderr && !stdout) {
      console.error("[SheetsLogger] Error appending row:", stderr);
    } else {
      console.log(
        `[SheetsLogger] Logged metrics for ${metrics.studentName} (${metrics.studentId})`
      );
    }
  } catch (err) {
    // Non-fatal: log the error but do not crash the game session
    console.error("[SheetsLogger] Failed to log to Google Sheets:", err);
  }
}

/**
 * Batch-appends multiple rows — used by the mock data simulation script.
 */
export async function batchLogFocusMetrics(
  rows: FocusMetrics[]
): Promise<void> {
  const values = rows.map((m) => {
    const module = m.module || "Solar System Lab";
    return [
      new Date().toISOString(),
      m.studentId,
      m.studentName,
      `${Math.round(m.scorePercent)}%`,
      m.timeSpentSec,
      m.attentionDriftCount,
      m.correctCount,
      m.totalXP,
      m.starsEarned,
      module,
    ];
  });

  const body = JSON.stringify({ values });
  const params = JSON.stringify({
    spreadsheetId: FOCUS_TRACKER_SHEET_ID,
    range: "Focus Tracker!A:J",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
  });

  try {
    const { stdout, stderr } = await execFileAsync("gws", [
      "sheets",
      "spreadsheets",
      "values",
      "append",
      "--params",
      params,
      "--json",
      body,
    ]);

    if (stderr && !stdout) {
      console.error("[SheetsLogger] Batch error:", stderr);
    } else {
      console.log(`[SheetsLogger] Batch logged ${rows.length} rows.`);
    }
  } catch (err) {
    console.error("[SheetsLogger] Batch log failed:", err);
  }
}
