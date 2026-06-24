---
type: session
source: claude-export
uuid: b98b4248-a569-4d94-9223-e03c3276e6bb
title: "Building a gbrain system with Claude Code"
created: 2026-06-23
updated: 2026-06-23
message_count: 2
status: stub
confidence: high
tags: []
---

# Building a gbrain system with Claude Code

## Decisions

- [[2026-06-23 gbrain pure-markdown-v1-defer-postgres-mcp]]

## Summary

**Conversation Overview**

Andrew is building a personal knowledge management system modeled on Garry Tan's open-source "gbrain" project, seeded primarily from his extensive Claude and Claude Code work history. He asked Claude to research gbrain's architecture and produce a comprehensive markdown instructions document for a separate Claude project that will lead this initiative. The critical requirement Andrew emphasized is getting all past Claude conversations and associated context into Obsidian as structured, linked markdown.

Claude researched gbrain, synthesized its core patterns (markdown-first storage, canonical entity taxonomy, typed knowledge graph via wikilinks, [[Brain-first retrieval]], tiered entity enrichment, and dream-cycle synthesis jobs), and produced a full project instructions document (`GBRAIN_PROJECT.md`) covering: the mission and phased architecture (pure-markdown v1 before any database/retrieval layer); vault folder structure with real paths; YAML frontmatter entity schema; typed edge vocabulary tuned to Andrew's builder/operator context rather than a VC context; a three-source import pipeline (Claude.ai data export, Claude Code local JSONL session logs, and this project's existing memory); a pre-seeded entity graph (five repos: [[Orpheus]], [[first-agent]], [[charlie]], [[mrkt]], [[NLSAFE]]; collaborators [[Tre Borden]], [[Liz Varner]], [[Spencer Williams]], [[John Jost]]; companies [[Trace Machina]], [[EeroQ]], [[AGS Law PLLC|AGS Law]], [[Audience Haus]]); and standing working rules inherited from Andrew's established preferences.

Andrew's working principles encoded throughout the document include: Claude Code prompts as the deliverable (not raw files); verify before delivering with dry-runs on single records before full imports; no Docker or unnecessary infrastructure; idempotent writes from the start; infra checklist on every feature; direct communication with no narration or padding; credential hygiene; and a specific voice discipline rule flagging the "not X, but Y" antithesis construction that Andrew's own Foil Check linter targets. The document explicitly notes that [[charlie]] (the multi-agent project for [[Liz Varner]]) must always be included, as it has been dropped from summaries previously. Five open decisions were surfaced for Andrew to resolve: sync engine choice, privacy scope for the import, script runtime (bun vs. node), whether to seed the new project with a context dump from this project, and whether to target plain Obsidian search or full gbrain retrieval from the start.

## Transcript

**human**

I'm creating a Gary Tan style gbrain setup based primarily on all of the work I've been doing with Claude Code. This project has the most comprehensive memory context for all of that work. I'd like you to briefly familarize yourself with Tan's gbrain, and then create an MD to input into memory and/or instructions for a separate claude project that will be spearheading this endevour. A critical component of this will be getting all of the chats we've had and associated context into Obsidian, so keep that in mind wrt the MD you write

**assistant**

I need to understand what Gary Tan's gbrain setup actually is before I can create a useful MD file for building something similar, so I should look that up first rather than making assumptions. Once I have that context, I can document the key components—especially how to integrate all the chats and context into Obsidian—in a way that another Claude project can use as a blueprint.
```
This block is not supported on your current device yet.
```

I'm getting a clearer picture of what gbrain does and how it works. Let me refocus on what Andrew actually needs—I should re-read his request to make sure I'm building exactly what he's asking for.

