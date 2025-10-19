# CHANGE SPECIFICATION

## SUMMARY

Introduce a **Roll‑up Dashboard (Lite)** that provides portfolio‑level visibility (status breakdown, active sprint progress, rolling throughput, workload by assignee) and a **cross‑view filtering model** for **Projects** and **Teams** (multi‑select). Persist user‑scoped filters and dashboard time range in Redux + local storage (per ADR‑0008). Add **Issue status‑change history** (store + issue details view) to improve throughput accuracy over time. Include minimal **Projects & Teams management** (seed one default each). Track key **telemetry** events. Keep scope **frontend‑only V0**, derived from Redux state. fileciteturn0file1 fileciteturn0file2 fileciteturn0file3 fileciteturn1file0

## GOAL

Deliver instant, low‑overhead visibility for leaders of 30–50‑person orgs and PMs by (1) aggregating progress in a single dashboard and (2) letting users focus on the subset of **Projects/Teams** they oversee, with filters that persist across **Issues**, **Current Sprint**, and **Dashboard**. Lay foundations for true flow metrics by recording **status‑change history**. fileciteturn0file2

## USER INPUT/OUTPUT FLOW

* **Global scope controls (user‑scoped):**

    * Users select one or more **Projects** and/or **Teams** from multi‑select controls available in: **Issues**, **Current Sprint**, and **Dashboard**.
    * Selections are persisted in Redux + local storage and applied consistently when navigating between these views. A **Clear filters** action resets scope to “All”. (Per ADR‑0008 persistence standard.) fileciteturn0file0
* **Dashboard (Lite):**

    * **Header controls:** Project(s), Team(s), **Time Range** presets (7/14/30 days) + **Custom** (date pickers). Default: **Last 7 days (rolling)**.
    * **Cards:**

        1. **Issues by Status** — counts + % across Todo/In Progress/In Review/Done.
        2. **Active Sprint Progress** — Done/Total + %. Shows sprint name and date range; empty state when no active sprint.
        3. **Throughput (rolling)** — count of issues that entered **Done** within the time window (prefer status history; fallback to `updatedAt` approximation). Tooltip clarifies approximation when in fallback. fileciteturn0file2
        4. **Workload by Assignee** — Top‑N (default 5) assignees by count of **non‑Done** issues; includes **Unassigned** bucket.
* **Issues view:**

    * Shows list filtered by selected Project(s)/Team(s). Includes **multi‑select controls** and **Clear filters**. New issues default their `projectId`/`teamId` to the **last used** values; users can change.
    * Each issue card displays the current **Project** and **Team** (badges/labels) to reinforce scope; gracefully show **Unassigned** when missing.
* **Current Sprint view:**

    * Kanban displays only issues in the **active sprint** intersected with selected Project(s)/Team(s). Includes the same scope controls and **Clear filters**.
    * Each Kanban card displays the current **Project** and **Team** (badges/labels); these reflect the global filters and the issue’s own assignment.
* **Issue details (status history):**

    * Read‑only timeline panel: `(timestamp) from → to`. New entry appended on every status change. Dates formatted in **user locale**.
    * **Project** and **Team** are easily editable via dropdowns. Saving updates the issue immediately (Redux) and updates `lastUsedProjectId`/`lastUsedTeamId` when appropriate.

## AFFECTED COMPONENTS

> Use **logical names**, not repository paths.

