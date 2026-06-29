# AbrainOAG — Knowledge-Server Build Spec

**Status:** Revised draft (v2) — nothing built yet **Date:** 2026-06-27 **Written in:** learning mode (technical terms glossed inline at first use)

---

## 0\. What this document is

A full specification for turning the AbrainOAG vault from a local set of files into a **hosted, client-agnostic knowledge server** — a single service, running on the internet, that any AI client (an AI application like Claude, ChatGPT, Gemini, or an open-source tool) can query for the vault's contents. This is the Phase 3 build the original GBRAIN\_PROJECT.md flagged as a decision gate, now scoped against requirements that have sharpened since: live access from chat and Projects, not just Claude Code; reachability from any client; always-on hosting; and an eventual multi-user, self-improving company memory.

It separates two things that have been blurring together, because keeping them separate is what keeps the build honest:

- **The pilot** — a single-user hosted deployment (you, your vault) that proves the architecture works. This is what we build now.  
- **The destination** — a multi-user company knowledge operating system, the thing your sister described for Dr Max's. This is documented here as design constraints we refuse to foreclose, and it is *not* built in the pilot.

---

## 1\. Requirements (what the finished thing must do)

Drawn directly from the decisions made in conversation:

1. **Inform conversations and Projects, not only code.** The vault exists to feed the thinking — the chat and Project (a saved Claude workspace with its own files and context) work where reasoning and drafting happen — which then occasionally feeds inputs to Claude Code. A vault reachable only from code serves the wrong end of the pipeline.  
2. **Client-agnostic.** The vault is a knowledge server, not a Claude feature. It must answer queries from Claude, ChatGPT, Gemini tooling, and open-source clients on equal terms.  
3. **Hosted and always-on.** Reachable from different machines, at any time, without your laptop being awake. (Your explicit choice over a laptop tunnel.)  
4. **Self-improving over time.** The memory should enrich itself on a schedule — the Phase 4 capability — which the destination product treats as core, not optional.  
5. **Multi-user (destination only).** Different people, different machines, with each person seeing only what they should. Designed-for, not built, in the pilot.

---

## 2\. Pre-build step: corpus excision (Phase 3.0)

Before anything is hosted, the legal-consulting material leaves the corpus. Per your correction, the only legal work is **Portable Diagnostic Systems (PDS)** and **RevGenius**, and neither needs to remain. Removing them drops the risk profile from "privileged client material on a server" to "ordinary business notes on a server" — the same call any company makes putting its documents in the cloud.

The excision is a clean, logged removal:

- Identify every session file sourced from PDS or RevGenius work, plus any entity file (a vault note representing a person, company, project, or concept) derived from them.  
- Remove them from the vault.  
- Re-derive the affected links so nothing points at a deleted file (a broken **wikilink** — a `[[note-name]]` cross-reference between vault files — left behind is a dangling pointer).  
- Log the removal in the import log and a deferred-or-removed-sources note, so the excision is a recorded decision, not a silent deletion.  
- Commit, so it is reversible if a file was caught by mistake.

This runs and verifies on the local vault before any hosting work begins.

---

## 3\. Architecture (the layers, bottom to top)

The design is four layers. The bottom one is the asset and stays portable; the upper three are the serving machinery and are swappable — which, for this build, is a hard requirement, not a nicety (Section 5).

**Layer 1 — Data: the markdown vault \+ git.** Unchanged. Plain markdown files (human-readable text files with light formatting) under **git** (the version-control system tracking every change). This is the portable asset — the whole reason the vault was never locked inside one product's memory feature. Every layer above can be replaced without touching this.

**Layer 2 — Index and retrieval: a knowledge engine over Postgres.** The vault gets imported into **gbrain** — and it is worth being exact about what gbrain is, because it is not a neutral building block. gbrain is one specific open-source program written by Garry Tan (the name is "g" for Garry plus "brain"): a **command-line tool** (a program you operate by typing commands into a terminal, the text window where you talk to the computer directly) that indexes a folder of markdown and can run as a server. In this build it is **validated scaffolding** — the thing that proves the architecture cheaply and is then replaced (Sections 4 and 5). It runs on **Postgres** (an industrial-strength database that arbitrates many simultaneous readers and writers). gbrain gives **hybrid search** — combining **vector search** (finding text by meaning, using **embeddings**, which are numerical fingerprints of meaning so "deal terms" can match "contract negotiation" even with no shared words) with **keyword search** (exact word matching) and **graph traversal** (following the typed links between entities, so "what did charlie depend on" is answerable). At your vault's current size, keyword plus the agent reading files is already enough; hybrid search earns its keep as the corpus grows, and it comes with gbrain regardless.

