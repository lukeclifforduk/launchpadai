# Claude Code — Project Guide

This file is read by Claude at the start of every session. Keep it up to date as the project evolves.

---

## Project Overview

> **Fill this in before starting development.**
>
> Example: "A SaaS dashboard for small businesses to track invoices and payments."

**Name:** (TBD)
**Purpose:** (TBD)
**Target users:** (TBD)

---

## Tech Stack

> Decisions should be made during planning and recorded here.

| Layer | Choice | Notes |
|---|---|---|
| Framework | TBD | |
| Language | TBD | |
| Styling | TBD | |
| Database | TBD | |
| Auth | TBD | |
| Hosting | TBD | |
| Testing | TBD | |

---

## Project Structure

> Update this as the codebase grows.

```
(to be defined once stack is chosen)
```

---

## Development Workflow

1. **Plan first** — before writing any code, discuss the feature or change and agree on the approach.
2. **Small, focused commits** — one concern per commit.
3. **No speculative code** — only build what is needed right now.
4. **Tests for behaviour, not implementation** — write tests that would survive a refactor.
5. **Always read before editing** — Claude should read a file before modifying it.

---

## Code Conventions

> Update these once the stack is decided.

- **Naming:** (TBD — e.g. camelCase for variables, PascalCase for components)
- **File organisation:** (TBD)
- **Error handling:** Validate at system boundaries (user input, external APIs). Trust internal code.
- **Comments:** Only where logic is non-obvious. No docstrings on trivial functions.
- **No backward-compat hacks** — if something is removed, delete it completely.

---

## Key Commands

> Fill these in once the project is initialised.

```bash
# Install dependencies
TBD

# Run development server
TBD

# Run tests
TBD

# Build for production
TBD

# Lint / type-check
TBD
```

---

## Out of Scope (do not build unless explicitly asked)

- Extra configurability or feature flags
- Abstractions for hypothetical future requirements
- Error handling for scenarios that cannot happen
- Backwards-compatibility shims

---

## Current Status

- [ ] Tech stack decided
- [ ] Project initialised
- [ ] Core data model defined
- [ ] Authentication working
- [ ] First feature complete
- [ ] Deployed to staging

---

## Planning Notes

> Use this section to capture decisions, trade-offs, and open questions during planning sessions.

(empty — add notes here as planning progresses)
