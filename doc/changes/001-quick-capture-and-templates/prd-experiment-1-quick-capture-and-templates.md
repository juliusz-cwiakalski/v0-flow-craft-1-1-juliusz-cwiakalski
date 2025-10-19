# CHANGE SPECIFICATION — Quick Capture & Ticket Templates (V0, Frontend Only)

## SUMMARY
Introduce a **global Quick Capture** experience with keyboard shortcut **Q** and a header button to create issues in ≤10s using **process templates** (Bug/Feature/Request + user-defined). Templates prefill title prefix, priority, status, optional assignee, and acceptance criteria. Prototype persists state via **Redux Toolkit** with **localStorage**; includes a minimal **Template Manager (basic)** to view/add/edit templates. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

## GOAL
Reduce “work-about-work” and increase consistency of new tickets by enabling **rapid capture** anywhere and **standardized inputs** via templates. Success (prototype): create in ≤10s; ≥70% of Quick Capture tickets use a template; AC badge visible on cards and reflects edits. :contentReference[oaicite:2]{index=2}

## USER INPUT/OUTPUT FLOW
**Entry points**
- **Global Shortcut**: Press **Q** when no input is focused → opens Quick Capture modal.
- **Header Button**: “Quick Add ⌨ Q” (icon denotes keyboard key). Tooltip repeats shortcut.  
- Modal remains open after create for **rapid multi-add**. `Esc` closes; if dirty, prompt to confirm discard. :contentReference[oaicite:3]{index=3}

**Quick Capture Modal (minimal fields)**
- **Title** (required, autofocus).  
- **Template** selector (None, Bug, Feature, Request, + user-defined).  
- **Priority**, **Status**, **Assignee** (optional), **Sprint** (optional, hidden if none; Completed not selectable).  
- **Acceptance Criteria (AC)**: **preview-only** here (prefilled from template). Editing/reordering happens in the full Issue Form.  
- **Create** (enabled when Title is non-empty) / **Cancel** (confirm if dirty).

**Template behavior**
- On choosing a template, **prefill only untouched fields** (prefix, priority, status, assignee, AC).  
- Changing template mid-edit: if any prefilled field was edited → ask whether to **overwrite** or **keep** user values.  
- **Default Assignee resolution** on create:  
  1) User-entered value (if any), else  
  2) Template `defaultAssignee` (if defined), else  
  3) **Current user** (fallback), else empty.

**Sprint contextual prefill**
- From **Issues** view → Sprint **not** prefilled.  
- From **Current Sprint** or **Editing a sprint** context → Sprint **prefilled** to that sprint (user can change).  

**Post-create feedback**
- Show **toast** for **6s** (UX best-practice balance for notice + action):  
  “Issue **{KEY} — {TitlePrefixEllipsized}** created — **Open**”.  
  - `TitlePrefixEllipsized` = prefix + first N chars of title (truncate gracefully to fit).  
  - Toast closes automatically; link opens the created issue.

**Persistence & instrumentation**
- All state via **Redux Toolkit**; persisted to **localStorage** (prototype).  
- Telemetry via **Tracking Adapter**; for V0 implementation, events are **console logged** only. :contentReference[oaicite:4]{index=4}

## AFFECTED COMPONENTS
> Logical names only; no file paths. Final mapping to repository structure is left to the coding agent. :contentReference[oaicite:5]{index=5}

- [CREATE] **QuickCaptureModal** — Modal UI, field state, submit, discard confirmation.
- [MODIFY] **NavigationHeader** — Add “Quick Add ⌨ Q” button; wire global **Q** shortcut (respect focus/other modals).
- [MODIFY] **IssuesView** — Provide context: “no sprint prefill”.
- [MODIFY] **CurrentSprintView** / **SprintEditor** — Provide context: “prefill this sprint”.
- [CREATE] **TemplatesSlice** — Redux slice for templates + persistence & last-used template.
- [CREATE] **IssuesSlice: quickCreate flow** — Action to compose payload with template defaults and contextual sprint; add issue; maintain timestamps.
- [CREATE] **TelemetryAdapter** — Thin abstraction (`track(eventName, payload)`) with console backend (V0).
- [CREATE] **TemplateManagerBasic** — Minimal UI to list/create/edit templates (system + user-defined).
- [MODIFY] **IssueForm** — Show template selector in create mode; AC editing happens here only.
- [MODIFY] **IssueCard** — AC progress badge `AC x/y` (hidden if no AC; green when x===y>0).

