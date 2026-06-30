---
type: note
subtype: infrastructure
status: active
created: 2026-06-29
updated: 2026-06-30
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

## Phase 3.2 — Local HTTP server with auth, one client, behind the boundary

**gbrain version:** 0.42.53.0  
**Server:** `gbrain serve --http` running locally, port 3799  
**Tunnel:** cloudflared quick tunnel (temporary URL, rotates on every restart)  
**Brain:** PGLite at `~/.gbrain/brain.pglite/` (same as Phase 3.1)

### Endpoints introduced (gbrain-specific HTTP surface)

| Endpoint | Method | What it does | Replacement must... |
|---|---|---|---|
| `/mcp` | POST | MCP HTTP transport (Streamable HTTP). Requires `Authorization: Bearer <access_token>`. Returns 401 JSON on missing/invalid token. | Expose `/mcp` at the same path; accept the same MCP tool call envelope |
| `/.well-known/oauth-authorization-server` | GET | RFC 8414 OAuth discovery. Returns issuer, token endpoint, authorization endpoint, supported grant types, scopes. | Implement RFC 8414 discovery at this exact path so MCP clients can self-configure |
| `/health` | GET | Returns `{status, version, engine}`. Used by Railway health checks and tunnel verification. | Expose `/health`; `status: "ok"` is the liveness signal clients check |
| `/admin/login` | POST | Exchanges `GBRAIN_ADMIN_BOOTSTRAP_TOKEN` for a session cookie (`gbrain_admin`). Body: `{token: string}`. | Admin auth is gbrain-internal; owned server replaces with its own admin mechanism |
| `/admin/api/register-client` | POST | Creates an OAuth client. Requires `gbrain_admin` session cookie. Body: `{name, grantTypes, scopes, redirectUris}`. Returns `{clientId, clientSecret}`. | Owned server must manage OAuth clients some other way; this endpoint is gbrain-specific |

### OAuth client schema (gbrain-specific)

| Field | Type | Value for claude-web | Portability note |
|---|---|---|---|
| `name` | string | `claude-web` | Arbitrary label; not part of OAuth wire protocol |
| `grantTypes` | string[] | `["authorization_code", "refresh_token"]` | Standard OAuth 2.1; owned server must support same grants |
| `scopes` | string | `"agent read"` | `agent` and `read` are gbrain-defined scope names; owned server must define equivalent scopes |
| `redirectUris` | string[] | `["https://claude.ai/api/mcp/auth_callback"]` | Claude's callback URL — must match exactly in the owned server's OAuth client store |

### Commands used (gbrain-specific)

| Command | What it does | Replacement must... |
|---|---|---|
| `gbrain serve --http --port N --public-url URL` | Starts OAuth 2.1 HTTP MCP server. `--public-url` sets the OAuth issuer in discovery metadata (must match the URL clients hit). | Expose `/mcp` and `/.well-known/oauth-authorization-server` at the same public URL |
| `gbrain serve --http --bind 0.0.0.0` | Binds to all interfaces (required when behind a tunnel or reverse proxy). Default is `127.0.0.1`. | Owned server bind/listen config |

### Provider dependencies

| Provider | Env var | Used for | Notes |
|---|---|---|---|
| `GBRAIN_ADMIN_BOOTSTRAP_TOKEN` | same | First-run admin auth; printed to stderr at server start if unset | 32+ char alphanum; owned server replaces with its own admin credential mechanism |

### Data artifacts

| Path | What it is |
|---|---|
| Cloudflared quick tunnel URL | `https://<random>.trycloudflare.com` — unstable, rotates on every restart. Phase 3.2 used `famous-advance-searched-yeast.trycloudflare.com` then `builds-gas-anchor-chronic.trycloudflare.com`. |
| `oauth_clients` table (PGLite) | Stores registered OAuth clients including `claude-web`. Owned by gbrain schema. |

### Phase 3.2 portability debt

