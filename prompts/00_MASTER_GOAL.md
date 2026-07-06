# Codex Master Goal — almejarav.xyz

You are working in the repository for `almejarav.xyz`, a GitHub Pages personal website for Alejandro Aravena Lazo.

## High-level objective

Build a static, Git-maintainable, interactive personal website that presents Alejandro as a computational/synthetic biologist interested in complex collective behaviors between biological entities. The site should combine a minimal terminal/digital-garden aesthetic with browser-based biological simulations such as toggle lattices, reaction–diffusion patterns, quorum-sensing particles, predator–prey dynamics, and SIR waves.

## Core technical constraint

This website must work on GitHub Pages. Assume static hosting only unless a later explicit instruction adds a build step. Do not add a backend, database, WordPress, login system, or server-only feature.

## Target audience

- Academic collaborators in biology, physics, engineering, and complex systems.
- Technical recruiters or AI/scientific-computing evaluators.
- Students and educators looking for teaching material.
- Visitors interested in scientific visualizations and open-source biology.

## Design intent

The site should feel like entering a small biological-systems terminal. It should be minimal, intimate, interactive, and scientific.

Use the reference concept of a terminal/digital garden, but do not copy any existing website's code, text, layout, or assets. Create an original version centered on biological collective behavior.

## Scientific identity

Emphasize:

- complex collective biological behavior,
- synthetic gene circuits,
- mathematical modeling,
- stochastic systems and noise,
- bacterial colonies and pattern formation,
- reaction–diffusion and Ising-like models,
- microscopy/data-analysis pipelines,
- open-source biotechnology and teaching.

## First implementation direction

Start with a buildless static site:

- HTML
- CSS
- vanilla JavaScript
- Canvas API
- JSON data files

Later, if requested, migrate to Vite + TypeScript + GitHub Actions.

## Primary pages

- `index.html`
- `about.html`
- `research.html`
- `projects.html`
- `models.html`
- `notes.html`
- `teaching.html`
- `cv.html`
- `contact.html`
- `404.html`

## First interactive feature

The first signature interactive feature should be a GFP/RFP-like toggle lattice background:

- green = GFP-like state,
- red = RFP-like state,
- dark = low-expression/inactive,
- local coupling influences state changes,
- stochastic noise creates flips,
- user can perturb/reset the system,
- terminal command can switch to the model.

## Privacy/security rules

- Do not include Alejandro's street address or phone number.
- Do not add secrets, API keys, private data, private datasets, or sensitive unpublished material.
- Do not add analytics or external scripts unless explicitly requested.
- Use email/social links before contact forms.
- Keep all public CVs sanitized.

## Stage workflow

Use the staged prompt files in this order:

1. `01_STATIC_FOUNDATION.md`
2. `02_TERMINAL_INTERFACE.md`
3. `03_TOGGLE_LATTICE.md`
4. `04_CONTENT_PAGES.md`
5. `05_MODEL_PLAYGROUND.md`
6. `06_POLISH_SECURITY_SEO.md`
7. `07_OPTIONAL_VITE_TYPESCRIPT.md`

Do not attempt the whole website in one pass. Complete one stage at a time and keep the implementation stable.
