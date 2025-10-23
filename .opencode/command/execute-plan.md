---
description: Execute implementation plan (world-class agent workflow)
agent: build
#provider: github_copilot
#model: gpt-4.1
---

Purpose
- Execute the implementation plan in @doc/changes/current/current-plan.md end-to-end with high reliability on weaker models.
- Apply small, targeted edits; validate with build, typecheck, and tests; update the plan checklist after each step.
- Ask only when truly blocked. Otherwise, proceed autonomously until done.

Inputs (via $ARGUMENTS)
- plan: path to plan markdown (default: @doc/changes/current/current-plan.md)
- confirmEach: boolean (default false) — require confirmation before each step
- stopAfter: number — stop after N completed steps
- stepsFilter: string|regex — only execute steps whose titles match
- dryRun: boolean — simulate actions; do not persist edits
- runInstall: boolean (default true) — run dependency install pre-flight
- buildCmd: string (default: pnpm build)
- testCmd: string (default: pnpm test)
- typecheckCmd: string (default: pnpm tsc -p tsconfig.json)
- commit: boolean (default true) — create git commits after each step
- branch: string — create/switch to a feature branch for the execution
- feedback: string — inline Markdown feedback to revise the plan before execution
- feedbackFile: string — path to a Markdown file with feedback
- feedbackMode: "merge" | "append" | "rewrite" (default: "merge") — strategy to apply feedback to the plan
- confirmPlanUpdate: boolean (default true) — show computed plan diff before applying
- allowReorder: boolean (default false) — permit reordering/removal/insertion of steps
- anchorStep: string — step title to anchor insertions around (used when allowReorder=true)
- insertPosition: "before" | "after" | "end" (default: "end") — where to insert new steps relative to anchor
- planSection: string — optional section heading within the plan to target (defaults to first checklist in the file)
- planRevisionLogSection: string (default: "Plan revision log") — section to append a summary of applied feedback
- planBackup: boolean (default true) — create a timestamped backup of the plan before patching
- watchFeedback: boolean (default false) — re-check and re-apply feedback before each step (idempotent)
- retryFlakyTests: number (default 2)
- maxFixAttempts: number (default 3)
- commitGranularity: "per-step" | "per-file" (default: "per-step")

Assumptions about this repo
- Stack: Next.js + TypeScript + pnpm.
- Tests: Jest configured via jest.config.js.
- Lint/typecheck: tsc via tsconfig.json.
- Primary plan lives at doc/changes/current/current-plan.md and uses markdown checkboxes [ ] / [x].

Hard rules for code changes
- Read the file before editing. Do not reformat or reorder unrelated code. Keep diffs minimal and localized.
- Preserve imports/exports and public APIs unless the plan requires changes; then update types, docs, and tests accordingly.
- Prefer repository conventions and existing utilities; do not introduce heavy dependencies without necessity.
- No external network calls or secret exposure.
- If information is missing, infer 1–2 reasonable assumptions, proceed, and record assumptions in the plan notes.

Plan feedback and course-correction (optional)
- Feedback sources: use feedback (inline string) and/or feedbackFile (path) to guide plan corrections before implementation.
- Parsing rules:
  • New steps: lines starting with "- [ ]" within a "Steps" context are treated as steps to add.
  • Step updates: provide the exact step title; sub-bullets become acceptance/notes under that step.
  • Constraints: prefix with "Must:" or "Should:"; they become acceptance criteria bullets under the target step or a global notes section.
  • Deletions/deferrals: use "Remove step:<title>" or "Defer step:<title>".
- Merge strategy (feedbackMode):
  • merge: map steps by normalized title; update or add acceptance, add new steps; do not remove/reorder unless allowReorder=true.
  • append: append new steps and notes at the end of the targeted checklist/section.
  • rewrite: replace the targeted checklist with feedback-defined steps (back up first if planBackup=true).
- Placement controls: when inserting new steps and allowReorder=true, use anchorStep + insertPosition; else append to end of targeted checklist.
- Confirmation: if confirmPlanUpdate=true, compute and present a readable diff; require confirmation prior to applying.
- Logging: append a concise summary of applied changes under planRevisionLogSection, including assumptions.
- Commit: if commit=true, commit plan changes as "chore(plan): apply feedback-driven updates" before execution.
- Mid-run updates: if watchFeedback=true, re-parse and apply feedback before each step; changes must be idempotent and preserve already-completed steps.

