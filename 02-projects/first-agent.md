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

Production lead-generation and multi-city art-commissioning intelligence system built for [[Tre Borden]], covering LA, NYC, and SF.

## Purpose

[[first-agent]] surfaces business development leads for [[Tre Borden]]/Co (TBC), an LA creative studio curating and commissioning art for corporate and public spaces [from: [[2026-03-13 flask-app-killed-by-railway-after-gunicorn-starts]]]. The project pivoted in May 2026 from permit-data lead prospecting to a relationship intelligence graph after permit data was found to arrive too late in the project lifecycle [from: [[2026-05-11 redirecting-project-strategy-after-permitting-dead-end]]].

## Stack

Python/Flask agentic pipeline with Claude API integration, structured output validation via Pydantic, Railway deployment [from: [[2026-03-13 flask-app-killed-by-railway-after-gunicorn-starts]], [[2026-05-11 redirecting-project-strategy-after-permitting-dead-end]]]. Two routes: `/run` and `/deep-dive` [from: [[2026-05-29 first-agent add-error-message-for-token-limit-exceeded]]]. 275-test suite [from: [[GBRAIN_PROJECT]]].

## Key decisions

- [[2026-05-11 first-agent pivot-from-permit-prospecting-to-relationship-graph]] — pivot to relationship intelligence graph after permit-data dead-end

## History

Initial build (March 2026) targeted corporate and public sector market segments in LA, using an agentic pipeline to find, evaluate, and score potential business development leads, with results saved to Excel [from: [[2026-03-13 lead-generation-agent-with-deduplication-and-icp-scoring]]]. Tre Borden cancelled a scheduled call in April 2026 stating the project had demonstrated the limitations of LLM technology; Claude was held accountable for failing to produce actionable leads [from: [[2026-04-09 claude-s-managed-agents-api]]]. The May 2026 session pivoted the architecture toward a relationship intelligence graph: a living model of people, firms, projects, and organizations in LA's creative and AEC ecosystem, with Supabase as the planned database layer [from: [[2026-05-11 redirecting-project-strategy-after-permitting-dead-end]]].

## Gaps

- Architecture of the current (post-pivot) relationship graph implementation — whether it was built and to what extent
- Current deployment URL and live status
- Scope of the 275-test suite: which components are covered
- Whether Tre Borden is still an active client post the April 2026 breakdown
- Multi-city (LA/NYC/SF) scope: whether NYC and SF are implemented or planned
