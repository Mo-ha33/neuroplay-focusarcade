/**
 * mockDataSeed.ts — NeuroPlay AI Demo Data Generator
 *
 * Injects 10 rows of realistic mock student data into Google Sheets
 * so the teacher focus-tracker dashboard looks fully active during
 * the hackathon live judging demo.
 *
 * Usage (standalone): npx tsx server/mockDataSeed.ts
 * Usage (via tRPC):   trpc.admin.seedMockData.mutate()
 */

import { google } from "googleapis";
import { audit, auditTimer } from "./audit";

// ─── Realistic mock student profiles ─────────────────────────────────────────

const MOCK_STUDENTS = [
  { id: "stu_001", name: "Alex Chen" },
  { id: "stu_002", name: "Maya Johnson" },
  { id: "stu_003", name: "Liam Torres" },
  { id: "stu_004", name: "Sofia Patel" },
  { id: "stu_005", name: "Noah Williams" },
  { id: "stu_006", name: "Emma Davis" },
  { id: "stu_007", name: "Ethan Brown" },
  { id: "stu_008", name: "Olivia Martinez" },
  { id: "stu_009", name: "Aiden Wilson" },
  { id: "stu_010", name: "Isabella Taylor" },
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockRow(
  student: { id: string; name: string },
  daysAgo: number
): (string | number)[] {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomBetween(8, 16), randomBetween(0, 59), 0, 0);

  const correctCount = randomBetween(4, 8);
  const totalPlanets = 8;
  const scorePct = ((correctCount / totalPlanets) * 100).toFixed(1);
  const timeSpentSec = randomBetween(180, 720); // 3-12 minutes
  const attentionDriftCount = randomBetween(0, 4); // Brain breaks triggered
  const xp = correctCount * randomBetween(80, 120);
  const stars = correctCount;

  return [
    date.toISOString(),
    student.id,
    student.name,
    `${scorePct}%`,
    timeSpentSec,
    attentionDriftCount,
    correctCount,
    totalPlanets,
    xp,
    stars,
  ];
}

export async function seedMockStudentData(): Promise<{
  success: boolean;
  rowsInserted: number;
  message: string;
  rows?: (string | number)[][];
}> {
  const timer = auditTimer();
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  audit.info("mock_data", "Starting mock student data seed", {
    studentCount: MOCK_STUDENTS.length,
    sheetId: sheetId ?? "NOT_CONFIGURED",
  });

  // Generate 10 rows of mock data (spread over last 7 days)
  const rows = MOCK_STUDENTS.map((student, i) =>
    generateMockRow(student, i % 7) // Spread across last 7 days
  );

  // If no sheet configured, return the data for display
  if (!sheetId) {
    audit.warn("mock_data", "GOOGLE_SHEETS_ID not configured — returning mock data without inserting");
    return {
      success: false,
      rowsInserted: 0,
      message: "Google Sheets not configured. Mock data generated but not inserted.",
      rows,
    };
  }

  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) {
    audit.warn("mock_data", "Google credentials not configured — returning mock data without inserting");
    return {
      success: false,
      rowsInserted: 0,
      message: "Google credentials not configured. Mock data generated but not inserted.",
      rows,
    };
  }

  try {
    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // First, ensure the header row exists
    const headerRow = [
      "Timestamp",
      "Student_ID",
      "Student_Name",
      "Score_%",
      "Time_Spent_Sec",
      "Attention_Drift_Count",
      "Correct_Count",
      "Total_Planets",
      "XP_Earned",
      "Stars_Earned",
    ];

    // Check if sheet has headers
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "FocusTracker!A1:J1",
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      // Insert header row first
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "FocusTracker!A1:J1",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [headerRow] },
      });
      audit.info("mock_data", "Header row inserted into FocusTracker sheet");
    }

    // Insert all mock rows
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "FocusTracker!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    const ms = timer.stop();
    audit.success("mock_data", "Mock student data seeded successfully", {
      rowsInserted: rows.length,
      sheetId,
    }, ms);

    return {
      success: true,
      rowsInserted: rows.length,
      message: `Successfully inserted ${rows.length} mock student rows into Google Sheets`,
      rows,
    };
  } catch (err) {
    const ms = timer.stop();
    audit.error("mock_data", "Failed to seed mock data", {
      error: String(err),
    }, ms);

    return {
      success: false,
      rowsInserted: 0,
      message: `Failed to insert mock data: ${String(err)}`,
      rows,
    };
  }
}

// ─── Standalone execution ─────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("mockDataSeed.ts") || process.argv[1]?.endsWith("mockDataSeed.js")) {
  console.log("🚀 NeuroPlay AI — Mock Data Seeder");
  console.log("Generating 10 rows of realistic student data...\n");

  seedMockStudentData()
    .then(result => {
      console.log(`\n✅ Result: ${result.message}`);
      console.log(`📊 Rows: ${result.rowsInserted} inserted`);
      if (result.rows) {
        console.log("\n📋 Sample data (first 3 rows):");
        result.rows.slice(0, 3).forEach((row, i) => {
          console.log(`  Row ${i + 1}: ${row.join(" | ")}`);
        });
      }
    })
    .catch(err => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
