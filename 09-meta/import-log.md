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
