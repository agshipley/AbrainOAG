---
type: decision
status: full
confidence: high
created: 2026-05-29
updated: 2026-05-30
source: "[[2026-05-29 wheelhouse sync-virtual-and-local-github-repositories]], [[2026-05-30 wheelhouse investigate-automatic-update-limitations]]"
tags: []
---

# Move Wheelhouse find-listings agent loop from browser to Supabase Edge Function with SSE

**Decision:** The `findListings` agent loop was moved from the browser to a Supabase Edge Function (`/functions/v1/find-listings`). The browser now POSTs to the function and reads an SSE stream; listings arrive one at a time as Claude finds them. The Anthropic API key became a Supabase server secret, removed from the Vite bundle.

**Rationale:** Railway was closing the HTTP connection mid-search (~30–60 seconds into a long Anthropic API call), causing React to unmount everything and leave a blank page. Keeping the agent loop in the browser also exposed the Anthropic key in the client bundle. A separate bug — `setOpps` not supporting functional updates — caused the SSE listener's `setOpps(prev => [listing, ...prev])` to store the callback as the opps array, crashing `.map()` on the next render; this was fixed as part of the same migration.

**Alternative considered:** Keep the agent loop in the browser and the Anthropic key in the Vite bundle (the pre-existing approach).

**Trade-off:** Adds a Supabase Edge Function dependency and a 2-minute server-side wall-clock limit (set to 115 seconds self-imposed to allow a clean `done` event before Supabase cuts the connection). Deployment requires the Supabase CLI; the Edge Function must be redeployed separately from the frontend on code changes.
