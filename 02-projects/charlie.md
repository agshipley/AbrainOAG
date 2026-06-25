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

Autonomous multi-agent entertainment industry intelligence system built for [[Liz Varner]], operated by Andrew Shipley, deployed on Railway.

## Thesis / Purpose

[[charlie]] monitors entertainment trade press and data platforms to produce a daily three-tier editorial brief (The Morning Loaf), a living strategic thesis (Far Mar), and an adversarial critique of its own output (Dark Comprandon) [from: [[2026-05-31 charlie-system-architecture-diagram]]]. The system is built around a thesis framework of three structural forces shaping the entertainment industry: supply exhaustion, demand migration, and a discovery infrastructure problem [from: [[2026-03-27 entertainment-news-aggregator-and-industry-research-project]]].

[[Liz Varner]]'s use is tied to a book deal with advance offers; [[charlie]]'s research infrastructure feeds directly into that commercial publishing project [from: [[2026-03-27 entertainment-news-aggregator-and-industry-research-project]]].

## Architecture

**Deployment:** Single Railway service at `charlie-productions.up.railway.app` with a volume mounted at `/app/data` for all persistent state [from: [[2026-04-15 architecture-review-after-workflow-sync]]]. Flat-file JSON; no database [from: [[2026-05-31 charlie-system-architecture-diagram]]].

**Agent contract:** Eight stateless Claude API agents operating on a `load-state → build-prompt → call-LLM → persist` cycle. The scheduler is a hand-rolled `while True` daemon thread in `web.py` (60-second polling loop) [from: [[2026-05-31 charlie-system-architecture-diagram]]].

**Daily pipeline (6am Pacific):** Ingestion → Analysis → Brief [from: [[2026-04-15 architecture-review-after-workflow-sync]]]. Ingestion runs on Sonnet across five search passes plus one structuring pass. Analysis and all deep-work agents run on Opus [from: [[2026-05-31 charlie-system-architecture-diagram]]].

**Weekly pipeline (Monday 7am Pacific):** Thesis synthesis (Far Mar) [from: [[2026-04-15 architecture-review-after-workflow-sync]]].

**On-demand agents:**
- *The Oven* — synthesizes the full [[charlie]] perspective (thesis, recent briefs, Field Work, context files, sessions) in response to a prompt from [[Liz Varner]]; its output does not re-enter any other agent or loop [from: [[2026-04-16 renaming-charlie-s-sections]]].
- *Acknowledgment agent* — generates a structured first-read response to Field Work uploads [from: [[2026-04-16 renaming-charlie-s-sections]]].

**Adversary (shadow mode):** Uses Opus. Reads brief drafts plus 30 days of sessions and 14 days of published briefs; excludes [[Liz Varner]]'s context files. Findings are rendered to MD/HTML/PDF and routed to Andrew only; they are hidden from primary web routes and do not re-enter the pipeline [from: [[2026-04-16 renaming-charlie-s-sections]], [[2026-05-31 charlie-system-architecture-diagram]]]. A Dark Comprandon toggle on the Companion page surfaces adversary findings to Liz for annotation (fair / off-base / partially right) [from: [[2026-04-16 renaming-charlie-s-sections]]].

**Brief structure (The Morning Loaf):**
- Tier 1: The Signal
- Tier 2: The Bullshit Flag
- Tier 3: Your World (receives Field Work injection)
- Each tier ends with open-ended → questions; these are a permanent feature [from: [[2026-05-31 charlie create-system-architecture-diagram]], [[2026-03-27 entertainment-news-aggregator-and-industry-research-project]]]

**State layer:** JSON files on Railway volume: `feedback.json`, `sessions.json`, `context/*.json`. Two distinct `sessions.json` files serve different roles. `context/` is a separate top-level directory from `data/` (the main data directory) [from: [[2026-05-31 charlie-system-architecture-diagram]]].

**Web surfaces (post-April 2026 renames):** Morning Loaf (`/`), Far Mar (`/thesis`), The Field (`/field`), The Oven (`/oven`), Companion (`/companion`), Archive (`/archive`), Run (`/run`) [from: [[2026-04-16 renaming-charlie-s-sections]], [[2026-05-31 charlie-system-architecture-diagram]]].

**Source priority:** Tier 1 — Matthew Ball, Richard Rushfield (The Ankler), Matthew Belloni (Puck); Tier 2 — Parrot Analytics, Nielsen, Edison Research [from: [[2026-03-27 entertainment-news-aggregator-and-industry-research-project]]].

