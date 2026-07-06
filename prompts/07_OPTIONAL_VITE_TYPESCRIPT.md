# Stage 7 Prompt — Optional Vite + TypeScript Upgrade

## Goal

Upgrade the site only if the vanilla JavaScript codebase has become difficult to maintain. This stage adds a build process using Vite and TypeScript while still deploying static files to GitHub Pages.

## Use this stage only if requested

Do not perform this migration unless explicitly instructed. The buildless version is preferred for early stages.

## Constraints

- The final output must remain static and GitHub Pages-compatible.
- Use GitHub Actions for deployment if a build step is introduced.
- Preserve the visual design and content.
- Do not rewrite everything unnecessarily.

## Tasks

1. Add Vite and TypeScript project files:

```txt
package.json
vite.config.ts
tsconfig.json
src/
public/
.github/workflows/deploy-pages.yml
```

2. Move source code carefully:

- HTML entry points or Vite-compatible pages,
- CSS into `src/styles/`,
- simulation modules into `src/simulations/`,
- data into `public/assets/data/` or source-managed imports.

3. Convert simulation JavaScript to TypeScript gradually:

- define types for cells, simulation settings, and model state,
- keep functions small,
- avoid overengineering.

4. Configure GitHub Actions to:

- install dependencies,
- build the site,
- upload the generated static artifact,
- deploy to GitHub Pages.

5. Update README with:

```bash
npm install
npm run dev
npm run build
```

6. Confirm all routes still work after deployment.

## Success criteria

- `npm run build` produces a static deployable output.
- GitHub Actions deploys successfully to GitHub Pages.
- Existing pages and simulations still work.
- The code is easier to maintain than before.
