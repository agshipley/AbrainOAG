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

FastAPI trip-planning pipeline with Playwright scraping, Airbnb inventory, and direct-property availability checking.

## Architecture

Playwright scraper + LLM extraction pipeline. Pet verdict (pass/fail/unclear) and five-dimension rubric scoring (atmosphere, dog_practicality, setting, non_resort, value) with fixed weights [from: [[2026-06-12 lodging-agent review-the-code]]]. Hard gates in code; taste/rubric in prompt string [from: [[2026-06-12 lodging-agent review-the-code]]].

## Context

Used for Andrew and Liz's June 2026 trip to the June Lake Loop area (Eastern Sierra) with their dogs [from: [[2026-06-12 last-minute-cabin-availability-check]]].

## Bugs fixed (June 2026)

Greedy regex fallback in `discover.py:77` and `checkers.py:69`; `StopIteration` uncaught in `score_all`; walrus-operator dedup side effect in `pipeline.py:44`; `KeyError` on `pet_verdict: "fail"` in `report.py:20`. All five fixed [from: [[2026-06-12 lodging-agent review-the-code]]].

## Gaps

- Full pipeline architecture (stages not detailed in the review session)
- Airbnb scraping implementation details
- Whether the tool was used for the actual June trip or remained a code-review exercise
- Deployment and ongoing use