## How it's used

[[Liz Varner]] reviews The Morning Loaf daily, rates signals 1–10 on the brief page, responds to per-tier questions on the Companion page, and uploads Field Work research artifacts via The Field [from: [[2026-04-15 architecture-review-after-workflow-sync]]].

Signal ratings write to `feedback.json` and inject into the next ingestion run via `get_feedback_prompt_injection()` as calibration blocks. A minimum of 2 ratings per signal type is required before the calibration block influences ingestion [from: [[2026-04-15 architecture-review-after-workflow-sync]], [[2026-04-15 charlie filter-bubble-firewall-indirect-influence-only]]].

Field Work uploads pass through a relevance-based citation layer before appearing in Tier 3: caps of 2 citations/week at relevance 0.7–0.8, 4/week at 0.8–0.9, 6/week at 0.9+, with a per-artifact maximum of 2 citations per 14-day rolling window. When caps bind, the system suppresses and logs. Caps are configurable via env vars. Field Work is excluded from Tier 1 and Tier 2 content entirely [from: [[2026-04-16 renaming-charlie-s-sections]]].

Andrew Shipley manages Railway deployments, pushes code changes, and reviews adversary findings manually [from: [[2026-04-15 architecture-review-after-workflow-sync]], [[2026-04-16 renaming-charlie-s-sections]]].

## Key decisions

- **Filter bubble firewall:** [[Liz Varner]]'s engagement data calibrates scoring in analysis and thesis agents; the ingestion aperture remains open and is not narrowed by her interests or project slate. See [[2026-04-15 charlie filter-bubble-firewall-indirect-influence-only]].
- **Adversary isolation:** Adversary findings route to Andrew only, never surface in primary web routes, and do not re-enter the pipeline [from: [[2026-04-16 renaming-charlie-s-sections]]].
- **Field Work citation caps:** Relevance-inverted caps configurable via env vars; Field Work excluded from Tier 1 and Tier 2 [from: [[2026-04-16 renaming-charlie-s-sections]]].
- **Mixed-model pipeline:** Sonnet for ingestion, Opus for Analysis and all deep-work agents [from: [[2026-05-31 charlie-system-architecture-diagram]]].
- **Section renames (April 2026):** The Brief → The Morning Loaf (daily consumption); Living Thesis → Far Mar (farmers market — complex partially-processed ingredients); The Book → The Field (where everything is seeded and grown) [from: [[2026-04-16 renaming-charlie-s-sections]]].

## Open threads

- The streaming landscape research file ([[Liz Varner]]'s xlsx, 129 shows across six sheets covering audience psychographics, platform profiles, and underserved audiences) was identified as a separate research artifact input channel with integration design deferred [from: [[2026-04-15 architecture-review-after-workflow-sync]]].
- The `/thesis/review` workflow (Liz annotates proposals, triggers Opus refinement passes up to 5 iterations, publishes) was specced in full during the April 2026 session; implementation status is not confirmed in later sessions [from: [[2026-04-15 architecture-review-after-workflow-sync]]].
- An executive tracking module (`--track-exec` flag) building a dataset of development executives hired at creator-native companies was described as built in the March 2026 session; its current integration and maintenance status are not documented [from: [[2026-03-27 entertainment-news-aggregator-and-industry-research-project]]].

## Gaps

What a complete [[charlie]] profile would cover that the corpus does not support:

- **Current deployment state.** The latest confirmed working session is May 2026. Whether all seven surfaces, the full pipeline, and the on-demand agents are currently live and functioning is not documented.
- **Far Mar thesis content.** The active strategic thesis and current working hypotheses are not surfaced in the corpus (appropriately — they are [[Liz Varner]]'s strategic property).
- **Test suite.** Existence, coverage, and pass rates are not documented in any session.
- **Running costs.** Monthly API spend, token consumption per pipeline run, and Railway infrastructure cost are not recorded.
- **Error handling and monitoring.** Sessions describe the success path. Error states, alerting, retry behavior, and recovery flows are not documented.
- **HTML architecture diagrams.** Three production-quality HTML architecture diagrams were generated using the Cocoon-AI skill; their content is not captured in this vault [from: [[2026-05-31 charlie-system-architecture-diagram]]].
- **Liz's usage patterns.** Sessions confirm she uses the system daily, rates signals, and uploads Field Work. Frequency depth, session duration, and signal-rating distribution are not recorded.
