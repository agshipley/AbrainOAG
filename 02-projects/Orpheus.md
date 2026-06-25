---
type: project
subtype: repo
status: full
confidence: high
created: 2026-06-22
updated: 2026-06-24
source: "[[GBRAIN_PROJECT]] §7"
aliases: []
tags: []
---

Open-source personal job search engine built by Andrew Shipley, deployed on Railway.

## Purpose

[[Orpheus]] aggregates job listings from multiple source agents, applies a four-identity ranker, and presents scored results through a web UI with content generators. The project is built primarily for Andrew's own job search and serves as a portfolio demonstration of agentic pipeline architecture [from: [[2026-04-11 job-search-engine-with-mcp-architecture-and-parallel-agents]]].

## Stack

Single Express + SQLite + Vite application. SQLite on a Railway volume at `/data`. Node.js/TypeScript. Deployed to Railway with automatic builds [from: [[2026-05-27 build-project-planning]]]. Live URL: `https://orpheus-production-6b88.up.railway.app` [from: [[2026-06-03 job-search-engine write-user-story-for-location-filtering]]]. Test suite: 121/121 passing as of May 2026 [from: [[2026-05-27 orpheus review-codebase-for-seven-agent-factory-architectu]]].

## Architecture

**Source agents (post-May 2026 rebuild):** Six agents fetch from different job sources. After the May 2026 data layer rebuild, confirmed working sources include HN (Hacker News Who's Hiring via Firebase/Algolia), ai_first (3 confirmed-live companies: Anthropic, Scale AI, DeepMind), vc_portfolio (13 direct Greenhouse boards: Stripe, Databricks, Figma, Brex, and others), operator_communities (6 Greenhouse sources), legal_innovation, and foundations_policy [from: [[2026-05-30 wheelhouse investigate-automatic-update-limitations]]].

**Four-identity ranker:** Scores every job against four profiles — operator, legal, research, applied_ai_operator — using keyword bags and org-adjacency boosts. MAX-wins logic: a job's final score is the highest identity score across all four [from: [[2026-04-11 job-search-engine-with-mcp-architecture-and-parallel-agents]]].

**GitHub signal boost:** Up to +20 points for jobs whose description or company matches keywords from portfolio projects [from: [[2026-05-27 build-project-planning]]].

**Location filter (added June 2026):** Hard geographic exclusion when the query names a location; soft profile-preference scoring when it does not [from: [[2026-06-03 job-search-engine write-user-story-for-location-filtering]]].

**Content generators:** Resume tailor, cover letter generator, email drafter — all identity-aware [from: [[2026-05-27 build-project-planning]]].

**ORPHEUS_STATE.md:** Canonical context file committed to the repo root, loaded automatically at the start of every Claude Code session [from: [[2026-04-11 job-search-engine-with-mcp-architecture-and-parallel-agents]]].

## Key decisions

- [[2026-04-11 orpheus orpheus-state-md-as-canonical-context-file]] — ORPHEUS_STATE.md pattern for persistent context
- [[2026-05-27 orpheus archimedes-config-yaml-exposure-accepted-as-benign]] — profile config accepted as non-sensitive
- [[2026-05-27 orpheus feature-factory-chain-opt-in-only]] — Feature Factory requires explicit invocation
- [[2026-05-29 wheelhouse findlistings moved to edge function sse]] — findListings moved to Edge Function (Wheelhouse; parallel pattern)
- [[2026-05-30 wheelhouse agent data layer rebuilt on greenhouse boards]] — Getro/Pallet retired, Greenhouse boards adopted
- [[2026-04-11 Orpheus relevance failure and corrective actions]] — April 2026 diagnostic and corrective calls
- [[2026-06-03 job-search-engine write-user-story-for-location-filtering]] — location filter designed and shipped

## Status

Active. Known structural limitation: [[Orpheus]] is a fixed-roster aggregator over ~30 company Greenhouse boards. Geographic coverage outside SF Bay Area and NYC is thin [from: [[2026-05-27 build-project-planning]]].

## Gaps

- Exact test suite composition and coverage beyond the 121-test count
- Observatory UI details (described as existing but not documented in sessions)
- Tonight's Five landing page behavior and data source
- Whether the Feature Factory agents are currently in use or were decommissioned after the opt-in decision
- Current live session count and search performance metrics
