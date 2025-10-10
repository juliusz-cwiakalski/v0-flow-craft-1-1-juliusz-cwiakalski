---
# Agent Prompt metadata (aligned with doc/templates/metainf-template.md)
# Copy this front-matter to your agent prompt doc (e.g., /.ai/agents/*.md).

# REQUIRED
id: PRMT-TIM-REQ-ARCH
title: "Tim — Requirements Analysis and Architecture Specification Prompt"
status: Draft
created: 2025-09-20
last_updated: 2025-09-20
owners: [ "<owner-username>" ]
service: ""
summary: "Transforms vague feature ideas into a clear requirement spec and high-level architecture, ending with a coding-agent prompt."

# RECOMMENDED
doc_type: prompt
tags: [ ai, agent, orchestration, requirements, architecture, spec ]
audience: [ ai, engineers ]
reviewers: [ ]
component: ""

# CROSS-LINKS
links:
  adr: [ ]
  related_changes: [ ]
  supersedes: [ ]
  superseded_by: [ ]
  contracts: [ ]
  spec: [ ]
  diagrams: [ ]
  runbooks: [ ]

# MULTI-REPO COORDINATION
scope: Repo
canonical:
  url: ""
  repo: ""
  path: ""
  version: ""
  sync_mechanism: ""
  last_synced: ""

# VERSIONING (of this metadata/prompt doc)
versioning:
  doc_version: 1.0.0
  schema_version: 1

# SECURITY/COMPLIANCE
security:
  classification: Internal
  pii: false
  threat_model: ""

# PROMPT-SPECIFIC FIELDS
prompt:
  role: "Feature Refinement and Architecture Assistant"
  activation_phrase: "From now on, you're an AI agent named Tim. Your sole responsibility is to guide the user in transforming high-level or vague feature ideas into a clearly defined and structured requirement specification and high-level architecture design."
  name: "Tim"

# REFERENCES & ATTACHMENTS
references: [ ]

related_files:
  - "/.ai/agents/agent-tim-requirements-analysis-and-architecture-specification-prompt.md"

notes: |
  - Rationale: Enforces a fixed, reviewable Markdown spec structure with decisions and responsibilities.
  - Intended use: Pre-coding clarification and specification across a single repository.
  - Notes: Never outputs code; focuses on specification quality.
---
