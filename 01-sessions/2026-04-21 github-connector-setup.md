---
type: session
source: claude-export
uuid: d3d2a978-3d7b-4256-9272-2ba7695954b9
title: "GitHub connector setup"
created: 2026-04-21
updated: 2026-04-21
message_count: 4
status: stub
confidence: high
tags: []
---

# GitHub connector setup

## Summary

**Conversation Overview**

The person is working on a project called [[Orpheus]] (a job search engine), located at `~/projects/Orpheus/job-search-engine/` on their local machine. The established workflow involves Claude drafting Claude Code prompts that the person executes locally. The conversation focused on troubleshooting GitHub integration within claude.ai on the web platform (not desktop).

The person attempted to connect a GitHub connector and encountered failure. Claude clarified an important distinction: GitHub on claude.ai web functions as a **project knowledge source** (read-only, static snapshot, synced via the "+" button within the project panel), not a live connector like Gmail or Calendar. The path to add it is: open the [[Orpheus]] project → project knowledge section (right panel) → "+" → GitHub → authenticate → select repo/files. Claude also noted that a separate known bug exists where the "Connect" button is non-functional for some users with no error message displayed. True live GitHub connector functionality (issues, PRs, real-time file access) does not exist on claude.ai web as of this conversation. For live repo actions, Claude Code with existing GitHub auth or the GitHub CLI via Claude Code were identified as the available alternatives. The conversation ended with Claude asking the person to clarify which use case they needed and where exactly the flow was failing.

## Transcript

**human**

Do you have github connector enabled for this project?

**assistant**

No — I don't have a GitHub connector enabled for this project. The tools available here are Google Drive, Gmail, and Google Calendar (plus web search, code execution, places, etc.), but no GitHub integration.

If you want me to interact with the [[Orpheus]] repo directly — read files, check commit state, open issues, review PRs — you'd need to add a GitHub connector via the Connectors settings. Otherwise the workflow stays as it is: I draft Claude Code prompts, you run them from `~/projects/Orpheus/job-search-engine/`.

Want me to flag this whenever a task would go faster with repo access, or just assume Claude Code is always the execution layer?

**human**

I have attempted to connect the github connector and it WILL NOT WORK. we are on web not desktop if that matters

**assistant**

I should look up what's currently happening with the GitHub connector on web since these integrations can have issues or limitations that change over time.
```
This block is not supported on your current device yet.
```

 I'm realizing there's an important distinction here—GitHub integration for Projects on claude.ai does work and lets you add repos to your project knowledge through the "+" button, syncing files directly into the knowledge base. What's not supported is GitHub functioning as a connector like Gmail or Calendar would.

Andrew's hitting a known bug with the Connect button being non-functional, but he should be able to add the [[Orpheus]] repo to his project knowledge instead, which will give him access to the file contents even if it's just a static snapshot rather than real-time interaction. I need to give him direct, practical guidance without the reassurances—he's frustrated and needs to know what actually works.There's a distinction worth naming because "GitHub connector" means two different things, and which one you're trying to set up determines whether it's even possible on web.

**What exists on claude.ai web:** GitHub as a **project knowledge source**, not a live connector like Gmail or Calendar. You add it from inside the project, not from Settings → Connectors. Path: open the [[Orpheus]] project → project knowledge section (right panel) → "+" button → select GitHub → authenticate → pick repo and files. That syncs a snapshot of selected files into project knowledge so I can read them. You hit "Sync" to pull updates. It's read-only, static until re-synced — not real-time repo interaction.

**What doesn't exist on claude.ai web:** A GitHub connector equivalent to Gmail/Calendar that lets me fetch files live, read issues, open PRs, or run actions. People have been requesting it for months; it's not shipped. If you were trying to add it via Settings → Connectors, that's why nothing is working — it's not there to connect.

**Known bug, separately:** The "Connect" button for GitHub has been reported as non-functional for some users across web and desktop, with no error shown. If you're clicking Connect and literally nothing happens, that's a documented issue, not something you can fix on your end.

**So, concretely for [[Orpheus]]:**

1. If you want me to read repo files during our sessions, add the repo via project knowledge (the "+" in the project, not Settings → Connectors). Likely works.
2. If you want me to take actions on the repo (create issues, open PRs, read PR comments live), that's not available on web. Your options are Claude Code (which already has GitHub auth) or the GitHub CLI from Claude Code.

Which one were you actually trying to do? If it's #1 and the in-project "+" flow is also broken, tell me exactly where it fails (button does nothing, auth redirect dies, repo list empty, etc.) and I'll work from there.
