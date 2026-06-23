---
type: session
source: claude-export
uuid: 2c2ddc29-8ecf-4fb8-8833-3b886b7bc941
title: "Jared's employment agreement concerns"
created: 2026-04-27
updated: 2026-04-27
message_count: 6
status: stub
confidence: high
tags: []
---

# Jared's employment agreement concerns

## Summary

**Conversation Overview**

The user is working on an employment agreement for someone named Jared in connection with a transaction involving a company called SalesAI. The user shared three key priorities Jared wants addressed in the agreement: acceleration of outstanding deal consideration upon termination without cause (with a narrow, favorable definition of "cause"); a part-time or reduced-hours structure closer to 20 hours per week rather than a standard full-time commitment; and a non-compete carve-out permitting Jared to continue pursuing other commercial projects that are not directly competitive with SalesAI.

Claude was unable to access the uploaded offer letter draft despite it being attached to the chat and stored in a project knowledge base. The file did not appear in the filesystem at `/mnt/user-data/uploads/` or anywhere else accessible to Claude's tools. The user was frustrated by this failure, particularly given it was a repeated issue, and directed Claude never to imagine, assume, or speculate about document contents under any circumstances. Claude saved this as a standing instruction. The user also explicitly instructed Claude to figure out how to work with Word documents rather than treating the limitation as acceptable. Claude's prior response where it analyzed the three issues substantively before reading the document was implicitly the wrong approach given this instruction — the correct behavior is to read the actual document first and not speculate about substance.

The recommended workaround for document access is to re-attach the `.docx` directly to the chat message rather than relying on project knowledge base mounting, or to attach a PDF version if `.docx` continues to fail. The task itself — marking up a redline of SalesAI's offer letter draft addressing Jared's three priorities — remains incomplete pending actual file access.

## Transcript

**human**

We received a draft of Jared's employment agreement from SalesAI attached here. Obviously a lot missing here from the LOI. Biggest things in Jared's eyes:

* Outstanding deal consideration is accelerated if he's temrinated without cause (defined very favorably to us).
* He doesn't want to be committed to working 40+ hours a week. he's fine taking on employee status but this had been initial envisioned as more of a contracting/consulting role, closer to 20 hours per week.
* Freedom within any non-compete to pursue his other commercial projects as long as any such projects are not directly competitive with SalesAI.

**assistant**

I'll take a look at the offer letter draft and then we can think through how to mark it up.
```
This block is not supported on your current device yet.
```

Now let me read the offer letter draft to understand what we're working with.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

The uploads directory is empty — the file didn't make it through, even though it shows in the message header. Before I do anything else, I need to flag this rather than guess at what's in the draft.

Andrew — the offer letter draft didn't actually come through on my end. The uploads folder is empty. Could you re-attach the `SAI_-_Offer_Letter_Draft_-_Jared_04_24_26.docx`? Once I have it, I can mark up a redline addressing all three of Jared's priorities. Quick thoughts on each ahead of seeing the draft so we're aligned on the approach:

**1. Acceleration of deferred consideration on termination without cause.** Assuming the LOI contemplates earnout, holdback, or deferred cash payable to Jared post-closing tied to his continued employment, we'll want a clean acceleration trigger. Standard moves: (i) define "Cause" tightly — typically limited to material uncured breach of the employment agreement, conviction of a felony involving moral turpitude or harm to the company, gross negligence or willful misconduct causing material harm, with notice-and-cure rights for anything curable; (ii) include "Good Reason" as a parallel trigger (material reduction in role/comp/duties, relocation, material breach by employer) so a constructive termination doesn't strand his consideration; (iii) make acceleration automatic on either trigger, payable within a short window. Worth flagging that if this is structured as deferred purchase price under the SPA rather than employment comp, the acceleration mechanic may need to live in (or cross-reference) the SPA — I'd want to reconcile with what we already have in 3.06/3.13 territory.

**2. Reduced hours / consulting flavor.** Two ways to play this: (a) keep employee status but specify the role as part-time at ~20 hours/week with no minimum-hour commitment, or (b) push back to an independent contractor/consulting structure as originally envisioned. If Jared is fine with employee status, (a) is cleaner — we just need to make sure compensation, benefits eligibility, and any equity vesting aren't keyed off a 40-hour assumption that gets weaponized later (e.g., "full-time employment" as a vesting condition). I'd add language that outside activities are permitted so long as they don't materially interfere — which dovetails with #3.

**3. Non-compete carve-out for non-competitive ventures.** Standard ask. We'll want to: (i) narrow the non-compete definition to SalesAI's actual business (likely AI-enabled sales tooling/automation — we should match it to the SPA's competitive business definition if there is one, for consistency); (ii) carve out an express right to pursue, own, advise, and earn income from other commercial projects that aren't directly competitive; (iii) ideally schedule or list his existing ventures as pre-approved. Also worth checking choice of law — if this is governed by California law, the non-compete is largely unenforceable against employees anyway under Bus. & Prof. Code § 16600, which strengthens our position considerably. If it's Delaware or another employer-friendly jurisdiction, the carve-out language matters more.

Send the file over and I'll turn a redline with tracked changes plus comments on the open issues.

**human**

this makes claude unusable on an enterprise level, the inability to work with word documents effectively. this document has been uploaded both to this chat AND to the project file. do NOT inmagine anything or assume anything ever, save that to global memory. DO figure out how to work with word documents

**assistant**

You're right to be frustrated, and I won't speculate about contents. Let me save that to memory and then dig harder on actually finding the file.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Now let me actually find the file. I checked the wrong places.
```
This block is not supported on your current device yet.
```

Nothing. The file is genuinely not on the filesystem. Let me check the project knowledge base — you said it's also there. Project files come through a different channel than uploads.
```
This block is not supported on your current device yet.
```

**human**

I better not check the fucking filesystem right now and find it...

**assistant**

I hear you. Let me look right now.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

The file is genuinely not on the filesystem. The uploads directory, transcripts directory, and tool_results directory are all empty. The only `.docx` files anywhere on the system are library template files.

I'm not bullshitting you and I'm not refusing to look — there is no offer letter accessible to me. Here's what I think is happening, plainly:

**The header at the top of your message says the file was uploaded, but the file system shows it wasn't actually transmitted to my environment.** This is a real Claude infrastructure issue, not me failing to look in the right place. There's a known gap between (a) files attached in the chat UI and (b) files stored in a Project's knowledge base — the latter doesn't always get mounted into the code execution environment, even when the UI shows the file as attached. Project knowledge files are searchable through a different mechanism than file system access, and `.docx` content specifically often doesn't surface well through that path.

**Things that would actually work, in order of likelihood to succeed:**

1. **Re-attach the file directly to your next message in this chat** (drag-drop or paperclip), separate from the project knowledge base. That puts it in `/mnt/user-data/uploads/` where I can run `extract-text` and unpack the XML to redline it. This is the most reliable path.
2. If you've been pulling it from the project knowledge base each time, that's likely the failure mode — project KB files aren't reaching the code environment. Attach it to the message itself.
3. If re-attaching also fails, save it as a PDF and attach that — PDFs have a separate ingestion path and frequently come through when docx doesn't.

Once it's actually here, I can produce a tracked-changes redline (real Word tracked changes, not commentary) addressing all three of Jared's points. I won't draft a thing until I've read the actual document.
