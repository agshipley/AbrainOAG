---
type: decision
status: full
confidence: high
created: 2026-05-30
updated: 2026-05-30
source: "[[2026-05-30 wheelhouse investigate-automatic-update-limitations]]"
tags: []
---

# Accept Find Listings structural limitation; stop prompt/architecture fixes; document it accurately

**Decision:** The team stopped investing in improvements to Find Listings and documented its fundamental constraint in the README. Wheelhouse was repositioned as a screener that users bring listings to, with the URL generator (Option 2) deferred to a future feature. The prior effort to improve Find Listings via prompt changes, scaled search budgets, and two-step extraction was explicitly declared a dead end.

**Rationale:** Claude's `web_search` tool reads a search index (Google), which lags live listing sites by days or weeks. When a listing goes inactive, the listing site removes it immediately but Google's index retains it until the next crawl. Prompt changes, agent architecture, and model choice cannot fix this — it is a property of how web search indexing works. As stated in the transcript: "There is no technical path to automated live listing discovery without either (a) a direct API or data agreement with the listing sites, or (b) a real-time scraper, both of which are out of scope for this project." Additionally, BizBen intentionally withholds asking prices from search snippets, so Claude was extracting from incomplete data even for active listings.

**Alternative considered:** Continue investing in Find Listings improvements (the approach taken in prior sessions: prompt refinement, `max_uses` scaling, "skip inactive listings" instruction, two-step search-then-extract).

**Trade-off:** No automated discovery. The recommended path (Option 2: generate a pre-filtered BizBen/BizBuySell search URL and open it in a new tab) shifts discovery work to the user and was deferred rather than built in this session. The URL generator replacement remained open as a future feature.
