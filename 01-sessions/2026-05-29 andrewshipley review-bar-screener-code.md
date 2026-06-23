---
type: session
source: claude-code
uuid: 2d701cd3-47cd-4e69-9e89-94902c002298
title: "Review bar screener code"
project: "andrewshipley"
cwd: "/Users/andrewshipley"
created: 2026-05-29
updated: 2026-05-29
message_count: 28
status: stub
confidence: high
tags: []
---

# Review bar screener code (andrewshipley)

## Transcript

**user**

<ide_opened_file>The user opened the file /Users/andrewshipley/Desktop/Poesis/Andrew/Bar Hunter/code/bar_screener.jsx in the IDE. This may or may not be related to the current task.</ide_opened_file>
take a moment to review the code

**assistant**

Let me read the file.

**assistant**

Here's my review of **Wheelhouse** (`bar_screener.jsx`):

---

## What it does well

- Clean separation of concerns: scoring engine, capitalization math, and UI are distinct and easy to follow
- The `computeAllIn` financing stack is well-thought-out — SBA debt, seller carry, and contingency all correctly layer
- `useMemo` on `scored` is the right call; re-computing scores on every render would be wasteful
- Graceful fallback when `window.storage` is unavailable; the try/catch pattern is appropriate for an optional persistence layer

---

## Bugs

