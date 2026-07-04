/**
 * integrations.ts — NeuroPlay AI External API Integrations
 *
 * Implements:
 *  1. logToGoogleSheets  — POST session metrics to teacher focus-tracker sheet
 *  2. schedulePomodoro   — Create Google Calendar 15-min Pomodoro Sprint event
 *  3. fireDopamineReport — Send celebratory notification on module completion
 *
 * All integrations degrade gracefully: if credentials are missing or the
 * upstream fails, we log the error and return a structured fallback result
 * so the game never crashes. Every call is instrumented via audit.ts.
 */

import { google } from "googleapis";
import { audit, auditTimer } from "./audit";
import { notifyOwner } from "./_core/notification";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FocusMetrics {
  studentId: string;
  studentName: string;
  scorePct: number;
  timeSpentSec: number;
  attentionDriftCount: number;
  correctCount: number;
  totalPlanets: number;
  xp: number;
  stars: number;
}

export interface IntegrationResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}

// ─── Google Auth Helper ───────────────────────────────────────────────────────

function getGoogleAuth() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) {
    return null;
  }
  try {
    const credentials = JSON.parse(credentialsJson);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/calendar",
      ],
    });
  } catch {
    return null;
  }
}

// ─── 1. Google Sheets Focus Tracker ──────────────────────────────────────────

export async function logToGoogleSheets(metrics: FocusMetrics): Promise<IntegrationResult> {
  const timer = auditTimer();
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  audit.info("sheets_tracker", "Logging focus metrics to Google Sheets", {
    studentId: metrics.studentId,
    scorePct: metrics.scorePct,
  });

  if (!sheetId) {
    audit.warn("sheets_tracker", "GOOGLE_SHEETS_ID not configured — skipping Sheets log", {
      studentId: metrics.studentId,
    });
    return {
      success: false,
      message: "Google Sheets not configured (GOOGLE_SHEETS_ID missing)",
      error: "SHEETS_NOT_CONFIGURED",
    };
  }

  const auth = getGoogleAuth();
  if (!auth) {
    audit.warn("sheets_tracker", "Google credentials not configured — skipping Sheets log");
    // Fallback: log to audit system only
    audit.info("sheets_tracker", "FALLBACK: Focus metrics captured in audit log", {
      timestamp: new Date().toISOString(),
      studentId: metrics.studentId,
      studentName: metrics.studentName,
      scorePct: metrics.scorePct,
      timeSpentSec: metrics.timeSpentSec,
      attentionDriftCount: metrics.attentionDriftCount,
    });
    return {
      success: false,
      message: "Google credentials not configured — metrics logged to audit system",
      error: "GOOGLE_AUTH_NOT_CONFIGURED",
      data: { auditFallback: true, metrics },
    };
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });
    const timestamp = new Date().toISOString();

    // Row format: [Timestamp, Student_ID, Student_Name, Score_%, Time_Spent_Sec, Attention_Drift_Count, Correct_Count, Total_Planets, XP, Stars]
    const row = [
      timestamp,
      metrics.studentId,
      metrics.studentName,
      `${metrics.scorePct.toFixed(1)}%`,
      metrics.timeSpentSec,
      metrics.attentionDriftCount,
      metrics.correctCount,
      metrics.totalPlanets,
      metrics.xp,
      metrics.stars,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "FocusTracker!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    const ms = timer.stop();
    audit.success("sheets_tracker", "Focus metrics logged to Google Sheets", {
      studentId: metrics.studentId,
      row: row.join(" | "),
    }, ms);

    return {
      success: true,
      message: "Focus metrics logged to Google Sheets successfully",
      data: { sheetId, rowData: row },
    };
  } catch (err) {
    const ms = timer.stop();
    audit.error("sheets_tracker", "Failed to log to Google Sheets", {
      error: String(err),
      studentId: metrics.studentId,
    }, ms);

    return {
      success: false,
      message: "Failed to log to Google Sheets",
      error: String(err),
    };
  }
}

// ─── 2. Google Calendar Pomodoro Sprint Scheduler ────────────────────────────

