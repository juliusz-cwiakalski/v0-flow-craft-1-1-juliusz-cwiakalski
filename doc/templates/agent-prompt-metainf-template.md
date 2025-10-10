---
# Agent Prompt metadata (aligned with doc/templates/metainf-template.md)
# Copy this front-matter to your agent prompt doc (e.g., /.ai/agents/*.md).

# REQUIRED
id: PRMT-AGENT-EXAMPLE            # Use PRMT-... for prompts; ensure uniqueness
title: "Example Agent Prompt"     # Human-readable title
status: Draft                     # Draft | Proposed | Accepted | Active | Deprecated | Superseded | Rejected
created: YYYY-MM-DD               # Creation date
last_updated: YYYY-MM-DD          # Last modification date
owners: [ "<owner-username>" ]    # Primary maintainers
service: ""                       # Optional for prompts; set if repo/service-specific
summary: "One-line description of the agent’s purpose and scope."

# RECOMMENDED
doc_type: prompt                  # spec | change | adr | contracts | domain | quality | ops | overview | analytics | i18n | template | prompt | example | diagram
tags: [ ai, agent, orchestration ]
audience: [ ai, engineers ]
reviewers: [ ]
component: ""                     # Optional: subsystem if applicable

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
  ai_conversations:
   - url: "https://chatgpt.com/g/g-p-6..."
     summary: "ChatGPT conversation refining this prompt"


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
  doc_version: 1.0.0              # SemVer for this prompt document
  schema_version: 1               # Metadata schema version

# SECURITY/COMPLIANCE
security:
  classification: Internal        # Public | Internal | Confidential
  pii: false
  threat_model: ""

# PROMPT-SPECIFIC FIELDS
prompt:
  role: "AI Assistant Role"       # e.g., Architect, Coach, Tester
  activation_phrase: "From now on, you are Example Agent..."
  name: "Example Agent"           # Optional display name
  author: "<your name>"           # Optional original author
  # You may also include:
  # version: 1.0.0
  # capabilities: [ ]
  # constraints: [ ]

# REFERENCES & ATTACHMENTS
references:
  - url: "https://example.com"
    summary: "Related article or resource"
  - url: "https://chat.openai.com/..."
    summary: "ChatGPT conversation refining this prompt"

related_files:
  - "/.ai/agents/example-agent.md"

notes: |
  - Rationale, design choices, and intended use.
  - Known limitations or TODOs.
  - Alignment: This template uses the same keys and lifecycle as doc/templates/metainf-template.md.
---
