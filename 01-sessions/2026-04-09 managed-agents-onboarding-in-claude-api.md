---
type: session
source: claude-export
uuid: fd721848-b5e4-4b0e-915c-1dc7e0c11e34
title: "Managed agents onboarding in Claude API"
created: 2026-04-09
updated: 2026-04-09
message_count: 2
status: stub
confidence: high
tags: []
---

# Managed agents onboarding in Claude API

## Summary

**Conversation overview**

The person requested onboarding assistance for Claude's Managed Agents feature in the Claude API. This was a technical getting-started session focused on understanding and implementing the newly launched Managed Agents public beta (released April 8, 2026). Claude researched the official documentation and provided a structured onboarding guide covering the four core concepts of the system: Agent, Environment, Session, and Events.

Claude walked through the complete setup flow with working curl/bash code examples: creating an Agent via POST to `/v1/agents` (with model, system prompt, and `agent_toolset_20260401` tool type), creating an Environment via `/v1/environments` (with cloud config and unrestricted networking), and starting a Session via `/v1/sessions` linking the agent and environment. Claude noted that all requests require the `anthropic-beta: managed-agents-2026-04-01` header, though the SDK sets this automatically. Pricing details were included: standard token pricing plus $0.08/session-hour for active runtime and $10 per 1,000 web searches. Rate limits of 60 requests/minute for create endpoints and 600/minute for read endpoints were also documented. The conversation ended with Claude asking what type of agent the person wants to build in order to assist with system prompt design, tool configuration, or environment setup.

**Tool knowledge**

Claude used `web_search` and `web_fetch` to retrieve Managed Agents documentation. The URL `https://platform.claude.com/docs/en/managed-agents/overview` successfully returned markdown content, while `https://platform.claude.com/docs/en/managed-agents/quickstart` did not render its main content — in that case, falling back to `web_search` with `site:platform.claude.com managed agents quickstart` was the effective workaround to recover the needed quickstart details.

## Transcript

**human**

start onboarding for managed agents in Claude API

**assistant**

Let me search for the most up-to-date information on this topic.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Now let me get the official docs for the quickstart/onboarding:
```
This block is not supported on your current device yet.
```

Now let me grab the quickstart:
```
This block is not supported on your current device yet.
```

The quickstart page didn't render its main content. Let me try the API reference:
```
This block is not supported on your current device yet.
```

Now I have comprehensive information. Here's your onboarding guide for Claude Managed Agents:

---

Claude Managed Agents just launched in public beta (as of yesterday, April 8, 2026). Here's how to get started.

## Prerequisites

You need a Claude API key (get one at [platform.claude.com/settings/keys](https://platform.claude.com/settings/keys)). Managed Agents is enabled by default for all API accounts. All requests require the `managed-agents-2026-04-01` beta header, though the SDK sets it automatically.

## Step 1: Create an Agent

An agent defines the model, system prompt, and tools. Create one with a POST to `/v1/agents`:

```bash
agent=$(curl -sS --fail-with-body https://api.anthropic.com/v1/agents \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d @- <<'EOF'
{
  "name": "Coding Assistant",
  "model": "claude-sonnet-4-6",
  "system": "You are a helpful coding assistant. Write clean, well-documented code.",
  "tools": [
    {"type": "agent_toolset_20260401"}
  ]
}
EOF
)
AGENT_ID=$(jq -er '.id' <<<"$agent")
echo "Agent ID: $AGENT_ID"
```

The `agent_toolset_20260401` tool type enables the full set of built-in tools (bash, file ops, web search, web fetch). You can selectively disable tools via the `configs` array if needed.

## Step 2: Create an Environment

An environment configures a cloud container with pre-installed packages, network access rules, and mounted files:

```bash
environment=$(curl -sS --fail-with-body https://api.anthropic.com/v1/environments \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d @- <<'EOF'
{
  "name": "quickstart-env",
  "config": {
    "type": "cloud",
    "networking": {"type": "unrestricted"}
  }
}
EOF
)
ENVIRONMENT_ID=$(jq -er '.id' <<<"$environment")
echo "Environment ID: $ENVIRONMENT_ID"
```

## Step 3: Start a Session

A session is a running agent instance performing a specific task:

```bash
session=$(curl -sS --fail-with-body https://api.anthropic.com/v1/sessions \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d @- <<EOF
{
  "agent": "$AGENT_ID",
  "environment_id": "$ENVIRONMENT_ID",
  "title": "Quickstart session"
}
EOF
)
SESSION_ID=$(jq -er '.id' <<<"$session")
echo "Session ID: $SESSION_ID"
```

## Step 4: Send Events and Stream Responses

Send user messages as events. Claude autonomously executes tools and streams back results via server-sent events (SSE). You can also send additional events mid-execution to steer or interrupt the agent.

## Key Concepts

The system is built around four concepts: **Agent** (model + prompt + tools), **Environment** (container template), **Session** (a running instance), and **Events** (messages exchanged between your app and the agent).

## Pricing

Standard API token pricing applies, plus $0.08 per session-hour for active runtime (measured in milliseconds — idle time doesn't count). Web searches cost an additional $10 per 1,000 searches.

## Rate Limits

Create endpoints are limited to 60 requests/minute and read endpoints to 600 requests/minute per organization, plus your standard tier-based limits.

## What's Next

The full documentation is at [platform.claude.com/docs/en/managed-agents/overview](https://platform.claude.com/docs/en/managed-agents/overview). A few features — outcomes, multi-agent coordination, and memory — are currently in research preview and require [requesting access](https://claude.com/form/claude-managed-agents).

What kind of agent are you looking to build? I can help you design the system prompt, tool configuration, or environment setup.
