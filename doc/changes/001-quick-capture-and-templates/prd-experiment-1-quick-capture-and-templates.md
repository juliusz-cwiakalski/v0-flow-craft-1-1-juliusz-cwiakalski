# PRD — Experiment 1: Quick Capture + Process Templates (S3.4 + S4.3)

Status: Ready for implementation (V0, frontend-only)
Owner: Product + Frontend
Traceability: OST S3.4 (Quick Capture), S4.3 (Process Templates); Roadmap MUST (S3.4), MUST (S4.3); Pain points #1 (coordination tax), #5 (usability)

1) Problem & Context
Teams experience high coordination tax and inconsistent task quality. Capturing small tasks/requests is slow and fragmented (notes/Slack). FlowCraft V0 must reduce “work-about-work” and standardize inputs to keep teams from migrating.

2) Objectives & Success Metrics (Prototype)
- Reduce time-to-capture: Create a valid issue from anywhere in ≤10 seconds via keyboard or 1 click.
- Standardize inputs: ≥70% of issues created via Quick Capture use a template during demo sessions.
- Improve clarity: Issue cards display Acceptance Criteria (AC) progress badge; updates reflect immediately after edits.
- Demo-ready artifacts: Screenshots of Quick Capture modal, AC badge on issue cards, and AC checklist in Issue Form.

3) Scope (V0)
- Global Quick Capture Modal (component): Shortcut Q, and a “Quick Add” button in top navigation.
- Template support: Bug, Feature, Customer Request. Code-defined (no UI to manage templates).
- Prefills: title prefix, default status/priority, optional assignee placeholder, acceptance criteria list.
- Acceptance Criteria (AC): stored per issue; editable in Issue Form; progress badge shown on Issue Card.
- In-memory state only; no backend.

Out of scope (V0)
- Email-to-task, Slack ingestion (S3.2 future).
- Template administration UI.
- Reorder AC items (static order only), rich text AC.

4) User Stories
- As a PM, I can press Q and quickly capture a task with minimal fields, so no context is lost.
- As an engineer, I can use a “Bug” template to auto-fill AC and priority, reducing admin work.
- As a team lead, I can see AC progress on cards to quickly gauge task definition quality.

5) UX / UI Specification

Entry points
- Navigation: Add a primary “Quick Add” button near existing actions in components/navigation.tsx.
- Keyboard: Pressing Q (when no input is focused) opens modal. Esc closes.

Quick Capture Modal (components/quick-capture.tsx)
- Title (required, text, auto-focused)
- Template (select: None, Bug, Feature, Request)
- Priority (select: P0–P5; default from template or P3)
- Status (select: Todo/In Progress/In Review/Done; default from template or Todo)
- Assignee (text input; optional)
- Sprint (select; optional; hide Completed sprints; show “No sprints” empty state)
- Acceptance Criteria (preview-only in this modal; created from template or empty; editable later in Issue Form)
- Actions: [Create Issue] (primary, disabled until valid) | [Cancel]
- Validation: Title non-empty; all other fields optional within allowed values.

Issue Form (components/issue-form.tsx) updates
- Template dropdown visible in Create mode (optional in Edit).
- Acceptance Criteria editor section:
  - List of items (checkbox + text)
  - Add item (max 10 items)
  - Remove item (with confirm)
  - Toggle item done/undone
  - Validation: text non-empty to save; duplicates allowed; order preserved.

Issue Card (components/issue-card.tsx) updates
- AC progress badge displayed if acceptanceCriteria exists:
  - “AC x/y”
  - Green variant when x === y and y > 0, neutral otherwise
  - Tooltip: “Acceptance Criteria completed”
  - Accessible label for screen readers.

Copy (default)
- Templates:
  - Bug: prefix “[Bug] ”, default priority P1, status Todo; AC:
    1) Steps to reproduce defined
    2) Expected vs actual behavior described
    3) Reproduction confirmed
  - Feature: prefix “[Feature] ”, priority P3, status Todo; AC:
    1) Acceptance scenarios listed
    2) Non-functional constraints noted
    3) UX mock agreed
  - Request: prefix “[Request] ”, priority P2, status Todo; AC:
    1) User impact clarified
    2) Success criteria measurable
    3) Approver identified

