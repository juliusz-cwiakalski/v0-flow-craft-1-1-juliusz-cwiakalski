---
description: Smart conventional commit from uncommitted changes (analyze → draft → commit → optional push)
agent: build
#provider: github_copilot
#model: gpt-4.1
---

Purpose
- Review the current working tree (staged + unstaged) and generate an excellent Conventional Commit message automatically.
- Stage files as configured, draft a high-signal subject/body/footers, optionally confirm, then perform the commit.
- Use clear, deterministic heuristics; keep diffs and logs in the commit body for future readers.

Inputs (via $ARGUMENTS)
- confirm: boolean (default: false) — if true, print the proposed message and exit without committing.
- dryRun: boolean (default: false) — simulate the flow and print the message; do not stage or commit.
- includeUntracked: boolean (default: true) — add new/untracked files (git add -A).
- onlyStaged: boolean (default: false) — commit only what's already staged (disables staging).
- typeOverride: string — force Conventional Commit type (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert).
- scopeOverride: string — force scope, e.g., "dashboard" or "components,lib".
- subjectOverride: string — force subject line (max 72 chars; no trailing period).
- bodyNote: string — optional extra paragraph appended to the body.
- ticketPattern: string (default: `(?:(?:[A-Z][A-Z0-9]+-\d+)|#\d+)`) — regex to extract tickets from branch name/diff for footers.
- allowBreaking: boolean (default: false) — if true and detector is confident, append ! and BREAKING CHANGE footer.
- autoDetectBreaking: boolean (default: true) — try to detect public API/contract breaks heuristically.
- testBefore: boolean (default: false) — run tests before committing; include status summary in body.
- typecheckBefore: boolean (default: false) — run tsc before committing; include status summary in body.
- signoff: boolean (default: false) — add --signoff to git commit.
- gpgSign: boolean (default: false) — add -S/--gpg-sign.
- noVerify: boolean (default: false) — pass --no-verify to git commit.
- amend: boolean (default: false) — amend previous commit with new message/content.
- push: boolean (default: false) — push after commit.
- pushArgs: string — extra args for git push (e.g., "--force-with-lease").
- maxSubjectLen: number (default: 72) — enforce subject length.
- wrapBody: number (default: 100) — wrap body to N chars per line when rendering.
- conventionalTypes: string — comma-separated allowlist for types; others will clamp to chore.

Conventional Commit format
- `type(scope)!: subject`
- blank line
- body
- footers

High-level workflow
1) Pre-flight
   - Ensure we are inside a Git repo; ensure there are uncommitted changes. Respect onlyStaged/includeUntracked.
   - Optionally run typecheck/tests and capture a short, single-line status to include in the body.
2) Analyze changes
   - Get branch name, git status --porcelain, and per-file diff stats (added/removed, added/removed files).
   - Extract candidate scopes from top-level paths (components/, lib/, hooks/, app/, types/, redux/, public/, styles/, config files).
   - Classify change type using deterministic heuristics (see below); allow overrides.
   - Detect potential BREAKING changes (see below) and extract ticket IDs from branch/diff per ticketPattern.
   - Build a concise subject (<= maxSubjectLen) and a rich body (files changed; +/-, key areas; optional preflight results).
3) Stage (unless onlyStaged=true)
   - includeUntracked=true → git add -A; else → git add -u.
   - Validate there is something staged (git diff --cached --name-only).
4) Commit
   - Render commit message to a temporary file, then git commit with flags (signoff, gpgSign, noVerify, amend).
   - If push=true, push to current branch's upstream (create with --set-upstream if missing).
5) Output
   - Always print the final subject and the first 10 lines of the body.
   - If confirm=true or dryRun=true, skip commit/push and exit with code 0 after printing.

