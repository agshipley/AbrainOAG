---
type: decision
status: full
confidence: high
created: 2026-05-27
updated: 2026-05-27
source: "[[2026-05-27 build-project-planning]]"
tags: []
---

# Orpheus: Feature Factory chain requires explicit invocation; never auto-triggers on feature requests

**Decision:** The Feature Factory seven-agent chain (researcher → story-writer → spec-writer → backend-builder → frontend-builder → test-verifier → validator) requires an explicit trigger phrase — one of: "run the factory," "build with the chain," "run the chain," "use the feature factory," "use the chain." A bare feature request ("build X," "add Y," "implement Z," "fix W") defaults to direct edits by Claude, regardless of how large the change sounds.

**Rationale:** During the first live factory run on the location filter (a one-line code change), the full seven-agent chain was invoked, burning most of a session's token budget on ceremony for a trivial fix. "The chain is expensive. Each of the seven agents re-reads ORPHEUS_STATE.md and CLAUDE.md from scratch and adds classifier overhead per action, so an unnecessary run can consume a full session." The default was changed to cheap-by-design; the expensive path requires deliberate choice.

**Alternative considered:** The original default: the chain auto-triggers on any feature request, with the skill description describing the agents' roles as sufficient guidance for when to invoke.

**Trade-off:** Andrew must remember to say a specific invocation phrase when he wants the full chain, and must know when a task is large enough to warrant it. The session added a fallback convention: if a task looks like a chain candidate but no phrase was used, Claude should ask — "run the factory, or direct?" — before starting either approach.
