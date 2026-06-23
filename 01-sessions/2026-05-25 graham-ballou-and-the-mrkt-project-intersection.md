---
type: session
source: claude-export
uuid: dd5f786f-2b6f-40be-8dbc-48126ccf3237
title: "Graham Ballou and the mrkt project intersection"
created: 2026-05-25
updated: 2026-05-25
message_count: 2
status: stub
confidence: high
tags: []
---

# Graham Ballou and the mrkt project intersection

## Summary

**Conversation Overview**

The person is planning a family meeting with their brother-in-law, Graham Ballou, a Partner at entertainment law boutique Johnson Shapiro Slewett & Kole (JSSK). They asked Claude to research Graham's background and then analyze how his entertainment industry work might intersect with the person's ongoing "Mrkt project." The conversation suggests the person has a legal background and is building an empirical data product focused on negotiated contract terms in M&A transactions.

Claude researched Graham's profile, finding he followed a trajectory from big law corporate/M&A work (Proskauer Rose) through entertainment law at Katten Muchin Rosenman, then nine years at Hulu rising to VP of Business Affairs for Originals, before joining JSSK as a Partner representing talent, writers, directors, producers, and production companies. JSSK is notable for pioneering diversity and inclusivity riders in production agreements. Claude drew parallels between Graham's career arc and the person's own trajectory.

The substantive analysis focused on two dimensions: how streamer-talent deal structures mirror the M&A information asymmetry that Mrkt addresses (one institutionally-advantaged party versus many counterparties with limited benchmarking data), and how the LLM-based extraction methodology underlying Mrkt would port to entertainment agreements, though the private corpus challenge would require firm-level data partnerships rather than public document sources. Claude advised the person to approach the meeting casually as family rather than as a pitch opportunity, offering three natural talking points if the topic of Mrkt arose organically. The person's Mrkt project involves schema design, model-tiered extraction pipelines (referencing Haiku and Sonnet), and cross-extraction consistency validation against datasets like MAUD.

## Transcript

**human**

so I'm going to meet up with my brother in law, Graham Ballou (https://heartofla.org/team/graham-ballou/). Do a search on graham to get up to speed. Then let's consider how his work in entertainment might intersect with the mrkt project (in form and/or substance)

**assistant**

I need to look up Graham Ballou at heartofla.org and understand what his entertainment background might contribute to the Mrkt project. Let me start by searching for information about him and the organization.
```
This block is not supported on your current device yet.
```

 I'm digging into Graham Ballou's background more thoroughly—he's currently at JSSK, previously held a senior business affairs role at Hulu, spent time in the entertainment practice at Katten Muchin Rosenman, and started his career doing M&A and PE work at Proskauer Rose. Let me pull up his JSSK profile and see what deals or press coverage might give me more insight into his current work.
```
This block is not supported on your current device yet.
```

 I've got a good sense of Graham's background now. Let me dig into what he's actually said about deals or his perspective on the business side, especially given his experience in business affairs at Hulu and his current work representing talent—that's probably the most useful lens for understanding how Mrkt could fit into his world.
```
This block is not supported on your current device yet.
```

 I'm getting a clearer sense of Graham's background now. He's a partner and entertainment attorney at JSSK, a boutique firm founded in 2022 by four prominent lawyers who came from Ziffren Brittenham and Gang Tyre, and he spent nine years at Hulu working his way up to VP in business affairs before making this move.

His career trajectory is striking—he started in M&A and private equity at Proskauer Rose in New York, transitioned into entertainment law at Katten Muchin Rosenman representing networks and studios, then moved in-house at Hulu where he handled major production deals at scale. Now he's back in private practice representing talent and production companies, and JSSK itself has a strong social impact focus, having helped develop diversity and inclusivity riders for production agreements. He's also on the board of Heart of LA, a nonprofit serving youth in the city.

What's interesting is how his profile mirrors certain aspects of Andrew's trajectory—both moved from top-tier corporate law into entertainment, spent time in-house at a major company, and are now in values-driven boutique settings. Graham has experience on both sides of the deal-making equation, from negotiating major production agreements at Hulu to now representing talent, which creates a substantive overlap with what Mrkt is trying to accomplish.

Entertainment contracts are arguably even more opaque than public M&A deals—there's no EDGAR-equivalent disclosure, NDAs protect deal terms, and the information asymmetry is extreme since studios track everything while talent typically only knows their own deals. This opacity is precisely why MFN clauses are so common, and it's exactly the kind of structural problem that the diversity rider work JSSK pioneered was designed to address. This maps directly onto Andrew's thesis about using empirical data to redistribute power in transactional law.

Graham's 9 years of inside experience with streamer Originals deals gives him the kind of institutional knowledge Andrew can't access—what's actually negotiable, what shifted post-strike, where the real zero-sum points are. The key question is whether Graham thinks empirical priors on deal terms would actually help his talent clients, who lack the institutional memory that studios have, and what specific features such a tool would need to be useful to him.

The methodology might also apply to entertainment deals more broadly. JSSK as a firm with deep deal flow could have an anonymized corpus worth analyzing, which opens up the firm-level partnership path. Beyond that, Graham's connections to the Hollywood power-lawyer network make him a valuable early advisor if the product expands into M&A and entertainment verticals.

