# Implementation Plan: Introduce Redux and Local Storage Persistence

References:
- ADR: doc/adr/ADR-0008-Standardize-all-application-state-management-using-Redux-Toolkit.md
- Functional Spec: doc/spec/specification.md
- Technical Design: doc/technical-design.md

Goals:
- Standardize all application state management with Redux Toolkit (RTK).
- Add a localStorage-backed persistence layer to survive reloads (first step of cascade-aware persistence).
- Preserve existing UI/component contracts and feature scope (Issues, Sprints, Current Sprint, Quick Capture, Changelog).

Out of scope:
- Backend/API sync and cross-device persistence (will be covered by future cascade layers per ADR-0008).
- Refactoring component props contracts beyond swapping data sources to Redux.

## 1) Dependencies

Install Redux Toolkit and React-Redux.

- Packages:
  - @reduxjs/toolkit
  - react-redux

Command:
- npm: `npm install @reduxjs/toolkit react-redux`
- pnpm: `pnpm add @reduxjs/toolkit react-redux`
- yarn: `yarn add @reduxjs/toolkit react-redux`

## 2) State Structure (Redux Slices)

Create feature slices aligned with our domain from the spec/tech design.

Create:
- lib/redux/slices/issuesSlice.ts
  - State: `issues: Issue[]`
  - Actions:
    - addIssue(Partial<Issue>)
    - updateIssue(Issue)
    - deleteIssue(issueId: string)
    - updateIssueStatus({ issueId, newStatus })
    - assignIssueToSprint({ issueId, sprintId })
    - moveUnfinishedIssuesToBacklog(sprintId: string) // used during sprint end
  - Notes:
    - Generate ID with `generateTaskId()`
    - Set timestamps on create and update
    - Keep AC list if provided

- lib/redux/slices/sprintsSlice.ts
  - State: `sprints: Sprint[]`
  - Actions:
    - addSprint(Partial<Sprint>)
    - updateSprint(Sprint)
    - startSprint(sprintId: string)
    - endSprint(sprintId: string)
  - Notes:
    - Only one sprint can be active at a time (enforced via UI/flows)
    - Set timestamps on create and update

- lib/redux/slices/uiSlice.ts
  - State: `{ currentView: ViewType; showWhatsNew: boolean; showQuickCapture: boolean; hasUnseenUpdates: boolean }`
  - Actions:
    - setCurrentView(ViewType)
    - setShowWhatsNew(boolean)
    - setShowQuickCapture(boolean)
    - setHasUnseenUpdates(boolean)

Types:
- Reuse existing domain types from types/index.ts
- Reuse helpers and sample data from lib/data.ts

## 3) Persistence Layer (Local Storage Middleware)

Create a lightweight persistence middleware with version-ready design.

Create:
- lib/redux/middleware/localStorage.ts
  - Key: `flowcraftState`
  - Functions:
    - `loadState(): RootState | undefined`
      - Read from localStorage
      - JSON.parse with dateReviver to reconstruct Date instances
      - SSR guards (no localStorage on server)
      - Fallback to `undefined` on error/missing
    - `saveState(state: RootState): void`
      - Serialize whole store to JSON (stringify)
      - Write to localStorage with try/catch
      - Optionally throttle in future (see Enhancements)
    - `localStorageMiddleware`
      - After `next(action)`, call `saveState(store.getState())`
  - Utilities:
    - `dateReviver` to detect ISO strings and convert to Date
  - Notes:
    - Keep scope simple for this iteration; full cascade and migrations will be added later per ADR-0008.

Serializable check:
- We store Date objects in state and revive them on load.
- Configure store’s `serializableCheck` to allow Date objects (see Store section).

## 4) Store Setup and Provider

Create:
- lib/redux/store.ts
  - `configureStore` with reducers: `issues`, `sprints`, `ui`
  - `preloadedState = loadState()`
  - `middleware`: default middleware + `localStorageMiddleware`
  - `serializableCheck`:
    - Allow Dates by customizing `isSerializable` or relaxing check to avoid false positives for Date instances.
    - Example approach:
      - `serializableCheck: { isSerializable: (value) => value instanceof Date || defaultIsSerializable(value) }`
      - Or disable check if necessary during first iteration, then re-enable with targeted ignores.
  - Export `RootState`, `AppDispatch`

