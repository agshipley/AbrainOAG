---
type: session
source: claude-export
uuid: 65981260-c2a0-4219-8ba8-7ed01590af8e
title: "Resuming project after break"
created: 2026-03-21
updated: 2026-03-21
message_count: 8
status: stub
confidence: high
tags: []
---

# Resuming project after break

## Transcript

**human**

Ok, it's been about a week. I'm going to need help getting back into the project

**assistant**

I'd love to help you get back into the project! Could you give me a quick refresher on what we're working on? It looks like memory isn't enabled, so I don't have access to our previous conversations.

What's the project about?

**human**

This is within the same project but it's a new conversation

**assistant**

Got it! Since this is a new conversation, I don't have access to what we discussed before — each conversation starts fresh for me without memory of previous ones.

Could you give me a quick recap? Even just a sentence or two about what the project is and where you left off would help me get up to speed!

**human**

so can you explain how memory works across conversations within the same project? And if there's no retention, the "projects" on Claude are strictly organizational?

**assistant**

Great question! Let me look up the current details on how Projects work.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Great question — here's how it actually works:

**Projects are more than just folders, but memory isn't automatic.**

Projects do give Claude persistent context through a few mechanisms:

1. **Project instructions / system prompt** — anything you add to the project's instructions is loaded at the start of every conversation in that project. This is the most reliable form of persistence.

2. **Files you upload to the project** — documents, notes, code, etc. uploaded to the project are available in every conversation within it.

3. **Memory feature (opt-in)** — if you enable Claude's memory feature, each project gets its own separate memory space and dedicated project summary, keeping context focused and separate from other projects or standalone chats. However, this feature has to be turned on in Settings, and you indicated it's not enabled for you.

**Without memory enabled**, each new conversation in a project does start fresh in terms of what I *recall* — Claude has to decide to use search tools to retrieve past context, and if the current question doesn't seem to require historical context, it might not look.

So to directly answer your question: **Projects are not strictly organizational**, but the persistence depends on what you put in them. The project instructions and uploaded files are always available; automatic cross-conversation memory requires the memory feature to be enabled.

**The most reliable workaround** (what many people do) is to keep a running "state" document — a brief notes file uploaded to the project summarizing where things stand — and paste or reference it at the start of a new conversation. Want to enable memory, or would you like to just catch me up on the project now?

**human**

enable memory

**assistant**

I can't enable memory for you directly — that's a setting you'd need to toggle yourself. Here's how:

1. Go to **Settings** (click your profile/avatar)
2. Navigate to **Capabilities** (or **Features**)
3. Toggle on **Generate memory from chat history**

Once it's on, I'll start building context from your conversations automatically. After you've enabled it, come back and fill me in on the project — that way it gets captured in memory going forward!