Type classification heuristics (ordered)
- revert: If the diff message or branch name begins with "revert" or all hunks remove recent changes (rare) → type=revert.
- test: If only *.test.* or __tests__ files changed → test.
- docs: If only docs (README.md, doc/**, *.md, *.mdx, *.adoc) changed → docs.
- style: If only styling/assets changed (styles/**, *.css, *.scss) or whitespace-only diffs in code → style.
- ci: If only .github/** or CI config files changed → ci.
- build: If package.json deps or lockfiles changed; next.config/jest.config/tsconfig changed → build.
- perf: If code diffs contain performance keywords (useMemo|useCallback|memo|optimi[sz]e|cache) → perf.
- fix: If code diffs contain bug-fix keywords (fix|bug|error|exception|null|undefined|crash) or tests changed alongside code → fix.
- refactor: If code changed but no new files and no clear fix/perf signals → refactor.
- feat: If new source files were added (non-test/docs/style) or significant code additions → feat.
- chore: Fallback when none of the above clearly apply.

Scope extraction
- Compute a frequency map of top-level directories among changed files: components, lib, hooks, app, types, redux, public, styles.
- Pick the top 1–2 scopes joined by ",". If none, use "repo". Allow scopeOverride to replace.
- For nested specializations (e.g., components/dashboard), prefer the second segment as a more specific scope when dominant.

Subject generation
- Verb selection from type: feat→"add", fix→"fix", docs→"docs", style→"style", refactor→"refactor", perf→"improve perf", test→"test", build→"build", ci→"ci", chore→"chore", revert→"revert".
- Noun phrase from dominant filenames (e.g., throughput-card → "throughput card").
- Form: "<verb> <topic>" (lowercase, no trailing period). Truncate to maxSubjectLen preserving whole words.
- If subjectOverride is provided, use it verbatim (still trimmed and length-limited).

Body generation
- Always include: files changed count; total +/-. List 3–5 key paths (shortened) with +/-. Group by scope when helpful.
- Include short notes from preflight checks ("Typecheck: PASS/FAIL", "Tests: PASS/FAIL") when requested.
- If bodyNote is provided, append as a paragraph.
- Wrap to wrapBody columns best-effort.

BREAKING change detection
- autoDetectBreaking=true: raise a high-confidence flag if we detect removed/renamed exported symbols or changed public types (regex on diff for lines starting with `- export` without matching `+ export` of the same symbol, changes under types/).
- Only apply when allowBreaking=true AND confidence≥0.9. If applied, append "!" to the header and add a BREAKING CHANGE footer summarizing the affected symbols/files.

Footers
- Tickets: add one footer per match, e.g., "Refs: ABC-123" or "Refs: #456". If type=fix and pattern looks like issue IDs, use "Closes: ...".
- Co-authors: if GIT_CO_AUTHORS or trailers present (optional), preserve/append them.

Operational details for reliability
- Prefer pnpm when pnpm-lock.yaml exists; otherwise npm/yarn. Use project scripts when present.
- Use shell-safe commands; avoid pagers (add | cat) when necessary.
- Keep the working tree pristine on dryRun and confirm.

Implementation plan (agent actions)
0) Discover repo state
   - Run: git rev-parse --is-inside-work-tree
   - Run: git status --porcelain=v1
   - If no changes (respecting onlyStaged), print "Nothing to commit" and exit 0.
   - Run: git rev-parse --abbrev-ref HEAD (branch)
   - Run: git diff --shortstat | cat (for +/-, overall)
   - Run: git diff --name-only --cached; git diff --name-only (to separate staged/unstaged lists)
   - Run: git diff --numstat (for per-file +/-, parseable)
1) Optional preflight
   - If typecheckBefore: run typecheck (e.g., pnpm tsc -p tsconfig.json) and collect PASS/FAIL.
   - If testBefore: run tests (e.g., pnpm test --silent --runInBand) and collect PASS/FAIL.
2) Heuristics + message
   - Determine type (allow typeOverride). Determine scopes (allow scopeOverride). Build subject (allow subjectOverride).
   - Compose body with: shortstat, top paths, preflight notes, and an "Areas" bullet list.
   - Extract tickets from branch name and diff. Decide Closes vs Refs based on type.
   - Detect BREAKING change (only if allowBreaking && autoDetectBreaking).
3) Stage
   - If dryRun or confirm or onlyStaged → skip staging.
   - Else: includeUntracked? git add -A : git add -u
   - Ensure something is staged: git diff --cached --name-only; if empty, exit non-zero with guidance.
4) Commit
   - Write message to .git/COMMIT_EDITMSG.auto.
   - Build flags: --signoff if signoff; -S if gpgSign; --no-verify if noVerify; --amend if amend.
   - Run: git commit -F .git/COMMIT_EDITMSG.auto [flags]
5) Optional push
   - If push=true: get current branch; try git push. If no upstream: git push --set-upstream origin <branch> [pushArgs]

Safety & fallbacks
- Subject cannot be empty; fallback to "chore: update" (respecting scope if present).
- If message exceeds typical limits, wrap body; subject is truncated to maxSubjectLen.
- If heuristics ambiguous (multiple types), prefer the earliest in the ordered rules.
- If conventionalTypes allowlist is provided, clamp to that set; otherwise use chore.

Error handling & recovery
- On any command failure, print the exact stderr and exit non-zero. Do not leave partial state in staging when dryRun/confirm.
- If commit fails due to hooks, re-run with noVerify when explicitly requested.
- If push fails due to upstream missing, attempt --set-upstream once; otherwise print remediation.

Examples
- Smart default commit of all changes:
  opencode run commit
- Simulate and print message only:
  opencode run commit --dryRun true
- Force a fix type with explicit scope and note, then push:
  opencode run commit --typeOverride fix --scopeOverride dashboard --bodyNote "Fix null deref in status panel" --push true
- Commit only staged changes with sign-off:
  opencode run commit --onlyStaged true --signoff true

Execution details (concrete command flow)
- Use these shell steps (zsh-compatible):
  1) Check repo state
     • `git rev-parse --is-inside-work-tree`
     • `git status --porcelain=v1`
     • `git rev-parse --abbrev-ref HEAD | tr -d '\n'`
     • `git diff --shortstat | cat`
     • `git diff --numstat | cat`
  2) Optional typecheck/tests (guarded by flags)
  3) Build message (agent logic per heuristics above)
  4) Stage if needed
     • includeUntracked? `git add -A` : `git add -u`
     • `git diff --cached --name-only | cat`
  5) Commit
     • `git commit -F .git/COMMIT_EDITMSG.auto [--signoff] [-S] [--no-verify] [--amend]`
  6) Push (optional)
     • `git push [--set-upstream origin $(git rev-parse --abbrev-ref HEAD)] [pushArgs]`

Notes for maintainers
- This command does not change repository files; it orchestrates git and renders a high-quality message.
- You can adjust heuristics by updating the ordered rules above without altering the flow.
- The detector avoids false-positive BREAKING headers unless allowBreaking is explicitly set.
