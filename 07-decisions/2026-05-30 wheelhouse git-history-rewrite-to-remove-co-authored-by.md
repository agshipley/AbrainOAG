---
type: decision
status: full
confidence: high
created: 2026-05-30
updated: 2026-05-30
source: "[[2026-05-30 wheelhouse add-crosstab-sorting-functionality]]"
tags: []
---

# Wheelhouse: rewrite all 18 git commits to remove Co-Authored-By: Claude trailers; force-push public repo

**Decision:** All 18 Wheelhouse git commits were rewritten using `git filter-branch` to strip `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` trailers from every commit message, then force-pushed to the public repository on GitHub. Claude does not appear in the Wheelhouse contributor list.

**Rationale:** Claude appeared in the GitHub contributors list because GitHub parses `Co-Authored-By` trailers to surface contributors. This had not happened in prior projects and was unwanted. The rewrite was approved by Andrew explicitly ("proceed") before the force-push; the repo is his sole contributor, so the blast radius of changing public history was contained.

**Alternative considered:** Leave the trailers in place, accepting Claude as a listed GitHub contributor.

**Trade-off:** Force-pushing rewrites the public history of the repository; anyone who had cloned it would need to re-clone. Claude will not add `Co-Authored-By` trailers to future Wheelhouse commits. A memory was saved to ensure this preference persists across sessions.
