---
type: decision
status: full
confidence: high
created: 2026-06-23
updated: 2026-06-23
source: "[[2026-06-23 building-a-gbrain-system-with-claude-code]]"
tags: []
---

# gbrain Phase 1: pure markdown + git + Obsidian; defer Postgres and MCP retrieval layer

**Decision:** The gbrain vault was built as Phase 1 using markdown files in git with Obsidian for rendering and navigation — no Postgres, no PGLite, no MCP server, no `gbrain import`. Phase 3 (retrieval engine) was explicitly deferred to an optional future gate, depending on whether Phase 1–2 prove valuable enough to warrant it.

**Rationale:** The COG fork (`huytieu/COG-second-brain`) demonstrates that a pure-markdown + Obsidian + git brain works without a database. Garry Tan's own guidance for gbrain is to seed from an existing markdown folder via `gbrain import`, so the vault is the durable asset and the retrieval engine is swappable. The vault must exist and be well-structured before any retrieval layer can be added. Building the database layer before the corpus is seeded violates the "working ugly thing first" principle from the Orpheus failure diagnostic. As stated in GBRAIN_PROJECT.md §1: "The vault is the asset; the retrieval engine is swappable."

**Alternative considered:** Build gbrain's full Postgres + pgvector + MCP server layer from the start (as Tan's production instance uses), giving hybrid search and 74 MCP tools from day one.

**Trade-off:** Phase 1 search is Obsidian's built-in full-text search — fast but no vector retrieval, no cross-source synthesis, no gap analysis. If Phase 3 is eventually built, migrating requires running `gbrain import` against the already-populated vault, which is straightforward if taxonomy and frontmatter fidelity have been maintained throughout Phase 1–2.