## DECISIONS
- **Shortcut availability**
  - Options: scoped to views vs. global
  - ✅ **Global** (with guards: ignore when input focused; block if any modal is open), plus header button with `(Q)`.  
- **Modal lifecycle**
  - Options: close after create vs. stay open for multi-add
  - ✅ **Stay open**; `Esc` closes; confirm if dirty.  
- **Required fields**
  - Options: Title only vs. include Assignee/Sprint
  - ✅ **Title only** for Quick Capture (prototype); other fields optional.  
- **Template defaults & overwrite policy**
  - Options: always overwrite vs. only untouched vs. ask on conflict
  - ✅ **Prefill untouched only**; on conflict ask to overwrite/keep.  
- **Default assignee**
  - Options: required; optional; per-template default; fallback
  - ✅ **Optional**; **per-template default**; fallback to **current user**; never overrides user edits.  
- **Sprint prefill**
  - Options: always preselect active sprint vs. contextual vs. never
  - ✅ **Contextual**: Issues view → none; Current/Editing sprint → that sprint prefilled.  
- **Acceptance Criteria (AC) in Quick Capture**
  - Options: editable here vs. preview-only
  - ✅ **Preview-only** in modal; **editable** in Issue Form; **no max** count.  
- **Template scope in V0**
  - Options: system-only vs. add minimal management
  - ✅ **Minimal Template Manager** (basic CRUD) alongside seeded system templates (Bug/Feature/Request).  
- **State & persistence**
  - Options: local React state vs. Redux Toolkit + localStorage
  - ✅ **Redux Toolkit** as sole state system with localStorage persistence (per ADR-0008). :contentReference[oaicite:6]{index=6}
- **Telemetry**
  - Options: none; direct GA/PostHog; adapter
  - ✅ **Adapter** layer with **console** backend in V0; events defined below.

## IMPLEMENTATION INSTRUCTIONS
**1) Keyboard & Header Integration**
- Add a **global key handler** for `Q` that:  
  - Ignites only when **no input** has focus and **no modal** is open.  
  - Opens **QuickCaptureModal**; autofocus on **Title**.  
- In **NavigationHeader**, add a **primary button** labeled **“Quick Add ⌨ Q”** with tooltip “Press Q to open Quick Capture”.

**2) QuickCaptureModal**
- Fields: Title, Template, Priority, Status, Assignee, Sprint, AC (preview-only).  
- **Submit**:  
  - Compose payload: merge current modal values with **template defaults** using the overwrite rules.  
  - **Default assignee** resolution: user entry → template.defaultAssignee → current user → empty.  
  - **Sprint**: read **context** from caller (Issues/CurrentSprint/SprintEditor) to prefill or leave empty.  
  - Generate timestamps; create issue; clear Title; keep modal open.
- **Discard**: on `Esc` or Cancel → if dirty, show confirm; otherwise close.

**3) Templates & Defaults**
- Seed **system templates** (Bug/Feature/Request) at boot if no user-defined templates exist. Initial defaults:  
  - **Bug**: prefix `[Bug] `, priority **P1**, status **Todo**, AC (3 quality checks).  
  - **Feature**: prefix `[Feature] `, priority **P3**, status **Todo**, AC (3 delivery checks).  
  - **Request**: prefix `[Request] `, priority **P2**, status **Todo**, AC (3 validation checks). :contentReference[oaicite:7]{index=7}
- Store templates in **TemplatesSlice**; persist to localStorage. User-defined templates **override** seeded defaults.

**4) Minimal Template Manager (Basic)**
- Accessible from Settings (or a “Manage templates” link from Quick Capture).  
- Capabilities (V0): **List**, **Create**, **Edit**, **Duplicate**, **Delete**.  
- Template fields: `id`, `name`, `prefix`, `priority`, `status`, `defaultAssignee?`, `acceptanceCriteria[] (strings)`.  
- On save: persist via TemplatesSlice; **remember last-used template** in TemplatesSlice.

**5) Issue Creation & AC**
- On create, map AC strings into `{id, text, done:false}`.  
- **IssueCard** renders **AC x/y** badge; **green** when complete (x===y>0); **hidden** if no AC.  
- **IssueForm** (create/edit) provides full AC editing (add/toggle/remove). :contentReference[oaicite:8]{index=8}

**6) Contextual Sprint Prefill**
- Caller provides **sprint context** token: `"none" | "currentSprint" | "editing:<sprintId>"`.  
- QuickCaptureModal reads token and sets Sprint default accordingly (user may change).

