# Codex Workflow for almejarav.xyz

## Why the plan is staged

The website combines content, design, GitHub Pages deployment, and interactive biological simulations. Asking Codex to do everything in one pass would likely produce a tangled implementation. Use staged prompts to keep changes reviewable.

## Recommended workflow

### 1. Start a new branch

```bash
git checkout -b stage-01-static-foundation
```

### 2. Ask Codex to implement one stage only

Example:

```txt
Read AGENTS.md and prompts/00_MASTER_GOAL.md. Then implement only prompts/01_STATIC_FOUNDATION.md. Do not implement later stages yet.
```

### 3. Review changed files

```bash
git status
git diff
```

### 4. Test locally

For buildless static files, use either:

```bash
python -m http.server 8000
```

then open:

```txt
http://localhost:8000
```

or open `index.html` directly if no module restrictions apply.

### 5. Commit

```bash
git add .
git commit -m "Implement static foundation"
```

### 6. Push and deploy/review

```bash
git push origin stage-01-static-foundation
```

Open a pull request if branch protection is enabled.

### 7. Merge before next stage

Do not start the next stage until the previous one is stable.

## Suggested branch names

```txt
stage-01-static-foundation
stage-02-terminal-interface
stage-03-toggle-lattice
stage-04-content-pages
stage-05-model-playground
stage-06-polish-security-seo
stage-07-vite-typescript
```

## What to tell Codex after each stage

Ask Codex for:

- changed files,
- how to test,
- known limitations,
- suggested next stage.

## What not to ask Codex initially

Avoid requests like:

```txt
Build the whole site with all simulations and deploy it.
```

Prefer:

```txt
Implement only Stage 2: terminal interface. Do not modify simulation files except for placeholder event hooks.
```
