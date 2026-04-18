---
name: me
description: >
  Personal context system — knows WHO the user is (ME.md), WHAT they know
  (LEARNING.md), and HOW to teach them (vault knowledge graph). Use at session
  start, when reviewing PRs, when explaining code, when detecting knowledge gaps,
  or when the user says "/learn". Calibrates explanation depth, review chunking,
  comment style, and interaction approach to the individual user.
  Triggers on: /learn, /me, learning profile, knowledge tracking, explanation depth,
  "I already know that", "what do I know", proficiency, review, "explain that",
  "I don't understand", code review, PR review.
user-invocable: true
---

# Me — Personal Context Skill

A Karpathy-inspired personal context system that tracks the individual user's
preferences, knowledge, and learning style, and calibrates all agent behavior
accordingly.

## Important: This Is Per-User, Not Per-Team

`LEARNING.md` tracks ONE person's proficiency. In a team setting, each developer
has their own `LEARNING.md` (gitignored or in a personal branch). The skill
adapts to whoever is using it — a senior dev gets terse references while a
junior gets full explanations for the same concepts.

## Core Files

Three files work together:

- **`LEARNING.md`** (repo root) — what the user KNOWS per project (proficiency per concept)
- **`ME.md`** (vault root) — WHO the user is and HOW they work (preferences, learning
  style, review methodology, environment). Read this at session start to understand
  the person, not just their knowledge level.
- **`notes/`** (vault) — what EXISTS to know (reference material, knowledge graph)

Read `LEARNING.md` before explaining code, reviewing PRs, or introducing concepts.
Read `ME.md` when you need to understand preferences for how to present information,
structure reviews, write comments, or interact during sessions.

## First Run

If `LEARNING.md` does not exist in the current project:

1. Read `references/learning-template.md` from this skill's directory
2. Create `LEARNING.md` at the repo root using that template
3. Ask the owner about their experience level with the project's tech stack
4. Detect categories from project files (package.json, Cargo.toml, requirements.txt,
   pyproject.toml, go.mod, wally.toml, etc.) and seed initial category headers
5. Add any concepts the owner mentions as `known` or `familiar`

## Commands

### `/learn` (no args)
Show a summary of the current learning profile: what the owner knows, what
they're actively learning, and what's new since last update.

### `/learn I understand <concept>`
Mark a concept as mastered. Move it from `learning` or `new` to `known`.
Example: `/learn I understand the observer pattern`

### `/learn explain <concept> more`
Mark a concept for deeper explanation. Move it to `learning` with a note.
Example: `/learn explain coroutines more`

### `/learn skip <concept>`
Tell agents to stop explaining this concept — the owner already knows it.

### `/learn reset <concept>`
Move a concept back to `new` — the owner wants a refresher.

### `/learn what do I know about <topic>`
Search the profile and show what's tracked for that topic area.

## How to Update LEARNING.md

When updating the profile, follow the table format exactly:

### Adding a known concept
```markdown
| concept name | YYYY-MM-DD | known | — |
```

### Adding a learning concept
```markdown
| concept name | YYYY-MM-DD | learning | Brief note on what's unclear |
```

### Recording a struggle
Add to the `## Struggle Log` section:
```markdown
| YYYY-MM-DD | concept | What was confusing | Which PR/file |
```

## Auto-Trigger: Gap Detection (Professor Model)

Do NOT wait for the user to invoke `/learn`. Detect knowledge gaps automatically
during any conversation and trigger this skill when you notice:

- **Direct signals**: User asks "why?", "how does that work?", "what does X mean?"
- **Struggle signals**: User rejects or heavily modifies agent code, asks repeated
  follow-up questions on the same topic, or says "I don't get this"
- **Hedging language**: "I think maybe...", "not sure if...", "is it correct that..."
- **Concept misuse**: User uses a term or pattern incorrectly
- **Novelty**: You are introducing a concept, library, or pattern the user has not
  encountered before in this project

When triggered:
1. Search `LEARNING.md` for the specific concept (grep the concept name or category header — do NOT load the entire file if only checking one concept)
2. Check the proficiency level
3. Calibrate your explanation depth accordingly
4. After the user understands, update the proficiency level

## Progressive Disclosure Rules

All agents MUST check `LEARNING.md` before writing explanations and follow
these rules based on the owner's proficiency level for each concept:

### Proficiency Levels

| Level | Exposure | Behavior |
|-------|----------|----------|
| `new` | First encounter | Full explanation with analogy, concrete example, and WHY |
| `learning` | Seen before, not solid | Brief recap (1-2 sentences) + link to where it was first explained |
| `known` | Demonstrated understanding | Just reference it by name, no explanation needed |
| `stale` | Known but not seen in 30+ days | Quick one-line refresher: "Recall that X works by..." |

### Staleness Detection

If a concept is marked `known` but the `Last Seen` date is older than 30 days,
treat it as `stale` and give a quick refresher when it comes up naturally.
Don't force it — only refresh when the concept is actually relevant to the
current work.

### Hard Example Mining (Karpathy/Tesla-inspired)

Track where the owner struggles:
- If they ask a follow-up question about an explanation -> that concept needs more detail
- If they reject or heavily modify agent code -> the agent's approach didn't match their understanding
- If they say "I don't get this" -> add to struggle log with context

After each session where struggles occurred, update `LEARNING.md` with:
1. What concept was hard
2. What was confusing about it
3. A suggested learning path (what to read/try next)