**Layer 3 — Transport: remote HTTP MCP.** The server speaks **MCP** (the Model Context Protocol — the open standard, created by Anthropic and donated to the Linux Foundation, that lets any AI client talk to any tool through one interface). It uses the **HTTP transport** (the web-protocol mode, the same protocol your browser uses, reachable at a public address) rather than the local-only mode, because a local mode is per-machine and per-client and so cannot be client-agnostic. gbrain provides this mode via `gbrain serve --http`. MCP is the first of the two open standards the swap design depends on.

**Layer 4 — Auth: OAuth 2.1 \+ PKCE.** The front door. **OAuth 2.1** (the open standard for granting an app limited access to your data without handing it your password — the "Sign in with Google" flow) with **PKCE** (pronounced "pixie," a security add-on that stops an attacker from hijacking the login handshake partway through). This combination is the agnostic key: it satisfies the strictest client (ChatGPT's connector requires OAuth 2.1 \+ PKCE), and the others ride on top of it. gbrain has this built into its program, which is the strongest argument for using it *to validate* — a correct login server is the most error-prone thing to write from scratch, so borrowing a working one to prove the pilot saves the hardest work. OAuth 2.1 \+ PKCE is the second of the two open standards the swap design depends on.

Above these sits the **host** (a cloud platform running the server at a stable public web address) and the **clients** (each registers the server's URL once as a custom connector — a user-added link to an outside MCP server).

---

## 4\. The build decision: gbrain to validate, an owned server for production

Earlier drafts framed this as "gbrain vs. a custom server," as if gbrain were a neutral component. It is not. **"Use gbrain" means adopting one person's specific, young, fast-moving codebase as a core dependency** (a dependency \= an outside piece of software your system relies on to run). That is a different kind of choice from "use MCP" (an open standard many vendors implement) or "use Postgres" (decades-old, battle-tested infrastructure). gbrain is a months-old project, largely one maintainer, that ships breaking changes. Acceptable as scaffolding; wrong as the permanent foundation of a company's memory.

So the decision, locked:

- **gbrain validates the pilot.** It borrows the two hardest things to build — a correct OAuth 2.1 \+ PKCE login server and a working hosted retrieval engine — so the architecture gets proven in days, not weeks. This is real time saved on the error-prone parts.  
- **An owned server is the production foundation.** For the final product, gbrain is replaced by a small server you control: it depends only on the open standards (MCP, OAuth) and mature infrastructure (Postgres), nothing one-maintainer, and it does not move under you.  
- **The swap is mandatory, not aspirational** (your call). Section 5 designs it in from the first commit so it stays cheap, because the real failure mode of "replace it later" is that the temporary thing becomes permanent by inertia.

What this is not: a rejection of gbrain. It is the right tool to answer the architecture questions cheaply. It is simply not the thing a company depends on long-term.

---

## 5\. The swap: how gbrain stays replaceable

The principle that makes the later replacement cheap, chosen now as a design constraint: **depend on gbrain's behavior, not its internals.**

Your clients connect to a web address that speaks two open standards — MCP and OAuth 2.1 \+ PKCE. As long as the *final* server speaks those same two standards at the *same* address, the engine behind that address can change and the clients never notice: same URL, same login, same protocol. The contract to hold fixed is therefore "MCP \+ OAuth at a stable URL," and gbrain is merely the first thing sitting behind that contract.

Two requirements fall out, both first-class, both from day one:

**A strangler boundary.** (A design where you wrap a temporary system behind a stable interface, then replace what is inside without the outside changing — named for the strangler fig, a vine that grows around a tree and eventually stands on its own where the tree was.) The clients point at *your* URL and *your* login, with gbrain living behind that boundary. When the owned server is built, it takes over behind the same boundary and the clients are never reconfigured. Practically: register the connector against a stable address you control, not against a raw gbrain-default endpoint you would later have to migrate every client off of.

**A portability ledger.** A running list, kept from the first commit, of every place the build leans on something gbrain-specific rather than on the open standard — a gbrain-only command, a quirk of how it stores or shapes data, a feature unique to it. Each entry is a thing the owned server must reimplement. The ledger *is* the specification for the replacement; without it, "swap it later" means reverse-engineering what you depended on, months after you have forgotten. With it, the replacement has a checklist.

**The honest cost now:** gbrain's multi-user company mode is its most proprietary, least-standard part — the hardest to hide behind a clean boundary, and the piece the destination needs most. So the discipline is to lean on company mode as little as possible. The pilot is single-user anyway, so it proves the entire agnostic-retrieval architecture without ever enabling company mode. The most-coupled feature stays unbuilt until the owned server is on the table to implement it natively. The clean line: **gbrain proves single-user hosted retrieval; the owned server is where multi-user lands. Multi-user is never built on gbrain.**

---

## 6\. Hosting model

**Where it runs.** A **PaaS** (Platform-as-a-Service — a host that runs your app from its code without you managing servers), such as **Fly.io** or **Railway**. The gbrain HTTP server runs there, always on, behind the stable boundary from Section 5\.

**The database.** A **managed Postgres** (a Postgres database someone else operates and backs up), such as **Supabase** (a hosted-Postgres provider with the **pgvector** extension — the add-on that lets Postgres store and search those embeddings — built in) or the host's own Postgres add-on. Postgres outlives gbrain in this design: the owned server uses the same database, so this choice is not throwaway.

**The public address.** A stable **HTTPS URL** (an encrypted web address; the padlock in your browser) that every client registers once. This is the boundary — keep it under your control (your own domain or a fixed host address) so the engine behind it can change without re-registering any client.

**Secrets.** API keys (for the embedding provider, the database, the admin token) live in the host's **environment variables** (configuration values held outside the code, never committed to git) — the same key-hygiene rule from the build, now at the host level.

After legal excision, the data living on this host is ordinary business and project notes, so hosting it on a reputable platform is a routine cloud decision with routine controls.

---

## 7\. Security model

**Pilot (single user):**

- OAuth 2.1 \+ PKCE on every request; no unauthenticated read path.  
- Secrets in environment variables, never in code or git.  
- HTTPS only.  
- Excised corpus — PDS and RevGenius already gone before the first deploy.  
- The honest residual: when any client reads a vault file into a conversation, that text becomes context sent to that client's model. For your own use that is the intended behavior; it is worth holding consciously per client (Claude, ChatGPT, and Gemini each receive whatever you pull into their chats).

**Destination (multi-user) — auth model sketch, built on the owned server (Phase 5), not on gbrain.**

The model, confirmed compatible with the pilot's boundary:

- *Identity.* Every user authenticates through the same OAuth 2.1 + PKCE front door the pilot already uses. The server maps each authenticated user to an identity record — who they are, what role they hold.
- *Scoping.* Each identity carries a scope (the set of records it may read and write). Following Claude Tag's channel-scoped-identity pattern, a scope is defined by role and by area (a project, a team, a "channel"), so a CEO, an ops lead, and a contractor each resolve to a different slice of the same brain.
- *Enforcement at read time.* Every read path — search, list, lookup, multi-source synthesis — filters to the caller's scope before returning anything, so a user never sees another user's slice even by indirect query. Enforced in the server, against the database, on every call. (gbrain's company mode claims zero-leak fuzz-testing of these paths; it is examined as a reference design only, never the production enforcer.)
- *Storage.* Per-record ownership and visibility tags in Postgres, enforced with row-level security (a Postgres feature that filters which rows a user can see at the database layer, so the filter holds even if application code has a bug).
- *Audit.* Every read and write logged with the acting identity — the who-saw-what, who-changed-what record a business memory needs.

*Why the pilot does not foreclose this:* adding per-user scoping changes what sits behind the boundary (the server's enforcement and the database schema), never the boundary itself (MCP + OAuth at a stable URL). The pilot stands up single-user auth at that boundary; the owned server later adds scoping behind it with no client reconfigured. Multi-user is a Phase 5 addition to the owned server, never a retrofit to gbrain.

---

## 8\. Build sequence (phased, each a checkpoint)

Every phase verifies before the next begins — the same probe-first, verify-on-one discipline that carried Phases 1 and 2\. The strangler boundary and the portability ledger are live from Phase 3.1 onward.

**Phase 3.0 — Corpus excision.** Remove PDS and RevGenius, re-derive links, log, commit. Verify zero broken links. *(Local; no hosting.)*

**Phase 3.1 — Migrate to gbrain over local Postgres.** Stand up gbrain on local Postgres, import the cleaned vault, generate embeddings. Start the **portability ledger** here: log every gbrain-specific command and behavior used. Verify retrieval parity — a handful of known queries ("what is charlie", "the Wheelhouse structural limitation") return the right files with their sources. *(Local; proves the engine before exposing it.)*

**Phase 3.2 — Local HTTP server with auth, one client, behind the boundary.** Run `gbrain serve --http` locally, expose it through a temporary **tunnel** (a tool like **ngrok** or **Tailscale Funnel** that gives a local server a public address for testing), and register it as a custom connector in one client **at a stable address you control**, not a raw gbrain default. Verify a real query from Claude web reaches the vault and returns sourced results. *(Proves transport \+ auth end to end, and establishes the boundary, before paying for a host.)*

**Phase 3.3 — Deploy to the host.** Move the server to Fly.io or Railway, point it at managed Postgres, fix the stable HTTPS URL (the boundary), move secrets into environment variables. Verify the hosted server answers the same queries the local one did. *(The always-on cutover.)*

**Phase 3.4 — Register across clients.** Add the connector in Claude (web, Projects, mobile) and at least one non-Claude client (ChatGPT or a Gemini-capable tool), each pointed at your boundary URL, to prove client-agnostic access for real. Verify the same query returns the same sourced answer from two different vendors' clients. *(The requirement's actual proof — agnostic means demonstrated on two vendors, not asserted. Pilot ends here; company mode never touched.)*

**Phase 3.5 — Write-back decision (gate).** Decide whether clients may write enrichment back into the vault, or stay read-only. A real fork with its own review; deferred until read retrieval is proven.

**Phase 4 — Self-improvement (later).** The scheduled enrichment loop — a **cron** (a timed job that runs on a schedule, e.g. nightly) that re-runs evidence-weighted scoring as the corpus grows, repairs citations, and consolidates. Core to the destination, enabled by the always-on host, scoped as its own phase.

**Phase 5 — Build the owned server and swap out gbrain.** Using the portability ledger as the spec, build the small server you control and bring it up behind the same boundary URL and login. Verify the known queries return identical sourced results, then cut over — clients never reconfigured. This is the mandatory swap, and the ledger makes it a checklist rather than a re-derivation.

**Future — Multi-user for Dr Max's, on the owned server.** Implement RBAC, audit, and concurrent write-back natively, as a distinct project with its own decisions. gbrain's company mode informs the design; it is not the foundation.

---

## 9\. Cost (honest estimate)

Pilot, single user, monthly:

- Host (Fly.io / Railway small instance): \~$5–20.  
- Managed Postgres (Supabase free tier may suffice at this size; paid \~$25): $0–25.  
- Embedding provider: a small one-time cost to embed the corpus, then minimal ongoing.  
- Tunnel (testing only, Phase 3.2): free tiers exist.

Pilot range: roughly **$10–50/month**. The destination (multi-user, always-on enrichment) scales up from there; published gbrain reference setups run \~$85/month for a small always-on configuration and far more at production scale. The pilot answers the architecture questions cheaply before any of that — and the eventual swap to an owned server changes the software, not the host or database costs.

---

## 10\. The discipline that carries (working rules)

The same rules that produced a correct vault apply to the server:

- **Probe and verify on one before scaling.** Each phase proves itself on a known query or a single record before the next.  
- **State ground-truth assumptions before each build prompt**, so you can check them at a glance.  
- **Simplicity over architecture.** Add a layer only when a requirement forces it — and here the requirements (agnostic, hosted, multi-user destination) genuinely force gbrain \+ Postgres for the pilot, justified now though deferred before.  
- **Division of labor.** You make product and taste calls; the infrastructure known-unknowns — persistence, auth, cost, rate limits, secrets, rollback — are mine to surface.  
- **Implementation via Claude Code prompts** in the repo, with ground-truth stated; the spec generates the prompts.  
- **Foil-clean prose** in everything generated.

---

## 11\. The risks to name out loud

**Premature productization.** The Dr Max's vision can pull the pilot into building the multi-tenant, permissioned, audited company platform before the single-user architecture is proven. That is the cathedral-before-the-foundation failure this whole build has avoided. The pilot's job is narrow and cheap: prove a hosted server serves the vault well across two vendors' clients with working auth.

**Scaffolding becoming permanent.** "Use gbrain to validate, replace it later" decays into "gbrain is load-bearing forever" unless the swap is designed in. The strangler boundary and the portability ledger are the guard: the boundary keeps clients off gbrain-specific addresses, and the ledger keeps an honest running cost of the replacement so it never grows invisible.

---

## 12\. Open decisions for you

1. **Host:** Fly.io vs Railway vs another. (Infra detail; I can recommend once you confirm any existing account or preference.)  
2. **Database:** Supabase vs the host's own Postgres add-on. (Outlives gbrain, so worth picking well.)  
3. **gbrain as scaffolding, confirmed:** accept gbrain to validate the pilot, with the owned-server swap (Phase 5\) committed and designed in from the start. *(This is now the locked position; flagged here so it stays explicit.)*  
4. **Second client for the agnostic proof:** ChatGPT, a Gemini tool, or an open-source client — which one do you actually want to validate against in Phase 3.4.  
5. **Write-back (Phase 3.5):** read-only knowledge server, or read-write so conversations can enrich the vault — a gate, decidable after retrieval is proven.

---

## 13\. The one-line summary

Excise the legal material, stand the markdown vault behind a stable URL speaking MCP \+ OAuth 2.1 \+ PKCE, use gbrain over Postgres to fill that boundary and prove client-agnostic live retrieval across Claude and one other vendor with a single user — keeping a portability ledger throughout — then replace gbrain with a server you own behind the same boundary, and only there build the multi-user, self-improving company memory that is the real destination.  
