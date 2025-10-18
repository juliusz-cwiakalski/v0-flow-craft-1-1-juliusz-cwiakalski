# Experiment 1 — Quick Capture + Process Templates (S3.4 + S4.3)

Why now
- Highest impact on daily productivity and adoption: reduces “work-about-work” and standardizes inputs.
- Low effort in V0: purely frontend, in-memory state; leverages existing Issue create/edit flows.

Hypothesis
If users can create issues with a global Quick Capture and apply ready-made templates (Bug/Feature/Request) with prefilled Acceptance Criteria (AC), then time-to-capture and data quality improve, reducing manual admin and churn drivers.

Success criteria (prototype)
- Create a new issue in ≤10 seconds via Quick Capture.
- ≥70% of new issues use a template in demo sessions.
- Issue cards show an AC completeness badge (e.g., AC 0/3), and the count updates after editing.

Scope (V0)
- Global Quick Capture modal (hotkey: Q, button in top navigation).
- Template picker: Bug, Feature, Customer Request (configurable).
- Prefill: title prefix, default status/priority, optional assignee placeholder, and AC list.
- AC list visible/editable in Issue Form; card shows a compact progress badge.

Out of scope (V0)
- Email-to-task, Slack ingestion (future for S3.2).
- Template admin UI (templates are code-defined constants for now).

UX spec
- Navigation: Add a “Quick Add” button (and keyboard shortcut “Q”).
- Modal: minimal fields (Title [required], Template selector, Priority, Assignee, Status, optional Sprint).
- Template selection auto-fills fields and acceptance criteria list (editable).
- Issue Card: show a small pill “AC: 0/3” when AC exists; clicking “Edit” opens the Issue Form where AC can be checked off.

Developer implementation plan

Data model changes (types/index.ts)
- Extend Issue with optional templateId?: string
- Extend Issue with optional acceptanceCriteria?: { id: string; text: string; done: boolean }[]

Data utilities (lib/data.ts)
- Add ISSUE_TEMPLATES: Record<string, { id: string; name: string; defaults: Partial<Issue>; acceptanceCriteria: string[] }>
  - Templates: “bug”, “feature”, “request”
- Add function: applyIssueTemplate(templateId: string): Partial<Issue> & { acceptanceCriteria: Issue['acceptanceCriteria'] }
  - Maps plain strings to { id, text, done: false }

New component: components/quick-capture.tsx
- Props:
  - isOpen: boolean
  - onOpenChange: (open: boolean) => void
  - onCreate: (payload: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'taskId'>) => void
  - templates: typeof ISSUE_TEMPLATES
- Behavior:
  - Local state for title, templateId, priority, assignee, status, sprintId
  - When template changes, prefill title prefix and AC
  - On submit, call onCreate with merged defaults

Existing components
- components/navigation.tsx
  - Add “Quick Add” button (and wire up ‘Q’ hotkey) to open QuickCapture
- components/issue-form.tsx
  - Add a template dropdown in create mode (optional in edit)
  - Add AC editor: list of checkboxes for acceptanceCriteria with add/remove item
- components/issue-card.tsx
  - Render AC progress badge if acceptanceCriteria exists:
    - label “AC x/y”
    - color change when complete (x === y > 0)

Root integration (app/page.tsx)
- State remains as issues/sprints arrays
- Add handler: handleQuickCreateIssue(payload)
  - Generate taskId with generateTaskId()
  - createdAt/updatedAt timestamps
  - Push into issues
- Pass handlers/props to Navigation and QuickCapture components

QA checklist (manual, V0)
- Press Q opens Quick Capture
- Selecting Bug fills title prefix “[Bug] …” and AC with 3 default items
- Create issue; it appears in Issues list with AC 0/3 badge
- Open Issue Form; check 1 item; badge updates to 1/3

Artifacts for certification
- Screenshot: Quick Capture modal
- Screenshot: Issue card with AC badge
- Screenshot: Issue Form with AC checklist

Files most likely to need changes (add to chat)
- app/page.tsx
- components/navigation.tsx
- components/issue-form.tsx
- components/issue-card.tsx
- types/index.ts
- lib/data.ts

New files to add
- components/quick-capture.tsx
