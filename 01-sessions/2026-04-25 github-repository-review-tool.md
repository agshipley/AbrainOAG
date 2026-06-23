---
type: session
source: claude-export
uuid: 0d3db1ce-a1be-4309-a2b7-46eec7d4cdd1
title: "GitHub repository review tool"
created: 2026-04-25
updated: 2026-04-25
message_count: 12
status: stub
confidence: high
tags: []
---

# GitHub repository review tool

## Summary

**Conversation Overview**

The person is exploring building a tool to review public GitHub repositories, with an initial framing of competitive/market research and code quality analysis. As the conversation progressed, the core need clarified: the person wants a way to get substantive architectural reviews of their own repos (and others'), something that doesn't currently work well in their workflow. They noted that Claude Code has access within individual VS Code project instances but that this doesn't support strategic cross-project review.

Claude pushed back on the generic "repo review tool" framing and attempted to scope the problem, proposing a CLI pipeline involving file ingestion, architectural significance ranking, and structured LLM-driven output. The person corrected this direction by pointing out that a basic GitHub integration should already exist rather than requiring a custom build, prompting a pivot to surveying what's already available. Claude identified GitHub's official MCP server as the relevant foundation and confirmed that third-party tools cover only narrower use cases like diff review.

The conversation revealed that the person had already installed the GitHub connector in Claude.ai settings before Claude suggested doing so, which Claude missed — requiring a correction. Subsequent tool searches confirmed that despite the connector being installed at the account level, no GitHub tools were available in the active conversation. Claude diagnosed this as likely a per-conversation toggle issue rather than a missing installation, and recommended verifying that GitHub is enabled within the specific chat session. The conversation ended unresolved, with the connector issue still to be confirmed.

**Tool Knowledge**

Claude used `tool_search` three times with queries for "github repository code search read file," "github," and "repository pull request issue commit" — none returned GitHub tools, only Google Drive tools. This confirms that even with a GitHub connector installed at the account level in Claude.ai, it does not automatically surface in a given conversation's tool runtime. The working hypothesis is that connectors require a per-conversation activation toggle in the message composer, separate from the global Settings → Connectors installation. Future instances should check tool availability via `tool_search` before assuming a connector is active, and should not re-suggest installation steps if the person has already confirmed the connector is installed.

## Transcript

**human**

I need to build a tool that is capable of reviewing public repos on github

**assistant**

Before I start sketching, two clarifying questions — answers shape the architecture significantly.
```
This block is not supported on your current device yet.
```

**human**

Q: What's the primary use case?
A: Competitive/market research (analyzing what others are building)

Q: What does 'review' mean to you here?
A: Code quality / architecture analysis

Q: Where does this fit in the portfolio?
A: Just exploring - no commitment yet

**assistant**

Good — that narrows it cleanly. Competitive research + architecture analysis + no commitment means I should pressure-test the idea before drafting any build plan.

**The honest read on this**

Competitive market research via repo analysis is a real need, but "tool that reviews public repos" is the kind of scope that absorbs unlimited engineering time and produces a generic SaaS clone. Before you spend a session on it, three questions worth answering:

**1. What decision does this output support?**

"Analyze a repo's architecture" is a capability, not a use case. The use cases that justify building are things like:
- *"I'm evaluating whether to compete with X — show me how mature their codebase actually is vs. their marketing claims"*
- *"I want to know what AI infra startups are actually shipping (not what their landing pages say)"*
- *"Given a list of YC AI companies, rank them by engineering velocity and architectural sophistication"*

Each of those implies a different tool. The first is one-off and shallow. The second is a monitoring system. The third is a batch ranker. Pick one and the design falls out; stay generic and you build all three badly.

**2. What's the unfair angle?**

GitHub already exposes most of what's interesting via API: commit cadence, contributor count, language breakdown, dependency graph, issue velocity. Tools like OSS Insight and Runa Capital's analytics already do the surface layer. The interesting differentiation is one of:
- **LLM-driven architectural read** — point Claude at a repo and get a structured assessment (what pattern is this, what are the load-bearing files, what's the actual complexity vs. apparent complexity)
- **Comparison across N repos** — pick a category, ingest 20 repos, surface architectural patterns and outliers
- **Claim verification** — startup says "we built X with Y architecture"; tool checks the repo and confirms or contradicts

The LLM-driven read is the one that's genuinely hard to do without an LLM and where you have a real edge given the rest of your portfolio. The other two are derivative.

**3. Does this belong in the portfolio?**

Your tier-1 repos already tell a story: [[Orpheus]] (self-search), [[NLSAFE]] (AI safety infra), [[first-agent]] (production lead-gen), [[mrkt]] (transactional law moneyball), [[charlie]]. A repo-analysis tool fits *only* if it's framed as something coherent with the rest — e.g., "[[mrkt]] for open-source projects" (empirical analysis of what's actually being built in a category) or as a sub-tool inside [[mrkt]]/[[Orpheus]].

Standalone, it risks looking like a sixth thing in a portfolio that already shows range. Folded into [[mrkt]] as "competitive intelligence on technical claims," it's stronger.

---

**Before I sketch architecture, what's the actual job?** Two paths:

**Path A — Concrete use case first.** Tell me the specific decision or research question. I'll design the smallest tool that answers it. Probably a CLI or a script, not a web app. Ship in a session.

**Path B — Stay exploratory.** I push back harder on whether this should exist as its own thing, or sketch how it folds into [[mrkt]] as a competitive-intelligence module. No code yet.

Which?

**human**

I can't get you to review my own code. This is a build tool first

**assistant**

Got it. That's a real gap and a fair frame — you want a tool *you* can point at a repo (yours or anyone else's) and get a substantive architectural read back. The competitive-research framing was downstream; the actual job is "Claude can review repos."