- Quick tunnel URL is not stable — any tunnel restart requires re-registering the connector in Claude. Phase 3.3 resolves this with a fixed Railway domain.
- The `agent` scope is a gbrain-specific scope name. Owned server must map it to an equivalent capability boundary.
- `/admin/api/register-client` response returns `clientSecret` in plaintext once. Owned server must implement equivalent one-time secret delivery.

---

## Phase 3.3 — Railway deploy on Supabase Postgres, stable URL

**gbrain version:** 0.42.53.0  
**Server:** Railway service `gbrain` in project `abrainoag-gbrain`  
**Public URL:** `https://gbrain-production-8e15.up.railway.app`  
**Brain:** Supabase Postgres via Transaction pooler (port 6543)  
**Brain data at:** Supabase project `<project-ref>`, region `ca-central-1` (AWS)

### Commands used (gbrain-specific)

| Command | What it does | Replacement must... |
|---|---|---|
| `gbrain init --url <pooler_url> --non-interactive` | Initialises Postgres engine: applies 119 schema migrations (idempotent), creates pgvector/pg_trgm/pgcrypto extensions, writes `config.json`. | Run the same 119 migrations against Postgres, or own the schema from scratch |
| `gbrain import <dir> --no-embed` | Walked 143 pages; created 3382 chunks. Same as Phase 3.1 but targeting Postgres via network pooler. | Same markdown walker + chunker; INSERT to `content_chunks` table |
| `gbrain embed --stale` | Embedded 3382 chunks; ran twice (first run exited at 78% after repeated OpenAI rate-limit retries; second run completed the remaining 535 chunks). | Embed only `content_chunks` rows where `embedding IS NULL`; respect OpenAI TPM limits |
| `gbrain extract all --source fs` | Created 350 links, 0 timeline entries from 143 pages. | Parse `[[wikilinks]]` from markdown; INSERT to `links` table with `link_type` and `context` |
| `gbrain config set link_resolution.global_basename true` | Enables basename-only wikilink resolution (resolves `[[charlie]]` → `02-projects/charlie`). **Stored in Postgres config table, not local config.json** — travels with the brain. | Own server owns this resolution strategy directly |
| `gbrain config set search.mode balanced` | Sets retrieval payload size. **Stored in Postgres config table** — in effect on every client connecting to this brain, including Railway. | Owned server controls retrieval parameters directly |

### Environment variables introduced (gbrain-specific)

| Env var | Where set | What it does | Replacement must... |
|---|---|---|---|
| `GBRAIN_DATABASE_URL` | `.env` + Railway | Namespaced Postgres URL. Always honoured; never ignored by the cwd `.env` guard that drops bare `DATABASE_URL`. Must be the **Transaction pooler** (port 6543) — direct connection (port 5432) is IPv6-only and fails on Railway. | Pass a standard `DATABASE_URL`; own the pooler-vs-direct distinction |
| `GBRAIN_HOME` | local only | Overrides config directory from `~/.gbrain/` to `~/.gbrain-pg/.gbrain/`. Used to keep Postgres config.json separate from the original PGLite config. Not needed on Railway (no local config file; `GBRAIN_DATABASE_URL` synthesises config at runtime). | Not applicable to owned server |
| `GBRAIN_ADMIN_BOOTSTRAP_TOKEN` | `.env` + Railway | Stable pre-configured admin token. When set, gbrain prints "from $GBRAIN_ADMIN_BOOTSTRAP_TOKEN" in the startup banner instead of generating and printing a one-time token. | Owned server manages its own admin credential |
| `GBRAIN_HTTP_CORS_ORIGIN` | Railway | Comma-separated CORS allowlist for OAuth endpoints. Without this, all cross-origin OAuth requests are rejected (default-deny). Set to `https://claude.ai`. | Owned server sets its own CORS policy; `https://claude.ai` must be in the allowlist for the Claude connector to complete the OAuth flow |
| `GBRAIN_EMBEDDING_MODEL` | Railway | Explicit model selector (`openai:text-embedding-3-large`). When `GBRAIN_DATABASE_URL` is set but no `config.json` exists, gbrain synthesises config purely from env vars — model must be set explicitly to match the stored vectors. | Owned server hard-codes or configures its embedding model independently |
| `GBRAIN_EMBEDDING_DIMENSIONS` | Railway | Must match vectors already in DB (`1536`). Mismatch causes dimension-check errors at startup. | Owned server validates dimension consistency at boot |
| `GBRAIN_EXPANSION_MODEL` / `GBRAIN_CHAT_MODEL` | Railway | Sets query-expansion and chat LLM (`openai:gpt-5.2`). | Owned server configures its own expansion model |

