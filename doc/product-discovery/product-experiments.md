# FlowCraft Priority Experiments (V0)

This document proposes the first three, highest-priority product experiments that maximize:
- Alignment with your OST and pain points
- Speed of delivery in the current V0 (frontend, in-memory state)
- The “Golden Thread” for certification with distinction (Problem → Discovery → OST → Prototype)

Selected experiments:
1) Quick Capture + Process Templates (S3.4 + S4.3)
2) Full Data Export (JSON/CSV) (S1.2)
3) Portfolio Roll‑up Dashboard (Lite) (S2.1 minimal)

Why these three
- Cover the top 3 opportunity areas driving churn: Collaboration & Automation, Migration & Adoption (trust), and Visibility & Reporting.
- High Impact / Low-to-Medium Effort in V0 (no backend): fast to build, easy to demo and screenshot.
- Directly traceable to OST solutions and roadmap MoSCoW/RICE, supporting the Golden Thread required for “with distinction”.

How they map to the OST and pain points
- S3.4 + S4.3 (Quick Capture + Templates): reduces coordination tax and admin overhead; standardizes input quality (DoR/DoD/AC).
- S1.2 (Full Export): eliminates vendor lock-in fear, builds trust for adoption/migration.
- S2.1 (Roll‑up Lite): gives leadership visibility without enterprise bloat.

Deliverables for certification
- OST already prepared (reference).
- Working prototype features:
  - Quick Capture modal with templates and Acceptance Criteria badge on issue cards.
  - “Export Data” dropdown producing JSON/CSV downloads for Issues and Sprints.
  - “Dashboard” view with status breakdown, per-sprint progress, and 7‑day Done throughput (approximation).
- Screenshots clearly showing the above features in action.

Next steps
1) Review the three experiment specs (below) and confirm the scope.
2) Add the listed files to the chat so I can send precise SEARCH/REPLACE patches.
3) I’ll provide the minimal, incremental changes per file to ship each experiment quickly.

Links
- [Experiment 1: Quick Capture + Templates — see experiment-1-quick-capture-and-templates.md](../changes/001-quick-capture-and-templates/experiment-1-quick-capture-and-templates.md)
- [Experiment 2: Roll‑up Dashboard (Lite) — see experiment-2-rollup-dashboard-lite.md](../changes/003-rollup-dashboard-lite/experiment-2-rollup-dashboard-lite.md)
- [Experiment 3: Full Data Export — see experiment-3-full-export.md](../changes/004-full-export/experiment-3-full-export.md)

PRDs
- PRD 0 — What’s New / Changelog — [prd-experiment-0-changelog.md](../changes/000-changelog/prd-experiment-0-changelog.md)
- PRD 1 — Quick Capture + Templates — [prd-experiment-1-quick-capture-and-templates.md](../changes/001-quick-capture-and-templates/prd-experiment-1-quick-capture-and-templates.md)
- PRD 3 — Roll‑up Dashboard (Lite) — [prd-change3-experiment-2-rollup-dashboard-lite.md](../changes/003-rollup-dashboard-lite/prd-change3-experiment-2-rollup-dashboard-lite.md)
- PRD 4 — Full Data Export — [prd-change4-experiment-3-full-export.md](../changes/004-full-export/prd-change4-experiment-3-full-export.md)
