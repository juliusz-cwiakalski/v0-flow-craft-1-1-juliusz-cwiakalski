# PRD — Experiment 2: Full Data Export (JSON/CSV) (S1.2)

Status: Ready for implementation (V0, client-only)
Owner: Product + Frontend
Traceability: OST S1.2 (Full, free export); Roadmap MUST; Pain points #3 (vendor lock-in), #2 (reporting)

1) Problem & Context
Prospects fear vendor lock-in and data loss. Providing simple, reliable export builds trust during adoption/migration and reduces churn risk.

2) Objectives & Success Metrics (Prototype)
- Provide “Export” dropdown with 4 actions: Issues JSON/CSV, Sprints JSON/CSV.
- One click downloads files with correct headers/fields.
- Export includes all data in memory (not filtered view).
- Demo screenshots: Export menu + CSV preview in spreadsheet.

3) Scope (V0)
- Client-side serialization and download only (no backend).
- Support JSON (pretty) and CSV (RFC 4180-ish).
- Include core fields: Issues (taskId, title, description, priority, status, assignee, sprintId, createdAt, updatedAt), Sprints (id, name, status, startDate, endDate, createdAt, updatedAt).
- Optional: include AC counts (acTotal, acDone) as extra columns in Issues CSV.

Out of scope (V0)
- PDF export, scheduled reports, partial column masking, compressed archives, import.

4) User Stories
- As a decision-maker, I can export all issues and sprints to review or share with stakeholders.
- As a migrating team, I can export my data anytime to avoid vendor lock-in concerns.

5) UX / UI Specification

Navigation (components/navigation.tsx)
- Add “Export” dropdown/menu in top bar.
- Items:
  - Export Issues (JSON)
  - Export Issues (CSV)
  - Export Sprints (JSON)
  - Export Sprints (CSV)
- Behavior:
  - Clicking triggers immediate download; optional toast “Export started” (non-blocking).

File naming
- issues-YYYYMMDD-HHMMSS.json
- issues-YYYYMMDD-HHMMSS.csv
- sprints-YYYYMMDD-HHMMSS.json
- sprints-YYYYMMDD-HHMMSS.csv
- Time based on user’s local time; zero-padded; 24-hour.

6) Serialization Rules

JSON
- exportAllToJSON(issues, sprints): string (pretty, 2 spaces)
- Issues JSON structure: array of all issues as stored (omit internal functions; include acceptanceCriteria if present).
- Sprints JSON: array of all sprints.

CSV
- CSV functions produce header row + data rows separated by \n.
- Quote fields containing commas, quotes, or newlines. Escape internal quotes by doubling them.
- Dates as ISO 8601 strings (new Date().toISOString()).
- Null/undefined become empty cells.
- Recommended Issues headers:
  - taskId,title,description,priority,status,assignee,sprintId,createdAt,updatedAt,acDone,acTotal
- Recommended Sprints headers:
  - id,name,status,startDate,endDate,createdAt,updatedAt

7) Download Mechanism (lib/export.ts)
- downloadTextFile(filename, text, mime) creates a Blob and uses a temporary <a download> link to trigger save.
- MIME: application/json; text/csv;charset=utf-8

8) Edge Cases & Decisions
- Empty arrays: still download with header-only CSV and valid JSON arrays.
- Large datasets: using Blob is fine for small/medium datasets typical in V0 (hundreds/thousands). No streaming required.
- Special characters in text (commas, quotes, newlines): handled with quoting/escaping.
- New fields in the future: extra JSON fields okay; CSV headers may need updates (backwards-compat not required in V0).
- Filtered view vs full export: always export full data set present in memory to fulfill “full export” guarantee.
- AC export detail: For CSV, include acDone and acTotal only (counts). AC full details available in JSON.

9) Risks & Mitigations
- CSV parsing in spreadsheets varies: stick to RFC-like quoting and UTF-8; test in Google Sheets and Excel.
- User confusion about filtered vs full export: add tooltip “Exports all data, not just current filters.”

10) QA Plan (Manual)
- Trigger each of 4 exports; files download; file names reflect correct timestamp pattern.
- CSV opens in Google Sheets: headers correct, rows align, commas inside description handled.
- JSON pretty printed and contains arrays with expected fields.
- Issues AC counts present when AC exists; zeros when not.

11) Implementation Checklist (Files to touch)
- lib/export.ts: implement csv/json + download helpers
- components/navigation.tsx: add Export dropdown + invoke handlers
- app/page.tsx: implement handlers:
  - handleExportIssuesJSON/CSV
  - handleExportSprintsJSON/CSV

12) Demo Script
- Open Export menu; click Export Issues (CSV); open downloaded file in viewer and show headers/rows.
- Repeat for Sprints JSON.

13) Acceptance Criteria (Go/No-Go)
- All four exports available and functional.
- Data integrity (no broken rows, proper escaping).
- Works without backend.
