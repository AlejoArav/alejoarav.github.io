# Stage 6 Prompt — Polish, Security, SEO, Accessibility

## Goal

Prepare the website for public sharing under `almejarav.xyz` by adding polish, security hygiene, metadata, accessibility checks, and documentation.

## Constraints

- Keep the site static and GitHub Pages-compatible.
- No analytics unless explicitly requested.
- No third-party scripts unless essential.
- Do not add private information.

## Tasks

1. Add or improve:

- `404.html`,
- `robots.txt`,
- `sitemap.xml`,
- favicon placeholders,
- OpenGraph/Twitter metadata,
- page descriptions,
- canonical URL placeholders using `https://almejarav.xyz/`.

2. Accessibility:

- check heading order,
- add skip link,
- improve focus states,
- ensure terminal input has an accessible label,
- ensure color contrast,
- respect `prefers-reduced-motion`,
- ensure canvas has an accessible textual description.

3. Performance:

- avoid huge assets,
- ensure simulation pauses/reduces work when hidden,
- minimize layout shifts,
- check mobile performance.

4. Security/privacy documentation:

- update `docs/SECURITY_CHECKLIST.md`,
- note that GitHub Pages is public static hosting,
- warn against committing secrets or private data,
- remind maintainers to sanitize CV PDFs.

5. Domain/deployment documentation:

- update `docs/DOMAIN_AND_DEPLOYMENT.md` with steps for:
  - buying/configuring `almejarav.xyz`,
  - setting GitHub Pages source,
  - adding custom domain,
  - verifying the domain,
  - enforcing HTTPS.

## Success criteria

- Site is shareable publicly.
- Metadata exists for main pages.
- Basic accessibility is improved.
- No secrets/private data.
- Docs explain how to deploy and maintain the site.
