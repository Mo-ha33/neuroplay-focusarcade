/**
 * NeuroPlay AI — Dopamine Report Service
 *
 * Fires a celebratory "Dopamine Report" notification to parents/teachers
 * upon module completion. Uses the built-in Manus notification system and
 * provides extension points for Slack/WhatsApp/Email webhooks.
 *
 * Pomodoro Sprint scheduling stubs are also included here for Calendar
 * integration when the Calendar API becomes available.
 */

import { notifyOwner } from "../_core/notification";

export interface DopamineReportPayload {
  studentName: string;
  studentId: string;
  score: number;
  scorePercent: number;
  totalXP: number;
  starsEarned: number;
  correctCount: number;
  timeSpentSec: number;
  module: string;
}

/**
 * Formats a human-readable time string from seconds.
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} seconds`;
  return `${m}m ${s}s`;
}

/**
 * Generates the celebratory message content for the Dopamine Report.
 */
function buildReportContent(p: DopamineReportPayload): string {
  const stars = "⭐".repeat(Math.min(p.starsEarned, 8));
  const grade =
    p.scorePercent >= 90
      ? "🏆 SUPERSTAR"
      : p.scorePercent >= 75
      ? "🌟 EXCELLENT"
      : p.scorePercent >= 60
      ? "✅ GREAT JOB"
      : "💪 KEEP GOING";

  return `
🎉 ${p.studentName} just completed the ${p.module} quest!

${grade} — Score: ${Math.round(p.scorePercent)}%
${stars}

📊 Session Summary:
• Planets placed correctly: ${p.correctCount}/8
• Total XP earned: ⚡ ${p.totalXP}
• Stars collected: ${p.starsEarned} ⭐
• Time spent: ${formatTime(p.timeSpentSec)}

🧠 ADHD Tip for parents:
Right now is the PERFECT moment to celebrate with ${p.studentName}!
Say: "I'm so proud of you — you focused and finished the whole mission! 🚀"

This immediate praise reinforces the dopamine reward loop and builds
positive associations with learning. Keep up the amazing work!

— NeuroPlay AI FocusArcade 🎮
  `.trim();
}

/**
 * Sends the Dopamine Report via the built-in Manus notification system.
 * Extend this function to add Slack/WhatsApp/Email webhooks.
 */
export async function fireDopamineReport(
  payload: DopamineReportPayload
): Promise<void> {
  const title = `🎉 ${payload.studentName} completed ${payload.module}! Score: ${Math.round(payload.scorePercent)}%`;
  const content = buildReportContent(payload);

  // 1. Built-in Manus notification (always fires)
  try {
    await notifyOwner({ title, content });
    console.log(
      `[DopamineReport] Notification sent for ${payload.studentName}`
    );
  } catch (err) {
    console.error("[DopamineReport] Built-in notification failed:", err);
  }

  // 2. Slack webhook (fires if SLACK_WEBHOOK_URL is configured)
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `*${title}*\n\`\`\`${content}\`\`\``,
        }),
      });
      console.log("[DopamineReport] Slack webhook fired.");
    } catch (err) {
      console.error("[DopamineReport] Slack webhook failed:", err);
    }
  }

  // 3. Generic webhook (fires if DOPAMINE_WEBHOOK_URL is configured)
  if (process.env.DOPAMINE_WEBHOOK_URL) {
    try {
      await fetch(process.env.DOPAMINE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, payload }),
      });
      console.log("[DopamineReport] Generic webhook fired.");
    } catch (err) {
      console.error("[DopamineReport] Generic webhook failed:", err);
    }
  }
}

/**
 * Pomodoro Sprint scheduler stub.
 *
 * Schedules a 15-minute Pomodoro Sprint on the parent's Google Calendar:
 *   - 10 minutes of interactive play
 *   - 5 minutes of motor rest / brain break
 *
 * NOTE: Google Calendar API is not currently available via the gws CLI.
 * This function logs the intent and is ready to be wired up when the
 * Calendar connector is enabled.
 */
export async function schedulePomodoroSprint(
  studentName: string,
  parentEmail?: string
): Promise<{ scheduled: boolean; message: string }> {
  const nextSession = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
  nextSession.setHours(16, 0, 0, 0); // 4:00 PM

  const eventDetails = {
    summary: `🎮 NeuroPlay Sprint: ${studentName} — Solar System Lab`,
    description: `Pomodoro Sprint for ${studentName}:\n• 10 min interactive Solar System quest\n• 5 min brain break (movement activity)\n\nPowered by NeuroPlay AI FocusArcade`,
    start: nextSession.toISOString(),
    end: new Date(nextSession.getTime() + 15 * 60 * 1000).toISOString(),
    attendees: parentEmail ? [{ email: parentEmail }] : [],
  };

  // Log the intent — Calendar API integration point
  console.log(
    "[PomodoroScheduler] Sprint event prepared:",
    JSON.stringify(eventDetails, null, 2)
  );
  console.log(
    "[PomodoroScheduler] NOTE: Calendar API not yet enabled. Enable the Google Calendar connector to auto-schedule."
  );

  return {
    scheduled: false,
    message: `Pomodoro Sprint prepared for ${studentName} at ${nextSession.toLocaleString()}. Enable Google Calendar connector to auto-schedule.`,
  };
}
