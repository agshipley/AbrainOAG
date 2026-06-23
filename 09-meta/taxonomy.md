# Taxonomy

## Canonical entity types

Nine fixed types. Subtype, format, and origin belong in frontmatter — not in folder nesting.

| Type | Folder | Used for |
|------|--------|----------|
| `project` | 02-projects/ | Repos, products, initiatives |
| `person` | 03-people/ | Collaborators, clients, contacts |
| `company` | 04-companies/ | Employers, clients, target orgs |
| `concept` | 05-concepts/ | Technical and strategic ideas, reusable patterns |
| `source` | 06-sources/ | Papers, articles, docs, external references |
| `writing` | 08-writing/ | Publications, resume versions, outreach drafts, essays |
| `decision` | 07-decisions/ | Architectural and strategic calls with rationale (date-stamped filenames) |
| `session` | 01-sessions/ | One file per Claude / Claude Code conversation |
| `note` | 00-inbox/ or any | Raw captures, scratch, unclassified |

## Frontmatter schema (every entity file)

```yaml
---
type: person | company | project | concept | source | writing | decision | session | note
subtype: ""          # e.g. collaborator, client, employer, repo, paper
status: stub | moderate | full | archived
confidence: low | med | high
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: ""           # where this entity's facts came from (session link, URL, doc)
aliases: []          # for dedup and Obsidian alias resolution
tags: []
---
```

## Body convention

- One-line definition at the top (what/who this is, in a sentence).
- Sections appropriate to type:
  - Person: Role, Working relationship, Strengths, Open threads
  - Project: Thesis, Stack, Status, Known bugs, Next
  - Decision: Context, Calls made, Rationale
- Every factual claim cites its source inline: `[from: [[session-file]]]`
- Wikilink every named entity that has a file — this is what builds the graph.

## Status definitions

| Status | Threshold | Meaning |
|--------|-----------|---------|
| `stub` | 1 mention | Name, one-line context, source. Nothing more. |
| `moderate` | 3+ mentions | Snapshot, working style or thesis, active threads. |
| `full` | 8+ mentions or a direct working session | Complete profile, all sections, full history. |
| `archived` | Inactive | Entity is no longer active; preserved for reference. |

Enrichment passes auto-escalate when inbound link count crosses the threshold. Pre-filling a full profile from thin evidence manufactures false confidence — do not do it.

## Confidence definitions

| Level | Meaning |
|-------|---------|
| `low` | Single source; unverified; inferred |
| `med` | Multiple consistent mentions; plausible |
| `high` | Directly verified; primary source |
