# learn

A continual learning skill for AI coding agents, distributed via [skills.sh](https://skills.sh).

Inspired by [Andrej Karpathy's LLM Wiki architecture](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
and his approach to continual learning and hard example mining, this skill tracks
your software engineering knowledge and calibrates all AI agent explanations to
your actual proficiency level.

## Install

```bash
npx skills add EricsenSemedo/learn
```

## What It Does

- Tracks your knowledge level per concept (`new` -> `learning` -> `known` -> `stale`)
- Calibrates agent explanations: no redundant explanations for things you know
- Auto-detects knowledge gaps mid-conversation (like a professor noticing confusion)
- Hard Example Mining: tracks where you struggle for targeted re-teaching
- Spaced Repetition: resurfaces concepts going stale
- Metrics tracking: measure your learning velocity over time
- Works with any codebase, any language, any framework

## Commands

| Command | What it does |
|---------|--------------|
| `/learn` | Show your current learning profile |
| `/learn I understand X` | Mark a concept as mastered |
| `/learn explain X more` | Request deeper explanation |
| `/learn skip X` | Stop explaining this concept |
| `/learn reset X` | Get a refresher on a concept |
| `/learn what do I know about X` | Search your profile |

## How It Works

The skill maintains a `LEARNING.md` file at your project root that tracks concepts
by proficiency level. All compatible AI agents read this file before writing
explanations, PR descriptions, or code comments, and adjust their detail level
accordingly.

On first run, the skill auto-scaffolds `LEARNING.md` from a template and seeds
categories based on your project's tech stack.

**Per-user, not per-team**: `LEARNING.md` tracks one person's proficiency. In a
team, each developer has their own (gitignored or in a personal branch). A senior
dev gets terse references; a junior gets full explanations for the same concepts.

## The Professor Model

Unlike typical memory systems that load everything into every session, this skill:
- Loads `LEARNING.md` **only when needed** (gap detected or `/learn` invoked)
- Uses **surgical retrieval** (grep for specific concepts, not full file loads)
- Gets **cheaper over time** as you learn more (fewer gaps = fewer triggers)
- Tracks effectiveness via `LEARNING_METRICS.json`

## Obsidian Integration (Optional)

If you use [Obsidian](https://obsidian.md) as a personal knowledge base / second
brain, this skill can leverage it via direct filesystem access (no MCP needed —
vaults are just markdown files):

- **The vault holds what EXISTS to know** (reference material, wiki pages, research)
- **LEARNING.md holds what YOU know** (proficiency tracking per concept)
- Together: the agent knows what to teach you and has source material to teach from

When a knowledge gap is detected, the agent searches your vault's `notes/`
directory for the concept and pulls context to enrich the explanation. When you
learn something new during coding, the agent files it back as a vault note —
knowledge compounds over time, Karpathy-style.

## Compatible Agents

Works with any agent that supports the Agent Skills format:
Claude Code, Cursor, Windsurf, GitHub Copilot, Cline, Codex, and 40+ others
via [skills.sh](https://skills.sh).

## References

- [Karpathy's LLM Wiki Idea File](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Original Tweet](https://x.com/karpathy/status/2039805659525644595)
- [skills.sh](https://skills.sh)

## License

MIT