export async function schedulePomodoro(params: {
  studentName: string;
  parentEmail?: string;
  moduleName: string;
  startTime?: Date;
}): Promise<IntegrationResult> {
  const timer = auditTimer();
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  audit.info("calendar_event", "Scheduling Pomodoro Sprint on Google Calendar", {
    studentName: params.studentName,
    moduleName: params.moduleName,
    parentEmail: params.parentEmail,
  });

  const auth = getGoogleAuth();
  if (!auth) {
    audit.warn("calendar_event", "Google credentials not configured — skipping Calendar event");
    return {
      success: false,
      message: "Google credentials not configured — Pomodoro event not scheduled",
      error: "GOOGLE_AUTH_NOT_CONFIGURED",
    };
  }

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const start = params.startTime ?? new Date(Date.now() + 5 * 60 * 1000); // 5 min from now
    const end = new Date(start.getTime() + 15 * 60 * 1000); // 15 min duration

    const attendees = params.parentEmail
      ? [{ email: params.parentEmail }]
      : [];

    const event = {
      summary: `🚀 NeuroPlay Sprint: ${params.moduleName}`,
      description: `⏱️ 15-Minute Pomodoro Sprint for ${params.studentName}

📚 Module: ${params.moduleName}
🎮 Format: 10 min interactive play + 5 min motor rest

🧠 NeuroPlay AI Pomodoro Structure:
• Minutes 0-10: Interactive Space Lab game (focused learning)
• Minutes 10-15: Brain Break — physical movement activity

💡 Tips for parents:
- Ensure a quiet, distraction-free environment
- Celebrate every correct answer with verbal praise
- The app will prompt the brain break automatically

Generated by NeuroPlay AI FocusArcade 🌟`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 5 },
          { method: "email", minutes: 10 },
        ],
      },
      colorId: "9", // Blueberry — calm focus color
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: attendees.length > 0 ? "all" : "none",
    });

    const ms = timer.stop();
    audit.success("calendar_event", "Pomodoro Sprint scheduled on Google Calendar", {
      eventId: response.data.id,
      studentName: params.studentName,
      startTime: start.toISOString(),
    }, ms);

    return {
      success: true,
      message: "Pomodoro Sprint scheduled successfully",
      data: {
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
    };
  } catch (err) {
    const ms = timer.stop();
    audit.error("calendar_event", "Failed to schedule Pomodoro Sprint", {
      error: String(err),
      studentName: params.studentName,
    }, ms);

    return {
      success: false,
      message: "Failed to schedule Pomodoro Sprint",
      error: String(err),
    };
  }
}

// ─── 3. Dopamine Report — Celebratory Completion Notification ─────────────────

export async function fireDopamineReport(params: {
  studentName: string;
  moduleName: string;
  scorePct: number;
  xp: number;
  stars: number;
  timeSpentSec: number;
  correctCount: number;
  totalPlanets: number;
}): Promise<IntegrationResult> {
  const timer = auditTimer();

  audit.info("dopamine_report", "Firing Dopamine Report notification", {
    studentName: params.studentName,
    scorePct: params.scorePct,
    xp: params.xp,
  });

  const scoreEmoji = params.scorePct >= 90 ? "🏆" : params.scorePct >= 70 ? "⭐" : "🌱";
  const timeMin = Math.floor(params.timeSpentSec / 60);
  const timeSec = params.timeSpentSec % 60;

  const title = `${scoreEmoji} ${params.studentName} just crushed the ${params.moduleName}!`;
  const content = `🎉 DOPAMINE REPORT — NeuroPlay AI FocusArcade

👤 Student: ${params.studentName}
📚 Module: ${params.moduleName}
📊 Score: ${params.scorePct.toFixed(0)}% (${params.correctCount}/${params.totalPlanets} correct)
⚡ XP Earned: +${params.xp} XP
⭐ Stars: ${params.stars} stars
⏱️ Time: ${timeMin}m ${timeSec}s

${params.scorePct >= 90
  ? "🏆 PERFECT SCORE! This child is a SPACE GENIUS! Give them a huge hug right now!"
  : params.scorePct >= 70
  ? "⭐ GREAT JOB! They worked really hard — celebrate this win with them!"
  : "🌱 They're learning and growing! Every attempt builds their confidence!"
}

💡 Next Step: A 15-minute Pomodoro Sprint has been scheduled on your calendar.
🧠 Remember: Immediate verbal praise within 30 seconds maximizes dopamine reinforcement!

— NeuroPlay AI | Turning Learning into Adventure 🚀`;

  try {
    const notified = await notifyOwner({ title, content });
    const ms = timer.stop();

    if (notified) {
      audit.success("dopamine_report", "Dopamine Report sent successfully", {
        studentName: params.studentName,
        scorePct: params.scorePct,
      }, ms);
      return { success: true, message: "Dopamine Report sent to parents/teachers" };
    } else {
      audit.warn("dopamine_report", "Dopamine Report delivery uncertain (upstream unavailable)", {
        studentName: params.studentName,
      }, ms);
      return {
        success: false,
        message: "Notification service temporarily unavailable",
        error: "UPSTREAM_UNAVAILABLE",
      };
    }
  } catch (err) {
    const ms = timer.stop();
    audit.error("dopamine_report", "Failed to fire Dopamine Report", {
      error: String(err),
      studentName: params.studentName,
    }, ms);
    return {
      success: false,
      message: "Failed to send Dopamine Report",
      error: String(err),
    };
  }
}
