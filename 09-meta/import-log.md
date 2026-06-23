# Import Log

One entry per extraction or enrichment pass. The `scripts/extract-entities.ts` script appends entries here automatically. Nothing is silently dropped — every skip carries a reason and an unblock path.

## Entry format

```
## YYYY-MM-DD HH:MM run-type
- Files added: N
- Stubs created: N (list names)
- Links inferred: N
- Skipped: [filename] — reason — unblock: [action]
```

---

<!-- Extraction pass entries appended below -->

## 2026-06-23 21:54 extract-entities --apply
- Sessions scanned: 107
- Sessions modified: 57
- Wikilinks inserted: 3012
- Stubs created: 5 (Wheelhouse, Dr Max's, trip-composer, civilwarland, lodging-agent)
- Entity tiers: full=12 moderate=11 stub=0

## 2026-06-23 21:56 extract-entities --apply
- Sessions scanned: 107
- Sessions modified: 0
- Wikilinks inserted: 0
- Stubs created: 0 (Wheelhouse, Dr Max's, trip-composer, civilwarland, lodging-agent)
- Entity tiers: full=12 moderate=10 stub=1