Let me think about this honestly before sketching.

**Why this is harder than it sounds**

The naive version — `git clone, cat every file, send to Claude` — fails for any non-trivial repo. [[Orpheus]] alone is well past any single-context window. So the real engineering problem is:

1. **Selection** — which files matter? A repo has load-bearing files (the Conductor, the MCP server registration, the ranking algorithm) and noise (lockfiles, generated types, vendored deps, tests of trivial utilities). A useful tool ranks files by architectural significance and feeds Claude the top N.

2. **Structure first, contents second** — the directory tree, the package.json/pyproject/Cargo.toml, the README, and the entry points tell you 60% of what you need before reading a single function body. Cheap to extract, high signal.

3. **Question-driven reads** — "review this repo" is too vague to produce a useful output. "Is the MCP architecture in [[Orpheus]] actually doing what the README claims" or "where is the ranking algorithm and is `targetTitles` wired in" are tractable. The tool should accept a question, not just a URL.

4. **Output format** — a wall of prose is useless. Structured output (architecture summary, key files with line refs, concrete findings, open questions) is what you'd actually use.

**What I'd build**

A CLI tool. Python or Node, your call — Node keeps it consistent with [[Orpheus]], Python has better tree-sitter bindings if you want AST parsing later. I'd start Node.

```
claude-repo-review <github-url-or-local-path> [--question "..."] [--depth shallow|deep]
```

Pipeline:

1. **Ingest** — clone to temp dir if URL, else use local path. Respect .gitignore.
2. **Map** — walk the tree, build a structured representation: directories, file sizes, languages, entry points (from package.json `main`/`scripts`, pyproject, etc.).
3. **Rank** — score files by architectural significance. Heuristics: referenced by entry points, imported frequently, large but not generated, named with words like "server"/"conductor"/"router"/"main"/"index". Drop lockfiles, node_modules, dist/, .next/, generated types.
4. **Read** — pull the top N files (configurable, defaults to fitting in ~150k tokens) plus README, top-level config files, and the directory tree.
5. **Query** — single Claude call with the assembled context and the user's question (or a default "produce an architectural review" prompt). Structured output: summary, architecture, key files, findings, questions.
6. **Render** — markdown to stdout, optionally write to file.

That's the v0. It's a few hundred lines, ships in a session, and it actually works on [[Orpheus]] or any other repo you point it at.

**The tier-1 portfolio version**

If this is going to be a tier-1 repo and not a script, two things matter beyond v0:

- **It runs against itself in CI.** Every push, the tool reviews the repo it lives in and posts the output. That's the demo — "this tool's own README is generated by running the tool on itself." That's the kind of thing that makes a portfolio repo memorable.
- **It handles the long-tail repos.** Monorepos, polyglot repos, repos where the interesting code is buried four directories deep. The ranking heuristic is where the actual engineering goes.

**What I want to flag before we build**

