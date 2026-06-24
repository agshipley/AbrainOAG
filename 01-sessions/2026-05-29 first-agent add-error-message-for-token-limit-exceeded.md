---
type: session
source: claude-code
uuid: 758fd5aa-daf7-4ff8-aa2b-06f03fe6b961
title: "Add error message for token limit exceeded"
project: "[[first-agent]]"
cwd: "/Users/andrewshipley/projects/first-agent"
created: 2026-05-29
updated: 2026-05-29
message_count: 6
status: stub
confidence: high
enriched: 2026-06-23
tags: []
---

# Add error message for token limit exceeded ([[first-agent]])

## Summary

Added a `TOKEN_EXHAUSTED_MSG` constant and `_is_credit_error()` helper to the first-agent Flask application. The helper checks error text for keywords (`credit`, `billing`, `balance`, `quota`, `insufficient`) that Anthropic includes on credit exhaustion, distinguishing it from per-minute rate limiting. Both the `/run` route (via `_collect_leads`) and the `/deep-dive` route now check for credit exhaustion before attempting a retry; on match, they surface the user-facing message and stop. Normal per-minute rate limit hits continue to retry as before.

## Transcript

**user**

In the event that the site stops working becasue I've run out of claude tokens, I would like the site to return an error message "looks like we've been too busy tooday! the admin has been notified that additional tokens are required. our apologies"

**assistant**

Let me look at the relevant files to understand where API errors are handled.

**assistant**

I can see there are two places that handle API errors: `_collect_leads` (used by `/run`) and the deep-dive loop. I'll add a credit/quota exhaustion check to both, plus a constant for the friendly message.

**assistant**

Now update the `_collect_leads` error handler to check for credit exhaustion before doing the retry:

**assistant**

Now update the deep-dive route's rate limit handler:

**assistant**

Done. Here's what was added:

- **`TOKEN_EXHAUSTED_MSG`** constant with your exact message (typo preserved)
- **`_is_credit_error()`** helper that checks the error message for keywords like `credit`, `billing`, `balance`, `quota`, `insufficient` — these are the strings Anthropic includes when your credit balance is exhausted (as opposed to a normal per-minute rate limit)
- Both the `/run` route (via `_collect_leads`) and the `/deep-dive` route now check for this condition before attempting a retry; if it matches, they surface the friendly message and stop

Normal rate limit hits (per-minute throttling) will still retry as before. Only credit exhaustion will show the user-facing message.
