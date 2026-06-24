---
type: decision
status: full
confidence: high
created: 2026-05-30
updated: 2026-05-30
source: "[[2026-05-30 wheelhouse investigate-automatic-update-limitations]]"
tags: []
---

# Rebuild Wheelhouse source agents on direct Greenhouse boards; retire Getro and Pallet integrations

**Decision:** All three broken source integrations were replaced with confirmed-live alternatives. `vc_portfolio` was rebuilt on 13 direct Greenhouse boards (Stripe, Databricks, Figma, Brex, Klaviyo, Robinhood, Asana, Gusto, Carta, Amplitude, Mercury, Airtable, Vercel). `operator_communities` was rebuilt with 6 live Greenhouse sources (Oura, ACLU, Mozilla, Wikimedia, Lattice, GOAT). `ai_first` was pruned from 10 companies to 3 confirmed-live ones (Anthropic, Scale AI, DeepMind). The prior Getro and Pallet integrations were removed.

**Rationale:** Live URL verification confirmed every Getro URL in `vc_portfolio` (12 of 12) returned 403 or 404, and every Pallet URL in `operator_communities` (7 of 7) returned HTML error pages or was dead. These agents had been returning zero jobs since the project was built. Eight of ten `ai_first` companies were also unreachable. The working corpus was Anthropic, DeepMind, HN, and fragments from `legal_innovation` — three effective sources out of six. The transcript notes this as "2 of 6 agents [being] decorative" and the fix as replacing them with sources that "actually return jobs."

**Alternative considered:** Debug and repair the Getro and Pallet integrations (e.g. authenticate with Getro, find live Pallet alternatives). The session checked each URL individually and found no viable repair path: Getro endpoints were auth-gated with no public workaround, and Pallet had no replacement endpoints returning real job data.

**Trade-off:** The replacement Greenhouse sources are weighted toward SF Bay Area and NYC companies (Stripe, Figma, Databricks headquarters). LA-specific queries still return thin results. The agent pool expanded from ~400–500 effective jobs to ~3,000+, but geographic coverage for non-SF markets remains limited.
