---
type: decision
status: full
confidence: high
created: 2026-05-27
updated: 2026-05-27
source: "[[2026-05-27 orpheus review-codebase-for-seven-agent-factory-architectu]]"
tags: []
---

# Orpheus: accept archimedes.config.yaml tracked in git as benign; flag forward-looking risk only

**Decision:** `archimedes.config.yaml` was left committed to the Orpheus git repository. The current exposure (name, contact info, work history, publications) was accepted as non-sensitive because the data mirrors what is already publicly available on LinkedIn. The file header saying "GITIGNORED" was corrected to accurately document the real risk: any future field containing non-public information (target companies, salary expectations, private positioning) would be committed by default, requiring a deliberate decision to gitignore at that time.

**Rationale:** "current contents mirror what is already on LinkedIn, so this is not a sensitive exposure." Gitignoring and scrubbing the file from history would require a force-push on a potentially public repo and additional coordination overhead, with no immediate security benefit given the current contents. The more durable fix was accurate documentation of the forward-looking risk.

**Alternative considered:** Add `archimedes.config.yaml` to `.gitignore` immediately and remove it from git history, eliminating any future risk of accidentally committing private profile data.

**Trade-off:** The forward-looking risk remains: if the config file gains private fields (salary floor, target company list, interview status), those fields will be committed to git by default until someone explicitly extends the gitignore. ORPHEUS_STATE.md was updated to document this trigger explicitly so future contributors know what to watch for.