**7) Telemetry (Adapter)**
- Create **TelemetryAdapter** with `track(event, payload)`; default impl **console.log**.  
- Emit:  
  - `quick_capture_opened` { source: `"shortcut"|"button"` }  
  - `template_selected` { templateId }  
  - `assignee_autofilled` { source: `"template"|"currentUser"` }  
  - `issue_created_via_quick_capture` { timeToCreateMs, fieldsUsed: {template,assignee,priority,status,sprint}, acCount }  
  - `ac_badge_viewed` { issueId }  
  - `ac_updated` { issueId, delta: {doneCount} }  
- Start **time-to-create** at modal open; stop on create.

**8) Redux & Persistence**
- Implement **IssuesSlice** and **TemplatesSlice** per ADR-0008; persist both to **localStorage** with versioning/migrations hooks for future backend cascade. :contentReference[oaicite:9]{index=9}

**9) Accessibility (prototype note)**
- Keep basic keyboard support and focus management; full ARIA labelling deferred (documented as prototype scope).

## AI CODING AGENT PROMPT
Implement Quick Capture & Ticket Templates (frontend-only) according to this spec. Follow repository conventions; use **logical names** from “Affected Components.” Do **not** invent new behavior beyond decisions below.

**Behavior to Implement**
- Global **Q** shortcut (guarded) + header button “Quick Add ⌨ Q” → opens **QuickCaptureModal** (autofocus Title).  
- **Keep modal open** after create for rapid multi-add; `Esc` closes; prompt on unsaved changes.  
- **Templates** prefill **prefix, priority, status, defaultAssignee, AC** for **untouched** fields only; changing template asks to overwrite or keep when conflicts exist.  
- **Default assignee** on create: user value → template.defaultAssignee → current user → empty (do not override user edits).  
- **Sprint prefill**: none from Issues; **current/edited sprint** when invoked from those contexts (user can change).  
- **AC** are **preview-only** in modal; full editing in Issue Form; no max count.  
- **Toast** on create for **6s**: “Issue {KEY} — {TitlePrefixEllipsized} created — Open”; link opens the created issue.  
- **TemplatesSlice** persists seeded system templates and user-defined templates; **remember last-used template**.  
- **IssuesSlice** handles quick-create with timestamps and AC mapping.  
- **TelemetryAdapter** exists with `track(event,payload)`; log events listed in “Telemetry (Adapter)” to console.  
- **IssueCard** shows `AC x/y` badge (green when complete; hidden if none).  
- **IssueForm** supports template selector (create mode) and AC editing.

**Non-Goals (defer)**
- Backend endpoints, server-side validation, rich text AC, reordering AC in modal, a11y completeness.

**Constraints**
- **Redux Toolkit + localStorage** persistence per ADR-0008. :contentReference[oaicite:10]{index=10}  
- Use existing UI patterns/components and design tokens already in the app (badges, selects, dialogs). :contentReference[oaicite:11]{index=11}

## MERGE REQUEST TEMPLATE
**Branch**
\`\`\`bash
git checkout -b feat/quick-capture-and-templates-v0
\`\`\`

**Conventional Commit Title**

\`\`\`
feat: quick capture modal + process templates (v0) with contextual sprint prefill and telemetry adapter

* Global Q shortcut + header “Quick Add ⌨ Q”
* QuickCaptureModal (Title required; template/priority/status/assignee/sprint optional)
* Template defaults (Bug/Feature/Request + user-defined); overwrite rules; default assignee with current-user fallback
* Contextual sprint prefill from Issues/Current Sprint/Sprint Editor
* AC preview in modal; full AC editing in Issue Form; AC badge on cards
* TelemetryAdapter (console backend) + key events; time-to-create metric
* Redux Toolkit slices for issues/templates; localStorage persistence; remember last-used template
* Prototype-level a11y (documented)
\`\`\`

**Checklist**

* [ ] QA: Q opens modal; Enter creates; Esc confirm on dirty; multi-add flow works
* [ ] QA: Template switching confirm works; untouched vs. edited field overwrite rules verified
* [ ] QA: Default assignee resolution chain verified
* [ ] QA: Sprint contextual prefill verified across entry points
* [ ] QA: Toast shows with key + truncated title; link opens issue
* [ ] QA: AC badge correct; hidden when none; green when complete
* [ ] Telemetry events emitted; time-to-create measured
* [ ] State persists across reload; last-used template remembered
