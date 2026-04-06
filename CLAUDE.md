# Claude Code — Project Guide

This file is read by Claude at the start of every session. Keep it up to date as the project evolves.

---

## Project Overview

**Name:** Launchpad
**Purpose:** A single-page web application that acts as a visual presentation. Designed to be viewed in a browser — think a polished, interactive slide deck or scrolling showcase rather than a traditional app.
**Target users:** Anyone the presentation is shared with — likely viewed on desktop but should be responsive.

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

## GitHub Pages — Live Preview (MANDATORY)

**Every branch push must include a valid `index.html` at the repository root.**

This keeps GitHub Pages working at all times so the user can preview work-in-progress on any branch.

Rules:
- Before pushing any branch, verify that `index.html` exists at the repo root.
- If it does not exist yet, create a minimal one that reflects the current state of the project (e.g. a placeholder page, or the actual app entry point once one exists).
- If the build outputs to a subdirectory (e.g. `dist/` or `out/`), copy or symlink the built `index.html` to the root, or use a root-level `index.html` that redirects to the correct location.
- Never push a branch that would break or remove the root `index.html`.
- After any push where visual progress has been made, remind the user with the live preview URL in the format: `https://lukeclifforduk.github.io/launchpadai/` — include this proactively whenever it would be useful for the user to see the current state (e.g. after a UI change, after initialising the project, after completing a feature).

---

## Development Workflow

1. **Plan first** — before writing any code, discuss the feature or change and agree on the approach.
2. **Small, focused commits** — one concern per commit.
3. **No speculative code** — only build what is needed right now.
4. **Tests for behaviour, not implementation** — write tests that would survive a refactor.
5. **Always read before editing** — Claude should read a file before modifying it.
6. **Always ensure `index.html` exists at root before pushing** — see GitHub Pages rule above.

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
- [ ] Presentation structure / slides defined
- [ ] Content written
- [ ] Visual design complete
- [ ] Live on GitHub Pages

---

## Planning Notes

> Use this section to capture decisions, trade-offs, and open questions during planning sessions.

(empty — add notes here as planning progresses)
