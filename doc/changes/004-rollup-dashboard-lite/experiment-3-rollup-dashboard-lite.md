# Experiment 3 — Portfolio Roll‑up Dashboard (Lite) (S2.1)

Why now
- Visibility is a top churn driver for teams at 30–50 people. A minimal roll‑up creates an executive view with low effort in V0.

Hypothesis
If leadership can see a concise, aggregate view (status breakdown, per‑sprint progress, 7‑day Done throughput), they can manage without switching tools, reducing churn.

Success criteria (prototype)
- New “Dashboard” tab in navigation.
- Cards displaying:
  - Issues by status (Todo/In Progress/In Review/Done)
  - Active sprint progress (Done/Total, with percent)
  - 7‑day throughput: count of issues that reached Done in the last 7 days (approximation via updatedAt)
- Optional: Workload by assignee (count of non‑Done issues)

Scope (V0)
- Purely frontend derived metrics from in‑memory arrays.
- Approximate throughput by counting issues with status === 'Done' and updatedAt within last 7 days.

Out of scope (V0)
- Advanced flow metrics (true cycle time), historical charts, filters, multi-project portfolios (future).

UX spec
- Navigation: Add “Dashboard” tab.
- Dashboard layout (components/dashboard-summary.tsx):
  - Top row: Status Breakdown (4 small stat cards)
  - Second row: Active Sprint Progress (progress bar + dates)
  - Third row: 7‑day Throughput (numeric pill) and optional Workload by Assignee (simple list)

Developer implementation plan

New component: components/dashboard-summary.tsx
- Props: issues: Issue[], sprints: Sprint[]
- Derived data:
  - countsByStatus: Record<IssueStatus, number>
  - activeSprint: Sprint | undefined
  - activeSprintIssues: Issue[]
  - activeProgress: { done: number; total: number; percent: number }
  - doneLast7Days: number (status === 'Done' && updatedAt >= now - 7 days)

Navigation (components/navigation.tsx)
- Add “Dashboard” tab alongside Issues / Current Sprint / Sprints
- Maintain selected view state via app/page.tsx

Root view (app/page.tsx)
- Extend selectedView union with 'dashboard'
- Render <DashboardSummary issues={issues} sprints={sprints} /> when active

QA checklist (manual)
- Empty state when no active sprint (progress card hidden or shows 0%)
- Status counts align with Issues list filters
- Changing an issue status updates dashboard numbers immediately

Artifacts for certification
- Screenshot: Dashboard view with all three sections
- Screenshot: Active Sprint Progress percent visible

Files most likely to need changes (add to chat)
- app/page.tsx
- components/navigation.tsx

New files to add
- components/dashboard-summary.tsx