### Spaced Repetition

When explaining concept B, look for opportunities to naturally reconnect to
a related concept A that is `stale`. This reinforces fading knowledge without
feeling forced.

Example: "This uses dependency injection — similar to the service pattern
you worked with in the auth module last month."

## For Automated / CI Agents

Pipeline agents, scheduled tasks, and CI-triggered agents MUST:
1. Read `LEARNING.md` before writing any PR body or code comments
2. Calibrate the `## What I Learned` section based on the owner's profile
3. Do NOT add `LEARN:`-prefixed comments to source files — use normal code
   comments (`-- NOTE:`, `-- WHY:`) that explain non-obvious logic for any reader,
   not just the owner. Educational context belongs in PR descriptions and
   interactive sessions, not baked into the codebase.
4. Skip explanations for `known` concepts unless `stale`
5. After creating a PR, check if any NEW concepts were introduced and add them
   to `LEARNING.md` as `new`

## For Interactive Sessions

When working directly with the owner:
1. Read `LEARNING.md` at session start
2. If you introduce something new, ask: "Want me to add this to your learning profile?"
3. If the owner says "I already know that" -> update to `known`
4. If the owner asks "why?" or "how does that work?" -> update to `learning` and explain fully
5. At session end, suggest any profile updates based on what happened

## Metrics Tracking

Maintain a `LEARNING_METRICS.json` file alongside `LEARNING.md` to track
learning effectiveness over time. Read `references/metrics-format.md` for the
JSON schema when creating or updating metrics. Update it whenever `LEARNING.md`
changes (concept promoted, added, or struggle recorded).

## RAG Optimization

`LEARNING.md` uses flat tables within category sections. Each concept is a single
row. This structure allows surgical retrieval — agents should grep for specific
concept names or category headers rather than reading the entire file when only
checking a single concept's proficiency. Only load the full file for `/learn`
summary commands or end-of-session reviews.

## AI Code Review — Focused Human Review

When the user is reviewing AI-generated code, the agent MUST use `LEARNING.md`
to calibrate what to focus on. The goal is efficient verification — not reading
every line, but spending human attention where it matters most.

### What AI Code Gets Wrong (Backed by Research)

AI-generated code produces 1.7x more issues per PR than human code. These are
the specific blind spots to watch for during reviews:

1. **Plausible but wrong logic** — compiles, types check, reads correctly, but
   control flow is subtly wrong. Must be caught by running it, not reading it.
2. **Tautological tests** — when AI generates both implementation and tests,
   the tests verify what the code *does*, not what it *should do*. They pass
   because they mirror the implementation, not because they independently verify.
3. **Missing guardrails** — null checks, early returns, error handling omitted.
   AI optimizes for "looks correct" not "fails gracefully."
4. **Business context violations** — AI infers patterns statistically, not
   semantically. It misses rules the user has internalized about how the
   project should work.

### Review Process (Proof Over Vibes)

Based on Addy Osmani's "Proof Over Vibes" framework and synthesized research:

1. **Intent check (30 seconds)** — does the PR description match the requirement?
   Does the diff match the stated intent?
2. **Proof check** — are there passing tests, screenshots, logs? No proof = flag it.
3. **Focused human review** — use `LEARNING.md` to know what the user understands:
   - `known` concepts: skip explaining, just flag if the implementation is wrong
   - `learning` concepts: brief note on WHY this approach, flag edge cases
   - `new` concepts: explain fully, offer to add to learning profile
4. **Call out AI blind spots** — specifically flag plausible-but-wrong logic,
   tautological tests, missing guardrails, and context violations
5. **Skip what's automated** — formatting, linting, syntax issues are handled by
   bots. Don't waste human attention on those.

### What NOT to Do

- Do NOT add `LEARN:` prefixed comments to source files. Educational context
  belongs in PR descriptions and interactive reviews, calibrated by `LEARNING.md`.
- Do NOT explain things the user already knows (`known` level). Reference by name.
- Do NOT flood the user with every issue. Prioritize by: correctness > security >
  architecture > performance > style.

## Obsidian Integration (Optional)

If the user has an Obsidian vault (a personal knowledge base / second brain),
this skill can leverage it as a knowledge source using Karpathy's LLM Wiki
architecture:

- **The vault holds what EXISTS to know** (reference material, wiki pages,
  research, ingested sources)
- **LEARNING.md holds what the USER knows** (proficiency tracking per concept)
- Together: the agent knows what to teach and has source material to teach from

### How to Connect

The vault is just markdown files on disk. No MCP server needed — agents read
and write directly via the filesystem. If the user has an `obsidian-vault`
skill installed, use it. Otherwise, access the vault path directly:

1. When a gap is detected, search `notes/` in the vault for the concept
2. If found, pull context from the vault note to enrich the explanation
3. When the user learns something new during a coding session, offer to file it
   as a vault note in `notes/` (compounding knowledge, Karpathy-style)
4. Follow `related:` frontmatter in vault notes to find connected concepts
5. During lint/review passes, cross-reference `LEARNING.md` concepts against
   vault pages to find gaps where knowledge exists in the vault but the user
   hasn't learned it yet

### Key Principle

The vault is the **knowledge graph**. `LEARNING.md` is the **learning state**.
The skill bridges the two — it knows WHERE knowledge lives (vault) and HOW MUCH
the user already understands (LEARNING.md), so it can teach at the right depth
with the right source material.
