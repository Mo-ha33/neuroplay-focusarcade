#!/usr/bin/env tsx
/**
 * seed-mock-data.ts — NeuroPlay AI Hackathon Demo Data Seeder
 *
 * Standalone script to inject 10 rows of realistic mock student data
 * into the Google Sheets FocusTracker dashboard.
 *
 * Usage:
 *   npx tsx scripts/seed-mock-data.ts
 *   # or with dotenv:
 *   GOOGLE_SHEETS_ID=xxx GOOGLE_SERVICE_ACCOUNT_JSON='...' npx tsx scripts/seed-mock-data.ts
 *
 * Required environment variables:
 *   GOOGLE_SHEETS_ID              — The Google Spreadsheet ID
 *   GOOGLE_SERVICE_ACCOUNT_JSON   — JSON string of service account credentials
 *
 * Sheet format (FocusTracker tab):
 *   A: Timestamp
 *   B: Student_ID
 *   C: Student_Name
 *   D: Score_%
 *   E: Time_Spent_Sec
 *   F: Attention_Drift_Count
 *   G: Correct_Count
 *   H: Total_Planets
 *   I: XP_Earned
 *   J: Stars_Earned
 */

import "dotenv/config";
import { seedMockStudentData } from "../server/mockDataSeed";

console.log("╔══════════════════════════════════════════════════════╗");
console.log("║   NeuroPlay AI — FocusArcade Mock Data Seeder 🚀     ║");
console.log("╚══════════════════════════════════════════════════════╝");
console.log("");

async function main() {
  console.log("📊 Configuration:");
  console.log(`   GOOGLE_SHEETS_ID: ${process.env.GOOGLE_SHEETS_ID ? "✅ Set" : "❌ Not set"}`);
  console.log(`   GOOGLE_SERVICE_ACCOUNT_JSON: ${process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? "✅ Set" : "❌ Not set"}`);
  console.log("");

  console.log("🧪 Generating 10 rows of realistic student data...");
  console.log("   Students: Alex Chen, Maya Johnson, Liam Torres, Sofia Patel,");
  console.log("             Noah Williams, Emma Davis, Ethan Brown, Olivia Martinez,");
  console.log("             Aiden Wilson, Isabella Taylor");
  console.log("");

  const result = await seedMockStudentData();

  console.log("─────────────────────────────────────────────────────");
  if (result.success) {
    console.log(`✅ SUCCESS: ${result.message}`);
    console.log(`📊 Rows inserted: ${result.rowsInserted}`);
  } else {
    console.log(`ℹ️  INFO: ${result.message}`);
    console.log(`📊 Rows generated (not inserted): ${result.rows?.length ?? 0}`);
  }

  if (result.rows) {
    console.log("\n📋 Generated data preview:");
    console.log("─────────────────────────────────────────────────────");
    console.log("Timestamp                | Student      | Score  | Time | Drift | XP");
    console.log("─────────────────────────────────────────────────────");
    result.rows.forEach((row) => {
      const typedRow = row as (string | number)[];
      const ts = String(typedRow[0]).slice(0, 19).replace("T", " ");
      const name = String(typedRow[2]).padEnd(12);
      const score = String(typedRow[3]).padEnd(6);
      const time = String(typedRow[4]).padEnd(4);
      const drift = String(typedRow[5]).padEnd(5);
      const xp = String(typedRow[8]);
      console.log(`${ts} | ${name} | ${score} | ${time} | ${drift} | ${xp}`);
    });
  }

  console.log("\n─────────────────────────────────────────────────────");
  console.log("🎯 Next steps:");
  if (!process.env.GOOGLE_SHEETS_ID) {
    console.log("   1. Create a Google Sheet and copy its ID from the URL");
    console.log("   2. Set GOOGLE_SHEETS_ID=<your-sheet-id> in .env");
    console.log("   3. Create a Google Service Account with Sheets access");
    console.log("   4. Set GOOGLE_SERVICE_ACCOUNT_JSON=<json-credentials> in .env");
    console.log("   5. Re-run this script to insert data");
  } else {
    console.log("   ✅ Data inserted! Open your Google Sheet to see the teacher dashboard.");
    console.log("   📊 Share the sheet with your team for the live demo.");
  }
  console.log("");
}

main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
