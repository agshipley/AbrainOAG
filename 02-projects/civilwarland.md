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

Browser-based park management simulation game based on George Saunders's short story "CivilWarLand in Bad Decline."

## Purpose

[[civilwarland]] is a narrative game in which the player manages a struggling historical theme park. The "Saunders principle" governs the difficulty design: decline should be the default state of the park, with the player working to manage rather than overcome that trajectory [from: [[2026-04-01 streamlining-the-initial-30-day-phase]]]. Built by Andrew as a non-engineer learning game development through practice [from: [[2026-03-23 park-characters-and-architecture-analysis]]].

## Technical details

Single `index.html` file, canvas-based rendering, JavaScript. Deployed via Vercel from GitHub repo `agshipley/CW_Actual` [from: [[2026-03-23 park-characters-and-architecture-analysis]]]. Building entry and interiors implemented via `enterBuilding()` / `renderInterior()` [from: [[2026-05-26 civilwarland fix-glitches-when-entering-buildings]]]. Phase 1 covers days 1–30; Phase 2 begins on day 31 and changes available player actions [from: [[2026-05-26 civilwarland fix-glitches-when-entering-buildings]]].

## Development history

Playtesting by Andrew's partner Liz and a technical friend, Tim Potter, drove gameplay balance changes [from: [[2026-03-23 park-characters-and-architecture-analysis]]]. Day-one difficulty was adjusted to reduce excessive stat decay in Phase 1 while preserving decline as the default [from: [[2026-04-01 streamlining-the-initial-30-day-phase]]]. Source B session (May 2026) fixed building-entry glitches from canvas context leakage and `applyMidnight()` firing during interior rendering; also gated Phase 2 to restrict Phase 1 actions and fixed a build-menu overlay blocking canvas clicks in Phase 2 at `mapScale=0.5` [from: [[2026-05-26 civilwarland fix-glitches-when-entering-buildings]]].

## Gaps

- Current game completion status (is there an ending?)
- Full list of buildings, characters, and story events
- Whether Phase 2 gameplay was completed and balanced
- Any public URL or deployment status beyond Vercel
