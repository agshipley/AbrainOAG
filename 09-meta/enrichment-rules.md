# Enrichment Rules

## Tiered escalation

Entities escalate through three tiers as inbound link count grows. The enrichment pass (`scripts/enrich-entities.ts`, Phase 2) reads inbound link counts from the edge index and upgrades `status` in frontmatter when a threshold is crossed.

| From | To | Trigger |
|------|----|---------|
| `stub` | `moderate` | 3+ inbound links (distinct source files) |
| `moderate` | `full` | 8+ inbound links, or entity is the subject of a direct working session |

## Rules

1. **Auto-escalate on threshold crossing.** The enrichment pass updates `status` and `updated` in frontmatter. It does not write body content — that requires a separate review pass or a direct session.

2. **Evidence-gated body expansion.** When escalating stub → moderate, add a snapshot and active threads drawn from the sessions that generated the inbound links. Cite each claim: `[from: [[session-file]]]`. Fabricate nothing.

3. **Full profiles on direct sessions.** If a session file is dedicated to an entity (entity name in session title or frontmatter `project:`), escalate to `full` and populate all type-appropriate sections from that session.

4. **Archived on explicit decision.** Set `status: archived` manually after Andrew confirms an entity is inactive. The enrichment pass never archives automatically.

5. **No pre-filling.** Writing a full profile from a single mention or a summary manufactures false confidence. This is the failure mode Andrew distrusts — guard against it at every pass.

## Dedup rules

- Check `aliases` frontmatter before creating a new stub. If a matching alias exists, add the new mention as an inbound link to the existing file.
- Log every dedup decision to `09-meta/import-log.md`.
