---
type: session
source: claude-export
uuid: 023b35da-1f2b-4999-aa22-88d42b4b1699
title: "Session limit interruption duration"
created: 2026-03-24
updated: 2026-03-24
message_count: 4
status: stub
confidence: high
tags: []
---

# Session limit interruption duration

## Summary

**Conversation Overview**

The person, a Claude Pro plan subscriber, asked about session limits — specifically what the interruption duration would be when hitting a session limit, and then followed up after receiving a "you've used 90% of your session limit" warning message. Claude explained that this warning indicates proximity to the cap for the current 5-hour rolling usage window, and that upon hitting 100%, access is paused until that window resets. Claude noted that the Pro plan's exact message count per window is not published by Anthropic and varies based on model choice and message complexity, with Opus consuming more quota than Sonnet. Claude also mentioned a double usage promotion running until March 27, 2026, available during off-peak hours (outside 8 AM–2 PM ET on weekdays), and suggested the person wrap up priority work before hitting the limit, consider switching to Sonnet to conserve quota, and use the displayed reset timer once the limit is reached.

## Transcript

**human**

how long will the interruption be when I hit my session limit?

**assistant**

```
This block is not supported on your current device yet.
```

It depends on which limit you're hitting — there are a couple of different ones:

**Usage limit (subscription quota):** Standard limits reset every 5 hours, with the exact countdown displayed in the interface. So when you hit your message quota, you'll typically need to wait until that 5-hour window resets. There are also weekly limits that reset every 7 days.

**Per-turn tool-use limit:** If you see "Claude reached its tool-use limit for this turn," that's resolved instantly by clicking "Continue" — it takes about two seconds and no work is lost.

For the main usage limit, the wait depends on where you are in your 5-hour rolling window. The reset time is shown when you hit the limit. Also worth noting: until March 27, 2026, there's a double usage promotion during off-peak hours (outside 8 AM–2 PM ET on weekdays), so you may be able to get more done by scheduling intensive sessions during those times.

Which plan are you on? That affects how much usage you get per window.

**human**

I'm on pro. and the message is "you've used 90% of your session limit"

**assistant**

That 90% warning means you're close to hitting the cap for your current 5-hour rolling window. Once you hit 100%, you'll be locked out until that window resets — which could be anywhere from a few minutes to a few hours depending on when your first message in the window was sent.

On the Pro plan, the exact number of messages per window isn't published by Anthropic and varies based on factors like which model you're using (Opus uses more quota than Sonnet) and how complex your messages are. But the 5-hour countdown starts from your first prompt in that window.

A few things you can do right now:

Wrap up your most important work before you hit 100%. Switch to Sonnet if you've been using Opus, since it consumes less of your quota. And take advantage of that double usage promotion running until March 27 — if you shift your heavy sessions to off-peak hours (outside 8 AM–2 PM ET on weekdays), you'll get twice the allowance.

Once you do hit the limit, the reset time will be displayed so you'll know exactly when you can pick back up.