- **API cost exposure.** A deep review of a large repo is a 100k-token call. At Claude Opus pricing that's real money per run. If this becomes a public tool with no auth (like [[Orpheus]]), you'll want a rate limiter and a cost ceiling from day one. Same lesson as [[Orpheus]].
- **Auth for private repos.** v0 should be public-only. Adding GitHub OAuth is a separate scope.
- **Local vs. cloned.** Running against a local path you already have is cheaper, faster, and avoids the clone step entirely. I'd build local-path support first and add URL support second.
- **The "question" parameter is the whole product.** Without it, you've built a generic summarizer. With it, you've built something that answers "is `targetTitles` wired into the ranker in [[Orpheus]]" in 30 seconds. Lead with the question.

---

Two decisions before I write the Claude Code prompt:

**1. Standalone repo or fold into an existing one?** My read: standalone, named something concrete (`recon`, `repogrok`, `cartograph` — your call). It's a real tool, not a sub-feature.

**2. v0 scope — local path only, or local + URL?** I'd ship local-only first. You can run it on `~/projects/Orpheus/` tomorrow morning and get value immediately. URL support is a half-day add later.

Which way on each?

**human**

it seems a basic github integration should already exist. let's continue to consider options here. What is currently available through Claude, what is available via open source. As a starting point, we have I believe reviewed the readme for some of my repos, but I don't believe we've actually looked at the code. CC obviously has access within each projects vs code instance but that doesn't work for looking strategically across projects

**assistant**

Right, fair pushback. Let me actually check what exists rather than guess.
```
This block is not supported on your current device yet.
```

Right. Here's the actual landscape — and the answer to your question is: there's already a solid foundation, you just haven't been using it.

**What exists right now**

**1. GitHub's official MCP server.** GitHub maintains `github/github-mcp-server` — production-grade, OAuth, the whole API surface. A compatible MCP host with remote server support (VS Code 1.101+, Claude Desktop, Cursor, Windsurf, etc.) can install it with one click. It exposes code search, commit history, PR review, repository operations, and Dependabot/security findings as tools. This is the load-bearing piece. Adding it to *this* Claude (the chat app you're using right now) means I can read any file in any of your public repos directly in this conversation, the same way I read your project files. No build required.

**2. Claude Code already has it locally.** When you run Claude Code in `~/projects/Orpheus/`, it reads any file in that repo. That's the "within each project's VS Code instance" thing you mentioned. Cross-project review is a different problem — that needs the MCP server above, not Claude Code.

**3. Third-party code-review MCPs exist but are narrow.** `praneybehl/code-review-mcp` reviews git diffs (staged changes, branch deltas) — not whole repos. Useful for PR review, wrong shape for what you want.

**The actual gap**

The GitHub MCP server gives any Claude surface raw access to repos. It does *not* give you a strategic, opinionated, cross-repo architectural read. That's still a thing you'd build on top.

So the question splits in two:

**Question A — short term: do you want me to actually look at your code in this conversation?** If yes, you connect the GitHub MCP server to Claude.ai (Settings → Connectors → add GitHub) and from then on I can read [[NLSAFE]], [[first-agent]], [[mrkt]], [[charlie]], [[Orpheus]] directly. No tool to build. This is a 5-minute setup. The reason I've only ever read your READMEs is that I literally can't see anything else without this connector.

**Question B — longer term: is there a tool worth building on top?** This is where it gets interesting. Possibilities, ranked by how distinct they'd be from what already exists:

- **Cross-repo strategic review.** "Look at all five tier-1 repos and tell me where the architectural patterns are inconsistent, where the documentation lies about what the code does, where the technical debt is concentrated." Not a thing any existing tool does. Genuinely useful for a portfolio.
- **Claim verification for [[mrkt]].** When [[mrkt]] evaluates a deal or a company, point it at their public repos and check whether their technical claims match reality. This is the M&A diligence angle and it folds cleanly into [[mrkt]]'s existing positioning.
- **Repo-as-portfolio summarizer.** Generate the "what these repos collectively demonstrate" narrative from the code itself. Less useful — you can write that yourself.

The first and second are real. The first is the more direct answer to "I want to be able to look across my projects strategically."

**My recommendation**

Two-step play:

1. **This week, no build.** Add the GitHub MCP server to Claude.ai. The next time we talk about [[Orpheus]] or [[NLSAFE]], I can actually read the code. This alone closes the gap you raised.
2. **Later, if it earns its place.** Build a cross-repo analyzer as a small CLI (or as a [[mrkt]] module) that does the strategic read across N repos. The GitHub MCP gives you the file access for free; what you'd build is the prompt scaffolding, the file ranking heuristic, and the structured-output contract.

