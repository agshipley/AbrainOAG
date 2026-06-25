---
type: project
subtype: repo
status: full
confidence: high
created: 2026-06-23
updated: 2026-06-24
source: "claude-code sessions"
aliases: []
tags: []
---

Bar acquisition pipeline screener built by Andrew Shipley; React SPA backed by Supabase, deployed on Railway then Vercel.

## Purpose

[[Wheelhouse]] scores and ranks bar acquisition opportunities for Andrew and his clients — career bartenders acquiring a coastal Southern California bar. The tool models all-in capital requirements (purchase price, closing costs, license transfer, rebrand, inventory, working capital, SBA debt, seller carry), scores opportunities on concept fit and economics, and supports a ranked pipeline with diligence checklists [from: [[2026-05-27 vetting-a-bar-business-opportunity-in-newport-huntington-beach]]].

## Stack

React SPA (`bar_screener.jsx`), originally built as a Claude.ai artifact, scaffolded to Vite for Railway deployment [from: [[2026-05-29 andrewshipley review-bar-screener-code]]]. Supabase Postgres for persistence; Supabase Edge Functions for AI calls; Anthropic API key stored as a Supabase server secret [from: [[2026-05-30 wheelhouse investigate-automatic-update-limitations]]]. GitHub: `agshipley/Wheelhouse` [from: [[2026-05-29 andrewshipley review-bar-screener-code]]].

## Features

Add Opportunity with AI Parse (URL or pasted text → form pre-fill), Edit, Re-check (web search + extraction, auto-saves), Check Links (Supabase Edge Function doing HEAD requests), two modes (Boardwalk Thesis pre-tuned; Custom open), criteria panel for capital stack and capacity targets [from: [[2026-05-30 wheelhouse investigate-automatic-update-limitations]]]. Two-level crosstab sorting with shift-click secondary axis and sort strip [from: [[2026-05-30 wheelhouse add-crosstab-sorting-functionality]]].

## Key decisions

- [[2026-05-29 wheelhouse bar-screener-api-key-browser-bundle]] — API key in browser bundle accepted for private tool
- [[2026-05-29 wheelhouse findlistings moved to edge function sse]] — findListings moved to Supabase Edge Function with SSE
- [[2026-05-30 wheelhouse findlistings structural limitation accepted]] — Find Listings structurally limited by Google index staleness
- [[2026-05-30 wheelhouse agent data layer rebuilt on greenhouse boards]] — Getro/Pallet replaced with Greenhouse boards
- [[2026-05-30 wheelhouse git-history-rewrite-to-remove-co-authored-by]] — git history rewritten to remove Claude attribution

## Gaps

- Current deployment URL (changed from `wheelhouse-production-f59a.up.railway.app`)
- Whether Find Listings was replaced with a BizBen URL generator (proposed but not confirmed built)
- Whether the tool has been used in a live acquisition transaction
- Mobile responsiveness (identified as 4-6 hours of work; status unknown)
