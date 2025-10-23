---
id: ADR-00xx
created: 2025-10-23
status: Accepted
summary: Document rationale for WIP and stale-age thresholds in user preferences
---

# ADR-00xx: WIP and Stale Thresholds in Preferences

## Context

The Roll-up Dashboard now surfaces advanced operational signals, including WIP Pressure and Blocked/Stale issue counters. These metrics require user-configurable thresholds for:
- **WIP Threshold:** The maximum number of issues considered healthy in progress before warning levels are triggered.
- **Stale Age (days):** The number of days after which an issue is considered stale if not updated.

## Decision

- Add `wipThreshold` and `staleAgeDays` fields to the Preferences slice, persisted locally per user.
- Default values: `wipThreshold = 10`, `staleAgeDays = 7`.
- Thresholds are editable directly from the dashboard cards for rapid tuning.
- No backend or team-wide settings in this iteration; future ADRs may extend scope.

## Rationale

- Enables teams and individuals to tune operational signals to their workflow and project scale.
- Avoids hardcoding values that may not fit all use cases.
- Keeps configuration lightweight and discoverable (no separate Settings page required).

## Consequences

- Dashboard cards reflect current thresholds and update in real time.
- Preferences are persisted and versioned via Redux localStorage middleware.
- Future iterations may add team-wide or project-specific thresholding.

## References
- ADR-0008: Standardize all application state management using Redux Toolkit
- doc/spec/specification.md (Dashboard metrics section)
