So right now we have the history of issue changes:

d) **Status-change history on issues (+ use it for throughput when present)**
**Reason:** Approximation via `updatedAt` is noisy; history unlocks future flow metrics.
**Goal:** More accurate throughput now; foundation for cycle-time later.
**Behavior:** On status change, append `{from,to,atISO}`; Issue Details shows read-only timeline (new panel). Throughput
prefers entries where `to==='Done'` within window; falls back to `updatedAt` + tooltip “approximate”.
**Integrates with:** Issues slice; Dashboard throughput card; telemetry (view opened).


---

**Implementation Steps Checklist: Comprehensive Issue History Viewer**

This plan covers tracking and presenting the full history of all issue changes (not just status), while ensuring dashboard statistics remain accurate and unaffected by non-status changes.

1. **Data Model & Redux Integration**
    - [x] Extend `Issue` type to include `history: Array<IssueChange>` where:
      ```ts
      type IssueChange = {
        atISO: string,
        field: string, // e.g. "status", "title", "description", "team", "assignee", "project"
        from: unknown, // previous value
        to: unknown,   // new value
        changedBy?: string, // user id or name (optional)
      }
      ```
    - [x] Update `issuesSlice.ts` to append a history entry for every field change (not just status)
    - [x] Ensure history is persisted via localStorage middleware
    - [x] Add selectors for:
        - Full issue history
        - Status-only history (for dashboard metrics)

2. **UI Component: Issue History Panel**
    - [x] Create/extend `issue-card-status-history-panel.tsx` to display a timeline of all changes (status, title, description, team, assignee, project, etc.)
    - [x] Show field name, old value, new value, timestamp, and (optionally) who made the change
    - [x] Integrate panel/modal into issue actions context (dropdown/modal)
    - [x] Allow filtering or highlighting by field type (optional)
    - [x] Ensure read-only, accessible, and clear formatting
    - [x] Make the isse history available via the issue contex actions (next to edit, delete, etc.) (done: added View History to issue context actions via dialog; see issue-card.tsx)

3. **Dashboard Integration**
    - [ ] Update `throughput-card.tsx` and related dashboard logic to use only status change entries for metrics (where `field === "status"` and `to === "Done"`)
    - [ ] Fallback to `updatedAt` if no status history; show tooltip “approximate”
    - [ ] Ensure dashboard statistics are unaffected by non-status changes (description, title, etc.)

4. **Telemetry**
    - [ ] Log when history view is opened in `lib/telemetry.ts`

5. **Specs & Documentation**
    - [x] Update `doc/spec/specification.md` to reference the comprehensive history feature and clarify dashboard logic
    - [x] Record user-visible change in `lib/changelog.ts`
    - [x] Document the new `IssueChange` model and selectors

6. **Testing & Validation**
    - [ ] Add/extend tests for history recording of all field changes
    - [ ] Test UI rendering of history panel for all change types
    - [ ] Validate dashboard throughput/cycle-time calculation is correct and unaffected by non-status changes

7. **Accessibility & UX**
    - [ ] Ensure timeline is keyboard navigable
    - [ ] Use clear labels, timestamps, and tooltips
    - [ ] Clearly distinguish status changes from other field changes in the UI

---

**Notes:**
- The dashboard must continue to use only status changes for its metrics, even as the history model expands to all fields.
- The history viewer will provide a complete audit trail of all changes to an issue, supporting future analytics and transparency.