The mistake would be to skip step 1 and build step 2 — you'd reinvent the file-fetching layer GitHub already maintains, and you still wouldn't be able to use it inside this conversation.

Want me to walk you through the connector setup, or dig deeper on the cross-repo tool design?

**human**

looks like the highub connector is already installed

**assistant**

Good — let me confirm what's actually wired up before we go further.
```
This block is not supported on your current device yet.
```

Two things going on, and they're worth separating cleanly:

**1. The directory doesn't show GitHub as available here.** The connector registry I can see in this surface returns no GitHub entry — the registry shown is mostly other tools (Figma, Bitly, Cloudflare, etc.). That doesn't mean it's not available account-wide; it means the GitHub remote MCP server isn't surfacing as an installable connector in this specific Claude.ai chat surface, and isn't currently exposed to me as a callable tool.

**2. What you may have installed.** A few possibilities, and they're not equivalent:

- **GitHub MCP server in Claude Code.** This is the most likely scenario — `claude mcp add github ...` configured locally in your terminal. That gives Claude *Code* access to GitHub. It does not extend to me, this Claude in the web chat. Different surface, different toolset.
- **GitHub MCP server in Claude Desktop.** Same story — it'd be wired into the desktop app via `claude_desktop_config.json`. Also not visible to me here.
- **GitHub MCP server in Claude.ai (web).** This is the one that would let me read your repos in this conversation. The official remote GitHub MCP server requires OAuth via a registered GitHub App, and as of the docs I just pulled, support varies by surface. If it's installed and connected at the account level, it should appear in my tool list — and it doesn't.

**How to check, definitively**

In this Claude.ai web app, go to **Settings → Connectors**. You'll see a list of what's actually wired into your account. If GitHub is there and shows "Connected," tell me — there may be a propagation issue or it may need to be enabled for this specific project. If it's not there, the connector you're thinking of is probably the Claude Code one, which is separate.

**What changes based on the answer**

- **If GitHub is connected here:** great, we'll get me reading your repos in this conversation directly. I'd start by pulling the file tree of [[NLSAFE]] or [[first-agent]] and giving you a real architectural read — the thing you've been asking for.
- **If it's only in Claude Code:** that's still the most useful place for it day-to-day, but it doesn't solve the cross-project strategic review problem you raised. For that, you either (a) connect GitHub at the Claude.ai account level so I can see code in conversations like this one, or (b) we build the small cross-repo CLI we discussed.
- **If it's not connected anywhere:** Claude.ai web is the highest-leverage place to add it given what you actually want to do.

Can you check Settings → Connectors and tell me what's listed?

**human**

I had already JUST looked at settings, and connectors, when I confirmed to you that the github extension was installed

**assistant**

You're right, I missed that. Apologies.

So the GitHub connector is already installed on this Claude. That means I should be able to read your repo code right now — and the fact that I haven't been doing it is the actual problem, not a missing tool.

Let me check what I actually have access to.
```
This block is not supported on your current device yet.
```

That returned only Google Drive tools. Let me search more specifically:
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Confirmed: I have Google Drive tools and that's it. No GitHub tools are available to me in this conversation, even though you've installed the connector at the account level.

That tells me one of two things is going on:

1. **The connector exists but isn't enabled for this specific chat.** Connectors in Claude.ai have a per-conversation toggle. You can install one globally and still need to enable it on the chat where you want it active. In the message composer, there's typically a tools/connectors button (paperclip or similar) — GitHub may need to be toggled on there.

2. **The connector is installed but in a state that didn't expose tools to this session.** Sometimes a re-auth or a fresh chat is what flips it on.

I'd bet on (1). The fact that it doesn't show up even after `tool_search` means the runtime doesn't have it loaded, regardless of what Settings → Connectors shows.

**What I'd do right now**

Open this chat's tools menu (the icon next to the message input — looks like a paperclip or a tool icon depending on the build) and confirm GitHub is toggled on for *this conversation*. If it is and it's still not surfacing, start a fresh chat and try again — connector state can be sticky to the session in which it was first authorized.

Once it shows up, the test is simple: ask me to read `agshipley/Orpheus/server/src/conductor.ts` (or whatever the actual file is). If I can fetch it, the integration works and we can do the strategic cross-repo review in this conversation. If I can't, it's a connector-auth problem and worth filing feedback.

I don't want to keep speculating about what I can do — easier to verify. Toggle it on and ask me to read one file. We'll know in 30 seconds whether the tool you want already exists.
