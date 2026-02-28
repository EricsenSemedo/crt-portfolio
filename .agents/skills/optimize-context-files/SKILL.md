---
name: optimize-context-files
description: Audits and slims down AGENTS.md, CLAUDE.md, and Cursor rules using research-backed principles. Context file overviews increase AI costs 20%+ with minimal benefit; tooling instructions and non-obvious rules are what agents act on. Use when asked to optimize, audit, slim down, or improve AGENTS.md, project rules, cursor rules, or context files. Also use when setting up AI rules for a new project.
---

# Optimize Context Files

Based on [Gloaguen et al., arXiv:2602.11988, ICML 2026](https://arxiv.org/abs/2602.11988): developer-written context files give +4% task success but increase inference cost by ~20%. The cost comes from codebase overviews that don't help — tooling instructions do.

## The Framework: Keep vs Remove

**Keep** — agents act on these:
- Build/tool commands (exact CLI commands for the project's toolchain)
- Non-obvious rules the agent will consistently get wrong without being told
- Project-specific tooling that is niche or underrepresented in training data
- Debugging paths or setup steps that are machine/environment-specific
- PR/workflow conventions (guides AI when creating branches and PRs)

**Remove** — agents don't benefit, but pay token cost:
- Project structure trees (agent explores the filesystem anyway — confirmed by paper)
- Architecture overviews and module descriptions (discoverable from source)
- Dependency lists (agent reads `package.json`, `wally.toml`, `requirements.txt`, etc.)
- Naming convention tables where conventions are already visible in the existing code
- Demo/run instructions already described in README
- Anything the agent can discover in 1-2 tool calls

**Important language nuance**: The research was conducted on Python — a language saturated in training data. For **niche languages** (Luau, Gleam, Zig, Roc, etc.) or niche toolchains (Rojo, Wally, Rokit), context files are likely more valuable because the model has less parametric knowledge. Keep more for niche stacks.

## Audit Process

1. **Read the existing AGENTS.md** (or equivalent)
2. **Classify each section** using the table below
3. **Rewrite**, keeping only the sections marked "keep"
4. **Refactor Cursor rules** into auto-attached files (see below)
5. **Sync** AGENTS.md ↔ `.cursor/rules/project-standards.mdc`

### Section Classification

| Section type | Action | Reason |
| --- | --- | --- |
| Build commands / CLI tools | ✅ Keep | Directly acted on; niche tools especially important |
| Non-obvious language rules | ✅ Keep | Corrects consistent agent mistakes |
| Machine-specific paths/setup | ✅ Keep | Not inferrable from code |
| PR / branch / commit conventions | ✅ Keep | Guides PR creation workflow |
| Project structure tree | ❌ Remove | Agents explore filesystem; overviews don't speed this up |
| Architecture / module descriptions | ❌ Remove | Agent reads source directly |
| Dependency versions/lists | ❌ Remove | Agent reads lockfiles/manifests |
| Naming conventions (if code already exists) | ❌ Remove | Agent infers from existing code |
| "How to run the demo" | ❌ Remove | Discoverable from README/scripts |

## Cursor Rules: Auto-Attach Instead of Always-Load

Split monolithic rules into small, scoped `.mdc` files:

```
.cursor/rules/
├── <language>-standards.mdc   ← globs: ["**/*.ext"], alwaysApply: false
├── project-standards.mdc      ← synced with AGENTS.md, alwaysApply: false
└── debugging.mdc              ← alwaysApply: true (only if very small)
```

**`<language>-standards.mdc` frontmatter:**
```yaml
---
description: "<Language> code standards for <Project>"
globs: ["**/*.<ext>"]
alwaysApply: false
---
```

This fires only when a matching file is open, saving tokens on every non-code conversation.

**`alwaysApply: true`** only for rules that are tiny (< 20 lines) and must apply universally (e.g., a debugging log path). Everything else should be `false`.

## Avoiding Duplication in Cursor

Cursor automatically loads `AGENTS.md` as a workspace rule. Do **not** create a `.cursor/rules/project-standards.mdc` that mirrors it — that doubles context cost with zero benefit.

`.cursor/rules/` files should only contain rules that **add something AGENTS.md doesn't**:
- `<language>-standards.mdc` with globs — adds scoping (fires only for relevant files)
- `debugging.mdc` (tiny, always-apply) — Cursor-specific tooling like log paths

If a `.cursor/rules/` file contains the same content as `AGENTS.md`, delete it.

## Output Format

After auditing, produce:
1. A rewritten `AGENTS.md` (slimmed to actionable content only)
2. Updated `.cursor/rules/project-standards.mdc` (synced copy with frontmatter)
3. A new `.cursor/rules/<language>-standards.mdc` if the project has a primary language with non-obvious rules

Report the line count before/after and briefly note what was removed and why.

## Example: What "Non-Obvious Rules" Looks Like

Good (agent gets this wrong without being told):
```markdown
- Every file must begin with `--!strict`
- Use instance hierarchy for requires: `game:GetService(...).Path` — never `require("string")`
- `warn()` for recoverable errors, `error()` for critical failures
```

Bad (agent already knows this):
```markdown
- Use descriptive variable names
- Handle errors appropriately
- Keep functions small and focused
```