### config.json engine selector (gbrain-specific)

`~/.gbrain-pg/.gbrain/config.json` contains `"engine": "postgres"` and the literal `database_url` field. On Railway, no `config.json` exists — gbrain synthesises the config object from `GBRAIN_DATABASE_URL` + env model vars at runtime (`loadConfig()` in `core/config.ts`). Owned server has no equivalent file; it is its own engine.

### Railway / build dependencies (gbrain-specific)

| Artifact | What it is | Replacement must... |
|---|---|---|
| `railway.json` (local, untracked) | `build.buildCommand: "true"` (skips unnecessary `bun run build` that compiles a standalone binary); `deploy.startCommand: "bun src/cli.ts serve --http --port $PORT --bind 0.0.0.0 --public-url https://$RAILWAY_PUBLIC_DOMAIN"` | Owned server has its own Dockerfile/Nixpacks config and start command |
| `NIXPACKS_NODE_VERSION=22` | Railway env var | Overrides Nixpacks auto-detected Node 18 (EOL, removed from nixpkgs). Not needed once gbrain ships a `nixpacks.toml` or when Nixpacks updates its default. | Owned server controls its own build toolchain |
| `bun.lock` | gbrain repo root | Tells Nixpacks to use Bun as the package manager and runtime. | Owned server may use a different runtime |

### OAuth client (Phase 3.3)

Re-registered `claude-web` against the Railway server's own admin API to guarantee the client lands in the Postgres `oauth_clients` table the live server reads:

```
POST https://gbrain-production-8e15.up.railway.app/admin/login   → session cookie
POST https://gbrain-production-8e15.up.railway.app/admin/api/register-client
  {name: "claude-web", grantTypes: ["authorization_code","refresh_token"],
   scopes: "agent read", redirectUris: ["https://claude.ai/api/mcp/auth_callback"]}
```

`clientId`: `gbrain_cl_d15d832845f4c542c4ff24e75dac8ab07a08de723d44be832cb305aa1415330b`  
`clientSecret`: stored in `/tmp/claude-web-client.json` on local machine (not committed).

### Phase 3.3 portability debt

- **`oauth_clients` schema is gbrain-internal.** `grantTypes`, `scopes` (`agent`, `read`), `redirectUris`, `clientSecret` hash storage — all owned by gbrain. Owned server must replicate these columns and the one-time secret reveal pattern.
- **`content_chunks` chunking is gbrain-internal.** Chunk boundaries, overlap, and the `embedding` column layout are not documented externally. Owned server must reverse-engineer or reimplement the chunker to match retrieval quality.
- **DB-plane config table.** `search.mode`, `link_resolution.global_basename`, and other settings live in a `brain_config` (or equivalent) table in Postgres, not in a file. Owned server must own these parameters directly rather than reading from a config table.
- **Pooler-specific behaviour.** Prepared statements disabled on port 6543 (`prepare: false`). gbrain auto-detects port and sets this. Owned server must set `prepare: false` explicitly when targeting Supabase Transaction pooler.
- **Supabase DDL via direct connection.** gbrain auto-derives a direct connection (port 5432) from the pooler URL for DDL and bulk operations (longer statement timeout). Owned server must handle DDL similarly or accept the pooler's 2-minute statement timeout cap.