**1. Hardcoded `$150k` in the "Stack:" display** ([bar_screener.jsx:415](Desktop/Poesis/Andrew/Bar%20Hunter/code/bar_screener.jsx#L415))
```jsx
Stack: operator <b style={{ color: C.ink }}>{k(150000)}</b> placeholder ·
```
`Row` doesn't receive `params`, so `operatorCash` isn't available there — the "placeholder" label confirms this is a known TODO. The calculation in `computeAllIn` uses `p.operatorCash` correctly; the display needs to either pass `params.operatorCash` down to `Row`, or store it in the `fin` object returned by `computeAllIn`.

**2. "Parse with AI" will always return 401** ([bar_screener.jsx:543](Desktop/Poesis/Andrew/Bar%20Hunter/code/bar_screener.jsx#L543))
The fetch to `api.anthropic.com` has no `x-api-key` header. The feature silently falls to `perr` with "Couldn't parse automatically." You'd need to either add a header with a key (and accept the client-side exposure), or proxy through a backend endpoint.

**3. Dead code in `recommend`** ([bar_screener.jsx:137](Desktop/Poesis/Andrew/Bar%20Hunter/code/bar_screener.jsx#L137))
```js
const tone = (t) => t; // never called
```

**4. Only 5 of 8 broker questions are shown** ([bar_screener.jsx:440](Desktop/Poesis/Andrew/Bar%20Hunter/code/bar_screener.jsx#L440))
`BROKER_QS.slice(0, 5)` — the last three questions (deferred capex, ABC discipline/CUP, seller's reason) are silently dropped. Probably unintentional.

---

## Design fragility

**Mixed `sellerFinancing` / `kitchen` types.** `BLANK` stores `"false"` (string), the seed data uses `false` (boolean), `computeAllIn` checks both (`!== false && !== "false"`), but `econScore` only checks the boolean form. If a persisted opportunity has `sellerFinancing: "true"` (string), `econScore` won't give the carry bonus. The `submit()` coercion fixes this for new entries, but round-tripping through storage preserves whatever was stored.

The safest fix: normalize all incoming data to booleans at load time, or add a coercion step in `econScore`/`computeAllIn` at the top.

---

## Minor

- No delete confirmation — one mis-click removes an opportunity silently. A simple `window.confirm` or an undo toast would help.
- `id: "x" + Date.now()` for new opportunities could collide if two are added within the same millisecond. `crypto.randomUUID()` is available in modern browsers and more robust.
- The `conceptScore` function doesn't handle `beachProximity: "unknown"` (falls through all branches with no adjustment). That's acceptable behavior, but worth a comment since it affects listings added via the form where "unknown" is a valid selection.

---

## Summary

The scoring and capitalization logic is solid. The two most impactful fixes are: **pass `operatorCash` through to the `Row` display** (easiest fix: add it to the `fin` object) and **fix or proxy the AI parse call** so the feature actually works. Everything else is cleanup.

**user**

<ide_opened_file>The user opened the file /Users/andrewshipley/Desktop/Poesis/Andrew/Bar Hunter/code/bar_screener.jsx in the IDE. This may or may not be related to the current task.</ide_opened_file>
alright, some changes made. Please review and then let's get this thing up and running on railway

**assistant**

Let me re-read the current state of the file first.

**assistant**

Good changes — all four issues from the review are addressed:
- `normalizeOpp` cleans up the type inconsistency across seed, form, and storage round-trips
- `computeAllIn` now returns `operatorCash` and the Stack display reads `fin.operatorCash` instead of the hardcoded `150k`
- Delete confirmation added
- All 8 broker questions now show

Now let me look at the project structure to plan the Railway deployment.

**assistant**

Just the single JSX file — no project scaffold yet. Let me check what's installed and then set everything up.

**assistant**

Good — Railway CLI is installed, Node v24 is ready. I'll set up the full project scaffold in the `code/` directory, add a localStorage persistence fallback (so state survives refreshes on Railway, not just in the Claude artifact runtime), and wire up Railway config.

**assistant**

First, adding the localStorage fallback so the app actually persists data on Railway.

**assistant**

Got it — full autonomy. Let me proceed.

**assistant**

Now replace the three `window.storage` usages with `store`:

**assistant**

Now creating the Vite scaffold:

**assistant**

Build clean. Now git init and deploy.

**assistant**

Railway session expired. Need to log in — this opens a browser tab.

**assistant**

The Railway CLI needs a browser-based login, which it can't do through this terminal session. Here's exactly what to run in a regular terminal from your `code/` folder to finish the deploy:

```bash
cd "/Users/andrewshipley/Desktop/Poesis/Andrew/Bar Hunter/code"

# Step 1 — log back in (opens browser)
railway login

# Step 2 — create a new Railway project
railway init

# Step 3 — deploy
railway up
```

Railway will give you a public URL at the end of `railway up`. That's the live app.

---

**What was set up:**

- [vite.config.js](Desktop/Poesis/Andrew/Bar%20Hunter/code/vite.config.js) — Vite build, `$PORT` wired for Railway
- [railway.toml](Desktop/Poesis/Andrew/Bar%20Hunter/code/railway.toml) — build + start commands
- [src/main.jsx](Desktop/Poesis/Andrew/Bar%20Hunter/code/src/main.jsx) — React entry point
- [index.html](Desktop/Poesis/Andrew/Bar%20Hunter/code/index.html) — minimal HTML shell
- [bar_screener.jsx](Desktop/Poesis/Andrew/Bar%20Hunter/code/bar_screener.jsx) — now includes a `store` shim that uses `localStorage` on Railway so pipeline data and criteria persist across page refreshes

Build verified clean: 179 kB JS, gzip 57 kB. Everything is committed and ready to push.

**user**

created a repo on github. can you push everything there to start, then I'll get going with railway: https://github.com/agshipley/Wheelhouse

**assistant**

Pushed. Everything is live at [github.com/agshipley/Wheelhouse](https://github.com/agshipley/Wheelhouse).

In Railway: **New Project → Deploy from GitHub repo → agshipley/Wheelhouse**. It'll pick up `railway.toml` automatically and build on the first deploy.

**user**

it will if the code has the right anthropic API key

**assistant**

Two things needed: add the API key header to the fetch, and Anthropic requires a special header when calling directly from a browser. I'll wire it to a `VITE_ANTHROPIC_API_KEY` env var you'll set in Railway — the key goes in Railway's env settings, never in the code.

**assistant**

Also update the error message since it's no longer Claude.ai-runtime-specific:

**assistant**

Build, commit, and push:

**assistant**

Pushed. In Railway, before you deploy:

**Settings → Variables → Add Variable:**
```
VITE_ANTHROPIC_API_KEY = sk-ant-...
```

One note: because it's a `VITE_` prefixed variable, it gets baked into the JS bundle at build time — meaning anyone who inspects the page source could extract it. Fine for a private tool you're the only user of, but worth keeping in mind if you ever make the URL public.

**user**

no I think we need gitignore and an env here right?

**assistant**

Right — `.gitignore` needs to cover env files, and you need a `.env.local` for running locally. Let me check what's there now.

**assistant**

`*.local` already covers `.env.local` — good. But `.env` itself isn't covered. Let me fix that and add an example file:

**assistant**

Now create your actual local env file (not committed):

**assistant**

`.env.local` is correctly excluded. Committing and pushing:

**assistant**

Done. Fill in your key in [.env.local](Desktop/Poesis/Andrew/Bar%20Hunter/code/.env.local) for local dev (`npm run dev` will pick it up automatically). Railway gets it via the environment variable you set in the dashboard — Railway doesn't use `.env` files, just its own Variables panel.