So the task is to create an instructions/system-prompt markdown for a separate Claude project that will build out a gbrain-style personal knowledge system for Andrew, seeded by all the Claude Code work he's done in this project. I need to capture what makes gbrain distinctive: it's markdown-first with no database lock-in, uses a canonical taxonomy of entity types like person, company, media, and tweet, creates a typed knowledge graph through wikilinks with relationships like works_at and founded, prioritizes querying the local brain before external APIs, and supports [[Tiered enrichment]] of entities.

The new project needs to account for Andrew's preferences—he's technical, runs [[Orpheus]] on Railway, works with Claude Code in local repos, values simplicity over flashy architecture, avoids Docker unless necessary, and generates Claude Code prompts to paste into his local repos. He's pursuing CoS/Director of Ops roles and has five tier-1 repos. The critical piece is getting all the chats and context into Obsidian, so the markdown needs to define the mission, the architecture (gbrain-inspired, Obsidian/markdown-first, git-backed), and adapt the entity taxonomy to Andrew's specific needs.

I also need to map out the import strategy—Claude.ai conversations can be exported via the settings' Export Data feature, which produces JSON that a script would parse into markdown files. Claude Code stores session transcripts locally in the project directories as JSONL files, so I should document both vectors for getting chat history into the vault. I need to be careful about exact paths and not overclaim what I know for certain.

Andrew's established working principles are important here: he provides the creative direction while I handle infrastructure unknowns, code should compile before delivery, real paths instead of placeholders, and no unnecessary complexity. But this is a separate Claude project, so the markdown I'm writing becomes that project's own instructions and memory.

The deliverable should be an MD file that encodes these standing rules so the new project inherits them. I'm thinking about how to structure the folder taxonomy using gbrain's type system—person, company, media, analysis, project, note—adapted for Andrew's Claude Code work as the seed corpus.

I'm designing a vault structure that stays faithful to gbrain but fits his actual workflow: inbox for raw captures, sessions for processed chat transcripts, projects for his repos, and people for collaborators.

I'm organizing the rest into companies he's worked with or knows, technical and strategic concepts, referenced sources, key decisions with their reasoning, his publications and resume versions, and a meta section for the brain's own configuration and enrichment rules. Each entity gets YAML frontmatter with type, status, confidence, and tags, connected through wikilinks to build the graph. I'm adapting the typed edges from the VC world to match his context instead.

For the import pipeline, I need to pull from three sources: his full Claude conversation export as the primary sessions, local Claude Code project logs which represent his actual work, and this project's memory plus any diagnostic files. I'm planning a parser script to handle this.

The approach is to build the markdown vault first—that's the hard, taste-driven part—then optionally layer on retrieval infrastructure later if he wants it. I should reference the gbrain repo and COG fork so the new project can adopt their patterns, and note that gbrain has an import command that can index existing markdown once the vault is built.

I also need to address the infrastructure unknowns from his checklist: where state lives (git repo synced via iCloud/Obsidian), API key exposure, enrichment costs, rate limits, what persists, and rollback via git. And I'm noticing his "Foil Check" tool—the "not X, but Y" construction—which signals he wants me to avoid that pattern in my own writing and probably encode it as a discipline rule in the brain itself, so I should add a voice/form discipline section to the markdown. I'll go with a phased approach: start with a pure markdown vault in Obsidian backed by git, then optionally layer on gbrain's MCP retrieval later. That keeps Phase 1 simple and focused on getting chats imported, which is the core need. Now I'm writing the markdown instructions for this project — direct, actionable prose that encodes his operational preferences and is ready to use immediately. Now I'm mapping out the full structure: what gbrain is and how we're adapting it, the phased markdown-first approach, the vault layout, entity taxonomy with frontmatter schemas, typed edges for the graph, the import pipeline as the critical piece (sources through dedup and linking), enrichment and automation within realistic bounds, seeding with his actual entities, the inherited working principles, infrastructure checklist, concrete phase plan, and open questions for Andrew.

