# Remaining Work — Quick Capture & Templates Settings (Completed)

This document tracks the additional work to extend Quick Capture with Templates management in Settings and Redux persistence, aligned with ADR-0008.

## Scope
- Add Templates management to Settings (new "Templates" tab) with CRUD and default selection.
- Move seeded templates to `lib/demo-data.ts` and hydrate Redux from there.
- Ensure every demo template defines a `defaultAssigneeUserId`.
- Remove legacy template statics/utilities from `lib/data.ts` and refactor consumers to use Redux slice utilities.

## Tasks
- Settings UI [Done]
  - Add `Templates` tab in `components/settings-view.tsx` (adjacent to Projects/Teams/Users).
  - Create `components/settings/templates-panel.tsx`:
    - List templates with `name`, `id`, `prefix`, `priority`, `status`, `defaultAssigneeUserId`, `isDefault`.
    - Actions: Create, Edit, Duplicate, Delete, Set as default.
    - Validation: unique `id`; non-empty `name`; AC strings non-empty; default assignee must reference an existing user.
- Redux [Done]
  - Ensure `lib/redux/slices/templatesSlice.ts` includes:
    - State: `templates: Record<string, IssueTemplate>`, `lastUsedTemplateId?: string`.
    - Actions: `addTemplate`, `updateTemplate`, `deleteTemplate`, `duplicateTemplate`, `setDefaultTemplate`, `setLastUsedTemplateId`.
    - Selectors: `selectTemplates`, `selectDefaultTemplate`, `selectLastUsedTemplateId`.
    - Utility: `applyTemplateDefaults(template, { title, priority, status, assigneeUserId })` that maps AC strings to `{id,text,done:false}`.
  - Persist via existing localStorage middleware (`lib/redux/middleware/localStorage.ts`).
  - Seed from `demoIssueTemplates` in `lib/demo-data.ts` on first load if no templates exist.
- Data Migration [Done]
  - Move template definitions out of `lib/data.ts` into `lib/demo-data.ts` (`demoIssueTemplates`).
  - Remove `ISSUE_TEMPLATES`, `applyIssueTemplate`, `getDefaultTemplate`, `getLastUsedTemplate`, `setLastUsedTemplate` from `lib/data.ts`.
  - Update any consumer components to use Redux selectors/utilities (e.g., Quick Capture, IssueForm).
- Demo Data [Done]
  - Verify `demoIssueTemplates` include `defaultAssigneeUserId` for all templates and a single `isDefault: true`.
- Quick Capture & Issue Form [Done]
  - Quick Capture: source templates via Redux; preselect `lastUsedTemplateId` or default; on create, set `lastUsedTemplateId`.
  - Issue Form: expose template selector in create mode; reuse Redux utilities; AC editing here only.

## QA Checklist (Completed)
- Templates tab renders with list and CRUD actions.
- Enforces exactly one `isDefault` template at a time.
- Validation errors shown for duplicate `id`, empty `name`, invalid `defaultAssigneeUserId`.
- Quick Capture uses Redux templates and remembers last-used after create. [Done]
- Switching templates respects untouched-only prefill; asks on conflict where applicable.
- AC preview in Quick Capture; full edit in Issue Form.
- Demo templates have `defaultAssigneeUserId` values; default template = Feature.
- State persists across reload via localStorage; changes reflected in Quick Capture and Issue Form.

## Notes
- Follow repository UI conventions (Tailwind, shadcn/ui components, `cn` util) and file naming patterns.
- Keep reducers pure; handle persistence via middleware only.
- Log telemetry events via `lib/telemetry.ts` adapter (console backend for V0).
