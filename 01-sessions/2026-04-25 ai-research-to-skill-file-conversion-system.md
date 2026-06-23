---
type: session
source: claude-export
uuid: dd33d13c-e981-4e44-8bae-fe958ce4b473
title: "AI research to skill file conversion system"
created: 2026-04-25
updated: 2026-04-25
message_count: 2
status: stub
confidence: high
tags: []
---

# AI research to skill file conversion system

## Summary

**Conversation Overview**

The person initiated a technical project discussion about building a pipeline that translates deep research conducted through an AI interface into reusable skill files that can be added to users' projects or stored in root memory. The core challenge Claude identified is that research documents are descriptive in nature while skill files must be operational, requiring meaningful structural transformation rather than simple packaging.

Claude reviewed the canonical skill-creator SKILL.md format and searched prior project context before outlining the four key translation challenges: extracting durable knowledge from findings, inferring triggering conditions not present in source material, restructuring content for progressive disclosure within file size constraints, and packaging to the appropriate scope. Claude proposed a multi-stage pipeline architecture: ingest the research document, run an analysis pass to identify the operational core and propose triggers, draft the SKILL.md with references bundled separately, present a confirmation step for user review, then emit the final artifact.

The conversation ended with Claude posing three clarifying questions to determine architecture direction: the target output format (`.skill` package, `CLAUDE.md` memory file, or both), the form the system itself should take (meta-skill, CLI tool, web app, or prompt template), and the desired level of automation (one-shot, collaborative with back-and-forth, or hybrid auto-draft with a single review step). The person had not yet responded to these questions by the end of the conversation.

## Transcript

**human**

I'd like to build a system that translates deep research conducted through an AI interface into skill files that can be added to users' projects or root memory

**assistant**

The user wants to build a pipeline that takes deep research output from an AI interface and converts it into skill files that can be integrated into their projects or stored in root memory. I should think about whether checking past conversations would provide useful context, though the core request is about creating a system to transform research findings into reusable skill artifacts.

Let me look at the skill-creator example to understand the skill format, then search the project history to see if there's relevant prior work. This will help me propose a solid architecture for either a workflow, automated tool, or skill that facilitates this research-to-skill conversion process.This is a great project idea—essentially a "research-to-skill" pipeline. Before I propose architecture, let me check whether you've discussed this in this project before and pull in the canonical skill-authoring guidance so I'm not guessing at format.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

 Now I'm understanding the actual scope of what's needed — the system should take deep research reports from Claude's Research feature and convert them into structured skill files that can be installed into projects or stored in root memory. Let me map out the core requirements: the input would be these long-form synthesized research documents with citations, and I need to figure out how to extract and transform that into the skill format I just reviewed.

The real challenge here is that research reports are fundamentally analytical — they present findings and conclusions — while skills need to be operational and actionable. So this isn't just about summarizing or condensing; I need to identify what knowledge is actually reusable, figure out when and how it should be triggered, and restructure everything as practical guidance rather than research conclusions. I also need to decide how to handle citations, what goes into the metadata versus the body, and whether this should be scoped to a specific project or stored more broadly in root memory.

I'm leaning toward either a meta-skill that handles the translation automatically when the user asks for it, or a combination approach where the skill orchestrates the transformation and possibly bundles supporting resources. Before I commit to a direction, I need to understand a few key things: where the research is actually coming from, whether it's specifically Claude's Research feature or any document, and what the user's workflow looks like.

I'm also realizing there's some ambiguity around what "skill" means here — whether we're targeting Anthropic's actual .skill format or something like CLAUDE.md memory files. And I should clarify whether this needs human review before packaging, what domain the research covers, and whether we're handling one document at a time or batching multiple research artifacts into skills.

The user seems technically savvy based on their language, so I think the best approach is to acknowledge the interesting parts of this problem, sketch what I think they're after, and ask a few focused questions to nail down the specifics before diving in.

I'm seeing some real design tensions here: research is fundamentally descriptive while skills need to be actionable, the triggering conditions aren't spelled out in the paper, there's a compression challenge since research can be lengthy but skill files should stay concise, and I'm not sure whether to preserve citations or strip them out. These decisions will shape how I approach the translation.

I should probably ask the user some clarifying questions since they've given me a high-level goal but not detailed constraints. The most critical one is whether we're building a `.skill` package or a `CLAUDE.md` memory file—that fundamentally changes the structure.

Beyond that, I need to understand how automated this should be: are we creating something that works with one click, or should it involve back-and-forth with the user to refine the skill? And what's the input—are we pulling from Claude Research specifically, or handling arbitrary research documents?

I'll lay out my thinking about the core challenge first: research reports describe findings, but skills need to be action-oriented. That's the real translation work here.

The system would need to extract what actually matters from the research, figure out when to apply it, condense it into a readable format while keeping detailed references separate, and then install it properly. I'm picturing an ingest-analyze-draft-confirm pipeline that takes the research document, identifies the operational core and triggering conditions, generates the skill file with frontmatter, and surfaces it for review.

Now I'm working through the key decisions: whether to output a `.skill` package for Claude.ai, a memory format for Claude Code, or both; where this tool should live—as a meta-skill in chat, a CLI, a web interface, or just a prompt template; and how much back-and-forth it should require versus a single pass from research to output.

I think asking about the format really matters since `.skill` and `CLAUDE.md` are fundamentally different, so I should use the elicitation approach rather than just proposing defaults and waiting for pushback. Let me tighten these three questions into something concrete.

Actually, I can probably get away with just two core questions: the output format and the system form. The third question about scope can likely be inferred from how they answer those. So I'm settling on Q1 about format (single-select between `.skill` package, `CLAUDE.md`, or both) and Q2 about the system type (single-select between meta-skill, CLI, or web app).

The user mentioned "root memory" which suggests they're thinking about Claude's memory system — either the `~/.claude/CLAUDE.md` file in Claude Code or the project-scoped memory in Claude.ai. That distinction matters for how I frame the questions.

For the response itself, I should keep this conversational since they're asking for my thinking, not a formal document. A few substantive paragraphs followed by the questions should work. The four challenges I identified have parallel structure, so a numbered list makes sense there. I'll avoid unnecessary bullet points elsewhere and let the prose flow naturally.There's a real translation problem here, not just a packaging problem. Research reports are *descriptive* — "here's what we found, with citations" — while skills are *operational* — "when X happens, do Y." So the system has to do four things that aren't trivial:

1. **Extract durable knowledge** from findings, filtering out dated speculation, one-off conclusions, and citation scaffolding that doesn't help future-Claude do anything
2. **Infer triggering conditions** that usually aren't anywhere in the source — research doesn't say "and you should consult this whenever a user mentions X"
3. **Restructure for progressive disclosure** — the operational gist needs to fit in a sub-500-line SKILL.md, with bulkier material pushed to a `references/` folder that's only loaded when relevant
4. **Package to the right scope** — `.skill` archive for project install vs. user-wide install, with sensible defaults about which fits

The skeleton I'd sketch is: ingest the research doc → an analysis pass that identifies the operational core, proposes a trigger description, and decides what's body-worthy vs. reference-worthy → draft the SKILL.md and bundle references → a confirmation step where the user can edit triggers and scope before packaging → emit a `.skill` file or write directly to the target memory path.

Before I go deeper, two forks change the architecture meaningfully:
```
This block is not supported on your current device yet.
```

Pick whatever feels right and I'll sketch the architecture concretely from there — including a draft of the meta-skill itself if that's the route, or a CLI design if that's the direction.
