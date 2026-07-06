# Stage 1 Prompt — Static Foundation for GitHub Pages

## Goal

Create the first deployable GitHub Pages version of `almejarav.xyz`: a clean, static, buildless website with a terminal-inspired homepage, basic navigation, safe placeholder content, and a clear folder structure.

## Constraints

- Use only HTML, CSS, and vanilla JavaScript.
- Do not add npm, Vite, React, Astro, Jekyll, or other frameworks.
- Do not add a backend, database, contact form service, or analytics.
- Keep the site deployable from the repository root using GitHub Pages.
- Do not include private address, phone number, secrets, or sensitive content.

## Tasks

1. Create this structure if it does not exist:

```txt
index.html
about.html
research.html
projects.html
models.html
notes.html
teaching.html
cv.html
contact.html
404.html
assets/css/main.css
assets/css/terminal.css
assets/css/simulations.css
assets/js/main.js
assets/js/terminal.js
assets/js/simulations/base-simulation.js
assets/data/projects.json
assets/data/publications.json
assets/data/notes.json
assets/data/commands.json
assets/cv/.gitkeep
assets/img/.gitkeep
```

2. Build a shared visual identity:

- minimal terminal/digital-garden aesthetic,
- readable typography,
- responsive layout,
- high contrast,
- green/red biological accents,
- subtle scientific feel.

3. Implement `index.html` with:

- site title: `Alejandro Aravena Lazo`,
- subtitle: `complex biological systems · synthetic circuits · collective behavior`,
- short homepage text:

```txt
I study how biological entities switch, communicate, synchronize,
compete, and form patterns — from genetic circuits to bacterial colonies.
```

- navigation links:

```txt
home / research / models / projects / notes / teaching / cv / contact
```

- visible terminal prompt placeholder:

```txt
> type ? for commands
```

4. Implement placeholder content pages:

- Each page should have a consistent header/nav/footer.
- Each page should include a concise heading and placeholder text describing its future content.
- Use semantic HTML.

5. Implement initial JSON data files with a few placeholder records.

6. Add a `README.md` with:

- project purpose,
- local development instructions,
- GitHub Pages deployment instructions,
- privacy warning about not committing sensitive data.

## Success criteria

- The site can be opened locally from `index.html`.
- Every navigation link works.
- The layout works on mobile and desktop.
- No browser console errors.
- The code is simple, readable, and ready for Stage 2.
