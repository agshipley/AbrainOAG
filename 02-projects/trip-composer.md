---
type: project
subtype: repo
status: moderate
confidence: high
created: 2026-06-23
updated: 2026-06-23
source: "claude-code sessions"
aliases: []
tags: []
---

FastAPI + SQLite trip planning agent with a six-stage LLM pipeline and Airbnb scraping.

## Architecture

Six-stage pipeline: parse → discover → inventory → judge → verify → compose [from: [[2026-06-12 trip-composer familiarize-with-the-codebase]]]. Apify scraper for Airbnb inventory (or mock fixtures when no token) [from: [[2026-06-12 trip-composer familiarize-with-the-codebase]]]. Direct property availability checking via booking-engine adapters (InnRoad implemented; ThinkReservations/Cloudbeds stubbed) [from: [[2026-06-12 trip-composer familiarize-with-the-codebase]]]. Parsed LLM output always via `structured()` with forced `tool_choice` — no regex JSON parsing [from: [[2026-06-12 trip-composer familiarize-with-the-codebase]]]. Mock mode works with only `ANTHROPIC_API_KEY` [from: [[2026-06-12 trip-composer familiarize-with-the-codebase]]].

## InnRoad adapter (corrected June 2026)

Correct session endpoint is `GET /session/status` (returns session token as response header); `POST /guestSession` does not exist. The `Origin` header must be the property-specific subdomain. Cloudflare Turnstile detection: raises `RuntimeError` → `direct.py` catches it, sets `call_to_confirm=True` [from: [[2026-06-12 trip-composer familiarize-with-the-codebase]]].

## Known bugs (identified June 2026, no fixes this session)

Greedy regex fallback in `discover.py` and `checkers.py`; `StopIteration` uncaught in `score_all`; Apify token in URL query params; `_first()` treating 0 as missing; `_fetch()` silent failure; PUT `/api/profile` no validation [from: [[2026-06-12 trip-composer review-code]]].

## Gaps

- Whether the bugs identified in the review session were subsequently fixed
- Current deployment URL and active use
- Profile owner and target use case (used for Andrew's own trip planning per one session)
- Pending Apify actor bake-off mentioned in docs
