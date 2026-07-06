# AGENTS.md — almejarav.xyz GitHub Pages Website

## Project identity

This repository contains the source for `almejarav.xyz`, a personal interactive digital garden for Alejandro Aravena Lazo. The site should communicate his work in computational biology, synthetic biology, mathematical modeling, microscopy/data-analysis pipelines, open-source biotechnology, teaching, and complex collective biological behavior.

The website should feel like a small living biological-systems terminal: minimal, personal, scientific, interactive, and Git-maintainable. It is inspired by terminal/digital-garden personal sites, but must not copy any existing site's source, assets, text, or visual identity.

## Core goals

1. Build a static website hosted on GitHub Pages.
2. Keep the first implementation simple: HTML, CSS, vanilla JavaScript, and Canvas.
3. Avoid a backend, database, WordPress, authentication, or server-only features.
4. Make the site easy to edit with Git and Codex.
5. Represent complex collective behaviors through interactive browser simulations.
6. Prioritize accessibility, performance, and security.
7. Keep sensitive personal information out of public files.

## Planned public pages

- `/` — terminal-inspired homepage with interactive biological background.
- `/about.html` — personal/scientific profile.
- `/research.html` — research interests and research statement.
- `/projects.html` — selected projects.
- `/models.html` — model playground index.
- `/notes.html` — digital garden / notes index.
- `/teaching.html` — teaching and educational resources.
- `/cv.html` — safe public CV downloads.
- `/contact.html` — email/social/ORCID/GitHub links.
- `/404.html` — custom not found page.

## Simulation priorities

Implement simulations gradually. Do not build all of them at once.

1. Toggle lattice — first signature simulation.
   - States: green/GFP-like, red/RFP-like, dark/low-expression.
   - Concepts: local coupling, stochastic switching, external field, perturbation.
2. Reaction–diffusion — organic pattern-forming texture.
3. Quorum-sensing particles — particles secrete diffusive signal and switch by threshold.
4. Predator–prey particles — ecological collective behavior.
5. SIR grid/particles — spatial propagation and front dynamics.
6. Ising-like lattice — optional advanced variant.

## Technical constraints

- Must remain deployable by GitHub Pages.
- Prefer static files and client-side JavaScript.
- No Node build step in Stage 1 unless explicitly requested.
- If a build step is added later, use Vite + TypeScript and GitHub Actions, with `dist/` deployed to Pages.
- Do not add frameworks unless the relevant staged prompt asks for them.
- Avoid unnecessary third-party dependencies.
- Use semantic HTML.
- Use responsive CSS.
- Use progressive enhancement: site content should still be readable if JavaScript fails.
- Include reduced-motion support for animations/simulations.
- Keep simulation loops efficient and pause/reduce work when the tab is hidden.

## Security and privacy rules

- Do not publish Alejandro's full street address or phone number.
- Do not commit secrets, API keys, tokens, private datasets, or private correspondence.
- Do not add contact forms requiring a backend unless specifically requested.
- Use `mailto:` contact links in the initial version.
- Do not load third-party analytics by default.
- Use HTTPS-compatible assets only.
- Keep all CV PDFs in `assets/cv/` and ensure they are public-safe.
- Never include private notes or unpublished sensitive data.

## Design direction

- Minimal terminal/digital-garden influence.
- Personal and scientific tone.
- Monospace accents, but readable body text.
- Green/red biological accents inspired by GFP/RFP toggle-switch work.
- Dark or off-white theme is acceptable; maintain contrast.
- Canvas simulation should be subtle enough that text remains readable.
- Avoid flashy animations that obscure content.
- Avoid copying `lhommeduchili.xyz`; use it only as conceptual inspiration.

## Content voice

The writing should be clear, warm, and scientifically grounded. It should be accessible to biologists, physicists, engineers, students, and technical recruiters.

Use three levels of tone:

1. Homepage: personal, concise, slightly poetic.
2. Projects/models: accessible scientific explanation.
3. CV/research: more formal and professional.

## Suggested homepage copy

Use or adapt this identity text:

```txt
Alejandro Aravena Lazo

computational biology · synthetic biology · mathematical modeling

I study how biological entities switch, communicate, synchronize,
compete, and form patterns — from genetic circuits to bacterial colonies.
```

Suggested navigation:

```txt
home / research / models / projects / notes / teaching / cv / contact
```

Suggested commands:

```txt
?
about
projects
research
models
notes
cv
contact
model toggle
model reaction
model quorum
perturb
reset
```

## Repository structure target for Stage 1

```txt
.
├── AGENTS.md
├── README.md
├── index.html
├── about.html
├── research.html
├── projects.html
├── models.html
├── notes.html
├── teaching.html
├── cv.html
├── contact.html
├── 404.html
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── terminal.css
│   │   └── simulations.css
│   ├── js/
│   │   ├── main.js
│   │   ├── terminal.js
│   │   └── simulations/
│   │       ├── base-simulation.js
│   │       └── toggle-lattice.js
│   ├── data/
│   │   ├── projects.json
│   │   ├── publications.json
│   │   ├── notes.json
│   │   └── commands.json
│   ├── cv/
│   └── img/
├── docs/
│   ├── DOMAIN_AND_DEPLOYMENT.md
│   ├── SECURITY_CHECKLIST.md
│   └── CONTENT_MODEL.md
└── prompts/
    ├── 00_MASTER_GOAL.md
    ├── 01_STATIC_FOUNDATION.md
    ├── 02_TERMINAL_INTERFACE.md
    ├── 03_TOGGLE_LATTICE.md
    ├── 04_CONTENT_PAGES.md
    ├── 05_MODEL_PLAYGROUND.md
    ├── 06_POLISH_SECURITY_SEO.md
    └── 07_OPTIONAL_VITE_TYPESCRIPT.md
```

## Coding style

- Use clear, small functions.
- Prefer ES modules when possible.
- Name files and functions descriptively.
- Keep simulation code separate from UI/terminal code.
- Avoid global variables except for a single controlled app namespace if needed.
- Use comments to explain biological meaning, not obvious JavaScript syntax.
- Use `requestAnimationFrame` for animation loops.
- Respect `prefers-reduced-motion`.
- Resize canvas safely on viewport changes.
- Handle mobile/touch interactions gracefully.

## Quality bar before each stage is complete

Before finishing a stage, check:

- The site still opens locally by loading `index.html`, or via a simple local server.
- Navigation links work.
- No console errors on load.
- Layout works on mobile and desktop widths.
- Text contrast is readable.
- Keyboard interaction works for the terminal input.
- Simulation does not make text unreadable.
- No private data is present.
- README or docs are updated if setup changed.

## How Codex should work

For each stage:

1. Read `AGENTS.md` first.
2. Read the relevant staged prompt in `prompts/`.
3. Make the smallest coherent implementation that satisfies the stage.
4. Do not jump ahead to later stages unless explicitly requested.
5. Do not add dependencies unless the stage allows it.
6. Leave concise notes in the final response explaining what changed and what to test.
7. If a requested feature conflicts with GitHub Pages static hosting, propose a static-compatible alternative.

