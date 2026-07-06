# almejarav.xyz

Static source for `almejarav.xyz`, a personal digital garden and portfolio for Alejandro Aravena Lazo.

## Purpose

This repository hosts a static GitHub Pages website focused on:

- computational biology
- synthetic biology
- mathematical modeling
- collective biological behavior
- microscopy and biological image analysis
- open-source biotechnology
- teaching and scientific communication

The site now uses a small Vite + TypeScript build layer while staying fully static:

- HTML
- CSS
- TypeScript entry/build configuration
- vanilla JavaScript and TypeScript modules
- Canvas-ready simulation scaffolding
- JSON data files

The homepage uses a floating terminal-style interface over a decorative browser
simulation background. The final output remains GitHub Pages-compatible and
deploys as plain static files.

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the local development server:

```bash
pnpm dev
```

Create a production build:

```bash
pnpm build
```

The production-ready static output is written to `dist/`.

Note: JSON-driven sections such as projects and notes render more completely over
the dev server than over direct `file://` browsing because some browsers limit
fetch requests from local files.

## GitHub Pages Deployment

This site is intended to deploy through GitHub Actions to GitHub Pages.
The chosen GitHub Pages repository is the user-site repository:

```txt
AlejoArav/alejoarav.github.io
```

That means:

- the default published URL is `https://alejoarav.github.io/`
- the Vite build can keep the root `/` base path
- `almejarav.xyz` can later be attached as the custom domain for the same site

1. Push the repository to GitHub.
2. In `Settings -> Pages`, set the source to `GitHub Actions`.
3. Let `.github/workflows/deploy-pages.yml` install dependencies and build the site.
4. GitHub Pages will publish the generated `dist/` artifact.
5. If using a custom domain, follow `docs/DOMAIN_AND_DEPLOYMENT.md`.

Stage 06 also adds:

- `robots.txt`
- `sitemap.xml`
- SVG favicon and Open Graph placeholder artwork
- canonical URLs and social metadata for public pages

## Project Structure

Stage 07 introduces a source/build split while preserving the same public pages:

- root `*.html` files remain the page entry points for Vite
- `src/app.ts` is the shared browser entry
- `src/styles/` contains maintained CSS source
- `src/scripts/` contains shared site behavior
- `src/simulations/` contains simulation source, with TypeScript migration started there
- `public/assets/` contains static data, images, and public-safe CV assets
- `dist/` is generated at build time and should not be edited manually

## Privacy And Security

Do not commit any of the following:

- home address
- phone number
- API keys, tokens, or credentials
- private datasets
- unpublished sensitive research material
- private correspondence

Only include public-safe professional contact information such as email, GitHub, LinkedIn, and ORCID.

GitHub Pages is public static hosting. Anything committed to the published branch
should be assumed world-readable once deployed.
