---
type: project
subtype: repo
status: stub
confidence: med
created: 2026-06-22
updated: 2026-06-22
source: "[[GBRAIN_PROJECT]] §7"
aliases: []
tags: []
---

Open-source job-search engine built by Andrew Shipley, deployed on Railway with SQLite on a volume at `/data`.

## Thesis

Aggregates job listings via a two-tier corpus: Adzuna (breadth) and 80,000 Hours (mission-driven roles) [from: [[GBRAIN_PROJECT]]].

## Stack

MCP architecture; Railway deploy; SQLite at `/data` [from: [[GBRAIN_PROJECT]]].

## Status

Active. Relevance failure diagnosed 2026-04-11 — see [[2026-04-11 Orpheus relevance failure and corrective actions]].

## Decisions

- [[2026-04-11 orpheus orpheus-state-md-as-canonical-context-file]] — ORPHEUS_STATE.md committed as canonical context across all sessions
- [[2026-05-27 orpheus archimedes-config-yaml-exposure-accepted-as-benign]] — config file exposure accepted as benign; forward risk documented
- [[2026-05-27 orpheus feature-factory-chain-opt-in-only]] — Feature Factory requires explicit invocation phrase; never auto-triggers
