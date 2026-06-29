---
type: note
subtype: infrastructure
status: active
created: 2026-06-29
updated: 2026-06-29
tags: [phase3, gbrain, portability]
---

A running list of every place the Phase 3 build depends on something gbrain-specific rather than on the open standards (MCP, OAuth 2.1 + PKCE, Postgres). Each entry is a thing the Phase 5 owned server must reimplement. The ledger IS the checklist for the replacement.

---

## Phase 3.1 — Local PGLite brain

**gbrain version:** 0.42.53.0  
**Installed at:** `~/gbrain/` (separate from the vault)  
**Brain data at:** `~/.gbrain/brain.pglite/` (NOT inside the vault; the vault markdown stays clean)

### Commands used (gbrain-specific)

| Command | What it does | Replacement must... |
|---|---|---|
| `gbrain init --pglite` | Creates PGLite brain (embedded Postgres, no server); runs 119 schema migrations; sets embedding model | Run 119 migrations on Postgres, or reimplement schema from scratch |
| `gbrain import <dir> --no-embed` | Walks markdown directory; parses frontmatter + body; creates pages + chunks (3381 chunks from 142 pages); slugifies filenames | Implement markdown walker + chunker + frontmatter parser |
| `gbrain embed --stale` | Calls OpenAI API for each unembedded chunk; stores 1536d vectors in pgvector column | Call embedding API directly; store vectors in pgvector |
| `gbrain search <query>` | tsvector keyword search | Postgres `to_tsvector` + `to_tsquery` |
| `gbrain query <question>` | Hybrid search: RRF fusion of keyword + vector; optional LLM query expansion | Implement RRF fusion; optionally call LLM for query expansion |
| `gbrain config set search.mode balanced` | Sets retrieval payload size (conservative/balanced/tokenmax); stored in `~/.gbrain/config.json` | Owned server controls its own retrieval parameters directly |
| `gbrain doctor` | Health check across 60+ dimensions | No direct equivalent needed; owned server has its own observability |
| `gbrain stats` | Page/chunk/embedding counts by type | SELECT queries against the pages table |
| `gbrain extract all` | (not yet run) Populates typed wikilink graph from `[[wikilinks]]` in markdown | Parse wikilinks from markdown; insert into links table |

### Provider dependencies

| Provider | Env var | Used for | Notes |
|---|---|---|---|
| `openai:text-embedding-3-large` | `OPENAI_API_KEY` | Embeddings (1536d) | gbrain's legacy default; v0.36+ default is `zeroentropyai:zembed-1`. Owned server can use either. |
| `openai:gpt-5.2` | `OPENAI_API_KEY` | Query expansion (hybrid search), chat | Auto-detected from OPENAI_API_KEY. ANTHROPIC_API_KEY would enable subagent features (dream, autopilot) — not needed for pilot. |

### Data artifacts (gbrain-specific, NOT in vault)

| Path | What it is |
|---|---|
| `~/.gbrain/brain.pglite/` | PGLite database directory (the index) |
| `~/.gbrain/config.json` | gbrain config (embedding model, search mode, etc.) |
| `~/.gbrain/audit/` | Local content-sanity audit log |
| `~/.gbrain/.locks/` | PGLite concurrency locks |

**These are not committed.** The vault markdown in `~/projects/AbrainOAG/` is the portable asset; the index above is generated and regenerable.

### Schema / format facts (portability-relevant)

- PGLite is a WASM-compiled Postgres running in-process; schema is identical to Postgres but the binary format is not a standard Postgres data directory. Migration to real Postgres uses `gbrain migrate --to supabase`.
- 119 schema migrations applied as of v0.42.53.0. Schema pack: `gbrain-base-v2`.
- Vectors stored in pgvector `embedding` column (1536d for `text-embedding-3-large`).
- Pages keyed by `slug` (filename slugified). Cross-references as `[[wikilinks]]` in markdown body, typed edges in a `links` table.
- Frontmatter fields (`type`, `subtype`, `status`, `created`, `updated`, `source`, `aliases`, `tags`) parsed and stored as structured columns.

### Things gbrain does that the owned server must match

1. **Markdown chunker**: splits pages into chunks for embedding; preserves frontmatter per-page.
2. **Hybrid search (RRF)**: fuses tsvector keyword rank + cosine vector rank into a single result list.
3. **Query expansion**: (optional) calls an LLM to expand the user's query before search.
4. **Link graph**: extracts `[[wikilinks]]` from markdown bodies into typed edges; enables relational queries.
5. **MCP tool surface**: `gbrain serve --http` exposes search/get/put/link tools over HTTP MCP. Owned server must implement the same tool names and signatures for clients to be unaffected by the swap.
6. **OAuth 2.1 + PKCE**: `gbrain serve --http` runs a built-in auth server. Owned server must expose the same token endpoint at the same URL for clients to be unaffected.

### Doctor output summary (Phase 3.1)

- **142 pages** imported, **3381 chunks**, **100% embedded** ✓  
- **Search mode**: balanced ✓  
- **Embedding**: openai:text-embedding-3-large, 1536d, DB-aligned ✓  
- **Schema**: version 119 (latest) ✓  
- **WARNs to address before Phase 3.2**:  
  - Run `gbrain extract all` to populate wikilink graph (currently 0% entity link coverage)  
  - Enable `link_resolution.global_basename` to resolve 3182 bare wikilinks  
  - 5 pages flagged as oversized/markup-heavy — still searchable, no action needed for pilot  
  - ANTHROPIC_API_KEY not set — subagent features (dream, autopilot) disabled; not needed for pilot  

---

## Phase 3.2 onward — entries to be added

(Tunnel command used, OAuth client registration, connector URL registered in each client — to be filled in as each phase runs.)
