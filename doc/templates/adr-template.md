---
id: ADR-NNNN
created: YYYY-MM-DD
decision_date: YYYY-MM-DD # Date when status changed to Accepted
last_updated: YYYY-MM-DD
status: Proposed # Options: Proposed, Accepted, Deprecated, Superseded
summary: Short one-line summary of the decision for indexing/search
---

# Architecture Decision Record (ADR)

## Template Instructions

1. **Create a new file** in your `decisions-log` directory, named using the format `ADR-NNNN-short-title.md`, where `NNNN` is the next sequential number and `short-title` is a kebab-case summary of the decision.
2. **Use this template** only when the decision has been fully discussed and validated. Archie will offer to create the ADR when appropriate.
3. **Fill all sections** with clear, unambiguous content. If a section does not apply, state why.
4. **Focus on capturing rationale, drivers, trade-offs, assumptions, and uncertainties.**
5. **Submit for peer review** (e.g., via RFC merge request) and track the decision’s status.
6. Remove all template instructions before submitting

---

# ADR-NNNN: <!-- Short, clear title of the decision -->

## Context

- What is the core problem or architectural choice?
- Why is this decision needed now?
- What are the environmental or systemic constraints?
- Relevant domain context, prior decisions, or dependencies

## Problem Framing (Clarified)

- Reframed user problem in objective technical terms
- Applied 5 Whys or Ishikawa if applicable (text format)
- Underlying cause(s), not just symptoms

## Decision Drivers

- Confirmed and validated drivers (with priorities, if available)
- Business, technical, and team-related concerns
- Risks or sensitivities (e.g., latency, maintainability)

## Mental Models & Techniques Used

- Mental models applied (e.g., First Principles, Inversion, Second-Order Thinking, OODA, KISS, etc.)
- Techniques applied (e.g., 5 Whys, heuristic audit, trade-off matrix)
- Justify their selection if relevant

## Alternatives Considered

1. **Alternative A**
   - Summary
   - Pros / Cons
   - Why rejected (which drivers it failed)
2. **Alternative B**
   - ...

## Decision

- Final decision taken
- Core rationale (linked to drivers)
- Explicit assumptions acknowledged

## Trade-offs & Consequences

### Positive Outcomes

- Benefits expected from this decision

### Negative Outcomes

- Known downsides or introduced complexity

### Unresolved Questions

- Remaining risks, information gaps, or areas for validation

## Implementation Plan

1. Requirements
2. Refactors, changes, or tooling required
3. Rollout strategy
4. Risk mitigation during implementation
5. Design details if applicable

## Verification Criteria

- KPIs or metrics to track decision impact
- Timeframe and tools to validate success/failure

## Confidence Rating

- Subjective estimate: Low / Medium / High
- Factors influencing confidence (data, precedent, validation)

## Lessons Learned (Retrospective)

- Insights gained post-implementation
- Adjustments made or suggested for future decisions

## Examples & Usage (Optional)

- Code samples, configurations, test scenarios
- Specific use cases impacted by this decision

## References

- Linked RFCs, technical docs, diagrams, prior ADRs
- External sources or research influencing the decision

---
