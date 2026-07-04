#!/usr/bin/env python3
"""
NeuroPlay AI FocusArcade — Mock Student Data Simulation Script
==============================================================
Injects 10 rows of realistic mock student data into the Google Sheets
Focus Tracker for the live judging demo.

Each row represents a completed Solar System Lab session with:
  [Timestamp, Student_ID, Student_Name, Score_%, Time_Spent_Sec,
   Attention_Drift_Count, Correct_Count, Total_XP, Stars_Earned, Module]

Usage:
    python3 scripts/simulate_students.py
"""

import subprocess
import json
import random
from datetime import datetime, timedelta

SHEET_ID = "1yYdSF05oIuZtOq0CluqiNPl-gTgNH7zAyZIcVqaO-Jg"
MODULE = "Solar System Lab"

# Realistic ADHD student profiles for the demo
STUDENTS = [
    {"name": "Aiden Carter",    "profile": "high_focus"},
    {"name": "Sofia Martinez",  "profile": "medium_focus"},
    {"name": "Liam Johnson",    "profile": "adhd_typical"},
    {"name": "Emma Williams",   "profile": "high_focus"},
    {"name": "Noah Davis",      "profile": "adhd_typical"},
    {"name": "Olivia Brown",    "profile": "medium_focus"},
    {"name": "Ethan Wilson",    "profile": "high_focus"},
    {"name": "Ava Anderson",    "profile": "adhd_typical"},
    {"name": "Mason Taylor",    "profile": "medium_focus"},
    {"name": "Isabella Thomas", "profile": "high_focus"},
]

# Profile parameters: (correct_count_range, time_range_sec, drift_range, score_multiplier)
PROFILES = {
    "high_focus":   {"correct": (7, 8),  "time": (180, 420),  "drift": (0, 1),  "score_mult": 0.95},
    "medium_focus": {"correct": (5, 7),  "time": (300, 600),  "drift": (1, 3),  "score_mult": 0.75},
    "adhd_typical": {"correct": (4, 6),  "time": (420, 900),  "drift": (3, 7),  "score_mult": 0.60},
}

def generate_session(student: dict, offset_minutes: int = 0) -> list:
    """Generate a realistic session row for a student."""
    profile = PROFILES[student["profile"]]
    
    correct_count = random.randint(*profile["correct"])
    time_spent = random.randint(*profile["time"])
    drift_count = random.randint(*profile["drift"])
    
    # Score calculation: base 100-200 pts per correct, reduced by attempts
    base_score = correct_count * random.randint(120, 200)
    score = int(base_score * (1 - drift_count * 0.02))
    score_pct = min(100, round((score / 1600) * 100))
    
    total_xp = correct_count * 100
    stars_earned = correct_count
    
    # Stagger timestamps across the past 3 days for realism
    base_time = datetime.now() - timedelta(
        days=random.randint(0, 2),
        hours=random.randint(9, 17),
        minutes=offset_minutes
    )
    timestamp = base_time.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    student_id = f"student_{random.randint(1000, 9999)}"
    
    return [
        timestamp,
        student_id,
        student["name"],
        f"{score_pct}%",
        time_spent,
        drift_count,
        correct_count,
        total_xp,
        stars_earned,
        MODULE,
    ]

def inject_mock_data():
    """Inject all 10 mock student rows into Google Sheets."""
    print("🚀 NeuroPlay AI — Injecting mock student data into Focus Tracker...")
    print(f"   Sheet ID: {SHEET_ID}")
    print()
    
    rows = []
    for i, student in enumerate(STUDENTS):
        row = generate_session(student, offset_minutes=i * 15)
        rows.append(row)
        score_pct = row[3]
        correct = row[6]
        print(f"   ✓ {student['name']:20s} | Score: {score_pct:5s} | Correct: {correct}/8 | "
              f"Time: {row[5]}s | Drift: {row[5]} | Profile: {student['profile']}")
    
    print()
    print("📊 Sending to Google Sheets...")
    
    body = json.dumps({"values": rows})
    params = json.dumps({
        "spreadsheetId": SHEET_ID,
        "range": "Focus Tracker!A:J",
        "valueInputOption": "USER_ENTERED",
        "insertDataOption": "INSERT_ROWS",
    })
    
    result = subprocess.run(
        ["gws", "sheets", "spreadsheets", "values", "append",
         "--params", params, "--json", body],
        capture_output=True, text=True
    )
    
    if result.returncode == 0:
        response = json.loads(result.stdout)
        updated = response.get("updates", {}).get("updatedRows", len(rows))
        print(f"   ✅ Successfully injected {updated} rows into Focus Tracker!")
        print(f"   🔗 Sheet URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit")
    else:
        print(f"   ❌ Error: {result.stderr}")
        print(f"   stdout: {result.stdout}")
    
    return rows

