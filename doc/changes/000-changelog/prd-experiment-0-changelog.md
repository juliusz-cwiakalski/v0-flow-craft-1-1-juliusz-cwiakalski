# PRD — Change 0: What’s New / In‑App Changelog

Status: Ready for implementation (V0, frontend-only)
Owner: Product + Frontend
Traceability: OST S1.3 (Onboarding guides), S5.3 (Clean, intuitive UI/UX). Supports “Golden Thread” by explicitly connecting newly shipped features (Experiments 1–3) with clear discovery paths.

1) Problem & Context
Users often miss newly delivered value in fast-moving products. In FlowCraft V0, we’re shipping several high‑impact features (Quick Capture, Full Export, Roll‑up Dashboard). Without a lightweight, in‑app changelog, these improvements remain invisible, hurting adoption and increasing churn risk. We need a discoverability layer that announces “what’s new,” why it matters, and how to try it immediately.

2) Objectives & Success Metrics (Prototype)
- Ensure discoverability: Show a “What’s New” modal once per version on first load after update.
- Drive trials: Each release note item has a “Try it now” CTA that deep-links to the relevant view or provides exact instructions.
- Initial release must highlight:
  - Quick Capture + Templates
  - Full Data Export (JSON/CSV)
  - Portfolio Roll‑up Dashboard (Lite)
- Prototype success:
  - Modal appears once after version bump; badge on nav icon reflects unseen updates.
  - Clicking a CTA navigates to the correct place (or shows clear, step-by-step “How to find it”).
  - Screenshots for certification: Modal, Changelog page/panel, and navigation icon with badge.

3) Scope (V0)
- Local, static release notes bundled with the app (no backend).
- A top‑nav “What’s New” entry point:
  - Bell/sparkle icon with a badge when there are unseen updates.
  - Clicking opens a “What’s New” modal.
  - A “View all updates” link opens a dedicated Changelog panel/page.
- First‑run after update:
  - Auto‑open the modal once per version.
  - “Don’t show again for this version” checkbox/secondary action.
- Deep‑links:
  - For supported views (issues/current sprint/sprints/dashboard), navigate immediately.
  - For actions that can’t be deep‑opened (e.g., open a dropdown), show clear “How to find it” text.
- Keyboard/accessibility: Fully keyboard operable, ARIA roles for modal and list semantics.

Out of scope (V0)
- Server‑driven content, user segments, analytics events.
- Multi‑language copy (English only in V0).
- Image/video embeds (text‑first; links allowed).
- Mobile parity considerations beyond responsive layout.

4) User Stories
- As a PM, I want a concise “What’s New” that I can skim and act on, so I can try new features immediately.
- As a team lead, I want a persistent Changelog page to review previous releases.
- As a new evaluator, I want direct links/instructions to find new features without guessing.

5) UX / UI Specification

Top Navigation
- Add a “What’s New” icon (bell or sparkles). If there are unseen updates for the current version, show a small badge (dot or count).
- Tooltip: “What’s New”
- Clicking opens the modal.

“What’s New” Modal
- Header: “What’s New in FlowCraft vX.Y.Z”
- Body: Up to 3 “release items,” each with:
  - Tag (New / Improved / Fixed / Notice) — color-coded badge
  - Title (short)
  - Summary (1–3 sentences; why it matters)
  - CTA button: “Try it now”
  - Optional secondary link: “How to find it” (if no deep‑link)
- Footer actions:
  - Primary: “Got it”
  - Secondary (checkbox): “Don’t show again for this version”
  - Tertiary link: “View all updates” (opens Changelog page/panel)

Changelog Page/Panel
- Route/view accessible from:
  - “View all updates” in modal
  - “What’s New” icon → “Open Changelog”
- Layout:
  - List releases in reverse chronological order.
  - Each release shows version, date, and its items.
  - Each item shows Tag, Title, Summary, CTA (if any), “How to find it”.
- Empty state if no releases: “No updates yet.”

Copy Guidelines (Initial Release)
- New: Quick Capture + Templates — “Press Q or click ‘Quick Add’ to create issues instantly. Use Bug/Feature/Request templates with ready Acceptance Criteria to standardize quality.”
  - CTA: “Try Quick Capture”
  - Deep‑link: view=issues (focus the nav; if feasible, also open Quick Capture, else provide “Press Q” guidance)
- New: Full Data Export (JSON/CSV) — “Export Issues and Sprints in one click to JSON/CSV. Build trust with guaranteed portability.”
  - CTA: “Open Export menu”
  - How to find: “Top navigation → Export → choose format”
