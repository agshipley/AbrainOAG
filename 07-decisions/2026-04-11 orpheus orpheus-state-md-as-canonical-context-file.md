---
type: decision
status: full
confidence: high
created: 2026-04-11
updated: 2026-04-11
source: "[[2026-04-11 job-search-engine-with-mcp-architecture-and-parallel-agents]]"
tags: []
---

# Commit ORPHEUS_STATE.md to the repo root as the canonical context file for all sessions

**Decision:** A comprehensive `ORPHEUS_STATE.md` was committed to the Orpheus repo root and referenced from `CLAUDE.md`, so every Claude Code session and every Claude.ai project conversation loads the same project state automatically without requiring manual context restoration.

**Rationale:** The prior multi-hour build session had produced a three-identity ranking architecture, a six-phase build plan, portfolio positioning, and numerous architectural decisions — none of which were accessible in a new conversation. Andrew described this as a "mind-breaking flaw": conversations within the same project could not preserve context. The solution was dual-channel: ORPHEUS_STATE.md committed to git (so Claude Code reads it on startup), and added to the claude.ai project knowledge sidebar (so chat conversations load it automatically). A saved transcript file at `/mnt/transcripts/…-orpheus-full-state-anchor.txt` was used to reconstruct the full state for the initial commit.

**Alternative considered:** Rely on Claude's conversation history and memory features within each session to reconstruct context as needed.

**Trade-off:** ORPHEUS_STATE.md must be kept up to date manually or via convention — a stale file produces worse context than no file. A pre-commit hook warning on governance-sensitive changes was added to help, but the update burden remains.
