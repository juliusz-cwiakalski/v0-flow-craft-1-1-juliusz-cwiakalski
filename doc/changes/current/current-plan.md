---
id: ROLLUP-ADV-METRICS-2025Q4
status: Proposed
created: 2025-10-23
last_updated: 2025-10-23
owners: ["@juliusz-cwiakalski"]
service: FlowCraft Web App
links:
  - doc/spec/specification.md
  - doc/changes/003-rollup-dashboard-lite/prd-change3-experiment-2-rollup-dashboard-lite.md
  - lib/dashboard-utils.ts
  - components/dashboard/dashboard-view.tsx
summary: >
  Extend the Roll-up Dashboard with advanced operational signals: Workload by Assignee (Top‑N),
  Velocity mini-trend across recent sprints, Blocked and Stale counters, WIP Pressure gauge,
  Cycle-time trend (In Progress → Done), and lightweight Delivery ETA per project. All metrics
  respect existing global Project/Team scope and dashboard time range, persist preferences, and
  include minimal tests and telemetry.
---

## Context and Goals

- Context: The current Dashboard (Lite) provides Status Breakdown, Active Sprint Progress, Throughput, and Workload by Assignee. Cross-view scope (Projects/Teams) and status-change history are implemented and persisted via Redux + localStorage (per ADR-0008).
- References: See doc/spec/specification.md for implemented slices/components and Change 003 PRD for dashboard scope and derivations.
- Goals:
  - Add six targeted insights to reduce blind spots and improve planning: Workload Top‑N, Velocity trend, Blocked/Stale signal, WIP pressure, Cycle-time trend, and Delivery ETA.
  - Keep derivations pure and memoizable in lib/dashboard-utils.ts; wire minimal UI cards in components/dashboard/* respecting global filters and time range.
  - Add minimal tests for derivations and selectors; emit telemetry on key interactions.
- Assumptions:
  - A simple numeric WIP threshold and stale-age days can be added to Preferences state and adjusted via UI controls (no separate Settings page required in this iteration).
  - ETA uses recent throughput counts and remaining non‑Done issue counts only (no story points; no probabilistic forecasting beyond optimistic/median windows).

## Scope

- In scope:
  - New derivation helpers in lib/dashboard-utils.ts for velocity, blocked/stale, WIP pressure, cycle-time trend, and delivery ETA.
  - New dashboard cards: Velocity, Blocked & Stale, WIP Pressure, Cycle-time Trend, Delivery ETA. Reuse existing Workload card with clearer “Unassigned” handling.
  - Preferences additions for WIP threshold and stale-age days; basic controls surfaced in Dashboard.
  - Telemetry for card views, control changes, and click-through to Issues (Blocked/Stale).
  - Minimal unit tests covering derivations and edge cases.
- Out of scope:
  - Backend/storage changes; advanced forecasting (e.g., Monte Carlo), story points, and team capacity modeling.
  - Complex charting; use simple sparkline/list/gauge visuals with existing UI primitives.
  - Full Settings UX for thresholds (can be introduced later if needed).
- Constraints:
  - Next.js 14 + TS, Redux Toolkit, persisted via existing localStorage middleware.
  - Follow coding standards in .ai/rules/rules.md; maintain existing file structure and naming.
  - Prefer pure derivations; avoid side effects in render.
- Risks and mitigations:
  - Insufficient status history for cycle-time → show “insufficient data” and skip calc; add tests for fallback.
  - Threshold misconfiguration → default sane values (e.g., WIP=10, stale=7 days) and allow quick edits on the card.
  - Time range confusion across cards → clearly reflect current preset; keep ETA window labeling explicit.

## Phases

### Phase 1: Derivations and Preferences wiring
- Goal: Implement pure helpers and extend preferences to support thresholds/time windows required by new cards, fully compliant with ADR-0008 Redux and persistence conventions.
- Tasks:
  - Tag new preferences fields (`wipThreshold`, `staleAgeDays`) for local persistence in the slice.
  - Update persistence middleware/config to include new fields and ensure versioning/migration logic is compatible.
  - Verify new state changes are traceable in Redux DevTools.
  - [x] Add Preferences fields in types/index.ts: `wipThreshold: number` (default 10), `staleAgeDays: number` (default 7). (done: fields already present in PreferencesState type)
  - [x] Extend lib/redux/slices/preferencesSlice.ts with actions: `setWipThreshold(number)`, `setStaleAgeDays(number)`; ensure persistence via existing middleware. (done: actions and initial state already present)
  - [x] Implement `deriveVelocityBySprint(issues: Issue[], sprints: Sprint[], limit=5)` in lib/dashboard-utils.ts returning last N sprints with done counts and dates. (done: function already existed; tests added in lib/dashboard-utils.test.ts)
  - [x] Implement `deriveBlockedAndStale(issues: Issue[], staleAgeDays: number)` returning per-status counts and total; staleness by `updatedAt` older than N days; blocked if `history` includes latest `blocked` true flag or placeholder field (fallback: infer none). (done: function already existed; tests added with fixed time via jest timers)
  - [x] Implement `deriveWipPressure(issues: Issue[], threshold: number)` returning `{ wip, threshold, ratio, level: 'green'|'amber'|'red' }` with levels at <80%, 80–100%, >100%. (done: function already existed; tests added in lib/dashboard-utils.test.ts)
  - [ ] Implement `deriveCycleTimeStats(issues: Issue[], range: DashboardTimeRange)` computing median and p75 from first transition to In Progress to Done within range; return `insufficientData: boolean` when missing.
  - [x] Implement `deriveDeliveryEtaPerProject(issues: Issue[], sprints: Sprint[], range: DashboardTimeRange)` returning per-project `{ projectId, remaining, recentThroughputMedian, recentThroughputBest, etaMedianDays?, etaOptimisticDays? }` with nulls when throughput=0. (done: added deriveDeliveryEtaPerProject in lib/dashboard-utils.ts; tests in lib/dashboard-utils.test.ts)
- Acceptance criteria:
  - Must: New Preferences fields exist with defaults; actions update and persist.
  - Must: New preferences fields are tagged for local persistence and included in migration/versioning logic.
  - Must: All new state changes are visible and traceable in Redux DevTools.
  - Must: Each derive* function is pure, covered by unit tests with fixed dates, and returns stable shapes even on empty inputs.
  - Must: No changes to existing derive* behavior (status, sprint progress, throughput, workload).
- Files and modules:
  - types/index.ts
  - lib/redux/slices/preferencesSlice.ts
  - lib/dashboard-utils.ts
  - lib/dashboard-utils.test.ts
- Tests:
  - lib/dashboard-utils.test.ts: add suites for velocity, blocked/stale, wip pressure, cycle-time stats, and ETA with fixed timestamps.
- Completion signal:
  - feat(lib): add advanced dashboard derivations and preferences fields

### Phase 2: Dashboard cards UI
- Goal: Add UI cards for new metrics and surface threshold controls.
- Tasks:
  - [ ] Create components/dashboard/velocity-card.tsx rendering last 3–5 sprints with counts (sparkline or list).
  - [ ] Create components/dashboard/blocked-stale-card.tsx showing total blocked and stale per status; click opens Issues with applied filters.
  - [ ] Create components/dashboard/wip-pressure-card.tsx showing gauge/indicator and inline editable threshold; dispatch `setWipThreshold` with telemetry.
  - [ ] Create components/dashboard/cycle-time-trend-card.tsx showing median and p75; show "insufficient data" state when applicable.
  - [ ] Create components/dashboard/delivery-eta-card.tsx listing per active project ETA optimistic/median with caveat tooltip.
  - [ ] Update components/dashboard/dashboard-view.tsx to derive new data via lib/dashboard-utils.ts and render cards; pass preferences and handlers.
- Acceptance criteria:
  - Must: New cards render alongside existing 2x2 grid without layout break; responsive on md breakpoint.
  - Must: Cards reflect current Project/Team scope and dashboard time-range where applicable.
  - Must: WIP threshold is editable and persists; telemetry fires on change.
  - Must: Blocked/Stale card click navigates to Issues view with filters applied.
- Files and modules:
  - components/dashboard/velocity-card.tsx
  - components/dashboard/blocked-stale-card.tsx
  - components/dashboard/wip-pressure-card.tsx
  - components/dashboard/cycle-time-trend-card.tsx
  - components/dashboard/delivery-eta-card.tsx
  - components/dashboard/dashboard-view.tsx
  - lib/telemetry.ts (event hooks if needed)
  - app/page.tsx (if cross-view navigation helpers are required)
- Tests:
  - lib/dashboard-utils.test.ts: light snapshot/shape assertions for data feeding cards.
  - Optionally, components shallow tests for empty states (jest + react-testing-library) under components/__tests__/ if pattern exists.
- Completion signal:
  - feat(dashboard): add velocity, blocked/stale, wip, cycle-time, and ETA cards

### Phase 3: Navigation, click-throughs, and telemetry
- Goal: Ensure interactions are consistent across views and tracked.
- Tasks:
  - [ ] Implement click-through in blocked-stale-card to open Issues view with Project/Team scope plus status filters (and optional stale-age QuickFilter).
  - [ ] Add telemetry events: `velocity_card_viewed`, `blocked_stale_card_viewed`, `wip_threshold_changed`, `cycle_time_card_viewed`, `eta_card_viewed`, and `blocked_stale_clickthrough` with payloads.
  - [ ] Ensure existing `dashboard_time_range_changed` and `dashboard_view_opened` remain unchanged; add emissions on new card mounts.
  - [ ] Update components/scope-filters.tsx if needed to expose helper for building query params for Issues deep link.
- Acceptance criteria:
  - Must: Clicking blocked/stale card opens Issues with filter applied; back/forward navigation works.
  - Must: Telemetry emits on mount/view and on threshold changes; no console errors.
- Files and modules:
  - components/dashboard/blocked-stale-card.tsx
  - components/scope-filters.tsx (helper export if required)
  - lib/telemetry.ts
  - app/page.tsx (deeplink handling if needed)
- Tests:
  - None required beyond derivation tests; manual verification acceptable for navigation. Add unit tests for query param helper in a small util if created (e.g., lib/utils.ts).
- Completion signal:
  - feat(telemetry): wire dashboard card view and click events

### Phase 4: Documentation and polishing
- Goal: Document features, acceptance criteria, and update changelog; finalize tests.
- Tasks:
  - [ ] Update doc/spec/specification.md with new dashboard cards, derivations, preferences fields, and behaviors.
  - [ ] Add brief ADR or note in doc/adr/ on preferences thresholds (optional if covered in ADR-0008 scope).
  - [ ] Update lib/changelog.ts with user-visible changes and deep-link if any.
  - [ ] Run pnpm lint and address warnings; ensure tests pass.
- Acceptance criteria:
  - Must: Spec reflects implemented cards and interactions; changelog entry appears in UI.
  - Must: Lint and tests pass; no type errors.
- Files and modules:
  - doc/spec/specification.md
  - doc/adr/ADR-00xx-WIP-and-stale-thresholds-in-preferences.md (if added)
  - lib/changelog.ts
  - package.json scripts (no change expected)
- Tests:
  - Finalize lib/dashboard-utils.test.ts coverage for edge cases (zero data, missing history, overlapping ranges).
- Completion signal:
  - docs(spec): document advanced dashboard metrics and preferences

## Test Scenarios

- Velocity trend:
  - Done counts computed for last 3–5 sprints; missing sprints handled gracefully. Automate via lib/dashboard-utils.test.ts with fixed sprint windows (e.g., 2025-01-01 to 2025-01-14).
- Blocked & Stale:
  - Stale threshold of 7 days flags issues by updatedAt; blocked defaults to 0 if no blocked flag available; totals per status correct. Automate via unit tests.
- WIP pressure:
  - Ratio and level mapping (<0.8 green, 0.8–1 amber, >1 red) correct for scoped issues. Automate via unit tests.
- Cycle-time trend:
  - Median and p75 computed from In Progress→Done transitions; insufficientData when transitions missing; ignores issues outside time range. Automate via unit tests.
- Delivery ETA:
  - Remaining non‑Done divided by recent throughput median/best yields integer day estimates; when throughput=0, show “insufficient data”. Automate via unit tests.
- Scope and time range:
  - All derive* functions accept already-scoped issues and respect DashboardTimeRange where applicable. Automate via unit tests.

## Artifacts and Links

- Planned docs to create/update:
  - doc/spec/specification.md (Dashboard section: add new cards and preferences)
  - doc/adr/ADR-00xx-WIP-and-stale-thresholds-in-preferences.md (optional)
  - doc/quality/test-specs/dashboard-advanced-metrics.md (test data tables and scenarios)

## Plan revision log

- 2025-10-23: Initial plan drafted for advanced dashboard metrics (this document).

## Execution log

- 2025-10-23 10:00 UTC: Plan created and proposed.
