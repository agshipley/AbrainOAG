---
type: session
source: claude-export
uuid: 57351c28-af06-45f8-8b0e-9d9fb6776adf
title: "Google Drive access"
created: 2026-04-03
updated: 2026-04-03
message_count: 2
status: stub
confidence: high
tags: []
---

# Google Drive access

## Summary

**Conversation Overview**

The person asked whether Claude has access to Google Drive. Claude confirmed it was not currently connected but checked the MCP registry and found an available Google Drive connector. Claude then surfaced the connector for the person to install, explaining that once connected, Claude would be able to search for and analyze files in their Google Drive directly within the conversation. No files were accessed or tasks completed beyond this initial setup inquiry.

**Tool Knowledge**

To check for available integrations, Claude used the `search_mcp_registry` tool with the keyword `['google drive']`, which successfully returned the Google Drive connector (UUID: `37fb5d42-ef62-45d4-a12e-66551527a003`). Claude then used `suggest_connectors` with that UUID and the keyword `['drive']` to surface the connector to the person. This two-step pattern — registry search followed by connector suggestion — is the correct flow for helping this person discover and connect new integrations they do not yet have active.

## Transcript

**human**

Do you have access to google drive?

**assistant**

The user is asking if I have access to Google Drive. Let me check what MCP servers/connectors are available. Looking at the tools I have, I don't see a Google Drive tool listed. Let me search the MCP registry to see if there's a Google Drive connector available.I don't currently have Google Drive connected, but let me check if there's a connector available for it.
```
This block is not supported on your current device yet.
```

There's a Google Drive connector available but it's not connected. Let me suggest it to the user.There's a Google Drive connector available, but it's not connected yet. Would you like to connect it? Here it is:
```
This block is not supported on your current device yet.
```

I've suggested the connector. The user can now connect it.Once you connect it, I'll be able to search for and analyze files in your Google Drive directly from our conversation.
