---
description: Document implementation plan (strict structure; writes to doc/changes/current/current-plan.md)
agent: build
#provider: github_copilot
#model: gpt-4.1
---

Purpose
- Turn the planning discussion into a world-class, executable implementation plan.
- Always write the plan to doc/changes/current/current-plan.md using the strict structure below so execute-plan can parse it deterministically.
- Break larger features into clear phases with tasks, acceptance criteria, links, and tests to draft.

Inputs (via $ARGUMENTS)
- changeTitle: string — short human title of the change.
- changeId: string — optional ID (e.g., CHG-0123). If absent, omit.
- service: string — service/app name (optional).
- summary: string — 1–3 sentence summary.
- planningContext: string — inline context from the prior chat (optional but recommended).
- planningContextFile: string — path to a markdown file with context (optional).
- planPath: string — defaults to doc/changes/current/current-plan.md.
- allowOverwrite: boolean (default true) — overwrite or synthesize from existing plan while preserving completed checkboxes.
- maxPhases: number (default 4) — cap phases to a manageable number.

Strict plan structure contract
- The plan MUST be a single markdown file with these top-level sections, in order:
  1) Front-matter (YAML):
     id, status, created, last_updated, owners, service, links, summary.
     Use status: Proposed.
  2) Context and Goals
  3) Scope
     - In scope
     - Out of scope
     - Constraints
     - Risks and mitigations
  4) Phases
     For each phase, render a "### Phase N: <short title>" with:
     - Goal: one sentence.
     - Tasks:
       - [ ] concrete steps (the FIRST checklist in the file must be "Phase 1 → Tasks")
     - Acceptance criteria:
       - Must: testable ACs
     - Files and modules:
       - list of repo paths to touch (components/, lib/, hooks/, app/, types/, redux/, scripts/, doc/**)
     - Tests:
       - unit/integration tests to add or update (file paths)
     - Completion signal:
       - A suggested Conventional Commit subject aligned with commit.md rules.
  5) Test Scenarios
     - Map scenarios to acceptance criteria; indicate automation potential.
  6) Artifacts and Links
     - Planned docs to create/update: doc/spec/**, doc/contracts/**, doc/adr/**, doc/quality/test-specs/**
  7) Plan revision log
  8) Execution log

Authoring rules
- Prefer repository conventions and existing utilities; reference exact files/dirs where possible.
- Keep tasks atomic and idempotent. Use stable filenames and explicit selectors/types.
- Acceptance criteria must be verifiable via unit tests or UI text where applicable.
- Use fixed timestamps in examples to avoid test flakiness.

Update/merge behavior (when plan already exists)
- Preserve any "[x]" completed tasks verbatim.
- If titles change, add "(aka: <old title>)" to preserve traceability.
- Append new phases to the end unless allowReorder=true is provided.
- Never remove sections; mark deferrals explicitly in a "Deferrals" sub-section.

Process
1) Read planningContext/planningContextFile and infer missing details with 1–2 reasonable assumptions; record assumptions under Context.
2) Derive phases and tasks. Keep total tasks per phase 3–7.
3) Draft test scenarios and call out exact files to place them.
4) Output the plan to planPath (create folders if missing). Overwrite existing only per rules above.

Conventional commit alignment
- For each phase, provide a suggested Conventional Commit subject in the "Completion signal" using:
  <type>(<scope>): <verb> <topic>
  where type is feat|fix|refactor|docs|test|chore, scope from dominant paths (e.g., dashboard, issues, lib), and topic from the phase title.

References
- Documentation Handbook: doc/documentation-handbook.md
- AI-augmented process: doc/overview/ai-augmented-software-delivery-process.md

$ARGUMENTS
