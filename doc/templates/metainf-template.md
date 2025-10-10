---
# Generic metadata front‑matter template for any /doc/**/*.md file.
# Copy this block to the top of your document and fill in relevant fields.

# REQUIRED (doc checks rely on these)
id: DOC-XXXX                    # Use: CHG-#### | ADR-#### | SPEC-... | OPS-... | QLTY-... | PRMT-... | DOC-...
title: "Document Title"         # Human-readable title
status: Draft                   # Draft | Proposed | Accepted | Active | Deprecated | Superseded | Rejected
created: YYYY-MM-DD             # Creation date
last_updated: YYYY-MM-DD        # Last modification date
owners: [ "<owner-username>" ]  # Primary maintainers
service: "<service-or-app>"     # e.g., "recipes-service", "ui-app" (omit if N/A)
summary: "One-line summary of the content and purpose."

# RECOMMENDED
doc_type: spec                  # spec | change | adr | contracts | domain | quality | ops | overview | analytics | i18n | template | prompt | example | diagram
tags: [ domain, keywords ]      # Search/routing keywords
audience: [ engineers, product, ops, ai ]  # Intended readers/users
reviewers: [ ]                  # Optional: approvers or typical reviewers
component: "<component-or-subsystem>"      # Optional: more granular ownership

# CROSS-LINKS (keep these updated to maintain navigability)
links:
  adr: [ ]                      # e.g., [ "ADR-0001" ]
  related_changes: [ ]          # e.g., [ "CHG-0043" ]
  supersedes: [ ]               # IDs this document replaces
  superseded_by: [ ]            # IDs that replace this document
  contracts: [ ]                # e.g., [ "contracts/rest/openapi.yaml#/paths/~1items~1search" ]
  spec: [ ]                     # Related /doc/spec/** paths
  diagrams: [ ]                 # Related /doc/diagrams/** paths
  runbooks: [ ]                 # Related /doc/ops/runbooks/** paths

# MULTI-REPO COORDINATION (use if this doc is shared or mirrored)
scope: Repo                     # Shared | Domain-scoped | Repo
canonical:
  url: ""                       # Canonical source if mirrored (http(s) link)
  repo: ""                      # org/repo if different
  path: ""                      # Path within canonical repo
  version: ""                   # Canonical version (if versioned artifact)
  sync_mechanism: ""            # submodule | subtree | automation | manual
  last_synced: ""               # YYYY-MM-DD

# VERSIONING (of this document, not product/API)
versioning:
  doc_version: 0.1.0            # Optional SemVer for living docs/templates/prompts/specs
  schema_version: 1             # Version of this metadata schema

# SECURITY/COMPLIANCE (optional; use for ops/spec/security docs)
security:
  classification: Internal      # Public | Internal | Confidential
  pii: false
  threat_model: ""              # Path to STRIDE/LINDDUN notes (if applicable)

# PROMPT-ONLY FIELDS (use for documents under /.ai or prompt templates)
prompt:
  role: ""                      # e.g., "AI Assistant Role"
  activation_phrase: ""         # e.g., "From now on, you are ..."
  # For prompt docs, you may also include:
  # version: 1.0.0
  # author: "<your name>"

# REFERENCES & ATTACHMENTS
references:
  - url: "https://example.com"
    summary: "Relevant background or external source"
related_files:
  - "/doc/examples/example.json"

notes: |
  - Rationale, design decisions, assumptions.
  - TODOs or follow-ups.
  - If this document is Accepted/Active, ensure related Spec/Contracts are updated.
---
