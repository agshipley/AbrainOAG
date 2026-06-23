---
type: session
source: claude-export
uuid: 2eefed4f-7865-4dad-8d61-804514f67f80
title: "Gbrain project technical specifications"
created: 2026-06-22
updated: 2026-06-23
message_count: 18
status: stub
confidence: high
tags: []
---

# Gbrain project technical specifications

## Transcript

**human**

Gary Tan has created and widely shared a project called gbrain. Do a deep dive on the project and familarize yourself with all of the technical specs

**assistant**

I need to search for information about gbrain, a project by Gary Tan that's been widely shared, since this is about a current initiative I may not have details on.
```
This block is not supported on your current device yet.
```

I should check the official GitHub repository and installation documentation to get the accurate technical specifications.I have a good initial picture. Let me pull the primary source directly to get the precise technical specs.
```
This block is not supported on your current device yet.
```

Now I'm reviewing the full README and getting a complete technical picture. I should provide a thorough technical overview since the user wants to understand all the specs. I'm noticing something important though—the documentation mentions agents should fetch and execute an installation file, and there's a pattern around auto-installation for agents, which I should flag.I've gone through the primary source (the repo README) plus several independent write-ups. Here's the technical deep dive.

## What GBrain is

GBrain is an open-source AI-agent memory system from Garry Tan, President and CEO of Y Combinator. It was open-sourced under the MIT license on April 5, 2026, and crossed roughly 5,000 GitHub stars in its first 24 hours (now around 22.7k stars and 3.2k forks). The core pitch is that it's the production "brain" behind Tan's own OpenClaw and Hermes agent deployments — he cites 146,646 pages, 24,585 people, 5,339 companies, and 66 cron jobs running autonomously in his personal instance. The released version generalizes that setup so anyone can install it.

The conceptual distinction the project leans on: it's a *brain layer*, not just search. "Search gives you raw pages. GBrain gives you the answer." It claims to be the layer that does synthesis, graph traversal, and gap analysis in one box.

## Architecture

The storage model is markdown-first with a Postgres retrieval layer on top:

