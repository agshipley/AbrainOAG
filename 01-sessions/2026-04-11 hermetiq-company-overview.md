---
type: session
source: claude-export
uuid: 2cddda57-fbef-4761-902d-8a63c5e4b565
title: "Hermetiq company overview"
created: 2026-04-11
updated: 2026-04-11
message_count: 2
status: stub
confidence: high
tags: []
---

# Hermetiq company overview

## Summary

**Conversation Overview**

The person asked Claude to review the Hermetiq website (hermetiq.com) to get up to speed on the company. Claude attempted to fetch the site directly but was unable to render content due to it being a JavaScript single-page application. Claude then conducted web searches to gather information and provided an overview of Hermetiq based on available indexed content.

Hermetiq is a build intelligence platform focused on Bazel, founded in 2025 and based in Los Angeles, California. The platform addresses the challenge of maintaining hermetic builds and cache hit rates in Bazel environments, offering AI-driven observability via Model Context Protocol (MCP) to identify cache misses, reduce build costs, and improve developer infrastructure performance. Claude explained the underlying technical problem — that Bazel's hermetic build model is powerful but difficult to maintain in practice, leading to silent performance degradation — and positioned Hermetiq as the observability and intelligence layer to address this. Claude offered to explore related topics such as competitive landscape, technical approach, or MCP integration details.

**Tool Knowledge**

The `web_fetch` tool was unable to render hermetiq.com because the site is a JavaScript SPA that requires client-side rendering; the tool returned no usable content. Web search was the effective fallback, with queries like "Hermetiq build intelligence Bazel" and "Hermetiq.com Bazel platform features MCP" successfully surfacing company information from sources including PitchBook. For JavaScript-heavy sites like this, defaulting to targeted web searches rather than relying on `web_fetch` is the more reliable approach.

## Transcript

**human**

Let's get up to speed on Hermetiq. Please review: https://www.hermetiq.com/

**assistant**

I'll take a look at the Hermetiq website for you.
```
This block is not supported on your current device yet.
```

The site requires JavaScript to render, so the content didn't come through. Let me search for more information about Hermetiq.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Here's what I found on Hermetiq:

**Hermetiq** is a build intelligence platform for Bazel that helps fix cache misses, lower build costs, and ship faster with AI-driven observability via MCP.

The platform gives visibility into Bazel builds, identifies bottlenecks, fixes cache misses, and develops workflows. It provides AI-enhanced build intelligence for Bazel and other build systems. The company was founded in 2025 and is based in Los Angeles, California.

From their PitchBook profile, the company provides observability around build behavior, surfaces issues tied to caching and performance, and uses machine learning insights within Model Context Protocol (MCP) powered workflows, enabling organizations that rely on Bazel to optimize their developer infrastructure.

In terms of the problem they're solving: Bazel's power comes from hermetic builds — deterministic, cacheable, and parallelizable — but in practice, maintaining hermeticity and cache hit rates is notoriously difficult. Cache misses silently degrade build performance, costing teams time and compute. Hermetiq essentially provides the observability layer to catch and fix those issues, with an AI/MCP-native approach that lets developers query and act on build data through tools like Claude.

Unfortunately the site itself is a JavaScript SPA that didn't render for me, so I couldn't pull detailed product pages, pricing, or docs. Want me to dig into anything specific — their competitive landscape, technical approach, or how MCP fits into their workflow?
