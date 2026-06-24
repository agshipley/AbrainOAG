---
type: session
source: claude-code
uuid: 5b79d9d9-4091-4f1f-93c7-8a9b103803d6
title: "Review codebase for seven-agent factory architecture"
project: "[[Orpheus]]"
cwd: "/Users/andrewshipley/projects/Orpheus"
created: 2026-05-27
updated: 2026-05-27
message_count: 22
status: stub
confidence: high
enriched: 2026-06-23
tags: []
---

# Review codebase for seven-agent factory architecture ([[Orpheus]])

## Summary

Reviewed the Orpheus codebase before installing a seven-agent feature factory. The user pasted a blog article describing the factory pattern; the session then executed three discrete tasks. First: fixed `afterDedup` in `conductor.ts` (line 225) from `rankedJobs.length` to `mergedJobs.length`, correcting a stat that was reporting the post-IC-filter count instead of the actual dedup count — 121/121 tests green. Second: clarified the `archimedes.config.yaml` risk (current data is LinkedIn-public; the real risk is future sensitive fields getting committed). Third: extracted eleven `.claude/` files from a local tar archive (seven agent definitions, two skills, one pre-commit hook, one README), installed the hook at `.git/hooks/pre-commit`, and committed as `c028e84`. Fourth: ran the Researcher subagent to diagnose search relevance failures, which identified three root causes: no location filter anywhere in the pipeline, no minimum score threshold on `/api/search`, and broad OR keyword matching at the agent level admitting any job where one keyword appears anywhere in a 500-word description.

## Transcript

**user**

we are going to build out a seven agent structure on top of this based on the following architecture. don't do anything, but review our existing code base to identify any issues:

How to Build a Software Factory with Claude Code That Ships Features While You Sleep
I thought I was using AI to code.
I was actually just typing faster.
Here is the difference — and the 7-agent system that changed everything.
Save this. It will save you months.
THE PROBLEM NOBODY TALKS ABOUT
The loop that feels productive but isn't:
→ Ask Claude to build a feature → It generates code → Something breaks → Paste the error back → It patches it → Something else breaks → Ask again
Day 1: this feels like magic.
Day 30: you're spending more time supervising AI than you used to spend writing code.
Same logic appears in 3 different places.
Claude forgot the convention you set up two weeks ago.
New features break old ones.
Tests are missing or shallow.
You wake up and realize: the AI isn't failing.
Your workflow is.
The real problem is structural.
When you type "build this feature" into Claude Code, you're asking one AI session to be:
→ Product analyst → Architect → Backend engineer → Frontend engineer → Test engineer → Code reviewer
All at once.
In the same messy conversation.
Wrong assumptions in the plan become wrong database models.
Wrong database models become wrong APIs.
Wrong APIs become wrong UIs.
By the time you notice, the mistake has spread everywhere.
This is called vibe coding.
And it has a hard ceiling.
THE SHIFT: FROM VIBE CODING TO A SOFTWARE FACTORY
What actually changes everything:
Real engineering teams don't work in one big conversation.
Different people own different jobs:
→ Someone clarifies the user problem → Someone thinks about architecture → Someone builds the API → Someone builds the UI → Someone thinks about edge cases → Someone reviews
When you collapse all of that into one AI session, mistakes compound silently.
The fix is to split the work across specialized agents.
Each agent gets: → One focused job → Its own clean context window → Only the tools it actually needs → Strict rules about what it cannot touch
The result: a software factory.
One developer + seven focused agents = a coordinated team.
Here are the seven agents that make it work.
THE 7 AGENTS
Agent 1: The Codebase Researcher
The biggest mistake developers make with AI?
Asking for code as the first move.
The AI accepts the prompt, makes guesses to fill the gaps, and starts generating.
That's when bad designs sneak in.
The Codebase Researcher fixes this.
Its only job: inspect the codebase and explain how things work — before a single line is written.
What it does: → Maps the relevant files and their roles → Documents existing patterns to follow → Finds similar features already built → Flags risks (timezone, multi-tenant, retry logic) → Lists what tests will need updating
What it cannot do: → Edit files (read-only access only) → Run any command that modifies state → Make assumptions — it asks instead
Tools: Read, Grep, Glob only.
The rule: explore before you build, every single time.
The Researcher runs first. Always.
Agent 2: The Story Writer
Most features fail not because the code was wrong.
But because the problem was never clearly defined.
The Story Writer turns a rough feature idea into a real user story before any technical decisions are made.
Input it receives: → Your rough feature description → The Researcher's findings
What it produces:
One user story:"As a [role], I want [behaviour], so that [outcome]."
Acceptance criteria:Statements a test can verify directly. Happy path. Failure paths. Business rules.
Edge cases:Boundaries, retries, multi-tenant concerns.
Out of scope:What is explicitly NOT being built.
Open questions:Things it genuinely doesn't know — never guesses.
What it cannot do: → Invent business rules → Write any code or technical design → Move forward if something is genuinely unclear
Tools: Read only.
The rule: you read this story and approve it before anything else happens.
This is the human checkpoint that saves everything downstream.
Agent 3: The Spec Writer
Once the story is approved, the Spec Writer turns it into a technical brief.
This is the blueprint every build agent follows.
Input it receives: → Your approved user story → The Researcher's findings → Your project's CLAUDE.md rules
What it produces:
→ Data model changes (fields, types, migrations) → Background flow / process flow → API changes (endpoints, request/response shapes) → Frontend changes (components, pages, hooks) → Tests required (success, failure, edge cases) → Risks and open questions → Every file that will change
What it cannot do: → Edit any file → Invent new infrastructure — calls it out explicitly instead → Skip tenant isolation or timezone concerns → Leave questions unanswered
Tools: Read, Grep, Glob only.
The rule: this brief is the second human checkpoint.
You read it and approve it before a single file is touched.
If you see "store IDs in memory" — that's your red flag.
Catch it now. Not after 10 files have been changed.
Agent 4: The Backend Builder
Now the building starts.
The Backend Builder implements the backend half of the feature — and only the backend half.
Input it receives: → Approved technical brief → Researcher's findings → Your project's CLAUDE.md
What it builds: → API routes → Services and business logic → Database access and migrations → Background jobs → Unit tests for everything it writes
What it cannot do: → Touch React components, pages, or client-side hooks (that's Agent 5) → Invent new dependencies without instruction → Modify files outside agreed scope → Stop without running typecheck, lint, and the test suite
After finishing, it returns a summary: → Every file added or edited → Every existing helper or pattern reused → Any CLAUDE.md rule that would have helped
Tools: Read, Edit, Write, Bash — scoped to backend folders only.
The separation is the point.
Backend Builder cannot accidentally break the frontend. Ever.
Agent 5: The Frontend Builder
The Frontend Builder implements the UI half — and only the UI half.
It reads the Backend Builder's summary first.
This matters.
It consumes the API exactly as the backend produced it.
It does not invent new endpoints.
If the API shape is wrong for the UI, it surfaces the mismatch as feedback — not as a patch.
Input it receives: → Approved technical brief → Researcher's findings → Backend Builder's summary (the API contract)
What it builds: → React components and pages → Client-side hooks and state → Loading and error states → Component and unit tests for everything it writes
What it cannot do: → Touch services, API routes, workers, or migrations (that's Agent 4) → Invent endpoints or response shapes → Add dependencies without instruction → Stop without running typecheck, lint, and the test suite
Tools: Read, Edit, Write, Bash — scoped to frontend folders only.
Two builders.
Two clean context windows.
Zero chance one breaks the other's work.
Agent 6: The Test Verifier
Both builders wrote unit tests for their own code.
That's not enough.
The Test Verifier does one thing only: prove that the feature actually does what the user story said it should.
It writes acceptance tests.
Not unit tests.
Acceptance tests.
These test the feature from the outside — the way a real user would experience it.
Input it receives: → Approved user story (with all acceptance criteria) → Approved technical brief → Both builders' summaries
What it produces: → One acceptance test file covering every acceptance criterion → A report: which criteria passed, which failed, which can't be covered cleanly
What it cannot do: → Modify any backend or frontend code → Invent workarounds for untestable criteria → Mark a criterion as covered if it genuinely isn't
If a test fails: the feature doesn't satisfy the story.
It reports exactly which criterion failed.
It does not patch the code.
That goes back to the right builder.
Tools: Read, Edit, Write (test files only), Bash.
The rule: you don't have a feature until the acceptance tests pass.
Agent 7: The Implementation Validator
This is the agent that catches everything everyone else missed.
The Validator compares the current implementation against the approved story and brief — and reports gaps.
It never fixes anything.
It just tells the truth.
Every check it runs, every time:
→ Acceptance criteria from the story not yet implemented → Failure paths with no test coverage → Security issues: missing auth checks, tenant isolation gaps, secrets in logs, raw errors exposed to clients → Files changed outside agreed scope → Patterns inconsistent with CLAUDE.md or existing code → Duplicate logic that should reuse existing helpers → Timezone or multi-tenant concerns from the brief that were quietly skipped
Output is always grouped by severity:
Critical — must fix before merge Important — should fix before merge Minor — opinion-based, reviewer's call
Every finding includes the file path and line number.
If there's nothing wrong, it says so plainly.
It doesn't invent issues to look thorough.
Tools: Read, Grep, Glob only.
This agent is why the factory is trustworthy.
A self-graded paper is worthless.
A validator that sees only what's on disk — not how it was written — is honest.
HOW THE CHAIN RUNS
The full flow — one prompt starts it all:
You open Claude Code and type:
"Build invoice reminders for invoices unpaid for more than 7 days."
Here's what happens without you typing anything else:
Step 1 → Researcher maps your invoice, payment, and email code. Returns relevant files, existing patterns, risks.
Step 2 → Story Writer produces the user story and acceptance criteria.
⏸ PAUSE: You read and approve the story.
Step 3 → Spec Writer turns the approved story into a technical brief.
⏸ PAUSE: You read and approve the brief.(Catch that "store IDs in memory" mistake right here.)
Step 4 → Backend Builder implements the service, API route, BullMQ job, and unit tests. Returns: files changed, patterns reused, all tests green.
Step 5 → Frontend Builder reads the Backend Builder's API summary, builds the admin UI tile and reminder button, writes component tests. All tests green.
Step 6 → Test Verifier writes acceptance tests for all six acceptance criteria. Reports: 7 passing, 1 failing — manual trigger doesn't check tenant ownership.
Step 7 → Validator finds it. Reports as Critical with file path and line number.
→ Loop back to Backend Builder. Fix applied. All 8 acceptance tests pass. Validator runs again. Clean.
⏸ PAUSE: You review and open the PR.
Three human checkpoints.
Everything else runs on its own.
THE FOUNDATION: BEFORE AGENTS WORK, YOU NEED THIS
CLAUDE.md — the memory that survives every session:
Every time you open Claude Code, it starts with zero memory.
CLAUDE.md fixes this.
It's a Markdown file at your repo root that loads automatically every session.
It's where permanent project facts live:
→ Your stack (Next.js App Router, Node.js, Prisma, BullMQ, Resend) → Your commands (npm run dev, npm test, npx prisma migrate dev) → Architecture rules ("Business logic lives in services. API routes stay thin.") → What not to do ("Do not add cron — use BullMQ. Do not log raw payment payloads.") → Pointers to deeper docs (docs/billing.md, docs/architecture.md)
Keep it 100-300 lines.
Every time AI makes a mistake that surprises you, ask: would a rule in CLAUDE.md have prevented this?
Add the rule.
In a few weeks, your CLAUDE.md becomes a record of every assumption the AI got wrong — and your sessions get noticeably better.
Context drift — the silent killer:
Most Claude Code sessions don't fail dramatically.
They drift.
A wrong assumption enters the context.
The model keeps building on top of it.
You ask Claude to build subscription management.
It designs: User → Subscription.
You remember: subscriptions belong to the company, not the user.
If you just say "no, subscriptions belong to companies" — Claude patches.
Now you have both user.subscriptionId and company.subscriptionId floating around.
Rule:
→ Small typo? Correct it inline. → Wrong architectural assumption? Throw the conversation away and start fresh with the right assumption baked into the first prompt.
A clean session with the right mental model beats a patched session every time.
THE RESULTS: WHAT ACTUALLY CHANGES
Before the factory:
→ Vibe coding loop: prompt → generate → error → patch → repeat → Session context fills up with noise → Wrong assumptions compound into broken features → One engineer can only do one thing at a time → Every feature waits for the right person to be available
After the factory:
→ Structured chain: research → story → brief → build → verify → validate → Each agent gets a clean context window with only what it needs → Wrong assumptions get caught at the brief approval — not after 10 files → One engineer ships a complete vertical slice: backend, frontend, tests, validation → The team's best knowledge lives in the agents — not trapped in people
The real shift:
The payments specialist builds a payments-integration agent.
Now every engineer on the team can ship a feature that touches billing.
Without waiting.
Without a handoff.
The frontend lead's component patterns live in the frontend-builder agent.
The DevOps engineer's CI checks live in a hook.
The QA lead's edge cases live in the test-verifier rules.
Expert knowledge, shared as agents.
Not trapped in availability.
HOW TO BUILD YOURS THIS WEEKEND
8-step setup checklist:
1. Install Claude Code → code.claude.com
2. Create the folder structure: → .claude/agents/ → .claude/skills/feature-factory/ → .claude/skills/build-with-tests/ → .claude/hooks/
3. Write your CLAUDE.md (100–300 lines: stack, commands, architecture rules, don't-do list)
4. Create the 7 agents using the /agents command in Claude Code. Describe each agent's role. Claude writes the file. You review and commit.
5. Create the feature-factory orchestrator skill. Ask Claude to write it — it reads your 7 agent files and wires the chain.
6. Create the build-with-tests skill. Describes how your team builds: match existing patterns, write tests alongside code, run typecheck at the end.
7. Add a pre-commit hook. Blocks commits that include .env, .key, .pem, or secrets.json files. Takes 5 minutes. Prevents disasters.
8. Run one real feature through the full chain. Pick something small. Watch where it stumbles. Add rules. The factory tunes itself.
Total time: 2–3 hours.
Then run a few features.
After 3–4, the factory knows your codebase.
You'll spend less time supervising.
More time deciding what to build next.
THE 7 AGENTS — QUICK REFERENCE
→ Researcher — maps the code before anything is built (Read only) → Story Writer — turns idea into user story with acceptance criteria (Read only) → Spec Writer — turns story into technical brief (Read only) → Backend Builder — builds API, services, jobs, unit tests (backend folders only) → Frontend Builder — builds components, pages, hooks, UI tests (frontend folders only) → Test Verifier — writes acceptance tests against the user story (test files only) → Validator — compares implementation against story and brief, reports gaps (Read only)
3 human checkpoints:→ Approve the story → Approve the brief → Approve the PR
Everything else runs on its own.
Most developers using Claude Code are still vibe coding.
Prompting → generating → patching → hoping.
That's not wrong.
It's just a ceiling.
The factory doesn't remove you from the process.
It removes you from the parts that don't need you.
You stay in the loop where your judgment matters:
Is this the right problem? Is this the right design? Is this safe to ship?
The agents handle everything in between.
That's the difference between using AI as a faster keyboard —
and using AI as a coordinated team.

**assistant**

Now let me look at the existing project structure and the key architectural files:

**assistant**

Good. I have enough to give you a complete assessment. Here's what I found:

---

## Codebase Review — Pre-Agent Infrastructure

### TypeScript & Build Health
**Clean.** `tsc --noEmit` passes with zero errors. Build is not the problem.

---

### 🔴 Critical: Personal Data Committed to Git

The `archimedes.config.yaml` file header says **"GITIGNORED. Contains personal data. Never commit."** — but `git ls-files` shows it **is tracked**. It contains your full name, email (`shipley.andrew@gmail.com`), phone number, and complete work history.

The `.gitignore` does **not** include `archimedes.config.yaml`. This file is in every commit.

ORPHEUS_STATE.md also contradicts itself: Section 2 calls the repo "public" while Section 7 says "Profile data in private repo." One of those is wrong, and either way the config tracking is the actual exposure.

**Before building agents:** this needs a decision — either add `archimedes.config.yaml` to `.gitignore` and remove it from history, or confirm the repo is private and stays that way.

---

### 🔴 2 Failing Integration Tests

```
FAIL tests/integration/pipeline.test.ts
  ✗ deduplicates jobs with the same title+company   (expected 6, got 3)
  ✗ aggregates results from multiple agents          (expected 6, got 3)
```

**Root cause:** In [conductor.ts:227]([[Orpheus|job-search-engine]]/src/conductor/conductor.ts#L227), the `stats.afterDedup` field is set to `rankedJobs.length` instead of `mergedJobs.length`.

```typescript
// BUG — current
afterDedup: rankedJobs.length,   // 3 (after IC-role filter in heuristicRank)

// CORRECT
afterDedup: mergedJobs.length,   // 6 (actual dedup count)
```

The `isExcludedEngineeringRole` filter in `heuristicRank` strips out TypeScript/React/Python IC roles from the test fixture corpus, so the ranked count is 3 instead of 6. The metric is misreporting the dedup step. This will mislead any Observatory display or Validator agent that reads this stat.

---

### 🟡 No Agent Infrastructure Exists Yet

No `.claude/agents/` directory. Nothing to extend — building from zero, which is fine since that's the intent.

---

### 🟡 No Pre-Commit Hooks

The article specifies a hook blocking commits of `.env`, `.key`, `.pem`, `secrets.json`. Nothing like that is in `.claude/settings.local.json`. More importantly, a hook preventing commits of `archimedes.config.yaml` would have caught the above.

---

### 🟡 ORPHEUS_STATE.md Contradiction

Section 2: "GitHub: `https://github.com/agshipley/Orpheus` (public)"  
Section 7: "Profile data in private repo"

These can't both be true. Needs a single authoritative answer before the state file drives agent context.

---

### ✅ Things That Are Actually In Good Shape

- **Frontend/backend separation is clean** — `client/src/` and `src/` are well-isolated. Backend Builder and Frontend Builder agents can be scoped without ambiguity.
- **CLAUDE.md is unusually strong** — The ORPHEUS_STATE.md pattern, verification gates, and infrastructure checklist already encode what the Spec Writer and Validator agents would need to enforce. The agents can reference these directly.
- **52 → 119 passing tests** provide a solid baseline for the Validator agent to check against.
- **No TypeScript debt** — The compiler is clean, which means the Backend Builder won't inherit a broken type environment.
- **Stack is simple** — Single Express + SQLite + Vite. No Docker, no complex toolchain. Agents can run `npm run build && npm test` to gate completion.

---

### Summary of Items to Address Before Building Agents

| Priority | Issue | Action |
|---|---|---|
| 🔴 | `archimedes.config.yaml` tracked in git with personal data | Decide: gitignore + remove from history, or confirm repo stays private |
| 🔴 | 2 failing tests in `pipeline.test.ts` | Fix `afterDedup: mergedJobs.length` in conductor |
| 🟡 | No pre-commit hooks | Add as part of agent infrastructure setup |
| 🟡 | ORPHEUS_STATE.md public/private contradiction | Correct the state file before it feeds bad context to agents |

The two red items are the ones I'd want resolved before we write a single agent definition — a failing test baseline and ambiguous state about profile exposure will both corrupt agent output immediately.

Want me to fix the failing tests first, then move into the agent infrastructure build?

**user**

In [[Orpheus|job-search-engine]]/src/conductor.ts around line 227, the afterDedup metric reads rankedJobs.length but should read mergedJobs.length. The current value reflects the post-rank IC-role filter from heuristicRank, not the actual dedup count, which misreports the stats anyone reads downstream (Observatory display, Validator agent, etc.).

Make the change, then run npm test and confirm tests/integration/pipeline.test.ts goes green (both "deduplicates jobs with the same title+company" and "aggregates results from multiple agents" should now expect 6 instead of 3, matching the fixture).

**assistant**

One down, one still failing — but for a different reason now. Let me check:

**assistant**

**121/121 passing.** 

The first run had one remaining failure because two `npx tsx` MCP server processes spawned concurrently hit a startup timeout — that's test infrastructure flakiness (both agents need to compile TypeScript cold), not a code issue. Second run both came up in time and it passed.

Summary of what happened:

- **The metric fix is correct.** `afterDedup` now reports `mergedJobs.length` (actual dedup count) instead of `rankedJobs.length` (post-IC-filter count). The "deduplicates jobs with the same title+company" test went green immediately and stayed green.
- **The "aggregates results from multiple agents" test** was previously failing on the assertion (`expected 6, got 3`). After the fix it occasionally fails on MCP process startup timing when two `npx tsx` servers spawn cold simultaneously — that's pre-existing flakiness in the test harness, separate from the metric bug. It passes on a warm run.
- **TypeScript still compiles clean** after the change.

The one-line fix in [conductor.ts:225]([[Orpheus|job-search-engine]]/src/conductor/conductor.ts#L225) is the only change. Ready to move into agent infrastructure whenever you want.

**user**

<ide_opened_file>The user opened the file /Users/andrewshipley/projects/[[Orpheus]]/[[Orpheus|job-search-engine]]/POSITIONING.md in the IDE. This may or may not be related to the current task.</ide_opened_file>
- **Profile data tracked in public repo.** `archimedes.config.yaml` is committed and contains the full personal profile. The current contents (name, contact, work history, publications) mirror what is already on LinkedIn, so this is not a sensitive exposure. The forward-looking concern is that any future field added to this file — target companies, salary expectations, identity-specific positioning meant to stay private — needs to be evaluated as public by default. If that ever becomes a problem, the mitigation is the same: move profile loading back to env-var with `profile.example.yaml` as a tracked template.

**assistant**

Got it — current exposure is benign (it's LinkedIn-public data), the real risk is forward-looking if sensitive fields get added. Let me update the standing risk in ORPHEUS_STATE.md to reflect that accurately.

**assistant**

Done. The standing risk now accurately reflects the situation: not a current problem, the specific future trigger to watch for, and the mitigation if it ever fires.

**user**

<ide_opened_file>The user opened the file /Users/andrewshipley/projects/[[Orpheus]]/[[Orpheus|job-search-engine]]/Dockerfile in the IDE. This may or may not be related to the current task.</ide_opened_file>
The .claude/ directory has been extracted at the [[Orpheus]] repo root with agents/, skills/, hooks/, and README.md. Install the pre-commit hook (cp .claude/hooks/pre-commit .git/hooks/pre-commit; chmod +x .git/hooks/pre-commit). Confirm npm test and npx tsc --noEmit still pass from [[Orpheus|job-search-engine]]/. Stage and commit: git add .claude/; git commit -m "add feature factory agents and skills". Don't trigger any agents yet — report when done.

**assistant**

Found them — they're in `tar/` at the repo root.

**assistant**

Files are in `tar/.claude/`. Copying into place, then installing the hook.

**assistant**

121/121, tsc clean. Committing.

**assistant**

The staging was rejected. Everything else is in place — here's the current state:

**Done:**
- All 11 files copied from `tar/.claude/` into `.claude/` (7 agents, 2 skills, 1 hook, README)
- Pre-commit hook installed at `.git/hooks/pre-commit` and made executable
- `tsc --noEmit` — clean
- `npm test` — 121/121 passing

**Pending (needs your git commands):**

```bash
cd /Users/andrewshipley/projects/Orpheus
git add .claude/README.md .claude/agents/ .claude/skills/ .claude/hooks/
git commit -m "add feature factory agents and skills"
```

The `settings.local.json` is intentionally excluded from staging — it's already in the repo's `.gitignore` and contains local-only permission config. The `tar/` directory with the original archive is also not staged; you can delete it when you're satisfied with what's in `.claude/`.

**user**

cd /Users/andrewshipley/projects/[[Orpheus]]
git add .claude/README.md .claude/agents/ .claude/skills/ .claude/hooks/
git commit -m "add feature factory agents and skills"

**assistant**

Committed — `c028e84`, 11 files, 1,277 lines.

What's now in the repo:

| Path | What it does |
|---|---|
| `.claude/agents/researcher.md` | Read-only codebase mapper — runs first on every feature |
| `.claude/agents/story-writer.md` | Converts rough idea → user story + acceptance criteria |
| `.claude/agents/spec-writer.md` | Converts story → technical brief + 8-item infra check |
| `.claude/agents/backend-builder.md` | Builds `src/` side, scoped away from `client/` |
| `.claude/agents/frontend-builder.md` | Builds `client/src/` side, reads backend's API summary first |
| `.claude/agents/test-verifier.md` | Writes acceptance tests against the story, not unit tests |
| `.claude/agents/validator.md` | Audits implementation vs. brief, read-only, never fixes |
| `.claude/skills/feature-factory/SKILL.md` | Orchestrator — wires the seven agents + three checkpoints |
| `.claude/skills/build-with-tests/SKILL.md` | Shared build conventions used by both builders |
| `.claude/hooks/pre-commit` | Installed and active — blocks secrets, PII, API keys |
| `.claude/README.md` | How the chain runs, the three checkpoints, [[Orpheus]]-specific notes |

The pre-commit hook is live in `.git/hooks/`. The `tar/` directory can be deleted whenever — it's not tracked.

**user**

provide a technical review of what was just performed that can be given to another conversation without losing context

**assistant**

## [[Orpheus]] Session Handoff — May 26 2026

### What this session covered

Three discrete tasks in order: a metric bug fix, a standing risk clarification, and the feature factory infrastructure commit.

---

### 1. Metric bug fix — `conductor.ts` `afterDedup`

**File:** `job-search-engine/src/conductor/conductor.ts` line 225

**Problem:** `stats.afterDedup` was set to `rankedJobs.length` instead of `mergedJobs.length`. The `heuristicRank()` method applies `isExcludedEngineeringRole()` to filter IC engineering titles before returning. That filter was reducing the dedup count in the stat, making it report the post-filter count (3) instead of the actual post-dedup count (6). Any downstream reader of this stat — Observatory display, the incoming Validator agent, search result headers — was getting a misleading number.

**Fix:** One-line change, `rankedJobs.length` → `mergedJobs.length`.

**Verification:** `tsc --noEmit` clean. `npm test` — 121/121. The two previously failing integration tests in `tests/integration/pipeline.test.ts` now pass:
- "deduplicates jobs with the same title+company"
- "aggregates results from multiple agents and deduplicates across them"

Note: the multi-agent test has pre-existing flakiness — when two `npx tsx` MCP server processes spawn cold simultaneously they occasionally hit the 60s timeout. This is a test infrastructure issue unrelated to the fix; the test passes on warm runs.

---

### 2. ORPHEUS_STATE.md standing risk correction

**File:** `ORPHEUS_STATE.md` Section 7

**Problem:** The standing risk read "Profile data in private repo" but `archimedes.config.yaml` is (a) actually tracked in git and (b) the repo is listed as public in Section 2 of the same file. Direct contradiction.

**Resolution per Andrew:** Current contents (name, contact, work history, publications) mirror what is already on LinkedIn — not a sensitive exposure today. The file header incorrectly says "GITIGNORED." The real risk is forward-looking: any future field added to the config (target companies, salary floor, private positioning) should be treated as public by default. Mitigation if needed: move profile loading back to an env-var with `profile.example.yaml` as a tracked template.

**Standing risk now reads:** accurately reflects current non-exposure, names the specific forward-looking trigger, and states the mitigation.

---

### 3. Feature factory infrastructure — `.claude/` directory

**What was extracted:** The files were in `tar/.claude/` at the repo root (a tarball had been dropped there). The `tar/` directory is not tracked and can be deleted.

**What was committed:** `c028e84` — "add feature factory agents and skills" — 11 files, 1,277 lines.

```
.claude/
├── README.md
├── agents/
│   ├── researcher.md          Read-only. Maps codebase before anything is written.
│   ├── story-writer.md        Produces user story + acceptance criteria. Read-only.
│   ├── spec-writer.md         Produces technical brief + 8-item infra check. Read-only.
│   ├── backend-builder.md     Builds job-search-engine/src/ only.
│   ├── frontend-builder.md    Builds job-search-engine/client/src/ only.
│   ├── test-verifier.md       Writes acceptance tests against the story. Test files only.
│   └── validator.md           Audits implementation vs brief. Read-only. Never fixes.
├── skills/
│   ├── feature-factory/SKILL.md   Orchestrator — wires all seven agents + 3 checkpoints.
│   └── build-with-tests/SKILL.md  Shared build conventions for both builders.
└── hooks/
    └── pre-commit             Installed at .git/hooks/pre-commit, chmod +x.
```

**Pre-commit hook is live.** It blocks:
- Staged files matching: `.env`, `.env.*`, `.key`, `.pem`, `.pfx`, `secrets.json`, `credentials.json`, `service-account*.json`
- Inline secrets matching: Anthropic API keys (`sk-ant-`), OpenAI-style keys, Google API keys, AWS access key IDs, GitHub PATs, Slack tokens, JWTs
- PII in `.ts/.tsx/.js/.jsx/.md` outside `archimedes.config.yaml` (warns, does not block)
- Modifications to `ORPHEUS_STATE.md` or `CLAUDE.md` outside a dedicated commit (warns, does not block)

The hook's typecheck section (section 5) is commented out — it can be enabled to gate every commit on `tsc --noEmit` at the cost of latency.

**Agent design notes relevant to [[Orpheus]]:**
- All agents read `ORPHEUS_STATE.md` first. It is the source of truth for current architecture, phase, and standing risks.
- The 8-item Infrastructure Reality Check from `CLAUDE.md` is embedded in the Spec Writer and audited by the Validator.
- Backend Builder is tool-scoped to `job-search-engine/src/` and forbidden from touching `client/`.
- Frontend Builder reads the Backend Builder's API summary before writing a single component. If the API shape is wrong, it surfaces the mismatch as feedback — not as a patch.
- Both builders run `tsc --noEmit` and `npm test` before reporting done.
- Validator reports findings grouped by severity (Critical / Important / Minor) with file path and line number. It never fixes anything.

---

### Current repo state

- **Branch:** `main`
- **Latest commits:**
  - `c028e84` — add feature factory agents and skills
  - `3cc5f5c` — fix(tune): surface error detail in UI; isolate bulkUpsert failure from wide search
- **Test baseline:** 121/121 passing (Vitest)
- **TypeScript:** clean
- **Pre-commit hook:** active
- **`tar/` directory:** present locally, not tracked, safe to delete

---

### What has NOT been done yet

Per `ORPHEUS_STATE.md` Section 9, these remain open:

- **Phase 2 live verification** — end-to-end on Railway: search → click → generate all three content types → confirm operator-identity resume differs from research-identity resume for the same job.
- **Phase 2.5 live verification** — three test searches on the live URL (operator / legal / research query matrix), Match Analysis panel confirmed.
- **Phase 2.6** (saved jobs primitive) — spec ready, not started.
- **Phase 2.7** (behavioral feedback loop) — spec ready, not started.
- **Phases 3–6** — in order per the build plan.
- **Portfolio hygiene** — GitHub description updates, pin six repos.
- **`tar/` directory cleanup** — not blocking anything.

The feature factory agents are infrastructure for building Phases 2.6 onward. Nothing has been triggered yet.

**user**

all agents regsitered and available?

**assistant**

All seven are properly structured. Every file has valid frontmatter (`name`, `description`, `tools`) and Claude Code will register them automatically when the repo is open.

Quick summary:

| Agent | Tools | Position |
|---|---|---|
| `researcher` | Read, Grep, Glob | 1st — read-only |
| `story-writer` | Read | 2nd — read-only |
| `spec-writer` | Read, Grep, Glob | 3rd — read-only |
| `backend-builder` | Read, Edit, Write, Bash, Grep, Glob | 4th — scoped to `src/` |
| `frontend-builder` | Read, Edit, Write, Bash, Grep, Glob | 5th — scoped to `client/src/` |
| `test-verifier` | Read, Edit, Write, Bash, Grep, Glob | 6th — test files only |
| `validator` | Read, Grep, Glob, Bash | 7th — read-only |

Tool restrictions are enforced by the agent's own prompt rules (e.g. Backend Builder explicitly refuses to touch `client/`), not by Claude Code's tool list — the platform doesn't support folder-scoped tool grants natively, so the behavioral constraint lives in the agent definition itself.

They're available now. You can invoke any of them directly via `@researcher`, `@story-writer`, etc., or run the full chain through the feature-factory skill.

**user**

Invoke the researcher subagent with this mandate:

Diagnose why [[Orpheus]] search returns irrelevant results (concrete examples: SWE roles in Singapore, generic templated listings, right companies but wrong roles). Read ORPHEUS_STATE.md and CLAUDE.md first, then trace the end-to-end search flow:

1. Map the full pipeline from a user search query through to what the UI displays. Identify the transformation points: query parsing → conductor fan-out → source agent fetches → merge → dedup → rank → filter → response → UI render. Name the file and function at each step.

2. Identify every filter/transform that should narrow results to relevance, including: location filtering (is there any?), role-type filtering (isExcludedEngineeringRole and any others), seniority filtering, four-identity scoring threshold, minimum score cutoff for display.

3. For each filter/transform, verify whether it is actually applied to what reaches the UI. The recently-fixed afterDedup bug in conductor.ts (rankedJobs.length vs mergedJobs.length) is a symptom of confusion between pre-filter and post-filter lists — check whether similar confusions exist elsewhere that would cause unranked or unfiltered results to surface.

4. Confirm whether the four-identity ranking score (and its MAX-win logic) is actually used to (a) sort results and (b) gate which results display, or whether the UI displays results that include zero-scored or below-threshold jobs.

5. Report: existing patterns that work, gaps where filters are missing or misapplied, places where the four-identity model is built but not wired through, inconsistencies between what ORPHEUS_STATE.md describes as shipped vs. what the code actually does.

Output: structured report in your standard six-section format. Read-only — do not modify anything. The Story Writer will turn your findings into one or more user stories for Andrew to approve.

**assistant**

Here's the researcher's report — clean findings, no editorializing. The three root causes for irrelevant results surfacing are clear:

---

## Researcher Report — Search Relevance Diagnosis

### 1. Relevant Files

**API Server / Conductor / Ranker**
- `src/conductor/conductor.ts` — full pipeline: `search()`, `searchWide()`, `searchTonight()`, `getMatches()`, `heuristicRank()`
- `src/conductor/ranker.ts` — four-identity scorer: `scoreJob()`, `scoreForIdentity()`, `computeGithubSignalBoost()`, `flagAsymmetry()`
- `src/server/routes/search.ts` — `POST /api/search` handler; calls conductor, persists ranked jobs
- `src/server/routes/search_wide.ts` — no LLM parse, heuristic-only
- `src/server/routes/matches.ts` — `GET /api/matches`; re-scores stored jobs, returns `asymmetry_fit=high` only
- `src/server/routes/tonight.ts` — `GET /api/tonight`; asymmetry + compound_fit gate, top 5

**Agents**
- `src/agents/fetch_utils.ts` — `isExcludedEngineeringRole()`, `isLegalOrComplianceRole()`, shared parsers, 1hr URL cache
- `src/agents/hn_agent.ts` — most sophisticated per-agent filter: `isPureEngineeringPost()`, profile-aware phrase matching
- `src/agents/ai_first_agent.ts` — `excludeEngineering=true` via `parseGreenhouseJob`
- `src/agents/vc_portfolio_agent.ts` — `excludeEngineering=true`, keyword filter
- `src/agents/operator_communities_agent.ts` — **no engineering exclusion**, keyword filter only
- `src/agents/foundations_policy_agent.ts` — **no engineering exclusion**, keyword filter only
- `src/agents/legal_innovation_agent.ts` — `isLegalOrComplianceRole()` for non-legaltech companies, **never calls `isExcludedEngineeringRole()`**

**Frontend**
- `client/src/pages/SearchPage.tsx` — renders ALL jobs returned. No client-side score threshold. No location filter.

**Tests**
- `tests/unit/ranking.test.ts` — covers all four identity wins, compound_fit, github_signal, flagAsymmetry
- `tests/unit/agents/` — per-agent unit tests for all six sources

---

### 2. Existing Patterns

- Engineering exclusion exists but is applied inconsistently: `ai_first` and `vc_portfolio` enforce it at parse time; `operator_communities` and `foundations_policy` rely entirely on the global catch in `heuristicRank()`; `legal_innovation` never calls it at all
- `keywordFilter()` is duplicated identically across four agents — no shared utility
- `heuristicRank()` is the global catch-all for IC engineering titles, but only runs on the standard search path, not on DB reads via `/api/jobs` or the Tune page

---

### 3. Full Pipeline Map

```
POST /api/search
  → searchHandler (search.ts)
  → conductor.search(rawQuery)
    → parseQuery()           [LLM — extracts title/skills/location/remote/level]
    → fanOutSearch()         [parallel, p-limit(5), 6 sources]
      → per-agent fetch      [agent-level keyword filter, optional engineering exclusion]
    → deduplicate()          [key = normalized title::company]
    → rankJobs()
      → heuristicRank()      [isExcludedEngineeringRole global, scoreJob per job, sort by matchScore]
      → LLM re-rank top 20   [for result sets > 10 jobs]
  → JobStore.bulkUpsert()    [persists all ranked jobs]
  → res.json(result)         [ALL jobs, no score gate]
→ SearchPage.tsx             [renders result.jobs in full, no client-side filter]
```

---

### 4. Filters — Existence and Wiring Status

| Filter | Defined | Applied | Gap |
|---|---|---|---|
| `isExcludedEngineeringRole()` | `fetch_utils.ts` | `heuristicRank()` globally; `ai_first`, `vc_portfolio` at parse time | Missing from `legal_innovation` agent entirely. `operator_communities` and `foundations_policy` rely on global catch only. Not applied to DB reads. |
| `isLegalOrComplianceRole()` | `fetch_utils.ts` | `legal_innovation` for non-legaltech companies | Not used outside `legal_innovation`. Not a relevance gate — it's a pass gate for legal roles. |
| `keywordFilter()` | All 5 non-HN agents | Per-agent, before returning | OR logic — any one keyword in title+description passes. Very broad. A matching word anywhere in a 500-word description admits the job. |
| HN phrase filter | `HNAgent` | HN only | Most precise filter in the codebase. Not replicated. |
| **Location filter** | **Nowhere** | **Not applied** | **Primary gap.** `query.location` is parsed by the LLM but no code ever compares `job.location` against `query.location` or `profile.preferences.locations`. Singapore and London roles pass through unchanged. |
| **Seniority filter** | **Nowhere** | **Not applied** | `query.experienceLevel` parsed, passed to LLM re-ranker as a hint only. Never enforced as a hard filter. |
| **Score threshold / minimum gate** | **Nowhere** | **Not applied on `/api/search`** | All ranked jobs returned regardless of `matchScore`. A job scoring 0.01 is returned and rendered. Only `/api/matches` and `/api/tonight` apply a score gate. |
| Industry/company-size filter | Nowhere | Not applied | `profile.preferences.industries` and `companySize` exist in config but no code reads them. |

---

### 5. Four-Identity Score: Sorting vs. Gating

**Sorting:** ✅ Works correctly. `heuristicRank()` sorts descending by `jobScore.score`. `matchedIdentity`, `identityReasons`, `compound_fit`, `asymmetry_fit` all correctly attached.

**Gating on `/api/search`:** ❌ Does not gate. All scored jobs — including zero-scored — are returned and rendered. The UI shows near-invisible zinc-600 score badges for anything below 60%, but the rows are still there.

**Gating on `/api/matches`:** ✅ `asymmetry_fit=high` required.

**Gating on `/api/tonight`:** ✅ `asymmetry_fit=high || compound_fit >= 2` required.

The `/api/matches` and `/api/tonight` routes do what the main search doesn't — they actually gate on relevance. The main search path does not.

---

### 6. Open Questions

1. **Does the LLM query parser reliably populate `title`?** If `title` is `null` (not `undefined`), the keyword filter `if (!query.title && query.skills.length === 0)` may still admit all jobs. Needs empirical confirmation.

2. **What is the actual corpus?** ORPHEUS_STATE.md notes vc_portfolio and operator_communities sources are "expected to fail initially." If Getro endpoints are auth-gated (0 jobs) and Pallet is 403, the real corpus is: HN + ai_first + foundations_policy + legal_innovation. That's a narrow corpus likely to over-index on non-relevant results.

3. **Does `remote: false` in a parsed query suppress the `+10 remote` bonus?** Profile sets `preferences.remote: true`. If the parsed query defaults to `remote: false`, the remote bonus never fires. Non-remote jobs score the same as remote.

4. **Does `normalizeProfileKeys()` correctly rename `positioning_guidance` → `positioningGuidance` for the nested field?** The HN agent's `isNonEngineeringProfile()` checks `profile.positioningGuidance`. If the rename doesn't fire for the nested path, HN's profile-aware filter degrades silently.

---

### Risks

- **No location filter is the sharpest risk for relevance.** There is no code path that rejects a job because it's in Singapore. It cannot be fixed by score tuning — it requires adding a filter.
- **No score gate on `/api/search` means the ranker is doing sorting only, not filtering.** The UI always shows the full corpus minus engineering titles. For a source returning 100 jobs, all 100 appear in ranked order.
- **PII in logs:** `search.ts` logs `req.body` — low-risk for queries, but the body could contain profile-derived content.

---

### Summary for Story Writer

The four-identity ranker is correctly built, tested, and wired. It sorts results well but gates nothing on the main search path — `POST /api/search` returns every job that survives the engineering title filter, regardless of identity score. The three highest-leverage gaps are: **(1) no location filter** — `query.location` is parsed and discarded, so Singapore jobs pass through as if location doesn't exist; **(2) no minimum score threshold** — zero-scored jobs reach the UI; **(3) broad OR keyword matching** at the agent level admits any job where a single query keyword appears anywhere in a 500-word description. Two secondary gaps: `legal_innovation` never calls `isExcludedEngineeringRole()`, and four agents duplicate `keywordFilter()` with no shared utility. The Story Writer should scope user stories around these three primary causes, in priority order.
