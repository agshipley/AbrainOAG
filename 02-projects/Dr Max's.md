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

Next.js product planning app built for Dr. Max's, a physician-formulated natural skincare brand.

## Context

Dr. Max's (drmaxs.com) is a small baby-and-pediatric skincare brand founded by Dr. Max Goldstein, M.D., with Erin as CEO [from: [[2026-06-11 dr-max-s-company-research-and-analysis]]]. Andrew built a product planning tool for this client to support a strategic roadmap decision (deepening the first-year baby SKU line vs. expanding into toddler offerings) [from: [[2026-06-11 dr-max-s-company-research-and-analysis]]].

## App

Next.js frontend with Supabase backend. Features: concept SKU planning with SkuCard components, photoreal product renders via OpenAI `gpt-image-1` (quality:medium, transparent background, PNG), "Render all concepts" batch action with queue counter, concept shelf persisted to Vercel Blob as a shared `concepts.json` manifest [from: [[2026-06-11 dr-max-s enable-dangerously-accepted-permissions]], [[2026-06-11 dr-max-s move-render-cache-from-localstorage-to-vercel-blob]]]. Nine seeded concept SKUs received photoreal renders, confirmed in production in a clean browser context [from: [[2026-06-11 dr-max-s enable-dangerously-accepted-permissions]]].

## Key decisions

- [[2026-06-11 dr-maxs blob-over-localstorage-for-shared-render-cache]] — Vercel Blob with shared manifest for cross-browser render and concept persistence

## Gaps

- Erin's current use of the tool and whether it informed the roadmap decision
- Full SKU list and brand strategy details
- Whether the app is used beyond this planning engagement
- Andrew's ongoing relationship with Dr. Max's as a client
