# Experiment 2 — Full Data Export (JSON/CSV) (S1.2)

Why now
- Directly addresses migration/adoption trust by guaranteeing data portability.
- Feasible in V0: client-side serialization and download, no backend required.

Hypothesis
If users can export all their issues and sprints to JSON/CSV, they will perceive FlowCraft as safe (no lock‑in), increasing willingness to adopt and stay.

Success criteria (prototype)
- “Export Data” dropdown with:
  - Export Issues (JSON)
  - Export Issues (CSV)
  - Export Sprints (JSON)
  - Export Sprints (CSV)
- Clicking an option downloads a file with correct headers/fields.

Scope (V0)
- Client-side export utils
- Dropdown in Navigation, always visible

Out of scope (V0)
- PDF export, scheduled email reports, partial column masking (future S2.3)

UX spec
- Navigation: Add “Export” dropdown with four actions
- Toast/snackbar confirmation after download (optional)

Developer implementation plan

New utility module: lib/export.ts
- exportIssuesToCSV(issues: Issue[]): string
- exportSprintsToCSV(sprints: Sprint[]): string
- exportAllToJSON(issues: Issue[], sprints: Sprint[]): string
- downloadTextFile(filename: string, text: string, mime: string): void

Navigation integration (components/navigation.tsx)
- Add “Export” menu
- Wire menu items to call handlers passed from app/page.tsx

Root handlers (app/page.tsx)
- handleExportIssuesJSON()
- handleExportIssuesCSV()
- handleExportSprintsJSON()
- handleExportSprintsCSV()

CSV columns (recommendation)
- Issues: taskId, title, description, priority, status, assignee, sprintId, createdAt, updatedAt
- Sprints: id, name, status, startDate, endDate, createdAt, updatedAt

QA checklist (manual)
- All four menu items download files
- CSV opens cleanly in spreadsheet apps
- JSON contains arrays with the expected keys and values

Artifacts for certification
- Screenshot: “Export” dropdown visible in the top navigation
- Screenshot: CSV opened showing rows and headers

Files most likely to need changes (add to chat)
- app/page.tsx
- components/navigation.tsx

New files to add
- lib/export.ts