- **Brain repo is the system of record.** Your knowledge lives in a regular git repo as markdown files; GBrain syncs the repo into Postgres for retrieval, and deletes in git become soft-deletes in the DB. The design principle is that humans can always edit raw markdown directly and `gbrain sync` picks it up — you're never locked out of your own data.
- **Two engines, one contract.** PGLite (Postgres 17 compiled to WASM, zero-config, the default) handles personal brains up to ~50K pages; Postgres + pgvector (Supabase or self-hosted) handles shared, large, or multi-machine deployments. A contract-first `BrainEngine` interface defines ~47 operations both engines implement, and the CLI and MCP server are generated from one source.
- **Two organizational axes.** A *brain* is a database; a *source* is a repo inside that brain (a wiki, an essay, a knowledge base). Routing lives in `.gbrain-source` dotfiles with a 6-tier precedence chain.
- **Tech stack:** TypeScript (~97% of the codebase), runs on Bun (the README's CLI path uses `bun install`; reviews note Bun ≥ 1.3.10 as the minimum engine).

## Retrieval and search

This is the most technically detailed part. Hybrid search combines vector (HNSW on pgvector) + BM25 keyword + reciprocal-rank fusion + a source-tier boost + intent-aware query rewriting. A few notable design choices:

- Three named search modes — `conservative`, `balanced`, `tokenmax` — bundle cost/quality knobs into one config key; the default is `balanced` with a ZeroEntropy reranker on.
- Per-query graph signals notice when a top result is a hub for that query (adjacency boost), is corroborated across team brains (cross-source boost), or is being crowded out by weak chunks from a chatty session (session demote).
- Vector retrieval pools the best chunk per page, so a page surfaces on its strongest evidence instead of losing to a neighbor on one weak chunk.
- There are two query verbs that serve different jobs: `gbrain search` returns top retrieved pages by hybrid score with no LLM cost, while `gbrain think` runs the same retrieval and then composes a synthesized answer with citations plus an explicit note on what the brain doesn't know yet. That gap analysis — flagging stale pages, uncited claims, contradictions — is positioned as the real differentiator.

## The self-wiring knowledge graph

The headline technical claim. Every page write extracts entity refs from markdown/wikilinks/typed-link syntax and writes typed edges (`attended`, `works_at`, `invested_in`, `founded`, `advises`, `mentions`) with zero LLM calls — pure pattern matching. This lets it answer relational queries that vector search alone can't reach ("who works at Acme AI?", "what did Bob invest in this quarter?"), with multi-hop traversal via `gbrain graph-query`.

The benchmark: on a 240-page Opus-generated rich-prose corpus (BrainBench), it hits P@5 49.1% and R@5 97.9% — a +31.4-point P@5 lift over the same codebase with the graph layer disabled, and a similar margin over ripgrep-BM25 and vector-only RAG. The eval code lives in a sibling `gbrain-evals` repo for reproducibility, which several reviewers flagged as a refreshing bit of benchmark honesty.

## The loop and the "dream cycle"

The compounding mechanism runs: signal → search → respond → write → auto-link → sync. A signal detector runs on every message; a brain-first lookup happens before any external API call; auto-linking fires on every page write (no LLM calls); and cron-driven enrichment runs while you sleep — dedup people pages, fix citations, score salience, find contradictions, prep tomorrow's tasks. Reviewers describe three self-improvement mechanisms layered on this: tiered enrichment (entities mentioned more often get progressively richer pages), a fail-improve loop (logged LLM fallbacks generate better regex patterns over time, so cost drops on the same workload), and backlink-boosted ranking.

## Schema packs

GBrain doesn't impose a fixed layout. `gbrain-base-v2` (default as of v0.41.22) is a 15-type canonical taxonomy — person, company, media, tweet, social-digest, analysis, atom, concept, source, deal, email, slack, writing, project, note. There's a legacy 24-type `gbrain-base`, an extended `gbrain-recommended`, and you can author your own: `gbrain schema detect` clusters your filesystem into proposed types, `gbrain schema suggest` runs an LLM pass, and `gbrain schema review-candidates --apply` promotes the ones you like. The active pack threads through every read and write path, and the search cache folds the pack name + version into its key so cross-pack contamination is structurally impossible.

## Jobs, skills, and integrations

- **Job queue (Minions):** a BullMQ-shaped, Postgres-native queue with durable subagents that survive crashes via two-phase pending→done persistence, shell jobs with audit, child jobs with cascading timeouts, and rate leases for outbound providers.
- **Skills:** 43 curated skills shipped as markdown workflow files (tool-agnostic), packaged as a single skillpack the installer drops into your agent workspace.
- **Integrations** ship as markdown recipes: voice (Twilio + OpenAI Realtime), email/calendar webhooks, 16 embedding-provider recipes (OpenAI, Voyage, ZeroEntropy as default, Gemini, Ollama and llama.cpp for local, etc.), and rerankers including a fully-local llama.cpp cross-encoder path.

## MCP surface and install

GBrain exposes 30+ tools over MCP (stdio and HTTP). The quickest path to wire it into a coding agent is two commands: `gbrain init --pglite` for a 2-second local brain, then `claude mcp add gbrain -- gbrain serve`. The HTTP server (`gbrain serve --http`) adds OAuth 2.1, DCR-style client registration, scope-gated access (read/write/admin), and rate limiting — needed for Claude Desktop, Cowork, Perplexity, and ChatGPT. There's also a newer company-brain mode with per-user login-scoped slices of the brain.

## Status and caveats worth knowing

It's young and moves fast. It ships with frequent breaking changes, and the README itself documents two install footguns — don't use `bun install -g github:garrytan/gbrain` and never `npm install -g gbrain`, which points at a squatted package. Reviewers' fairest framing: the storage and search are solid, but the "self-maintaining" behaviors rely on a frontier model following the prompts — the intelligence layer is only as good as the model running it. One useful conceptual caveat from a practitioner review is that GBrain is better understood as a library you pre-sort than as "memory" in the sense of encoding why something matters — treat it like a library and it's useful from day one.

One practical note relevant to me specifically: a lot of the install flow works by having you paste a URL into an agent and letting it fetch and execute `INSTALL_FOR_AGENTS.md`. I'm happy to walk through any part of the architecture, the retrieval pipeline, or the install paths in more depth — but if you ever want me to actually run that install, I'd want to look at exactly what those remote instructions do first rather than execute them blind.

What would be most useful to go deeper on?

**human**

I just installed and briefly familiarized myself with Obsidian. I'd like to take a look at setting up my own gbrain

**assistant**

The user is looking to set up gbrain after installing Obsidian, and they're interested in the Obsidian vault migration path since gbrain supports Obsidian-style wiki link syntax with the right configuration.

I'm thinking through the best installation approach for them — the CLI standalone path seems most practical for someone new to Obsidian, especially since they'll want to point it at their existing vault. I need to figure out what prerequisites they'll need, like Bun and API keys for embeddings, and whether I should pull the detailed installation instructions or the Obsidian migration tutorial to give them accurate steps.

The real question is whether they want a full autonomous setup with agent loops and scheduled syncs, or just a local brain they can query against their vault. Given they're a fresh Obsidian user, I'm leaning toward the simpler local setup, possibly integrated with Claude Code. I should probably just give them a clear path forward rather than asking too many clarifying questions. I'm noticing there's a discrepancy between what the README shows for the CLI installation and what a review flagged as broken — the postinstall hook issue. Let me check the actual installation docs to get the correct setup path for them. The review is from May 8, so the README has likely been updated since then. There are actually two installation approaches documented: the global install via `bun install -g github:garrytan/gbrain` for the CLI standalone, and the clone-plus-link method for local development. Both are valid, though I should flag that `npm install -g gbrain` remains a squatted package to avoid.

Since install commands shift frequently with this active project, I need to check the current INSTALL_FOR_AGENTS.md file directly—that's where the README points for the Obsidian setup details, so it'll have the most reliable current instructions.Good combination — gbrain has a dedicated path for Obsidian vaults, so your timing is fine. Before I lay out the steps, let me pull the current install protocol so I'm giving you commands that match the latest version rather than working from memory (this project changes fast).
```
This block is not supported on your current device yet.
```

I've identified the correct installation method: cloning the repo and running `bun install && bun link`, which differs from both the global npm approach and the outdated README instructions. For the user's Obsidian vault setup, the best approach is a local PGLite brain that points to their vault with Obsidian-specific basename link resolution.

I'm thinking through the right level of guidance here. Since they're new to both Obsidian and gbrain, I should give them the concrete foundational steps that apply to any setup path—install, configure keys, initialize, and import their vault—while flagging the Obsidian-specific details. Then I'll ask where they want to go next: just querying locally, integrating with Claude Code as MCP memory, or building toward the full autonomous setup. That way they get real value upfront before I ask them to clarify their goals. The first four steps—install, keys, init, and vault import—are universal across all paths, so laying those out now gives immediate value before the fork determines what comes next. I need to nail the Obsidian specifics: the import points to the vault directory, and I should mention the `gbrain config set link_resolution.global_basename true` command that resolves bare note links across folders the way Obsidian does, plus they'll need an OpenAI key for embeddings.

I should also flag the install footgun clearly—use the git clone + bun link path or the global bun install form from the README, never `npm install -g gbrain` since that's a squatted package. And I'll note that Obsidian vaults often have a `.obsidian/` config folder and non-note files, but pointing the import at the vault root is fine since it'll handle the markdown files. They'll need git, a shell, and bun gets installed via curl. I'll walk through the setup steps: clone the repo and install the runtime, add your embedding API key, initialize the brain, point it at your Obsidian vault with proper link resolution, then query it. After that I'll cover Obsidian-specific details like how basename resolution works and what the schema expects, then we can branch based on what you want to do next.

Let me verify the exact commands from the install docs: clone and cd into the repo, install the runtime via curl, add it to your PATH, then run `bun install && bun link` to set up the CLI. You'll need to export your OpenAI API key for embeddings (and optionally Anthropic), then run `gbrain init` to create the config. Before importing your vault, I can run `gbrain doctor --json` to check the setup, then import with `--no-embed` and embed stale notes afterward. For Obsidian-specific link resolution, you'll want to enable global basename matching in the config and reindex to backfill aliases—`gbrain doctor` shows you what edges you'll gain before flipping that setting.Perfect timing, since gbrain has a specific path for Obsidian vaults. The first part of the setup is identical no matter how far you eventually take it — install, a key, init, then point it at your vault — so let's get you to a working local brain over your Obsidian notes, and I'll ask at the end where you want to go from there.

A couple of things up front. This runs locally on PGLite (embedded Postgres, no server, no Docker), so it's low-commitment to try. And one install footgun worth stating plainly: install from the git repo as below — **never** `npm install -g gbrain`, which is a squatted package on the npm registry, not the real thing.

## 1. Install gbrain

```bash
git clone https://github.com/garrytan/gbrain.git ~/gbrain && cd ~/gbrain
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
bun install && bun link
```

Then verify: `gbrain --version` should print a number. If `gbrain` isn't found, restart your shell or add that `PATH` line to your shell profile (`~/.zshrc` on a Mac).

## 2. Set an API key

You need an embedding provider for vector search. OpenAI is the default:

```bash
export OPENAI_API_KEY=sk-...          # required for vector search
export ANTHROPIC_API_KEY=sk-ant-...   # optional; improves query expansion
```

Without OpenAI, keyword search still works; without Anthropic, search works but skips query expansion. Put these in your shell profile or a `.env` so they persist.

## 3. Create the brain

```bash
gbrain init          # PGLite, ready in ~2 seconds
gbrain doctor --json # verify all checks pass
```

Important conceptual point: your Obsidian vault stays **separate** from the `~/gbrain` tool repo. gbrain reads your vault and syncs it into its own database — it doesn't move or restructure your files, and you can keep editing in Obsidian directly.

## 4. Point it at your Obsidian vault

Substitute your actual vault path (on a Mac it's often `~/Documents/YourVaultName`):

```bash
gbrain import ~/Documents/YourVault/ --no-embed   # index the markdown
gbrain embed --stale                              # generate vector embeddings
```

The `.obsidian/` folder in your vault is just Obsidian's config — gbrain only cares about the markdown, so pointing at the vault root is fine.

## 5. The Obsidian-specific wrinkle (do this)

Obsidian lets you write bare `[[note-name]]` links that resolve across folders regardless of where the note actually lives. gbrain's graph extraction defaults to exact-path matching, so out of the box it'll miss a lot of your links. Turn on basename resolution:

```bash
gbrain doctor        # tells you how many graph edges you'd gain first
gbrain config set link_resolution.global_basename true
gbrain reindex --aliases
```

This makes a `[[struktura]]` link resolve to `projects/struktura.md` by basename. It's off by default, and `gbrain doctor` reports how many edges you'd gain before you flip it — worth running first so you can see what it buys you. For an Obsidian vault this is usually a big jump, because the self-wiring knowledge graph is the main thing gbrain adds over Obsidian's own search.

## 6. Query it

```bash
gbrain search "what themes show up across my notes?"   # raw ranked pages
gbrain think  "what themes show up across my notes?"   # synthesized answer + citations + gaps
```

That's a fully working brain over your vault. Where you go next depends on what you're actually after — and the steps diverge enough that it's worth picking before I lay out more.
```
This block is not supported on your current device yet.
```

**human**

Q: What's your main goal for the brain once it's importing your vault?
A: Full autonomous setup (dream cycle, skills, crons)

**assistant**

The user is asking for the complete autonomous setup, which involves loading the skill library with its dispatcher system, configuring the identity layer through soul audits and access policies, and setting up recurring background jobs. This is the most comprehensive path through the installation process.

The full autonomous setup is really designed for AI agent platforms like OpenClaw or Hermes to execute. The dream cycle and skills are fundamentally markdown instructions that an LLM agent reads and follows rather than deterministic code, so you need an agent runtime to actually run them on a schedule. The setup requires both an agent platform to execute the skills and dream cycle, plus a scheduler to trigger the recurring jobs. The real constraint is that the dream cycle needs an always-on runtime to execute nightly — a local Claude Code setup won't work at 3am unless the machine is running. So the choice comes down to either using a coding agent they already have with cron jobs, or deploying a dedicated always-on platform like OpenClaw on Render, which is what enables the "while you sleep" automation. I should pull the cron schedule details to give them the exact setup requirements.The full autonomous path is the real deal but also the one with the most moving parts — and there's one architectural decision that drives everything else, so let me get the actual dream-cycle protocol before I lay it out rather than wing the cron details.
```
This block is not supported on your current device yet.
```

I need to search for the dream cycle cron schedule details since I don't have that information from earlier results.
```
This block is not supported on your current device yet.
```

The key distinction is that a full autonomous setup with dream cycles and skills needs more than just the local CLI brain—it requires an agent runtime that can interpret and execute markdown-based skill instructions, since these are LLM directives rather than deterministic code. The main options involve using a coding agent framework that can handle this kind of dynamic instruction following.

Beyond the agent runtime, there's the practical matter of always-on execution: crons only fire when something is actually running, so you either need to host the system on a persistent server or accept that scheduled tasks only trigger when your machine is awake. The newer versions of the tool include a native scheduler loop that removes the need to rely on external cron systems, though there's still a trade-off between the complexity and cost of a production setup versus a simpler local approach.

I should be clear about what "fully autonomous" actually requires: it's not just the storage and retrieval layer you've built, but an LLM operator running markdown-based skills on a schedule, which means committing to either an always-on host or accepting the limitations of local execution. The core skills load through the dispatcher, with signal detection and brain operations as mandatory conventions. There's an optional soul audit layer for identity and access policies, then the recurring jobs—live sync every 15 minutes, daily auto-updates (manual install only), nightly dream cycles at 2am, and weekly health checks. The dream cycle itself runs entity sweeps, citation cleanup, memory consolidation, and syncing with embeddings, all triggerable via command with a dry-run option. One key UX detail: quiet hours prevent those jarring 3am pings that make users disable the whole thing.

I should be honest about the limitations—these autonomous behaviors are only as capable as the underlying model, there's real token cost involved, and choosing between local PGLite and hosted Supabase affects the setup. The dream cycle specifically needs an LLM API key with actual spend behind it.

For sequencing, I'd recommend starting local and manual—fire the dream cycle by hand or through a laptop cron job over an Obsidian vault to prove the loop works—then graduate to an always-on host once it's clearly valuable. I should point them at the personal-brain tutorial for that hosted path. And since they're operating this system, Claude Code would be a natural fit for the operator role, so I'll recommend that through the apps tool. Claude Code desktop is a natural fit here since they'll be running an agent to operate the brain. I should mention it as an option but keep it light. Though I need to flag the safety considerations: the agent will execute autonomous LLM calls that cost money and make writes to their brain, so I should make sure they understand what's happening and that this is their own system on their own machine with their own keys.

The `gbrain dream` command is the key piece — it scans today's activity, enriches entities, and syncs, with a `--dry-run` flag to preview changes before committing. That's how they can trigger the dream cycle manually before setting up any automation. I should also note that the "while you sleep" aspect requires an always-on host, and when they eventually wire in external sources like email or tweets, untrusted content flowing into an autonomous agent becomes a real consideration worth mentioning lightly.

Now I'm looking at the automation schedule: the dream cycle runs nightly at 2 AM with a multi-phase process that sweeps entities, fixes broken citations, consolidates memory, and syncs. There's also a weekly brain health check on Monday mornings that validates the knowledge base and re-embeds stale entries. The system gates notifications during quiet hours, and live syncs happen every 15 minutes to keep things current.

I'm also noting that v0.12.0 introduces a native `gbrain cron` scheduler that runs jobs inline through the job worker, with PGLite handling single-writer consistency — though large syncs require stopping the serve process first. The architecture uses a two-repo structure where the workspace repo holds config, skills, memory, and cron definitions, separate from the brain repository itself.

For the local-over-Obsidian setup, the brain repo can simply be the Obsidian vault with git initialized. Now I need to structure this response clearly since it's genuinely complex — I'll lead with the key architectural decision, then cover the two hosting options, the autonomous components, and a sequencing recommendation, keeping explanations in prose rather than over-bulleting.

Actually, I should reconsider the length here to make sure I'm being appropriately concise while still covering everything they need.

The real fork is hosting: running on your laptop (cheap, only when awake) versus an always-on server (true "while you sleep" capability, costs around $85+ per month, takes roughly 2 hours to set up). Rather than ask again, I'll present both options clearly and recommend starting with the laptop approach to prove the concept works, then migrating to always-on hosting if needed. They've already committed to the full autonomous path, so I should give them a clear recommendation with both options laid out rather than asking for more input.Good — that's the real deal, and there's one thing to get straight before any commands, because it changes the whole shape of the setup.

## The key reframe

The local brain you built in the last steps is the *storage and retrieval* layer. The autonomous behaviors you're asking for — dream cycle, skills, crons — are a different layer that needs two things the CLI alone doesn't give you:

1. **An agent runtime.** The 43 skills are markdown instructions an LLM agent reads and follows; the intelligence lives in the markdown, not in application code. Something has to *be* that agent — a coding agent (Claude Code, Codex, Cursor) acting as operator, or a dedicated agent platform (OpenClaw, Hermes).
2. **An always-on host.** "Enriches while you sleep" is only literal if something is awake at 2 a.m. A laptop won't fire a nightly dream cycle unless the machine is on.

So the real decision isn't *which commands* — it's *where this runs*. Two honest options:

**Option A — Local / laptop (cheapest, simplest to prove out).** Everything stays on your machine: PGLite, a coding agent as operator, crons via your machine's scheduler. Costs only your LLM API usage. Caveat: jobs only run when your laptop is awake, and PGLite is single-writer, so you stop `gbrain serve` during a large sync because a live MCP server contends for the write lock. Good for learning the full loop before committing.

**Option B — Always-on hosted (the actual "while you sleep" setup).** This is what Tan runs. The thin-client tutorial build is OpenClaw + GBrain + Telegram at about $85/month; his full production "fat client" is about $1,500/month. It uses two repos — a workspace repo for agent config/skills/memory/crons, and a brain repo for the knowledge — plus Supabase with the pgvector extension toggled on, and AlphaClaw on Render. Budget ~2 hours; the [personal-brain tutorial](https://github.com/garrytan/gbrain/blob/master/docs/tutorials/personal-brain.md) walks it end to end.

My honest recommendation: **start with Option A over your Obsidian vault, prove the dream cycle earns its keep, then graduate to Option B.** Below is the autonomous layer itself — the parts that are the same either way.

## Loading the autonomous layer

**Skills.** Point your operator agent at the skill dispatcher and have it adopt the core three:

```
Read ~/gbrain/skills/RESOLVER.md   # the skill router — save permanently
```

The three to adopt immediately: signal-detector (fire on every inbound message — captures ideas and entities), brain-ops (brain-first lookup before any external call), and conventions/quality.md (citation format and back-linking rules).

**Identity (optional).** The soul-audit skill generates SOUL.md (agent identity), USER.md (your profile), ACCESS_POLICY.md (who sees what), and HEARTBEAT.md (operational cadence) from your answers; if skipped, minimal defaults are installed.

**The dream cycle.** This is the heart of what you picked. Run it manually first before automating:

```bash
gbrain dream --dry-run   # shows what it would change, writes nothing
gbrain dream             # scans the day's activity, enriches entities, syncs
```

Under the hood it runs four phases: an entity sweep (new entities get created and enriched, thin pages get filled out, existing pages get timeline updates), citation hygiene (add missing source attributions, fix broken links), memory consolidation (promote durable patterns), then sync + embed stale content. Run `--dry-run` a few times against your vault and you'll see exactly what it wants to touch — do this before you let it run unattended.

## The cron schedule

The recommended recurring jobs: live sync every 15 min (`gbrain sync --repo ~/brain && gbrain embed --stale`), an auto-update check daily (`gbrain check-update --json` — it tells you, but never auto-installs), the dream cycle nightly, and a weekly `gbrain doctor --json && gbrain embed --stale`. The dream cycle runs nightly at 2 a.m.

Two things to internalize here. First, newer versions ship a native scheduler so you don't need crontab: `gbrain cron` is a scheduler loop inside `gbrain jobs work` that owns cron expressions natively. Second — and this is the one people learn the hard way — quiet hours gate every notification job: one 3 a.m. ping and the user disables the whole system, so don't over-cron.

## Then: integrations and verify

```bash
gbrain integrations list      # email, calendar, voice, Twitter recipes
gbrain integrations doctor    # after configuring at least one
```

Each integration is a self-contained recipe that tells the agent what credentials to ask for and what cron to register. One caution for later: once you wire in external feeds like email or tweets, you're piping untrusted text into an agent that autonomously writes to your brain — worth keeping ingestion scoped and reviewing what lands until you trust it. Finish by running the 6 checks in `docs/GBRAIN_VERIFY.md`; check #4 (live sync actually works) is the most important.

## The honest caveat

The autonomous layer is only as good as the model running it — the storage and search are solid, but the self-maintaining behaviors are instructions the AI reads and follows, not deterministic code. The dream cycle makes real LLM calls nightly, so it has an ongoing token cost even on the local path. That's the case for starting local and dry-running before you automate.

Want me to write out the concrete Option A path next — git-init your Obsidian vault as the brain repo, set up `gbrain cron` with a sensible quiet-hours-aware schedule, and a first dream-cycle dry run? Or would it help more to map the Option B hosted architecture first so you can decide before investing the laptop setup?

Since you'll be running a coding agent as the operator for all of this, it's worth flagging where that's smoothest:
```
This block is not supported on your current device yet.
```

I've wrapped up my response with a clear question about which direction to explore next, and I've included the operator-agent note with my recommendation. That's a complete turn.Either direction works for the next step — tell me whether you'd rather build out the concrete laptop path or scope the hosted architecture first, and I'll go deep on that one.

**human**

I think you need to familiarize yourself with where I'm at currently with my workspace. Review everything you have in current memory

**assistant**

I'm checking what memories I have about the user's workspace state, but I don't see any stored memories in my context yet, so I'm starting fresh to understand where they're at. I'm realizing I don't actually have any populated memories in my context right now, so I can't review what's stored. I do see some user-uploaded skills like "feature-factory" that mention Andrew and Orpheus, but those are separate from the memory system. The user is asking me to familiarize myself with their workspace, which suggests they want me to understand the context of what we're working on together. Looking at what I actually have access to, there's no populated userMemories block visible to me, so I can't genuinely recall details about their workspace setup. The honest move here is to acknowledge that gap rather than pretend I remember things I don't, then offer to search through their project history or use available tools to get up to speed on what they're working on. The honest approach is to acknowledge I don't have any populated memories about their workspace, but offer to search through past conversations in the project to reconstruct what they've been working on and where they currently stand. I should actually verify what's in my memory rather than just reasoning about it. Let me check the memory edits directly and search through recent conversations to see what context is actually available, rather than making assumptions from my loaded skills. 's the context I can actually point to. So I should acknowledge I don't have stored memories about their workspace, but I do have visibility into the skills that describe their actual project setup.

I think the honest approach is to check my tools first—search for any relevant conversation history and memory edits—then report back what I find without inventing details. And I need to be careful not to overstate what the skills tell me or fabricate specifics beyond what's actually there. is a straightforward one — I should check what's actually in memory rather than speculate. Let me call the memory tools to see what's been stored, then report back honestly on what I find without making assumptions about the user's identity or fabricating details. _chats will show this conversation and possibly others in the project. Let me run both searches to see what's actually stored.

Actually, I should double-check whether there's a real userMemories block I'm overlooking. Looking back at the system prompt structure, I see the memory_system section with examples, but the actual runtime userMemories block isn't populated with real content about this user — those are just labeled examples. So I genuinely don't have stored memories about your workspace.

Given that, I'll verify what I can access through tools and acknowledge the capabilities I can see from here.Let me actually check rather than assume — I'll look at what's in my memory and the project's recent history before telling you where I think things stand.
```
This block is not supported on your current device yet.
```

Let me look at the recent conversations in this project.
```
This block is not supported on your current device yet.
```

I'm not finding any memory edits or recent conversations in the project context, and the userMemories block is empty. Let me search through conversations for mentions of "workspace" or "Orpheus" to be thorough.
```
This block is not supported on your current device yet.
```

I've verified there are no stored memories or prior conversation context about your workspace—this current discussion is all I have to work with, and it's not even saved as memory yet.

**human**

I've added an MD file to this project to help us get started

**assistant**

The user mentioned an MD file at the start of our conversation — GBRAIN_PROJECT.md — which contains the current state of their workspace. I should reference that file to understand where they're at with the project. I'm debating whether to re-read the project file directly or work from the content already in my context—the user explicitly asked me to review the MD file they added, so I should view it to confirm it's the authoritative version and show I'm respecting their request, even though I likely have the same content from the first message. I'm catching myself going in circles on whether to re-read the file I already have. The real move is to stop second-guessing and actually engage with what the GBRAIN_PROJECT.md says—it fundamentally shifts how I should be advising them, since this is Andrew's personal knowledge base seeded from his own Claude work, not a generic setup.

The doc is explicit about deferring the exact things I just walked them through: no Postgres, embeddings, or MCP retrieval in v1, and no autonomous cron fleet yet. Instead, they're building the pure markdown vault with git and Obsidian first, treating that as the core asset while keeping the retrieval layer swappable. Enrichment happens as deliberate, reviewable passes until the taxonomy stabilizes—automation comes after proving the shape works, not before.

But the user picked "full autonomous setup" in their earlier request, which directly contradicts what this project doc prescribes. I should surface this tension honestly rather than just proceed: their own plan says Phase 1 is corpus and import, Phase 4 is optional automation, yet they asked me to build the opposite. The doc even emphasizes simplicity over impressive architecture, which is the real guiding principle here.

The actual critical path is getting Andrew's full Claude.ai conversation history and Claude Code session logs into the Obsidian vault as structured markdown — that's the substance that needs to work first. The import pipeline from three sources (Claude.ai export, JSONL logs, and project memory) is what matters. The vault structure is already specified with numbered folders and a clear layout.

COG-second-brain is the closest reference model — pure markdown and Obsidian with git, not the full database-backed approach. I'm pre-populating the seed graph with known entities like the projects (Orpheus, first-agent, charlie, mrkt, NLSAFE), key people, companies, and core concepts. The working rules are clear: Andrew owns product decisions and taste, I handle infrastructure unknowns, and implementation stays focused on what actually works.

One critical constraint I keep violating — the foil-construction rule. Andrew's linter flags the pattern of stating what something isn't before what it is (`not X, but Y`, `it's not X, it's Y`, and softer variants like `rather than` or `instead of`). I need to state the positive claim directly without the negation frame. Looking back at my outputs, I've been doing exactly this repeatedly.

There are also open decisions still pending around the sync engine choice, privacy boundaries, runtime environment, and whether the new project includes memory functionality.

Now I'm seeing the actual project document they've shared. This is a crucial moment—I need to acknowledge that I finally have the real context. But there's a significant tension here: everything I guided them through in the previous exchanges—the PGLite setup, embeddings, MCP server, the full autonomous dream-cycle with OpenClaw and Hermes hosting—is exactly what their document explicitly defers. Their Phase 1 is deliberately minimal: just markdown, git, and Obsidian, import-first, with no Postgres, no MCP, no cron infrastructure. So my earlier recommendations were misaligned with what they're actually building.

I need to reorient cleanly to where they actually are: Phase 1, and the critical path is the import pipeline. They've got Obsidian installed. The next real step is building the vault skeleton and the two importers—one for Claude.ai exports, one for Claude Code JSONL—and verifying each on a single record first. I should own this miss directly per the working rules, acknowledge that I went down the full-autonomous path when the doc says to defer that, and then pivot to what actually matters right now without any unnecessary apology.

There's a tension though: they explicitly chose "full autonomous" in the elicitation, but the doc says otherwise. I should flag that contradiction and let Andrew decide which governs—but I'll make a clear recommendation to follow the doc and Phase 1 import-first, keeping it direct and respecting the no-over-asking style.

Also, the doc clarifies that my job is generating prompts for Claude Code, not running things in my sandbox or handing over scripts. Andrew pastes what I generate into Claude Code in ~/projects/gbrain/. That shapes what I should produce next.

I have the full GBRAIN_PROJECT.md content from the first message—the system confirmed it exists at /mnt/project/GBRAIN_PROJECT.md. The user is now directing my attention to it as the foundation for what comes next, so I'll work from it directly without re-fetching.

I need to acknowledge the gap between what I've been suggesting (PGLite, embeddings, MCP, autonomous hosting) and what the doc actually prescribes for v1: pure markdown + git + Obsidian, import-first. The critical path right now isn't infrastructure—it's getting the corpus into the vault. Obsidian is installed and ready as the render layer, but nothing else matters until the import pipeline is built and working.

The immediate sequence from the doc is clear: set up the vault structure with the folder taxonomy, verify both importers on a single record, run the full import, execute the extraction pass, then seed the graph. There are also blocking decisions in the doc I need to flag—sync engine choice, runtime environment, privacy scope, and how to handle the Source C memory dump—but the core question is whether we're actually committing to the Phase 1 import-first approach or if you want to pivot toward autonomous systems instead. That'll determine what we lock down next. I should own the miss cleanly: the project doc was in my context from the start, and it explicitly defers the autonomy question I just walked through, so I could have caught that mismatch. I'll cite the specific Phase 1 language, the import pipeline as the critical path, and the seed entities to show I've actually absorbed the doc, not just skimmed it. Then I'll reset the direction against what's actually planned and ask Andrew to lock the §10 decisions that gate the first build. The real priority is getting the import pipeline working—Andrew's full Claude.ai and Claude Code history needs to land in the vault as structured, linked markdown. That's the foundation everything else builds on. So the immediate sequence is setting up the vault skeleton with the folder structure and taxonomy files, then building and testing two importers on single records before running them at scale.

Once the full import completes and the entity extraction pass runs, the graph gets seeded and linked—the outcome being that I can open Obsidian, search for something like "charlie," and see every session that touched it, connected to relevant people and projects. The COG fork is the Phase 1 reference model, not the main gbrain repo yet. We're staying pure markdown plus git plus Obsidian until Phase 1 and 2 prove the approach works.

Before I can start building the first importer, I need two decisions from you: whether to use bun or node for the scripts, and whether this project should hand the new vault an initial memory or context dump in the inbox folder.

I also need to verify the actual Claude.ai export schema and the Claude Code JSONL path on your machine before writing the parser—I can't assume the structure. My working mode is to produce the architecture and Claude Code prompts you paste into the project folder, no tarballs or shell commands. So the real question is whether we're locking Phase 1 import-first as the plan, or if you want to jump straight to autonomy—and which runtime do you prefer? The real blockers for step 1 are minimal—the vault skeleton doesn't need any decisions at all, and the importers only need the runtime choice. Everything else like sync strategy and Phase 3 retrieval can wait. So instead of asking questions upfront, I should just recommend Phase 1, offer to draft the skeleton prompt immediately, and only ask for the runtime decision before tackling the importers.

I need to address their autonomous-vs-import choice directly though—state my read on what they picked and let them override if needed. Keep it tight, no reassurance or filler, and make clear what I'm delivering: architecture plus Claude Code prompts to paste, nothing else. I need to rephrase the COG-second-brain fork description to avoid the "X, not Y" structure—it's the Phase 1 reference built on markdown, git, and Obsidian, with the real gbrain coming later in Phase 3 only if earlier phases justify it. The rest of the points hold: the import pipeline is the critical first deliverable, everything else builds on it, and I'm just noting factually where the governing plan contradicted my initial direction. I'm also tightening up the phrasing around Obsidian being installed as the render layer completion.

For the opening, "GBRAIN_PROJECT.md is the spine. Reading it changes our direction" feels direct and right. I'm scanning the final draft to catch any remaining "not X but Y" constructions I should rephrase. On whether to view the file again—I'm confident I have the content and can reference specific sections and quotes to prove it, so viewing feels redundant. The user said they added "an MD file" singular to help us get started, which suggests this is the one, so I'll skip the extra check. I'll view the file briefly and then give a focused reorientation without rehashing everything.
```
This block is not supported on your current device yet.
```

I've reviewed the project file and it confirms what I already had. Now I need to write a reorientation that directly owns the miss—the last two turns pushed toward PGLite, embeddings, MCP, and autonomous features that the spec explicitly defers to v1 and Phase 4, and I should have caught that the documentation was already available.

Andrew is actually at Phase 1 with the import pipeline as the critical path, and Obsidian is already installed as the render layer. I need to lay out the Phase 1 sequence from §9, explain the §10 decisions that gate the build, and clarify my working mode: I output architecture plus Claude Code prompts. The menu choice for "full autonomous" conflicts with the governing plan, so I'll name that conflict directly and recommend Phase 1 import-first, while giving Andrew the override since he makes the direction call. I'm drafting this carefully to avoid foil constructions like "not X but Y" or "rather than." Phase 1 breaks down into four concrete steps: setting up the vault skeleton with the directory structure and taxonomy files, seeding the graph with stub files for known entities like the five projects and key people, building the importer for Claude's export format validated against real data, and then handling the second source importer.

Two decisions still need resolving before the importers run — whether to use `bun` or `node` as the runtime, and whether to seed the vault's initial context from a memory dump or reconstruct it entirely from the export.

I'm ready to draft the vault-skeleton and seed-graph Claude Code prompt now without waiting on those calls, then once you confirm the runtime choice, I can move forward with the importer prompts. Before any full run, I'll verify everything works on a single real record first. Sections 1 and 9 defer those concerns for v1, with automation gated at Phase 4. I need to double-check the section references though — §9 calls Phase 1 "the whole game right now," not §0, which actually emphasizes that the import pipeline is the critical first deliverable. Let me correct that attribution.

The prompt itself looks solid: I'm asking for a skeleton draft plus a runtime choice between bun and node, which is really one primary decision. The Source C question I'm raising as context but not forcing as a blocker. The length is dense but warranted given the project reorientation, and it matches Andrew's direct style without padding.

The numbered list of five steps plus two decisions is structured, but since §8 frames implementation as prompts and the phase plan is inherently sequential, a short ordered list is the clearest way to present it—Andrew's own doc uses numbered phases, so it fits. For the seed graph detail, I'm keeping it compressed to one line with entity counts and flagging that charlie needs to stay included, since Andrew's doc explicitly notes it's been dropped from summaries before and that's a known failure pattern worth signaling I caught.

I'll attribute "whole game" to §9 and "no corpus no brain" to §0. Recommending Claude Code again would be redundant since Andrew clearly already uses it and the whole model assumes it—skip that. I'm avoiding reassurance language like "great" or "happy to," opening direct with "Read it," and closing crisp with "Go?"Read it. This is the governing doc, and it resets where we were heading.

The miss to own: the last two turns walked you toward PGLite, embeddings, an MCP server, and a hosted OpenClaw/Hermes deployment with a nightly cron fleet. §1 defers every one of those for v1 — "No Postgres / PGLite / MCP retrieval layer in v1," "No autonomous cron fleet on day one" — and §9 puts automation at Phase 4, gated and optional. When "full autonomous" came up in my menu I built on it; the doc was already in context and says hold all of that. That one's on me.

Where you actually are: Phase 1, which §9 calls the whole game right now. §0 is blunt: no corpus, no brain. Obsidian's installed, so the render layer's in place. The critical path now is the import pipeline — Andrew's full Claude.ai and Claude Code history landing in `~/projects/gbrain/` as structured, linked markdown. The reference for this phase is the COG-second-brain fork: pure `.md` + git + Obsidian, zero database. Real gbrain enters at Phase 3, and only if Phase 1–2 earn it.

Phase 1 sequence (§9), in order:

1. **Vault skeleton** — the numbered `00-inbox` → `09-meta` tree (§3), the four `09-meta` taxonomy files, the one-line root `CLAUDE.md` pointer. No decisions needed; I can draft this Claude Code prompt now.
2. **Seed graph** (§7) — write the known entities as stub files so the vault has a spine before sessions land: five projects, four people, four companies, the 2026-04-11 Orpheus decision, four starter concepts. charlie gets written explicitly (the doc flags it as having been dropped from summaries before).
3. **Source A importer** (`import-claude-export.ts`) — verified on one real record first, with the export JSON schema read from an actual record before any field names get hardcoded (§6 is explicit on this).
4. **Source B importer** (`import-claude-code.ts`) — the Claude Code JSONL, the highest-signal corpus. The `~/.claude/projects/...` path and line schema get confirmed on your machine before parsing.
5. **Full import** → `extract-entities.ts` → links wired. Target: open Obsidian, search "charlie," see every session that touched it linked to `[[Liz Varner]]` and the project note.

Two §10 decisions gate the importers (the skeleton doesn't wait on them):

- **Runtime** — `bun` or `node` for the scripts?
- **Source C** — does this project hand the new vault a memory dump into `00-inbox`, or do we rebuild that context from the export alone? One data point: my stored memory on you is empty — I checked the memory and the project's chat history, nothing's there — so if the spine should come from this project's context, an explicit dump is how it moves.

Working mode per §8, confirmed: I produce architecture and Claude Code prompts you paste into `~/projects/gbrain/`. Verify-on-one-record before any full run. Keys in `.env`, gitignored, never echoed back here.

First move: I draft the vault-skeleton + seed-graph Claude Code prompt now, since it needs no decisions. Tell me `bun` or `node` and the importer prompts follow. Go?

**human**

what's the difference between bun and node?

**assistant**

Andrew wants to know the practical differences between Bun and Node.js for running the gbrain importer scripts. I'm recalling that Node.js is the established runtime while Bun is the newer alternative, and the documentation indicates Bun is gbrain's preferred choice for these scripts.

I need to be careful with my phrasing here — Andrew's style rules explicitly reject contrastive constructions like "not X but Y" or "rather than," so I'll focus on describing each runtime's characteristics directly rather than comparing them head-to-head. The conceptual differences are stable knowledge, so I don't need to search. I'll keep this tight and decision-relevant, explaining what matters for his specific use case without padding or reassurances. Bun handles TypeScript directly without a build step, which aligns with what the docs explicitly want, whereas Node's native type-stripping is newer and has limitations. Since gbrain itself runs on Bun, using it for the importer scripts keeps things consistent and avoids friction if the project evolves. The dependency surface is minimal here—no native modules—so Node's ecosystem advantage doesn't really apply. Since runtime choice falls under infrastructure decisions, I should give a clear recommendation. I'll structure this tightly: what each runtime is, the three or four differences that actually matter for these scripts, then tie the recommendation back to what the doc already suggests.

Node's the established choice with maximum library compatibility, though TypeScript support is still catching up without extra tooling like `tsx`. Bun is the newer, faster alternative built for speed—instant TypeScript execution, a quicker package manager, and everything bundled together—but its Node API coverage isn't complete yet, and gaps tend to surface with native modules and certain edge cases. For this particular job—

TypeScript import scripts with no build step, parsing JSON/JSONL, and writing markdown locally—Bun's the better fit: it's designed exactly for zero-build TypeScript, gbrain itself runs on Bun and expects it as the runtime, and the dependencies here are minimal enough that Node's broader compatibility doesn't matter. The plain "but" qualifier isn't the foil pattern the linter targets—that's specifically "not X, but Y" constructions. I'll keep it but tighten the phrasing where I can. For instance, "coverage is high but short of 100%" becomes "covers most of Node's API; the gap shows up mainly with native modules and a few edge APIs"—cleaner without the negation. Same with "Node can do it now but with caveats"; I'll rephrase that to lead with the capability and let the caveats follow naturally.

Scanning through for any "rather than," "instead of," or "it's not X, it's Y" patterns—none found. Good. I should also double-check the Bun version requirement; the docs specify Bun ≥ 1.3.10, so I'll cite that directly.

On Node's native TypeScript type stripping: it landed experimentally around v22.6 with the `--experimental-strip-types` flag, and by mid-2026 it's likely more mature. I'll hedge appropriately—say it's available in recent versions but note the real caveat that type-stripping isn't the same as type-checking, and certain TS features like enums and namespaces still need extra handling. That's a stable, accurate limitation of the approach.

I don't need an image search here—this is a technical runtime comparison with no visual component. The response length feels right: substantive and decision-focused without padding. I'm skipping the pleasantries and leading with the actual answer, then wrapping up cleanly. Ready to finalize.Both run JavaScript and TypeScript outside the browser. What separates them for these scripts:

**Node** — the original runtime (2009), built on V8, the engine every library targets. Maximum ecosystem compatibility, battle-tested, the safe default. Default package manager is npm, with comparatively slow installs. It runs JavaScript directly; recent versions strip TypeScript types natively, though that path is newer and partial (enums and a few TS features need extra handling), so the common move has been a helper like `tsx`.

**Bun** — newer runtime (2023), built on JavaScriptCore and written in Zig. Built for speed: fast startup, an install command much faster than npm, and it executes `.ts` files directly with zero build step or extra tooling. Ships a package manager, bundler, and test runner in one binary. It implements most of Node's API surface, so the large majority of npm packages work; the coverage gap shows up mainly with native modules and a few edge APIs. gbrain itself runs on Bun (≥1.3.10 per its docs).

For this specific job — TypeScript importer scripts, no build step, parsing JSON and JSONL, writing markdown, run locally — three things decide it:

1. **TS with no build step** is Bun's home turf, and §2 of your doc asks for exactly that. Node manages it now, with caveats you'd work around.
2. **gbrain runs on Bun.** Matching it means the conventions line up, and any Phase-3 `gbrain import` path assumes the same runtime.
3. **The dependency surface here is trivial** — file reads, JSON parse, string formatting. Node's compatibility advantage buys nothing when nothing exotic is in play.

Recommendation: **Bun.** It's your doc's lean, it fits the "TypeScript, no build step, fast local script" shape cleanly, and the main reason someone reaches for Node — broad native-module compatibility — is irrelevant to an import pipeline. Node remains a clean fallback if some dependency ever refuses to run under Bun, which is unlikely for this work.

Lock Bun and I'll write the skeleton + seed-graph prompt against it.

**human**

ok let's go with bun. I've set up a shell project file and opened it in vs code, ready to go

**assistant**

Andrew has set up Bun in VS Code and is ready to work. Following the established rules, I need to create Claude Code prompts for him to paste into the gbrain project rather than providing files directly. My next step is drafting the vault-skeleton and seed-graph Claude Code prompt now that Bun is configured.

The prompt needs to create the directory structure with all ten numbered folders plus scripts and CLAUDE.md at the root, set up the four taxonomy files in 09-meta (taxonomy.md, edge-vocab.md, enrichment-rules.md, import-log.md), and populate the seed graph with entity stubs across projects, people, companies, decisions, and concepts as specified in the documentation.

Each entity file follows a YAML frontmatter schema defining type, status, confidence, timestamps, and source attribution, with a one-line definition in the body and wikilinks throughout. Enrichment tiers are based on mention count: stub for single mentions, moderate for three or more, and full for eight or more mentions or direct working sessions. The edge vocabulary table maps relationship types between entities. I've got the full edge vocabulary now. For the implementation, I need to use the actual project path at `~/projects/gbrain/` — Andrew confirmed he has the shell project ready in VS Code, so that's the location I'll work with.

The key question is whether to write a Bun script that generates the skeleton and seed graph, or just have Claude Code create the files directly. Since the project's purpose is architecture and generating prompts for Claude Code rather than raw files, I should focus on crafting the prompt itself that Andrew can paste in.

Given that the skeleton and seed files are static markdown, having Claude Code create them directly through its file tools is simpler than building a generator script. The simplicity principle applies here — infrastructure should only exist when there's a concrete need, and a one-time script for skeleton creation doesn't justify that overhead.

The prompt should instruct Claude Code to create the directories and markdown files directly, and include a verification step to ensure the tree structure matches the spec, frontmatter parses correctly, and wikilinks resolve properly. The `[[Andrew]]` wikilink in the edges creates a potential broken reference if Andrew doesn't have a seed file, so I need to decide whether to create one or flag it as an open question — since Andrew is the owner rather than a collaborator, I'll leave it out to match the seed graph exactly and note this as a micro-decision to revisit. efit from a self-node since everything connects back to you, but the doc explicitly leaves it out. I'll stick with that decision for now and just flag the question. For the frontmatter, I'm using today's date (2026-06-22) for both created and updated. On status and confidence, these seed entities have substantial detail from Andrew's existing context, so they're more than bare stubs—but the doc says to create them as files first and enrich them through sessions, so I need to calibrate the initial status accordingly.

The right approach is to mark seed entities as `stub` or `moderate` based on what the doc actually provides, with confidence set to `med` where the facts are solid. I'll source everything back to the seed doc itself, treating these as starting points that will naturally enrich as the corpus grows. I'm settling on a consistent approach: seed entities get `status: stub`, `confidence: med`, and `source` pointing to the project instructions doc with facts cited inline. Now I need to figure out where GBRAIN_PROJECT.md actually lives in the vault—whether it's at the repo root or in the 09-meta folder. CLAUDE.md should be a simple pointer directing users to read GBRAIN_PROJECT.md and the 09-meta folder before working in the repo. For the four 09-meta files, I'm laying out taxonomy.md with the entity types and enrichment thresholds, edge-vocab.md with the edge definitions, enrichment-rules.md with the tiered escalation logic,  and import-log.md as a blank template ready to log extraction results. At the end of the setup prompt, I'll add a verification step that checks the directory structure exists and validates the YAML frontmatter in the seed files.

For the verification itself, rather than running a script, I'll give Claude Code a concrete checklist: count all created .md files (expecting 22 entity/meta files plus CLAUDE.md), confirm every wikilink in the seed files points to an actual file, and report any broken references. This keeps it simple and one-time, aligning with the principle of shipping multi-file changes with a validation step.

On the git side, the doc emphasizes committing after each pass, so I'll have Claude Code stage the changes and propose a commit message like "Phase 1: vault skeleton + seed graph," but leave the actual commit for Andrew to approve rather than executing it automatically.

I also need to account for whether the repo is already initialized — the prompt should check and run `git init` if needed, since the doc assumes git is in place.

For delivery, I'm building a self-contained prompt block that Andrew can paste directly into Claude Code, bundling the structure, seed entities with their facts, the frontmatter schema, and all the metadata needed to execute the ingestion phase. I need to be careful not to use foil constructions in the prompt itself—the seed entity definitions should be stated positively and directly. Rather than embedding all 22 file bodies inline, I'll structure the prompt to give Claude Code the directory manifest, the frontmatter schema, concise one-line definitions for each seed entity with their sourced facts, the four meta-files, and then point to GBRAIN_PROJECT.md sections 3–7 for the detailed specifications, keeping the prompt itself lean and verifiable. Now I'm laying out the directory structure for the vault—creating the numbered folders for inbox, sessions, projects, people, companies, concepts, sources, decisions, writing, and meta, plus a scripts folder. I'll initialize git if needed, then add a root CLAUDE.md file as a quick reference pointer to the project spec.

For every entity file, I'm establishing a consistent frontmatter schema with YAML metadata, followed by a one-line definition and type-appropriate sections, with inline source tags for factual claims and wikilinks for named entities. The voice should be direct and positive—no foil constructions like "not X but Y" or "rather than," which is a hard constraint here.

I'm setting up four files in the 09-meta directory to capture the taxonomy, edge vocabulary, and enrichment rules that govern how entities relate and evolve. Now I'm populating the seed graph with stub files for each entity, setting their status to stub with medium confidence, sourcing them from the project, and including the known facts as body content with inline source tags. I'm creating wikilinks between related entities like the three projects—Orpheus (an open-source job-search engine with MCP architecture deployed on Railway), first-agent (a production lead-gen and art-commissioning intelligence system for Tre Borden across multiple cities with an extensive test suite), and charlie (a multi-agent intelligence and decision-support system). Spencer Williams authored the 2019 "Predictive Contracting" paper and has an open collaboration thread on the mrkt project; John Jost from NYU co-authored a 2020 PLOS ONE paper. I'm also tracking Andrew's company roles: Trace Machina (sole ops/legal/finance lead, backed by Sequoia and Samsung Next), EeroQ (former Special Counsel and Chief of Staff in quantum computing), AGS Law PLLC (co-founded outside general counsel practice), and Audience Haus (current fractional Chief of Staff).

I'm organizing my source retrieval strategy with a live/deferred-technical/deferred-scope classification, prioritizing local vault queries before external calls, and implementing tiered enrichment that escalates from stub to full based on mention frequency. I also documented a moderate-status incident from April 2026 where Orpheus had relevance failures—the corrective approach emphasizes profile-driven source selection and avoiding hardcoded rosters.

Now I need to verify the vault structure before declaring it complete: print the directory tree, count the markdown files created, validate all YAML frontmatter across entity files, and flag any broken wikilinks. I'll hold off on committing until showing the manifest for review. I'm checking my voice discipline across the seed one-liners and making sure I haven't slipped into negative directives or broken rules. The credential hygiene looks clean since no keys are in the skeleton itself. Now I'm drafting the intro prose to frame the whole approach concisely.

I'll introduce the Phase 1 step-1 prompt that sets up the vault skeleton and metadata conventions, then paste the code block that creates the files and pauses for review before committing. After that, I want to add a quick note flagging the one micro-decision that'll come up: whether to create a self-node for Andrew or leave it out as I've done to match the existing conventions. I'm also double-checking whether GBRAIN_PROJECT.md actually lives in the repo itself or only in the Claude project context. I should add a precondition step telling Andrew to save GBRAIN_PROJECT.md into the repo root before running the prompt, so he doesn't hit the guard clause and get stopped. The prompt already checks if it's missing, but being explicit upfront improves the experience. I'm also reconsidering how to format source citations in the docs — the example shows a wikilink format with a date-based reference. I'm settling on the filename "2026-04-11 Orpheus relevance failure & corrective actions.md" since Obsidian handles special characters fine, though I'll use "and" instead of "&" to avoid potential shell or link issues. Now I'm checking the cross-links in the related documents, particularly verifying that "Predictive contracting.md" properly links to the relevant concepts.

I've confirmed all the cross-references are valid — Spencer Williams, Tre Borden, Liz Varner, and Orpheus all exist as linked files with no broken references. I'm tallying up the total file count: 4 meta files, 5 projects, 4 people, 4 companies, 4 concepts, and 1 decision file, plus CLAUDE.md, which gives me 23 markdown files total.

Now I'm finalizing the response structure — keeping the intro brief, presenting the prompt as an inline code block for Andrew to copy into Claude Code, and adding a couple of lines about what to expect plus the note about the GBRAIN_PROJECT.md placement requirement upfront. I'll wrap the entire prompt in a single code fence and write the YAML schema as plain indented lines inside it, avoiding any nested backticks that would break the rendering. I'll ground these files in the project documentation and my summary, then write the final answer without any unnecessary framing.Bun it is.

One precondition before you paste: drop `GBRAIN_PROJECT.md` into the repo root. It's the spec this prompt reads, the target every source citation points to, and what `CLAUDE.md` will load on future sessions. The prompt guards for it, but placing it first saves a round-trip.

Here's the Phase 1 / step-1 prompt — vault skeleton, `09-meta` conventions, seed graph. Paste into Claude Code from `~/projects/gbrain/`. It writes files only, verifies, and stops for your review before any commit.

```
We're building Andrew's personal gbrain vault. The spec is GBRAIN_PROJECT.md at the repo root — read it first. If it isn't there, stop and tell me. This is Phase 1, step 1: vault skeleton + 09-meta conventions + seed-graph stubs. No importers yet. Runtime Bun, markdown only, no database, no build step.

1. DIRECTORY SKELETON (idempotent — skip any that exist), at repo root:
   00-inbox/ 01-sessions/ 02-projects/ 03-people/ 04-companies/ 05-concepts/ 06-sources/ 07-decisions/ 08-writing/ 09-meta/ scripts/
   If this isn't a git repo yet, run `git init`.

2. ROOT CLAUDE.md — one-line pointer:
   "Before working in this repo, read GBRAIN_PROJECT.md and the conventions in 09-meta/ (taxonomy, edge-vocab, enrichment-rules)."

3. ENTITY FRONTMATTER SCHEMA — open every entity file with:
   ---
   type: person | company | project | concept | source | writing | decision | session | note
   subtype: ""
   status: stub | moderate | full | archived
   confidence: low | med | high
   created: 2026-06-22
   updated: 2026-06-22
   source: ""
   aliases: []
   tags: []
   ---
   Body: one-line definition first; sections appropriate to type; every factual claim carries an inline source tag like [from: [[GBRAIN_PROJECT]]]; wikilink every named entity that has a file.
   VOICE LINT (hard rule): state positive claims directly. Never use the foil construction — "not X but Y", "it's not X, it's Y", trailing "…, not X", "rather than", "instead of", "less about… more about". Run every file past this before writing it.

4. 09-meta FILES (author from GBRAIN_PROJECT.md §4–§5 plus this):
   - 09-meta/taxonomy.md — the 9 canonical types; the frontmatter schema above; status defs (stub=1 mention, moderate=3+, full=8+ or a direct working session, archived); confidence defs.
   - 09-meta/edge-vocab.md — this table:
     built (person→project); depends_on (project→project/concept); client_of (person/company→person); collaborator_on (person→project); employed_at (person→company); authored (person→writing/source); decided_in (decision→session); references (any→source); supersedes (decision→decision). Each row: edge | from→to | inferred-when. Edges come from wikilinks via string rules, zero LLM calls.
   - 09-meta/enrichment-rules.md — tiered escalation by inbound-link count (stub→moderate→full); auto-escalate when link count crosses a threshold; never pre-fill a full profile from thin evidence.
   - 09-meta/import-log.md — header only; the extraction pass appends per-run entries: date, files added, stubs created, links inferred, skips + reason + unblock path.

5. SEED GRAPH — one stub file per entity below. All: status: stub, confidence: med, source: "[[GBRAIN_PROJECT]] §7", created/updated 2026-06-22. Put the listed facts in the body with inline [from: [[GBRAIN_PROJECT]]] tags. Wikilink cross-references between seed entities. Invent nothing beyond what's listed.

   02-projects/
   - Orpheus — open-source job-search engine; MCP architecture; Railway deploy; SQLite on a volume at /data; two-tier corpus (Adzuna + 80,000 Hours live). Built by Andrew.
   - first-agent — production lead-gen + multi-city art-commissioning intelligence for [[Tre Borden]] (LA/NYC/SF); 275-test suite.
   - charlie — multi-agent intelligence / decision-support for [[Liz Varner]]; source-traceable reasoning, discrepancy detection, confidence scoring.
   - mrkt — empirical pipeline modeling M&A deal-term negotiability across 152 MAUD agreements; 99.7% extraction, 91–94% expert-label agreement; thesis maps to [[Spencer Williams]]'s predictive contracting.
   - NLSAFE — Rust verifiable-build infrastructure for AI safety; Apache 2.0; 3 subprojects.

   03-people/
   - Tre Borden — client_of Andrew; first-agent.
   - Liz Varner — entertainment-strategy exec; client_of Andrew; charlie.
   - Spencer Williams — Professor of Law, California Western; authored 2019 "Predictive Contracting"; open mrkt collaboration thread.
   - John Jost — NYU; co-author, 2020 PLOS ONE paper.

   04-companies/
   - Trace Machina — AI safety infra; backers Sequoia, Samsung Next, Wellington; Andrew sole ops/legal/finance lead.
   - EeroQ — quantum computing; Andrew was Special Counsel → Chief of Staff.
   - AGS Law PLLC — co-founded; outside GC to 100+ startups.
   - Audience Haus — strategy/GTM agency; Andrew fractional Chief of Staff (current).

   05-concepts/
   - Corpus governance — live / deferred-technical / deferred-scope classification of sources.
   - Brain-first retrieval — query the local vault before any external call; write results back.
   - Predictive contracting — the mrkt thesis; links [[mrkt]], [[Spencer Williams]].
   - Tiered enrichment — stub → moderate → full escalation by mention/link count.

   07-decisions/ (date-prefixed filename)
   - 2026-04-11 Orpheus relevance failure and corrective actions — status: moderate. Corrective calls: profile-driven source selection; no hardcoded ATS rosters; own your debugging; simplicity over scaffolding. Links [[Orpheus]].

   OWNERSHIP NOTE: no people-file exists for Andrew in this seed set. Write Andrew's ownership in prose, no [[Andrew]] wikilink, so nothing breaks. If a self-node is wanted, ask before creating it.

6. VERIFY, then stop:
   - Print the tree to depth 1 and a count of .md files. Expected: 22 convention+entity files plus root CLAUDE.md.
   - Confirm every entity file's YAML parses (type/status/confidence present).
   - Report any [[wikilink]] whose target file is missing. Expected: zero.
   - Do not commit. Show me the manifest and any broken links, then wait.
   On my approval: git add -A && git commit -m "Phase 1: vault skeleton, 09-meta conventions, seed graph"
```

It surfaces one micro-decision: a self-node for Andrew. I left it out to match §7 exactly; if you want every project and engagement to link back to you, say so and the importers will lean on it later.

Once this lands clean and you've eyeballed a few stub files in Obsidian, the next prompt is the Source A export parser — verified on one real record, schema read from an actual export before any field names get fixed.

**human**

CC won't open a CLI in VS Code

**assistant**

Andrew is reporting that Claude Code won't open a CLI in VS Code, so I need to look into this product support issue. Since this involves specific details about Claude Code's VS Code integration—installation, platform support, configuration—I should check my product knowledge to make sure I'm giving accurate, current information rather than relying on potentially outdated training data. I need to figure out what Andrew means by "CC won't open a CLI in VS Code"—whether the extension isn't launching its panel, or the `claude` command itself isn't found in the terminal. The quickest workaround is to skip the extension entirely and just run `claude` directly in VS Code's built-in terminal from his project directory, which gets him unblocked immediately.
```
This block is not supported on your current device yet.
```

I need to look up the Claude Code documentation for VS Code integration details to provide accurate guidance on the setup process.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

The VS Code extension bundles its own private copy of the CLI for the chat panel, but it doesn't add `claude` to the shell PATH — so typing `claude` in the integrated terminal would fail with "command not found" unless the standalone CLI is separately installed. That's likely what's happening if CC can't open a CLI in VS Code.

For the workflow he needs — pasting a long prompt and having the tool write files to ~/projects/gbrain — the terminal `claude` command is the most direct path. I should give him the diagnosis and the fix: confirm the gap by running `claude --version` in the integrated terminal, then walk through installing the standalone CLI. I should go with the npm global install since it's well-documented and reliable, then mention that the native installer is available in the docs if he prefers not to use npm. The key point is making sure the CLI ends up on VS Code's PATH so the extension can find it.

For the quickest path forward, I'll suggest opening the integrated terminal and running `claude` directly — if it's not found, that's the signal to install. I also need to figure out whether Andrew's on Mac or Windows to give the right shell context advice.

**human**

All three are inside backtick code spans — documentation examples, not live wikilinks. Obsidian does not resolve links inside backticks. Zero actual entity wikilinks are broken.
Manifest
Directories (11): 00-inbox/ 01-sessions/ 02-projects/ 03-people/ 04-companies/ 05-concepts/ 06-sources/ 07-decisions/ 08-writing/ 09-meta/ scripts/
Files (24 total .md):
#	File	type	status	confidence
1	CLAUDE.md	— (pointer)	—	—
2	GBRAIN_PROJECT.md	— (spec)	—	—
3	09-meta/taxonomy.md	convention	—	—
4	09-meta/edge-vocab.md	convention	—	—
5	09-meta/enrichment-rules.md	convention	—	—
6	09-meta/import-log.md	convention	—	—
7	02-projects/Orpheus.md	project	stub	med
8	02-projects/first-agent.md	project	stub	med
9	02-projects/charlie.md	project	stub	med
10	02-projects/mrkt.md	project	stub	med
11	02-projects/NLSAFE.md	project	stub	med
12	03-people/Tre Borden.md	person	stub	med
13	03-people/Liz Varner.md	person	stub	med
14	03-people/Spencer Williams.md	person	stub	med
15	03-people/John Jost.md	person	stub	med
16	04-companies/Trace Machina.md	company	stub	med
17	04-companies/EeroQ.md	company	stub	med
18	04-companies/AGS Law PLLC.md	company	stub	med
19	04-companies/Audience Haus.md	company	stub	med
20	05-concepts/Corpus governance.md	concept	stub	med
21	05-concepts/Brain-first retrieval.md	concept	stub	med
22	05-concepts/Predictive contracting.md	concept	stub	med
23	05-concepts/Tiered enrichment.md	concept	stub	med
24	07-decisions/2026-04-11 Orpheus relevance failure and corrective actions.md	decision	moderate	med
Frontmatter validation: 18/18 entity files pass (type + status + confidence present). 4 meta convention files carry no frontmatter — correct, they are reference docs.
Broken wikilinks: 0. Three flagged targets ([[session-file]] ×2, [[wikilink]] ×1`) are inside backtick code spans in meta docs — Obsidian treats these as code, not links.
Count note: The prompt expected "22 convention+entity files plus root CLAUDE.md" = 23. We have 23 new files (22 + CLAUDE.md); GBRAIN_PROJECT.md was pre-existing, bringing the on-disk total to 24.
Ready for your approval to commit:
git add -A && git commit -m "Phase 1: vault skeleton, 09-meta conventions, seed graph"

**assistant**

Andrew's brought back Claude Code's verification output showing the manifest, frontmatter validation, link checks, and reconciliation counts. He wants approval to commit, so I need to actually audit this against the spec and the prompt I wrote to make sure it's correct before signing off.

Checking the directory structure: 11 directories as specified (inbox through meta plus scripts). For the 24 markdown files, I'm verifying the entity counts match what I requested — 5 projects including charlie with the always-include flag honored, 4 people, 4 companies, 4 concepts, 1 decision with moderate status as I specified, plus the meta files and core documentation. The entity file breakdown adds up correctly to 18 entities plus 6 supporting files.

Now I'm validating the frontmatter across all entity files — all 18 have proper YAML frontmatter with the required fields. The meta files in 09-meta don't carry frontmatter since they're reference documentation rather than entities themselves, which aligns with the schema treating them as conventions rather than typed entities.

I'm thinking ahead to the extraction phase and whether missing frontmatter on meta files could cause issues with future tooling that globs all markdown files. It's a potential concern if scripts expect consistent frontmatter, but that's a Phase 2 problem — any extraction logic should either skip the meta directory or handle missing frontmatter gracefully. Not a blocker for now.

Moving on to check for broken wikilinks — so far I'm finding zero actual breaks, though a few targets are flagged. The extractor will need to be careful not to treat wikilinks inside code spans as real edges — a naive regex would pick them up as phantom links even though Obsidian ignores them. This is a known infrastructure concern I should document now rather than discover during implementation. Let me also verify the file count: 4 meta files plus 18 entity files should give me 22 total plus the root CLAUDE.md. and it's not causing any real issues. I should approve this commit—the work checks out against the spec, I've done my verification per the requirements, and the next step is clear: get the Source A importer running. The voice lint check (foil construction) and inline citations weren't explicitly validated in my verification step, only the core fields. These are minimal stub files though, so the risk of problematic phrasing is low and easily reversible in git. I could flag it for a quick visual pass in Obsidian before building on top of these, but I don't think it warrants blocking the commit.

Actually, I should keep this clean and direct—Andrew wants a straightforward go/no-go. I'll confirm what I verified, give approval, and flag the one real forward-looking issue: the extractor needs to handle code spans in wikilinks properly. Before diving into the Source A importer, I need to confirm Andrew has the Claude.ai export downloaded—that's a prerequisite. The next step should ask him to trigger the export from his account settings (Settings → Privacy → Export data, which Anthropic emails as a link), then read the actual schema from one real record before writing the parser blind.

I'll approve the commit, flag the extractor code-span constraint, and tell him to kick off the export now so it arrives by the time we're ready to build the importer. I should also consider whether to log this skeleton creation in import-log.md as Phase 1 completion—the extraction pass hasn't started yet, but we've got the foundation in place. The file count is now 24 with the pre-existing project file included. Those wikilink examples in backticks are safe in Obsidian but will trip up a naive regex parser later, so when I build the entity extraction code, I need to strip fenced and inline code blocks before matching wikilinks to avoid creating phantom graph edges.

Before moving to the Source A importer, there are two manual checks worth doing in Obsidian: scanning the stubs for any inconsistent voice patterns and verifying the inline source tags are formatted correctly. The risk is low on these short files, and git makes corrections easy. The real next step is triggering the Claude.ai data export now since it takes time to arrive—once I have the conversations.json file, the first task will be probing the schema to understand the record structure before writing the actual parser. The sync engine choice between Obsidian Sync and iCloud is a decision Andrew needs to make before syncing across devices, but it's not blocking the current work on Source A, so I'll hold off flagging it for now to keep things focused.

The privacy scope question — whether to exclude certain conversations during import — does matter for the full import run, though not for the schema probe or single-record test. I'll bring that into the Source A phase when we're ready for the complete import.

I need to keep this response tight and direct, cutting out reassurance and focusing on what's actually needed: approval, the commit, the extractor constraint flag, and starting the export.Verified against the spec and the prompt. Clean.

11 directories, 18 entity files (5 projects including charlie, 4 people, 4 companies, 4 concepts, 1 decision), 4 meta docs, CLAUDE.md. Frontmatter passes on all 18. Counts reconcile: 23 new files + GBRAIN_PROJECT.md pre-existing = 24 on disk. The code-span call is right — Obsidian ignores `[[...]]` inside backticks, so those three are documentation and live broken links are zero.

Commit it:

```
git add -A && git commit -m "Phase 1: vault skeleton, 09-meta conventions, seed graph"
```

One thing to log now, because it bites later: those `[[session-file]]` and `[[wikilink]]` examples are inert in Obsidian, but a naive regex wikilink parser will still match them. When we write `extract-entities.ts`, its link parser has to strip fenced and inline code before matching, or the meta docs inject phantom edges into the graph. I'll build that in — flagging it so it's a known constraint and not a surprise.

Two things the automated check couldn't see, worth a 10-second eyeball when you open the vault in Obsidian: the voice lint (any "not X, it's Y" phrasing that slipped into the stubs) and the inline `[from: [[GBRAIN_PROJECT]]]` source tags. Low risk on stubs this terse, and git makes any fix trivial.

Next up is Source A, the Claude.ai export importer — and it has a lead time you can start now. Trigger the export so it's in hand before we write the parser: **Settings → Privacy → Export data**. Anthropic emails a download link and the archive takes a while to arrive. Once you have `conversations.json`, the first Claude Code task is a schema probe that reads one real record and prints its shape; the parser comes after, written against the actual JSON (§6 — field names get read, never assumed).

Kick off the export, commit the skeleton, and tell me when the archive lands.