- New: Roll‑up Dashboard (Lite) — “Bird’s‑eye view with status breakdown, active sprint progress, and 7‑day throughput.”
  - CTA: “Open Dashboard”
  - Deep‑link: view=dashboard

6) Data Model & Storage

Release content (lib/changelog.ts)
- type Release = {
  version: string        // e.g., '0.1.0'
  dateISO: string        // e.g., '2025-10-18'
  items: ReleaseItem[]
}
- type ReleaseItem = {
  id: string
  kind: 'New' | 'Improved' | 'Fixed' | 'Notice'
  title: string
  summary: string
  cta?: { label: string; href?: string }
  deeplink?: { view: 'issues' | 'currentSprint' | 'sprints' | 'dashboard'; query?: Record<string, string> }
  howToFind?: string
}
- export const releases: Release[] = [ ... ]; // newest first

App version (lib/version.ts)
- export const APP_VERSION = '0.1.0';

Local persistence
- localStorage keys:
  - 'flowcraft:lastSeenVersion' -> string (e.g., '0.1.0')
  - If APP_VERSION !== lastSeenVersion → show modal on first load.
  - On “Got it” (or “Don’t show again”), set lastSeenVersion = APP_VERSION.
- Badge logic:
  - If APP_VERSION !== lastSeenVersion → show dot on icon.
  - No per-item unread count in V0 (simple dot per release is enough).

7) Interaction Rules

- App start:
  - Read lastSeenVersion from localStorage.
  - If different from APP_VERSION, schedule auto‑open modal after initial render.
- Modal close:
  - “Got it” sets lastSeenVersion = APP_VERSION and hides badge.
  - “Don’t show again” also sets lastSeenVersion = APP_VERSION.
- Navigation:
  - CTA with deeplink:
    - Switch current view accordingly (e.g., to 'dashboard').
    - Optional: attach a query param (?whatsnew=feature-id) that can trigger soft UI hints.
  - CTA without deeplink:
    - Open link in new tab if href provided, else scroll instructions into view (N/A in V0).
- Accessibility:
  - Focus trap inside modal; Esc closes; Enter activates primary.
  - ARIA: role="dialog", labelledby header; list semantics for items.

8) Edge Cases & Decisions
- No localStorage (disabled browsers): Don’t auto‑open; icon visible without badge; Changelog still accessible.
- Missing or malformed APP_VERSION: Default to '0.0.0'; never auto‑open.
- Empty releases array: Hide icon or show without badge and empty state page.
- Multiple releases bundled: Badge uses simple “diff” vs lastSeenVersion (newest version only).
- Timezone/date: Render date with toLocaleDateString.
- Deep‑link action that can’t be auto‑opened (e.g., open Export dropdown):
  - Provide “How to find it” with exact path: “Top navigation → Export”.
- Performance: Content is small; no optimization needed in V0.

9) QA Plan (Manual)
- Fresh load with no lastSeenVersion:
  - Modal opens automatically once; icon shows badge before first open.
- Click “Got it”:
  - Badge disappears; reload does not reopen modal.
- Verify CTAs:
  - Quick Capture CTA → switch to Issues view (and if feasible, pressing Q opens modal).
  - Export CTA → users see top bar Export menu; instructions clarify the path.
  - Dashboard CTA → navigate to Dashboard view.
- Changelog page:
  - Lists the current release and items with tags, dates, CTAs.
- Accessibility:
  - Keyboard navigation through modal elements, Esc closes, focus restored to “What’s New” icon.

10) Implementation Checklist (Files to touch when implementing)
- New:
  - lib/version.ts (APP_VERSION)
  - lib/changelog.ts (releases content for v0.1.0)
  - components/whats-new-modal.tsx (modal)
  - components/changelog-panel.tsx (page/panel)
- Updates:
  - components/navigation.tsx (add “What’s New” icon + badge + open handlers)
  - app/page.tsx (hold selectedView; auto‑open logic based on version; route to deeplinks)
- Optional:
  - Add query param support (?whatsnew=xxx) to trigger soft hints.

11) Demo Script (Certification)
- Reload the app after bumping APP_VERSION → modal auto‑opens; show three items (Quick Capture, Export, Dashboard).
- Click each CTA to navigate and show where the feature is.
- Open Changelog page from modal and from nav icon.

12) Acceptance Criteria (Go/No‑Go)
- Modal auto‑opens exactly once per version (per browser profile).
- “What’s New” icon shows a badge until acknowledged for the current version.
- Changelog page lists releases with items and CTAs.
- CTAs navigate to the intended views or provide clear “How to find it” instructions.
- No regressions in navigation or existing views.
