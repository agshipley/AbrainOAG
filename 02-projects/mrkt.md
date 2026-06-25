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

Empirical pipeline modeling M&A deal-term negotiability, testing whether negotiated deal terms predict acquirer post-transaction outcomes.

## Thesis

[[mrkt]] applies LLM-based extraction of M&A contract terms to the MAUD corpus to test [[Spencer Williams]]'s [[Predictive contracting]] framework: the hypothesis that negotiated deal terms (specifically fee structures) predict acquirer abnormal returns [from: [[2026-05-07 mrkt-project-context-and-research]]]. Headline Study 1 OLS finding: fee percentage coefficient −2.52, t=−2.22 at 5% significance; −27 percentage point spread in acquirer abnormal returns at 365 days for high-fee vs. low-fee deals [from: [[2026-03-25 moneyball-for-transactional-law]]].

## Corpus and pipeline

Study 1 corpus: 152 MAUD agreements, 2020–2021 (COVID era). Extraction accuracy: 99.7%; expert-label agreement: 91–94% [from: [[GBRAIN_PROJECT]]]. Pipeline: stdlib-only Python, Anthropic Message Batches API with prompt caching for extraction [from: [[2026-05-07 mrkt-project-context-and-research]]]. GitHub: private repo at `github.com/agshipley/mrkt` [from: [[2026-03-25 moneyball-for-transactional-law]]]. Data files are gitignored [from: [[2026-03-25 moneyball-for-transactional-law]]].

## Study 2 design (planned)

Three-regime cross-era structure: pre-COVID 2016–2019, COVID 2020–Q1 2021 (existing baseline), post-COVID 2022–H1 2023. Target corpus: ~450 agreements aligned to ABA Public Target Deal Points Study windows [from: [[2026-05-07 mrkt-project-context-and-research]]]. WRDS (via [[Spencer Williams]]'s academic access) for outcome variables; EDGAR + mrkt extraction for predictor variables [from: [[2026-05-07 mrkt-project-context-and-research]]]. Pre-registration on AsPredicted or OSF required before pulling WRDS outcome data [from: [[2026-05-07 mrkt-project-context-and-research]]]. Estimated API budget: ~$500 [from: [[2026-05-07 mrkt-project-context-and-research]]].

## Product thesis

A tool that takes an uploaded LOI and redlined SPA, extracts deal terms, and surfaces empirical preference weights and negotiability priors from real deal data — giving the side of the table without institutional memory the same term-pricing intelligence that large law firms with proprietary data possess [from: [[2026-04-25 portfolio-strategy-and-job-search-direction]]].

## Key decisions

- [[2026-05-07 mrkt study2-three-regime-cross-era-structure]]
- [[2026-05-07 mrkt study2-preregistration-before-outcome-data]]

## Collaboration

Open thread with [[Spencer Williams]] (Professor of Law, California Western; "Predictive Contracting" author) as anticipated co-author and WRDS access point [from: [[2026-05-07 mrkt-project-context-and-research]]].

## Gaps

- Study 2 execution status: whether data collection has begun
- WRDS access arrangement with [[Spencer Williams]]
- Commercial product development timeline and priorities
- Study 1 publication status (working paper vs. journal submission)
- GitHub repo structure and test coverage
