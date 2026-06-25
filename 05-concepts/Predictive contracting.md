---
type: concept
subtype: ""
status: moderate
confidence: high
created: 2026-06-22
updated: 2026-06-24
source: "[[GBRAIN_PROJECT]] §7"
aliases: []
tags: []
---

The thesis that empirical analysis of negotiated M&A deal terms can reveal negotiability patterns and predict post-transaction acquirer outcomes.

## Definition

[[Predictive contracting]] originated with [[Spencer Williams]]'s 2019 paper arguing that contract terms in M&A transactions are not merely legal language but empirical data encoding the relative negotiating power and information asymmetries between parties. The framework predicts that high termination fee percentages — a proxy for acquirer leverage — correlate with worse acquirer post-closing returns [from: [[2026-05-07 mrkt-project-context-and-research]]].

## Relationship to mrkt

[[mrkt]] provides an empirical prototype for the predictive contracting thesis: an LLM-based extraction pipeline over the MAUD corpus produces the deal-term dataset, and OLS regression tests whether fee structure predicts acquirer abnormal returns [from: [[2026-04-25 portfolio-strategy-and-job-search-direction]]]. Study 1 headline finding: fee percentage coefficient −2.52, t=−2.22, −27pp spread at 365 days [from: [[2026-03-25 moneyball-for-transactional-law]]].

## Product application

The commercial vision extends the framework to a practitioner tool: upload an LOI and redlined SPA, extract deal terms, surface negotiability priors from historical data — giving counterparties without institutional deal-data the same term-pricing intelligence as large law firms [from: [[2026-04-25 portfolio-strategy-and-job-search-direction]]].

## Gaps

Evidence is corroborated across 5 sessions spanning March–June 2026, giving this concept a stronger foundation than most in this vault. The following remain undocumented:

- The 2019 Spencer Williams paper itself: title, journal, full argument, and the specific empirical claims Andrew is building on
- Whether the predictive contracting framework has been cited or adopted beyond Williams's own work
- The theoretical mechanism linking fee percentage to acquirer leverage — the corpus states the correlation but does not trace the causal logic
- How the entertainment industry application (the [[mrkt]]/Graham Ballou intersection discussed in May 2026) extends or modifies the framework from M&A to talent deal structures
