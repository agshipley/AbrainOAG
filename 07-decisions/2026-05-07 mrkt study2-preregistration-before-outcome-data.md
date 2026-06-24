---
type: decision
status: full
confidence: high
created: 2026-05-07
updated: 2026-05-07
source: "[[2026-05-07 mrkt-project-context-and-research]]"
tags: []
---

# mrkt Study 2: pre-register hypotheses on AsPredicted or OSF before pulling outcome data

**Decision:** Study 2 hypotheses are pre-registered on AsPredicted or OSF before WRDS outcome data is pulled.

**Rationale:** The mrkt pipeline extracts predictor variables (deal terms) from EDGAR filings, which are publicly available and must be collected before outcome data. Pre-registration locks the hypothesis set and analysis plan after predictors are collected but before outcomes are visible, preventing specification searching. This is the standard research integrity gate when the researcher has the ability to see predictor distributions before committing to a model. The mrkt study has a unique temptation: the predictor data informs which deal structures to test, and post-hoc hypothesis selection would make the 5% significance threshold meaningless.

**Alternative considered:** No pre-registration — specify the analysis plan in the working paper as a methods section without a timestamped commitment.

**Trade-off:** Pre-registration constrains the final analysis to the pre-specified hypotheses. Exploratory findings discovered after seeing outcome data must be labeled as exploratory and are held to a different evidentiary standard. This reduces false-positive risk but adds process friction and requires the hypothesis set to be well-formed before the most informative data is available.