Create:
- lib/redux/provider.tsx
  - React-Redux `<Provider store={store}>` wrapper
  - Export `ReduxProvider` for app root

Update:
- app/layout.tsx
  - Wrap app in `<ReduxProvider>` at the root (inside <body>)

## 5) App Integration

Update:
- app/page.tsx
  - Replace local `useState` app state with Redux selectors and dispatchers:
    - Select: issues, sprints, ui state (currentView, modal flags, unseen updates)
    - Dispatch actions for:
      - Issues: addIssue, updateIssue, deleteIssue, updateIssueStatus, assignIssueToSprint
      - Sprints: addSprint, updateSprint, startSprint, endSprint (and moveUnfinishedIssuesToBacklog prior to end)
      - UI: setCurrentView, setShowWhatsNew, setShowQuickCapture, setHasUnseenUpdates
  - Maintain existing component props contracts for child components (they remain presentational and callback-driven).

No changes required (confirm usage remains compatible):
- All components in components/* continue to receive data and callbacks via props.
- types/index.ts remains the single source of domain types.
- lib/changelog.ts continues to manage release data and last-seen version (UI slice controls visibility flags).

## 6) File-by-File Checklist

Create:
- lib/redux/slices/issuesSlice.ts
- lib/redux/slices/sprintsSlice.ts
- lib/redux/slices/uiSlice.ts
- lib/redux/middleware/localStorage.ts
- lib/redux/store.ts
- lib/redux/provider.tsx

Update:
- app/layout.tsx (wrap with ReduxProvider)
- app/page.tsx (use useSelector/useDispatch, remove local useState for app state)

No change but referenced:
- types/index.ts
- lib/data.ts
- components/*

## 7) Validation and Testing

Developer validation:
- Launch app, verify:
  - Issues view renders with initial data
  - Create/Edit/Delete Issue works; AC progress badges display
  - Assign to sprint works; status updates work
  - Sprints: create/edit/start/end works; ending a sprint moves unfinished issues back to backlog
  - Current Sprint view shows kanban with correct counts and update dropdowns
  - Quick Capture:
    - Q key opens modal when no input focused
    - Templates prefill priority/status/AC; “Create Issue” adds issue
  - What’s New:
    - Badge indicator when unseen updates
    - Modal open/close and “don’t show again” persists last seen version

Persistence tests:
- Refresh page; previously created issues/sprints and UI flags (where applicable) persist.
- Create an issue, refresh, confirm it remains.
- End an active sprint, refresh, confirm state persists.

Edge cases:
- Incognito mode or localStorage disabled: app should still run with in-memory state (loadState returns undefined).
- Date fields remain Date objects after load (confirmed by features relying on date formatting).
- No Redux serializable warnings after configuring serializableCheck for Date (or acceptable if temporarily relaxed).

## 8) Performance & Safety Notes

- Persistence writes on every action; acceptable for this iteration.
- Future optimization: throttle/debounce saveState (e.g., requestIdleCallback or 250ms debounce).
- Avoid logging secrets in middleware (N/A currently).
- Guard localStorage access with try/catch and window availability checks.

## 9) Migration & Rollback

- Migration path:
  - Before: app/page.tsx owned state via useState
  - After: state lives in Redux slices; components unchanged in contracts
- Rollback plan:
  - Revert to prior commit; components still accept props, so low risk.
- Data loss risk:
  - localStorage keys scoped to `flowcraftState`; safe changes if reducers/slices evolve.
  - When changing persisted schema in future, add a version field and migration function per slice (see ADR-0008).

## 10) Future Enhancements (per ADR-0008)

- Introduce slice-level persistence metadata and versioning.
- Add migrations and store version to persisted payload.
- Implement cascade-aware persistence (Local -> Remote API) with an adapter interface:
  - `StorageAdapter.save/load`, per ADR.
- Add selective persistence (e.g., persist issues/sprints only, not ephemeral UI flags).
- Add analytics and audit-friendly action logging via middleware.

## Acceptance Criteria

- Entire app state is stored in Redux slices.
- App loads with `preloadedState` from localStorage when available.
- State changes persist across reloads.
- No regression in existing features (Issues, Sprints, Current Sprint, Quick Capture, Changelog).
- Code follows existing patterns, TypeScript strict, and keeps public component APIs stable.
