# Edge Vocabulary

Edges are inferred from wikilinks by string/regex rules. Zero LLM calls per edge. Daily ingestion stays token-free.

New edge types require a `09-meta` change signed off by Andrew — no ad-hoc invention mid-import.

## Edge table

| Edge | From → To | Inferred when |
|------|-----------|---------------|
| `built` | person → project | Profile authored or owns the repo |
| `depends_on` | project → project/concept | Stack or dependency named in project file |
| `client_of` | person/company → person | Engagement relationship stated |
| `collaborator_on` | person → project | Named as collaborator in project or person file |
| `employed_at` | person → company | Role at company stated in person file |
| `authored` | person → writing/source | Publication or draft attributed to person |
| `decided_in` | decision → session | Call made during that conversation, session linked |
| `references` | any → source | Citation or mention of a source entity |
| `supersedes` | decision → decision | A later decision file overrides an earlier one |

## Inference rules (implementation notes for `scripts/extract-entities.ts`)

- Parse every `[[wikilink]]` in a file.
- Look up the link target's `type` in frontmatter.
- Apply the edge table: if the current file is type `person` and the target is type `project`, emit `built` (if the file body uses ownership language) or `collaborator_on` (if collaboration language).
- Write inferred edges to `09-meta/edge-index.md` on each extraction pass (append-only, deduped by pair).
- Log every inference to `09-meta/import-log.md` with source file, target, edge type, and the matching rule.
