# PRD — Experiment 3: Portfolio Roll‑up Dashboard (Lite) (S2.1)

Status: Ready for implementation (V0, frontend-only)
Owner: Product + Frontend
Traceability: OST S2.1 (Roll-up dashboard); Roadmap MUST; Pain points #2 (visibility/reporting)

1) Problem & Context
Leadership at 30–50 headcount needs a birds-eye view to avoid switching to enterprise tools. A minimal roll‑up view should aggregate status and progress using in-memory data.

2) Objectives & Success Metrics (Prototype)
- Provide a new “Dashboard” tab with:
  - Issues by Status (global counts)
  - Active Sprint Progress (Done/Total, %)
  - 7‑Day Throughput (count of issues moved to Done recently; approximated via updatedAt)
  - Optional: Workload by Assignee (non‑Done counts, top 5)
- Real-time: Numbers update immediately when issues/sprints change.
- Demo screenshots of all cards; empty states behave gracefully.

3) Scope (V0)
- Purely derived metrics from issues[] and sprints[].
- Approximate throughput using updatedAt (no historical event store).
- Use existing status/priority color tokens from UI.

Out of scope (V0)
- True flow metrics (cycle time, time-in-status), multi-project portfolio, filters, charts.

4) User Stories
- As an executive, I see how work is distributed by status and whether the active sprint is on track.
- As a PM, I get a simple throughput signal for the last 7 days without complex setup.

5) UX / UI Specification

Navigation (components/navigation.tsx)
- Add “Dashboard” tab alongside Issues / Current Sprint / Sprints.
- app/page.tsx manages selected view: 'issues' | 'currentSprint' | 'sprints' | 'dashboard'.

Dashboard Layout (components/dashboard-summary.tsx)
- Header: “Dashboard”
- Section A — Issues by Status
  - 4 stat cards: Todo, In Progress, In Review, Done
  - Show count and percentage of total (e.g., 8 (40%))
  - Colors use statusColors mapping.
  - Tooltip: “Count across all issues”
  - Empty state: Show zeros and subtle hint if no issues.
- Section B — Active Sprint Progress
  - If an Active sprint exists:
    - Name + date range (startDate → endDate)
    - Progress bar: Done/Total; percent computed as (done/total*100)
    - Subtext: “X of Y issues Done”
    - If total = 0: show 0% with empty progress bar.
  - If no Active sprint: Card with “No active sprint” message and CTA: “Create or start a sprint.”
- Section C — 7‑Day Throughput
  - Numeric card: “Done last 7 days”
  - Rule: count issues with status === 'Done' and updatedAt >= now - 7 days.
  - Subtext: “Approx. via last update time”
  - Tooltip explaining approximation limitation.
- Section D — Workload by Assignee (optional)
  - List top 5 assignees by count of issues not Done.
  - Show “Unassigned” bucket.
  - Small badge with count; clicking item (optional V0) filters Issues view by that assignee (if easy), else non-interactive.

Accessibility
- All cards have ARIA labels for screen readers.
- Sufficient color contrast; numbers always accompanied by text labels (not color-only).

6) Data Derivation Rules

A) countsByStatus
- Initialize all statuses to 0 to avoid undefined.
- countsByStatus[status]++ for each issue.
- percent = count / totalIssues * 100 (0 when total = 0).

B) activeSprint
- activeSprint = sprints.find(s => s.status === 'Active').
- activeSprintIssues = issues.filter(i => i.sprintId === activeSprint?.id).
- done = activeSprintIssues.filter(i => i.status === 'Done').length
- total = activeSprintIssues.length
- percent = total === 0 ? 0 : Math.round((done / total) * 100)

C) doneLast7Days
- now = Date.now(); threshold = now - 7 days
- Count issues with status === 'Done' and new Date(issue.updatedAt).getTime() >= threshold

D) workloadByAssignee
- For each issue where status !== 'Done', group by issue.assignee || 'Unassigned'
- Sort descending by count and take top 5.

7) Edge Cases & Decisions
- No issues: All counts 0; cards still render; educational hint shown.
- No sprints: Active Sprint card shows “No active sprint”.
- Multiple active sprints (should not happen): pick first found; log warning in dev.
- Dates invalid: render “—” for missing start/end dates.
- Timezone: use local time for thresholds; display dates in locale string.
- Performance: derived in render; arrays are small in V0.

8) Risks & Mitigations
- Approximate throughput may be misleading: add tooltip and copy; acceptable for V0.
- Cluttered UI: keep cards compact, with progressive disclosure via tooltips.

9) QA Plan (Manual)
- Update issue statuses; Status cards and Throughput reflect immediately.
- Start/End a sprint; Active Sprint card updates correctly; 0% when total 0.
- Throughput counts only Done issues changed within last 7 days by updatedAt.
- Workload list shows Unassigned; sorted correctly; limited to 5.

10) Implementation Checklist (Files to touch)
- app/page.tsx: add 'dashboard' view and route logic
- components/navigation.tsx: add Dashboard tab
- components/dashboard-summary.tsx: new component implementing sections A–D
- types/index.ts: none required (reuse existing Issue/Sprint)
- lib/data.ts: none required

11) Demo Script
- Navigate to Dashboard; show Status totals.
- Start a sprint; show Active Progress updates.
- Move issues to Done; refresh numbers.

12) Acceptance Criteria (Go/No-Go)
- Dashboard tab exists and renders 3 core sections (A, B, C); optional D if implemented.
- Numbers update in real-time with state changes.
- Empty states are graceful; no crashes without data.
