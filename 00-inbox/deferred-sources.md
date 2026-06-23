---
type: note
subtype: ""
status: stub
confidence: low
created: 2026-06-22
updated: 2026-06-22
source: "probe-claude-export.ts"
aliases: []
tags: []
---

Sources present in the Claude export that are out of scope for Phase 1 import. Each entry: what it is, why deferred, unblock path.

---

memories.json (~92KB) — out-of-spec, present in export, holds [shape TBD]; probe and import in a later pass. Logged 2026-06-22.

project docs arrays — each of the 22 project/*.json files carries a `docs` array of uploaded knowledge-base documents (full content embedded, NOT conversation references). Shape: {uuid, filename, content, created_at}. Candidate for 06-sources/ import. Deferred: scope. Unblock: write scripts/import-project-docs.ts in Phase 2. Logged 2026-06-22.