6) Data Model & Utilities

Types (types/index.ts)
- Extend Issue:
  - templateId?: 'bug' | 'feature' | 'request' | undefined
  - acceptanceCriteria?: { id: string; text: string; done: boolean }[]

Data (lib/data.ts)
- ISSUE_TEMPLATES: Record<string, { id: string; name: string; defaults: Partial<Issue>; acceptanceCriteria: string[] }>
- applyIssueTemplate(templateId: string): Partial<Issue> & { acceptanceCriteria: Issue['acceptanceCriteria'] }
  - Map strings to AC objects { id: uuid-like, text, done: false }
- generateACId(): string (simple unique id; e.g., 'ac-' + Math.random().toString(36).slice(2))

7) Interaction Rules & Validation

Template selection behavior
- When user selects a template in Quick Capture:
  - If Title is empty, prefill prefix. If not empty, DO NOT override user-entered title.
  - Priority/Status are set from template only if user hasn’t changed them yet in this modal.
  - AC preview is generated from template, stored in pending payload; final editable in Issue Form.
- Switching templates:
  - If AC exists in current draft and differs from new template AC, show a brief confirm: “Switching template will replace acceptance criteria preview.” Options: Continue (replace) / Keep current.
  - Title prefix update only if title still begins with the previous template’s prefix and has not been modified beyond it.

Acceptance Criteria editing
- In Issue Form only:
  - Add (up to 10), toggle done, remove with confirm.
  - Saving issue persists AC.
  - AC badge updates immediately on save.

Sprints dropdown
- Only Planned/Active sprints selectable; Completed are disabled with tooltip “Cannot assign to completed sprint.”

Keyboard
- Q opens Quick Capture (global), Enter submits when valid, Esc closes.

8) Edge Cases & Decisions
- Empty Sprints: Sprint select hidden or shows “No sprints available”.
- Title length: soft limit 120 chars; allow longer but no error (truncate visually).
- Duplicate titles: allowed (no validation).
- AC empty: AC badge hidden; editor section collapsed by default.
- Template None: no prefix/AC; user sets fields manually.
- Rapid open/close: modal state resets on open; template resets to None.
- Accessibility: Focus trap in modal, ARIA labels for inputs and badge, keyboard-operable buttons.

9) Risks & Mitigations
- Too many options in Quick Capture → keep fields minimal, template optional, title auto-focused.
- Confusion when switching templates → confirm dialog when replacing AC preview.

10) QA Plan (Manual)
- Keyboard: Q opens; Esc closes; Enter submits valid form.
- Templates fill defaults; switching prompts AC replacement; “Keep current” preserves.
- Create issue with Bug → Issue card shows “AC 0/3”.
- Edit AC to complete 2/3 → badge updates to “AC 2/3”.
- Assign to Completed sprint disabled.
- No sprints: Sprint field hidden or disabled with copy.

11) Implementation Checklist (Files to touch)
- app/page.tsx: state + handler handleQuickCreateIssue(payload)
- components/navigation.tsx: “Quick Add” button + Q shortcut wiring
- components/quick-capture.tsx: new modal component
- components/issue-form.tsx: template dropdown (create), AC editor
- components/issue-card.tsx: AC progress badge
- types/index.ts: Issue extensions
- lib/data.ts: templates + applyIssueTemplate()

12) Demo Script
- Show Quick Add (Q) → select Bug → create.
- Show Issue Card with AC badge.
- Open Issue, check 1 AC → save → badge updates.

13) Acceptance Criteria (Go/No-Go)
- Quick Capture works via keyboard and button; title required validation.
- Templates apply correct defaults and AC.
- AC editor persists state and badge updates.
- No regressions in existing issue CRUD.
