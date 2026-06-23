---
type: concept
subtype: ""
status: stub
confidence: med
created: 2026-06-22
updated: 2026-06-22
source: "[[GBRAIN_PROJECT]] §7"
aliases: []
tags: []
---

A three-tier classification system for sources in the vault: live (active, queryable), deferred-technical (correct but blocked by infra), and deferred-scope (out of current scope) [from: [[GBRAIN_PROJECT]]].

The rule: every skipped source is logged in `09-meta/import-log.md` with a reason and an unblock path. Nothing drops silently.