* [MODIFY] **Navigation** — Add **Dashboard** tab (placed after **Current Sprint**, before **Sprints**) for prominent discovery without disrupting daily flow. fileciteturn0file1
* [CREATE] **Dashboard View (container)** — Hosts scope/time controls and composes cards (StatusBreakdown, ActiveSprintProgress, Throughput, WorkloadByAssignee). fileciteturn0file2
* [CREATE] **Dashboard Subcomponents** — `StatusBreakdownCard`, `ActiveSprintProgressCard`, `ThroughputCard`, `WorkloadByAssigneeCard` (pure, memoizable derivations). fileciteturn0file2
* [MODIFY] **Issues View** — Add Project(s)/Team(s) multi‑select filters (+ Clear) and apply to list/metrics. Defaults new issues to last used scope. fileciteturn0file1
* [MODIFY] **Current Sprint View** — Add the same scope controls (+ Clear) and filter board content accordingly. fileciteturn0file1
* [MODIFY] **Redux — Issues state** — Add `projectId`, `teamId`, `statusChangeHistory: Array<{ from,to,atISO }>`; update history and `updatedAt` on status changes.
* [CREATE] **Redux — Projects state** — Minimal entity store with seed **“Main Project”** on first run (CRUD for management panel).
* [CREATE] **Redux — Teams state** — Minimal entity store with seed **“Main Team”** (CRUD for management panel).
* [MODIFY/CREATE] **Redux — Preferences/UI state** — Persist: `selectedProjectIds[]`, `selectedTeamIds[]`, `lastUsedProjectId`, `lastUsedTeamId`, `dashboardTimeRange`.
* [MODIFY] **Issue Creation (standard & quick capture)** — Initialize `projectId`/`teamId` from **Preferences/UI**; update preferences after creation. fileciteturn0file1
* [MODIFY] **Issue Details View** — Add **Status History** panel (read‑only V0).
* [CREATE] **Settings Panel (Projects & Teams Management)** — Simple CRUD UI to define Projects/Teams; stored entirely in UI via Redux + local storage per ADR‑0008; accessible from global navigation; guard deletes when referenced.
* [MODIFY] **Telemetry Integration** — Emit dashboard and filter interaction events via existing telemetry adapter.

## DECISIONS

* **State & Persistence** — Use **Redux Toolkit + local storage** per ADR‑0008 for all new slices and preferences. ✅ fileciteturn0file0
* **Dashboard placement** — After **Current Sprint**, before **Sprints**. ✅
* **Component granularity** — Split dashboard into subcomponents for maintainability; container coordinates scope/time controls. ✅ fileciteturn0file2
* **Styling** — Reuse existing tokens/components; responsive 2×2 card layout (stack on small screens). ✅ fileciteturn0file1
* **Time window** — Default **Last 7 days (rolling)**; presets 7/14/30 + Custom; display in **user locale**. ✅
* **Throughput** — Prefer **statusChangeHistory** (`to==='Done'` within window); fallback to PRD approximation using `updatedAt` when absent; tooltip clarifies approximation. ✅ fileciteturn0file2
* **Workload** — Include Top‑5 non‑Done issues per assignee; show **Unassigned**; static in V0 (no click‑through) to minimize scope. ✅ fileciteturn0file2
* **Accessibility** — Skip ARIA for prototype; note for future. ✅
* **Telemetry** — Add `dashboard_view_opened`, `dashboard_time_range_changed`, `dashboard_scope_changed`, `filters_cleared`, `scope_changed_on_issues`, `scope_changed_on_current_sprint`. ✅
* **Testing** — Minimal unit tests for **pure derivations** (status counts/%, sprint progress, throughput window (history + fallback), workload grouping) and **filter application**. Skip complex UI tests for speed. ✅
* **Projects & Teams** — Introduce simple entities and management panel; seed one default each; **sprints remain shared** across projects/teams; filters scope the data shown. ✅ fileciteturn0file1

## IMPLEMENTATION INSTRUCTIONS

* **Scope model (Preferences/UI state):**

    * Structure: `{ selectedProjectIds: string[], selectedTeamIds: string[], lastUsedProjectId?: string, lastUsedTeamId?: string, dashboardTimeRange: { preset: '7d'|'14d'|'30d'|'custom', fromISO?: string, toISO?: string } }`.
    * Persist this state; selectors return effective scope for all views.
* **Status history mechanics:**

    * On issue status change, append `{ from, to, atISO: new Date().toISOString() }` and update `updatedAt`. Display in Issue Details as reverse‑chronological list with locale formatting.