I'll pre-seed the known entities from his context so the graph starts populated rather than empty—that's high-value and only possible because I have his background. I need to be thoughtful about what to include: the professional graph of projects, people, and companies is clearly useful and something he'd want in his own vault, but I'll skip anything speculative or sensitive like the Oxford uncertainty or burn metrics. This is his personal knowledge system, so seeding the professional entities makes sense without overstepping.

For the actual setup, I'm thinking through the directory structure—his [[Orpheus|job-search-engine]] repo lives at ~/projects/[[Orpheus]]/[[Orpheus|job-search-engine]]/, so I'll suggest the vault at ~/projects/gbrain/ and use real paths rather than placeholders, flagging them for him to confirm. For the claude.ai export, I know the flow: Settings → Privacy/Account → Export data, which emails a download link with conversations.json and projects.json in the zip.

Now I'm writing out the full markdown document—aiming for around 350-450 lines to cover setup, file structure, and the integration workflow comprehensively. I'll create it as a single file since it's a cohesive guide.I've got a clear picture of gbrain. Quick synthesis before the deliverable:

**What gbrain actually is** — Garry Tan's open-source agent memory layer (released April 2026, ~14k stars). Core ideas worth stealing: markdown-first storage with no vendor lock-in; a canonical entity taxonomy (person, company, project, concept, source, deal, writing, note, etc.); a *typed* knowledge graph auto-wired from wikilinks with zero LLM calls (works_at, founded, advises, mentions…); **[[Brain-first retrieval]]** (query local before any external API); tiered, evidence-based people profiles that auto-escalate as someone recurs; and overnight "dream-cycle" jobs that enrich entities, fix citations, and consolidate. The pure-markdown community fork (COG) drops the Postgres requirement entirely — just `.md` + git + Obsidian — which maps better to your simplicity rule. Tan also recommends seeding from an existing Obsidian/notes folder via `gbrain import`, so the right sequence is *build the vault first, layer retrieval on later*.

That separation drives the doc below. I've written it as standalone instructions for the new project, pre-seeded with your actual entity graph (repos, collaborators, companies) so it doesn't start empty, with the chat-export-to-Obsidian pipeline as the spine.
```
This block is not supported on your current device yet.
```

I've got the repo structure mapped out, so now I'm ready to write the markdown file directly to outputs as one cohesive document.I have enough. Writing the project instructions now.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Done. A few decisions baked into it worth flagging, since they're the ones you might overrule:

**Pure-markdown v1, no database.** Tan's real gbrain ships PGLite/Postgres + a 74-tool MCP server. I made v1 the COG-style `.md` + git + Obsidian variant and pushed the retrieval engine to an *optional* Phase 3. Rationale: Tan himself recommends seeding gbrain by importing an existing markdown folder, so the vault is the durable asset and the retrieval layer is swappable. This also keeps you out of Docker/DB territory you've said you don't want until forced. If you'd rather aim at real gbrain from day one, that changes how strict the taxonomy fidelity needs to be (decision #5 in the doc).

**The import pipeline is the spine, and it has two verify-first landmines.** I deliberately did *not* hardcode the Claude.ai export JSON schema or the Claude Code JSONL path/schema — both get verified against one real record before the parser is written. I also wrote idempotency in from the start (stable conversation-id keys), because the non-idempotent-write bug that hit [[Orpheus]] is the exact failure a re-runnable importer invites.

**I pre-seeded your actual graph** (§7) rather than handing the new project an empty vault — all five repos including [[charlie]], the four collaborators, four companies, and the 04-11 decision. So day one it can already answer "show me every session that touched [[mrkt]]."

**One thing I need from you to make Source C real:** the new project can't see this project's memory. Either you do a context dump from here into its `00-inbox/`, or it rebuilds everything from the raw export. That's decision #4, and it materially changes how good the first enrichment pass is.

Want me to draft the first Claude Code prompt — the vault skeleton + `09-meta` taxonomy files + the single-record dry-run of the export importer — so you have something to paste once the new project is stood up?
