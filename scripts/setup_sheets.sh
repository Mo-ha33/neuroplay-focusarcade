#!/bin/bash
# Setup Google Sheets Focus Tracker header row
SHEET_ID="1yYdSF05oIuZtOq0CluqiNPl-gTgNH7zAyZIcVqaO-Jg"

gws sheets spreadsheets values update \
  --params "{\"spreadsheetId\": \"${SHEET_ID}\", \"range\": \"Focus Tracker!A1:J1\", \"valueInputOption\": \"USER_ENTERED\"}" \
  --json '{"values": [["Timestamp", "Student_ID", "Student_Name", "Score_%", "Time_Spent_Sec", "Attention_Drift_Count", "Correct_Count", "Total_XP", "Stars_Earned", "Module"]]}'
