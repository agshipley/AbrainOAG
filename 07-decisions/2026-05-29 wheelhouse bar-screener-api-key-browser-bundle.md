---
type: decision
status: full
confidence: high
created: 2026-05-29
updated: 2026-05-29
source: "[[2026-05-29 andrewshipley review-bar-screener-code]]"
tags: []
---

# Wheelhouse: accept Anthropic API key in browser bundle via VITE_ prefix for private-tool deployment

**Decision:** The Wheelhouse bar screener was deployed to Railway with the Anthropic API key exposed in the Vite client bundle via `VITE_ANTHROPIC_API_KEY` and `dangerouslyAllowBrowser: true`. The risk was explicitly acknowledged and accepted for the private-tool use case.

**Rationale:** "Fine for a private tool you're the only user of, but worth keeping in mind if you ever make the URL public." A backend proxy would require a separate server component, adding deployment complexity to what was designed as a static React app served by Vite on Railway. The `VITE_` prefix bakes the key into the compiled JS bundle at build time; anyone who inspects the bundle can extract it. For a private tool with a single user, key rotation is the available mitigation if the URL is shared.

**Alternative considered:** Build a thin backend proxy (e.g., a server-side function or a separate Express endpoint) that holds the API key and forwards requests to Anthropic, keeping the key out of the browser entirely.

**Trade-off:** The key is visible to anyone who inspects the page source. The app must not be shared publicly without either implementing the proxy or rotating and restricting the key. Railway environment variables (set in the dashboard) correctly scope the key to the build environment; it is not committed to the repository.