The diversity rider work is conceptually interesting too — it's a contractual lever for structural change, similar to what Mrkt could enable by giving underrepresented parties empirical negotiating power. But the real frame here is simpler: this is family, the conversation should stay casual, and Andrew shouldn't pitch anything. The goal is just to understand what Graham actually does well enough that if organic interest emerges, there's substance to discuss.

Now I'm drafting a concise summary of Graham's work and where it might naturally intersect with Mrkt — focusing on both the methodology and the subject matter angles, keeping it as direct prose rather than a formal breakdown, substantive but not exhaustive.## Graham at a glance

Graham Ballou is a Partner at Johnson Shapiro Slewett & Kole (JSSK), a boutique entertainment firm founded in 2022 by four top entertainment attorneys from Ziffren Brittenham and Gang Tyre, all perennial Hollywood Reporter Power Lawyers list honorees. The firm is positioned as "values-driven excellence and social impact," and was involved in crafting the diversity and inclusivity rider now considered a critical component of production agreements industry-wide.

Graham's arc is notable for how cleanly it parallels yours in structural terms:

- **Proskauer Rose NY**, corporate associate doing M&A and private equity (your Gunderson analog — same junior years on the deal side of big law)
- **Katten Muchin Rosenman**, entertainment practice representing networks, studios, and entertainment companies
- **Hulu**, nine years ending as VP, Business Affairs, Originals — a senior buy-side dealmaker at a major streamer through the streaming-wars build-out
- **JSSK** as Partner, now repping top writers, directors, producers, actors, and production companies — i.e., talent-side, the opposite side of the table he sat at for nine years

NYU Law. He sits on the Heart of LA board, which is consistent with the JSSK firm posture.

The one-line read: he is one of a small number of people in town who has been the senior dealmaker on both sides of the streamer-originals table, AND started his career on the transactional side that Mrkt is built around. That's a rare combination.

---

## Intersection with Mrkt — substance

The streamer–talent deal is structurally analogous to the M&A deal in the exact way Mrkt cares about: a negotiated, multi-clause contract where one side (the streamer) accumulates institutional memory across thousands of transactions and the other side (talent and their reps) sees a handful in their career. The asymmetry is the product. The terms with the highest financial impact — exclusivity windows, option periods, backend definitions, MFN scopes, performance metrics tied to bonus triggers, termination/holdback rights — are all variants of the same provision-archetypes Mrkt extracts in the M&A context.

A few specific structural overlaps worth holding in mind:

1. **The hidden-distribution problem is worse in entertainment than in M&A.** There's no EDGAR. Talent reps benchmark by personal network and partner gut. MFNs exist precisely because the distribution is invisible. The Spencer Williams "information inequality" thread from the project handoff applies here with more force than it does to public M&A.

2. **JSSK already operates as a structural-contract-intervention shop.** The diversity rider is a clean example — it's not litigation, it's a contractual mechanism that redistributes leverage. Empirical term-pricing is in the same family. Graham would recognize the shape of what you're building immediately.

3. **The post-2023-strike landscape changed deal terms in ways nobody outside has measured.** Streamer originals deals got materially worse for talent on residuals, exclusivity, and minimum guarantees. Anyone with empirical receipts on the magnitude and term-distribution of that shift owns a meaningful piece of industry knowledge. Graham would know exactly which terms moved and by how much, from inside the room on both sides.

## Intersection with Mrkt — form

The methodological question is whether the extraction pipeline ports. The honest answer is: the LLM extraction tooling ports cleanly, the corpus problem is much harder.

- **What ports:** The schema design discipline (nullable fields, enum + other, confidence + source), the MAUD-style validation approach, the Haiku-bulk/Sonnet-complex model selection, the cross-extraction consistency layer. None of that cares whether the document is a merger agreement or a talent deal.

- **What doesn't port:** The free public corpus. There is no MAUD for entertainment deals. There is no EDGAR. The data problem flips from "extract from public documents at scale" to "negotiate access to private deal libraries with confidentiality structure." This is precisely the "firm-level corpus partnership" path flagged in the context handoff as a corpus-expansion option for Mrkt — and JSSK is exactly the kind of firm where it could happen, if there were ever a reason.

## What to actually do with this

You're seeing him as family, not pitching him. The useful thing is probably to know enough about what he actually does that if the conversation naturally goes to your work, you can be intelligent about his. Three things worth being able to say without effort if it comes up:

- You're doing empirical work on whether negotiated contract terms predict deal outcomes, using public M&A agreements as the testbed because they're the only place the data is free.
- The thesis is informationally redistributive — closer to what JSSK did with the diversity rider, in spirit, than to what Harvey/Mike are doing on the workflow side.
- The streamer-originals deal is a more extreme version of the same asymmetry you're studying in M&A, and you're aware that the methodology would port to entertainment if a private-corpus partnership ever made sense. You don't need anything from him on it. It's just there.

The third one is the only place this could become more than a family lunch. Don't push it. If he picks it up, he picks it up.
