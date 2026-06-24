---
type: decision
status: full
confidence: high
created: 2026-06-11
updated: 2026-06-11
source: "[[2026-06-11 dr-max-s move-render-cache-from-localstorage-to-vercel-blob]]"
tags: []
---

# Dr Max's: use Vercel Blob with shared manifest for render and concept persistence; retire localStorage

**Decision:** Dr Max's concept shelf and render cache moved from `localStorage` to Vercel Blob, with a shared `concepts.json` manifest mapping state across browsers. `localStorage` was retained only for in-flight UX state (optimistic updates before POST confirms). The verification standard was updated: "done" means verified from a clean incognito browser with empty storage, not from the builder's own session.

**Rationale:** This note replaces the earlier localStorage-based render approach, which failed cross-browser persistence: renders cached in one browser session were invisible to every other user. The prior session had deployed render caching via `localStorage`, run a Playwright verification that confirmed all 9 concept renders appeared, and shipped. The problem was identified by Andrew: "localStorage is per-browser. CC ran 'Render all' inside its own Playwright browser, the renders cached into that browser's storage, its screenshot genuinely showed nine photos — every checkmark in its report is true for its browser. Then it threw that browser away. Your browser has empty storage." Any shared concept shelf or rendered image must live in server-side storage to be visible to multiple users and sessions.

**Alternative considered:** Keep `localStorage` for render caching (the approach in the prior session) — per-browser, zero infrastructure, but invisible to other users.

**Trade-off:** Requires `@vercel/blob` dependency and a `BLOB_READ_WRITE_TOKEN` environment variable. A one-line `allowOverwrite: true` flag was required to fix a `@vercel/blob` API change that was not in the documentation at the time of implementation. CDN cache lag (a few seconds after a write before a read reflects it) required explicit cache-busting in tests.