High-level workflow
0) Plan revision (if feedback provided)
   - Load plan and feedback (inline/file). Determine target section (planSection) and compute changes using feedbackMode.
   - Present diff if confirmPlanUpdate=true; on approval, apply changes. Create a backup if planBackup=true.
   - Append a brief summary under planRevisionLogSection. Commit plan changes if commit=true.

1) Pre-flight context
   - Resolve plan path (default). Load and parse all checklist items, keeping order. Determine remaining unchecked steps.
   - Detect package manager and scripts from package.json. If runInstall=true, run dependency install.
   - Run fast health checks: typecheck, then tests. Capture baselines.
   - If confirmEach=true, present the next step summary and wait for confirmation; otherwise proceed.

2) Execute each unchecked plan step (loop)
   - If watchFeedback=true, re-check feedback and apply idempotent updates to the plan (preserve completed steps).
   For the current step:
   - Step brief: summarize the goal, inputs/outputs, and success criteria in 2–5 bullets.
   - Discover affected files by targeted search before edits (prefer components/, lib/, hooks/, app/, types/, redux/). Open and read relevant files fully enough to avoid missing context.
   - Write or update minimal tests first when changing public behavior (happy path + 1–2 edge cases). Place tests near existing ones (e.g., lib/*.test.ts). Keep tests fast.
   - Implement small, focused edits:
     • Use localized diffs and keep style consistent.
     • Add types and JSDoc when introducing new data shapes.
     • Feature flags or fallbacks where risky.
   - Quality gates for this step:
     • Typecheck: must pass.
     • Unit tests: add/update tests; must pass. Retry flakies up to retryFlakyTests times.
     • Optional quick smoke: run a tiny usage path if applicable (no long-running servers).
   - Update docs if the plan calls for it (specs/changelog/types docs). Keep them concise and accurate.
   - Mark the step as done in the plan ([ ] -> [x]) with a one-line note of what changed and links to key files.
   - Commit (if commit=true): use commitGranularity; prefer per-step conventional messages. Example: "feat(history): compute throughput from status-only change entries; fallback to updatedAt"
   - If stopAfter is reached, stop.

3) Finalization
   - Re-run full quality gates: typecheck, tests, build.
   - Ensure the plan has all steps checked. If anything intentionally deferred, add a short Deferrals section with reasons.
   - Summarize changes at the end of the plan under an Execution log: files touched, major behaviors, and any assumptions.

Quality gates (must be green before done)
- Build: {buildCmd}
- Typecheck: {typecheckCmd}
- Unit tests: {testCmd}
- Smoke sanity: optional minimal interaction for changed UI (e.g., render component and assert key text via existing tests).

Error handling & recovery
- On failure, capture the exact error output. Attempt up to maxFixAttempts focused fixes. If still failing, back out the last risky change and choose a simpler approach. Record the final state and rationale.
- Only ask for user input when truly blocked by missing product decisions or irreconcilable conflicts.

Plan grammar and updates
- The plan MUST follow the structure defined by document-plan: Context and Goals, Scope, Phases, Test Scenarios, Artifacts and Links, Plan revision log, Execution log.
- Tasks to execute are the checkboxes under each "### Phase N: <title>" section in the "Tasks" subsection. The first checklist in the file must be Phase 1 Tasks.
- Update the exact checkbox line from "- [ ]" to "- [x]" when done. Append a concise parenthetical note, e.g., "(done: updated throughput-card.tsx; tests added)".
- Do not reorder phases or tasks. If a step depends on a later step, note the dependency and proceed with the dependency first unless allowReorder=true.
- Feedback-driven edits must preserve already completed steps; when titles change, add a parenthetical alias to retain traceability.

Repository-aware guidance for the current example plan
- Throughput logic (components/dashboard/throughput-card.tsx and lib/dashboard-utils.ts):
  • Use status-only history entries where field === "status" and to === "Done" within the window.
  • Fallback to updatedAt when no status history exists; render a tooltip “approximate”.
  • Ensure non-status changes do not affect metrics.
  • Add unit tests in lib/dashboard-utils.test.ts for both history-present and fallback cases.
- Telemetry (lib/telemetry.ts):
  • Add an event when the history view opens (e.g., event: "history_view_opened", context: issueId, source component).
- UI history panel (components/issue-card-status-history-panel.tsx):
  • Ensure read-only, accessible timeline. Keyboard navigable; clear labels; distinguish status vs other field changes.
  • Prefer existing UI primitives in components/ui/; add ARIA labels and roles as appropriate.
- Tests
  • Add tests that record: title change, status change, and verify both appear in history; throughput uses only status changes.
  • Keep tests deterministic; avoid time flakiness by using fixed timestamps where possible.

Minimal contracts to state before coding each step
- Inputs: relevant files, state shapes, and selectors you’ll rely on.
- Outputs: files edited/created, functions/modules changed, tests added.
- Success: which quality gates must pass, which UI text/behaviors must be visible, which selectors return expected values.
- Edge cases: empty/null history, multiple status flips, timezone/ISO parsing, large lists performance.

Reporting format
- After each step: update the checkbox and add one short note.
- After completion: append an "Execution log" section at the end with a compact bullet list of key changes and any assumptions/deviations.

Operational details for reliability on weaker models
- Plan parsing rules:
  - Recognize checklist items as lines starting with "- [ ]" (unchecked) or "- [x]" (checked).
  - Respect original order; handle nested items by appearance. When stepsFilter is set, include only matching titles (case-insensitive) without reordering.
  - When marking done, change only the checkbox token and append a short note at the end of the same line; do not reflow text.
- Branch and commit policy:
  - If branch is provided, create/switch before any edits. Keep commits atomic (one plan step per commit).
  - Use conventional commits: feat|fix|refactor|test|docs|chore(scope): summary. In the body, mention the step title and key files.
  - If a step yields no changes, skip commit but still annotate the plan.
- Edit discipline:
  - Edit one file at a time for larger steps; validate incrementally. Preserve imports/exports and existing style.
  - Keep diffs minimal; avoid unrelated reformatting or renames.
- Determinism:
  - In tests, use fixed ISO timestamps and avoid non-deterministic Date.now() unless mocked.
  - Prefer UTC and ISO parsing; add a boundary test at 00:00Z when time windows matter.
- Discovery heuristics:
  - Metrics helpers: lib/dashboard-utils.ts; dashboard cards: components/dashboard/*.tsx; telemetry: lib/telemetry.ts.
  - Issue types/selectors: types/index.ts, lib/data.ts, redux/ issues slice.
  - UI primitives: components/ui/*; dialogs: components/ui/dialog.tsx.
- Tests placement and style:
  - Keep unit tests near modules (e.g., lib/*.test.ts). Use Jest only. One happy path + 1–2 edge cases per behavior.
- Lint/typecheck/build detection:
  - Prefer pnpm if pnpm-lock.yaml exists; else npm. Use package.json scripts when present; otherwise invoke tools directly (e.g., "tsc -p tsconfig.json").

Dry run and confirmation modes
- dryRun=true: perform discovery and list planned diffs/tests/commands; do not modify files or commit.
- confirmEach=true: before each step, present a brief summary (goal, files, tests, acceptance) and wait for proceed/skip/defer.

Step acceptance template (for internal use before coding)
- Goal: <one sentence>
- Inputs: <files/modules, state shapes, selectors>
- Outputs: <files edited/created, functions/modules changed, tests added>
- Success: <gates to pass; visible behavior; selectors>
- Edge cases: <3–5 items>

Repository-aware acceptance for the example plan (succinct)
- Throughput uses only status changes to Done in window; fallback to updatedAt with tooltip "approximate" when no status history exists.
- Telemetry logs history view open with issueId and source component.
- History panel renders all change types; is read-only and keyboard navigable; status vs other fields clearly labeled.
- Tests: verify history records title and status changes; throughput excludes non-status changes; timestamps are fixed.

Final reporting
- Ensure "Execution log" at plan end includes:
  - Files touched, commit subjects, and a one-line behavior summary per step.
  - Any assumptions made and deferrals with reasons.

Proceed to plan revision (if feedback provided), then execute the plan unless confirmEach=true or confirmPlanUpdate=true. If dryRun=true, perform discovery and planning and list intended diffs/commands without applying them.

$ARGUMENTS
