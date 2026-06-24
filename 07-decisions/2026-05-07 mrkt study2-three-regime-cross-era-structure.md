---
type: decision
status: full
confidence: high
created: 2026-05-07
updated: 2026-05-07
source: "[[2026-05-07 mrkt-project-context-and-research]]"
tags: []
---

# mrkt Study 2: three-regime cross-era structure (pre-COVID / COVID / post-COVID)

**Decision:** Study 2 is structured as a three-regime cross-era comparison: pre-COVID 2016–2019, COVID 2020–Q1 2021 (the existing baseline corpus), and post-COVID 2022–H1 2023. Target corpus approximately 450 agreements.

**Rationale:** The three windows align to the ABA Public Target Deal Points Study releases (four releases from 2017–2024), enabling direct comparison with an established benchmarking series rather than constructing an isolated dataset. The three-regime structure directly addresses Study 1's primary external validity limitation: a COVID-era sampling bias that constrains generalizability. Separating pre-COVID, COVID, and post-COVID periods also allows the year-effect variable (which proved the dominant predictor in Study 1 multivariate OLS) to be modeled structurally across market cycles rather than as a residual control.

**Alternative considered:** A single-era structure extending the existing 2020–2021 baseline, or a two-era (pre/post-COVID) design without the COVID regime as a distinct period.

**Trade-off:** Three regimes require approximately 450 agreements vs. the existing 152-agreement baseline, increasing extraction API budget to approximately $500 and extending the data-collection timeline. Hierarchical partial-pooling models are needed for segment-level inference given the effective-N problem — segment predictions require more observations than simple OLS.