def add_dashboard_formulas():
    """Add summary statistics to the Dashboard sheet."""
    print()
    print("📈 Setting up Dashboard summary formulas...")
    
    dashboard_data = [
        ["NeuroPlay AI FocusArcade — Teacher Dashboard", "", "", "", ""],
        ["Solar System Lab — Class Summary", "", "", "", ""],
        ["", "", "", "", ""],
        ["Metric", "Value", "", "Notes", ""],
        ["Total Students", f"=COUNTA('Focus Tracker'!B2:B1000)", "", "Active sessions", ""],
        ["Average Score", f"=AVERAGEIF('Focus Tracker'!D2:D1000,\"<>\",ARRAYFORMULA(VALUE(SUBSTITUTE('Focus Tracker'!D2:D1000,\"%\",\"\"))))", "", "Class average %", ""],
        ["Avg Time (sec)", f"=AVERAGE('Focus Tracker'!E2:E1000)", "", "Seconds per session", ""],
        ["Avg Attention Drift", f"=AVERAGE('Focus Tracker'!F2:F1000)", "", "Lower = better focus", ""],
        ["Avg Correct Planets", f"=AVERAGE('Focus Tracker'!G2:G1000)", "", "Out of 8 planets", ""],
        ["Total XP Awarded", f"=SUM('Focus Tracker'!H2:H1000)", "", "Cumulative XP", ""],
        ["", "", "", "", ""],
        ["Last Updated", f"=NOW()", "", "", ""],
    ]
    
    body = json.dumps({"values": dashboard_data})
    params = json.dumps({
        "spreadsheetId": SHEET_ID,
        "range": "Dashboard!A1:E12",
        "valueInputOption": "USER_ENTERED",
    })
    
    result = subprocess.run(
        ["gws", "sheets", "spreadsheets", "values", "update",
         "--params", params, "--json", body],
        capture_output=True, text=True
    )
    
    if result.returncode == 0:
        print("   ✅ Dashboard formulas added!")
    else:
        print(f"   ⚠️  Dashboard setup warning: {result.stderr[:200]}")

def format_dashboard():
    """Apply formatting to the Dashboard sheet."""
    format_body = json.dumps({
        "requests": [
            {
                "repeatCell": {
                    "range": {"sheetId": 1, "startRowIndex": 0, "endRowIndex": 2},
                    "cell": {
                        "userEnteredFormat": {
                            "backgroundColor": {"red": 0.059, "green": 0.09, "blue": 0.165},
                            "textFormat": {
                                "bold": True,
                                "foregroundColor": {"red": 0, "green": 0.898, "blue": 1},
                                "fontSize": 12
                            },
                            "horizontalAlignment": "CENTER"
                        }
                    },
                    "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
                }
            },
            {
                "repeatCell": {
                    "range": {"sheetId": 1, "startRowIndex": 3, "endRowIndex": 4},
                    "cell": {
                        "userEnteredFormat": {
                            "textFormat": {"bold": True},
                            "backgroundColor": {"red": 0.12, "green": 0.16, "blue": 0.27}
                        }
                    },
                    "fields": "userEnteredFormat(textFormat,backgroundColor)"
                }
            }
        ]
    })
    
    params = json.dumps({"spreadsheetId": SHEET_ID})
    
    result = subprocess.run(
        ["gws", "sheets", "spreadsheets", "batchUpdate",
         "--params", params, "--json", format_body],
        capture_output=True, text=True
    )
    
    if result.returncode == 0:
        print("   ✅ Dashboard formatted!")
    else:
        print(f"   ⚠️  Dashboard format warning: {result.stderr[:200]}")

if __name__ == "__main__":
    print("=" * 60)
    print("  NeuroPlay AI FocusArcade — Student Data Simulator")
    print("=" * 60)
    print()
    
    rows = inject_mock_data()
    add_dashboard_formulas()
    format_dashboard()
    
    print()
    print("=" * 60)
    print("  ✅ SIMULATION COMPLETE!")
    print("=" * 60)
    print()
    print(f"  📊 Google Sheets Focus Tracker:")
    print(f"     https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit")
    print()
    print(f"  📋 Data injected: {len(rows)} student sessions")
    print(f"  📅 Module: {MODULE}")
    print()
    print("  Students simulated:")
    for s in STUDENTS:
        print(f"    • {s['name']} ({s['profile']})")
    print()