* **Derivation helpers (pure functions):**

    * `deriveCountsByStatus(issues)` → map and percentages.
    * `deriveActiveSprintProgress(issues, sprints)` → `{ done, total, percent, sprintMeta }` (first Active sprint; 0% if none/total 0).
    * `deriveThroughput(issues, window)` → prefer history hits to `to:'Done'`; else fallback to `updatedAt`+`status==='Done'` (flag `approximate=true`).
    * `deriveWorkloadByAssignee(issues, topN=5)` → array of `{ assigneeLabel, count }`, include `Unassigned` bucket.
    * All helpers accept **already‑scoped** issues (by Projects/Teams) provided by selectors.
* **Views:**

    * **Issues** — Add Project(s)/Team(s) multi‑select chips/menus + **Clear filters** button; apply scope to list. On issue creation success, set preferences `lastUsedProjectId/TeamId` to the chosen values (and keep existing defaults for next time).
    * **Current Sprint** — Same controls; board shows only scoped issues within active sprint; **Clear filters** resets scope.
    * **Dashboard** — Header with scope + time controls; render 4 cards in 2×2 grid. Cards consume **scoped** issues/sprints and selected time window.
* **Projects & Teams management panel (Settings):**

    * Minimal CRUD lists (name, createdAt). Prevent deletion if referenced by any issue (V0 constraint). Seed **Main Project**/**Main Team** on first run via bootstrap effect.
    * Accessible via a top‑level **Settings** entry in the app navigation.
    * Stored entirely in UI via Redux + local storage per **ADR‑0008**; no backend calls in V0.
* **Telemetry wiring (examples):**

    * On Dashboard mount: `dashboard_view_opened({ projectIds, teamIds, timeRange })`.
    * On time range change: `dashboard_time_range_changed({ preset, fromISO?, toISO? })`.
    * On scope change in any view: `dashboard_scope_changed` (Dashboard), `scope_changed_on_issues`, `scope_changed_on_current_sprint` with `{ projectIds, teamIds }`.
    * On Clear filters: `filters_cleared({ view })`.
* **Testing (minimal):**

    * Unit tests for derivations and for scope selectors applying multi‑select filters. Avoid rendering tests; focus on logic.

## IMPLEMENTATION CHECKLIST

- Redux slices exist for **Projects** and **Teams** with CRUD reducers/selectors; state is persisted to local storage per **ADR‑0008**.
- On first run, app seeds one default of each: **Main Project** and **Main Team**.
- A top‑level **Settings** panel is accessible from navigation with simple CRUD UIs for Projects and Teams:
  - Create/Edit with name validation; show `createdAt`.
  - Prevent delete when referenced by any Issue.
- A persisted **Preferences/UI** slice contains: `selectedProjectIds[]`, `selectedTeamIds[]`, `lastUsedProjectId`, `lastUsedTeamId`, `dashboardTimeRange`.
- Scope controls (Projects/Teams multi‑select) exist on: **Issues**, **Current Sprint**, and **Dashboard**; include a working **Clear filters** action.
- Global scope selections persist across page reloads and are applied consistently to all selectors and derived data.
- Issue cards in **Issues** and **Current Sprint** visibly show the current Project and Team (badges/labels); fallback to **Unassigned** when missing.
- **Issue Details** view allows changing Project and Team via dropdowns; saving updates the Issue and, when relevant, `lastUsedProjectId`/`lastUsedTeamId`.
- **Dashboard** consumes the same scoped issues/sprints and reflects the currently selected Projects/Teams and Time Range.
- Throughput derivation prefers status history; falls back to `updatedAt` when necessary and indicates “approximate”.
- Telemetry emitted: `dashboard_view_opened`, `dashboard_time_range_changed`, `dashboard_scope_changed`, `filters_cleared`, `scope_changed_on_issues`, `scope_changed_on_current_sprint`.
- Minimal unit tests cover: status breakdown, active sprint progress, throughput (history + fallback), workload grouping, and scope filter selectors.

## ACCEPTANCE CRITERIA

- Managing Projects/Teams:
  - User can create, edit, and delete Projects and Teams in **Settings**; data persists across reloads.
  - Attempting to delete a Project/Team that is referenced by any Issue is prevented with a clear message.
- Global filtering:
  - Selecting Projects/Teams in any of the three views updates the others after navigation; clearing filters resets all views to “All”.
- Issue presentation and editing:
  - Every issue card in **Issues** and **Current Sprint** shows Project and Team.
  - In **Issue Details**, user can easily change Project/Team; changes save immediately and reflect on cards and lists.
  - New Issues default to the last used Project/Team; users can override during creation.
- Dashboard consistency:
  - Dashboard metrics and cards reflect the currently selected Projects/Teams and Time Range.
- Derivations and telemetry:
  - Throughput indicates “approximate” when falling back to `updatedAt`.
  - Defined telemetry events fire at the specified interaction points.

## AI CODING AGENT PROMPT

Implement **Change 003 — Roll‑up Dashboard Lite + Projects/Teams + Cross‑View Filters** in the frontend using the existing FlowCraft patterns:

* Add **Projects** and **Teams** entity slices (Redux, persisted), seeded with one default each; create a simple **management panel** (CRUD). Sprints remain shared.
* Extend **Issues state** with `projectId`, `teamId`, and `statusChangeHistory`. On every status change, append a `{ from,to,atISO }` entry and update `updatedAt`.
* Add a **Preferences/UI** state that persists: `selectedProjectIds[]`, `selectedTeamIds[]`, `lastUsedProjectId`, `lastUsedTeamId`, `dashboardTimeRange`.
* Update **Issue creation flows** (standard & quick capture) to default `projectId`/`teamId` from last used; update those preferences after each creation.
* Add scope controls (Projects/Teams **multi‑select**) + **Clear filters** to **Issues**, **Current Sprint**, and **Dashboard**; selections persist and apply consistently across these views.
* Ensure each issue card in **Issues** and **Current Sprint** displays the current **Project** and **Team** (badges/labels).
* Make **Project** and **Team** editable in **Issue Details** via dropdowns; persist changes and update `lastUsedProjectId`/`lastUsedTeamId` as appropriate.
* Build **Dashboard (Lite)** container + four **subcomponents** (StatusBreakdownCard, ActiveSprintProgressCard, ThroughputCard, WorkloadByAssigneeCard). The container exposes scope + time‑range controls (7/14/30 days + Custom); default **Last 7 days (rolling)**, locale dates.
* Derivations are **pure and memoizable**. Throughput **prefers** status history entries where `to==='Done'` within window; **fallback** to (`status==='Done'` && `updatedAt` within window) with an “approximate” tooltip indicator.
* Place Dashboard tab **after Current Sprint** and **before Sprints** in Navigation. Keep styling consistent with the system’s components/tokens.
* Emit telemetry events: `dashboard_view_opened`, `dashboard_time_range_changed`, `dashboard_scope_changed`, `filters_cleared`, `scope_changed_on_issues`, `scope_changed_on_current_sprint` via the existing telemetry adapter.
* Implement minimal unit tests for derivations and scope selectors; skip complex UI rendering tests.
* Use **logical names** only; do **not** reference or create specific file paths in this prompt.

## MERGE REQUEST TEMPLATE

### Checkout Command

\`\`\`bash
git checkout -b feat/rollup-dashboard-lite-projects-teams-cross-view-filters
\`\`\`

### Commit Message (used as MR title and description)

\`\`\`text
feat: roll‑up dashboard lite + projects/teams entities + cross‑view filters with persistence

- Add Projects/Teams slices with default seeding and simple management panel
- Extend Issues with projectId/teamId and statusChangeHistory; show history in Issue details (read‑only)
- Add user‑scoped multi‑select filters (Projects/Teams) to Issues, Current Sprint, Dashboard + Clear filters
- Implement Dashboard (Lite) with Status, Active Sprint Progress, Throughput (history‑aware, fallback to updatedAt), Workload cards
- Persist filters and dashboard time range in Redux + local storage (ADR‑0008)
- Telemetry: dashboard_view_opened, dashboard_time_range_changed, dashboard_scope_changed, filters_cleared, scope_changed_on_issues, scope_changed_on_current_sprint
- Minimal unit tests for derivations and scope selectors
\`\`\`
