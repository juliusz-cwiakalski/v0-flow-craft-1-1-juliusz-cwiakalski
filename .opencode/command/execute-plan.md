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

High-level workflow
1) Pre-flight context
   - Resolve plan path (default). Load and parse all checklist items, keeping order. Determine remaining unchecked steps.
   - Detect package manager and scripts from package.json. If runInstall=true, run dependency install.
   - Run fast health checks: typecheck, then tests. Capture baselines.
   - If confirmEach=true, present the next step summary and wait for confirmation; otherwise proceed.

2) Execute each unchecked plan step (loop)
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
     • Unit tests: add/update tests; must pass. Retry flakies up to 2 times.
     • Optional quick smoke: run a tiny usage path if applicable (no long-running servers).
   - Update docs if the plan calls for it (specs/changelog/types docs). Keep them concise and accurate.
   - Mark the step as done in the plan ([ ] -> [x]) with a one-line note of what changed and links to key files.
   - Commit (if commit=true): conventional message. Example: "feat(history): compute throughput from status-only change entries; fallback to updatedAt"
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
- On failure, capture the exact error output. Attempt up to 3 focused fixes. If still failing, back out the last risky change and choose a simpler approach. Record the final state and rationale.
- Only ask for user input when truly blocked by missing product decisions or irreconcilable conflicts.

Plan grammar and updates
- The plan uses markdown checkboxes for steps and may include sub-bullets with details and acceptance criteria.
- Update the exact checkbox line from "- [ ]" to "- [x]" when done. Append a concise parenthetical note, e.g., "(done: updated throughput-card.tsx; tests added)".
- Do not reorder steps. If a step is found to be dependent on a later step, note the dependency and proceed with the dependency first.

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

Proceed to execute the plan now unless confirmEach=true. If dryRun=true, perform discovery and planning and list intended diffs/commands without applying them.

$ARGUMENTS
