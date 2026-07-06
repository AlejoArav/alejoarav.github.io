# Security and Privacy Checklist

## GitHub account

- [ ] Enable two-factor authentication.
- [ ] Use SSH keys or GitHub CLI for local work.
- [ ] Review account recovery options.
- [ ] Avoid committing credentials from local environment files.

## Repository

- [ ] Add `.gitignore`.
- [ ] Enable Dependabot alerts if dependencies are introduced.
- [ ] Enable secret scanning if available.
- [ ] Protect the `main` branch once the site is stable.
- [ ] Use pull requests for larger changes.
- [ ] Do not commit private notes or unpublished sensitive data.
- [ ] Remember that GitHub Pages publishes static repository contents publicly.
- [ ] Review structured data files in `assets/data/` for accidental sensitive details.

## Public personal information

- [ ] Do not publish full street address.
- [ ] Do not publish phone number.
- [ ] Use `Santiago, Chile` as location if needed.
- [ ] Use email/social links instead of full personal details.
- [ ] Sanitize CV PDFs before uploading.
- [ ] Check PDF metadata for author names, hidden comments, tracked changes, and embedded files before publishing.

## Website

- [ ] Enforce HTTPS after custom domain is connected.
- [ ] Avoid third-party analytics by default.
- [ ] Use only HTTPS assets.
- [ ] Do not add contact forms until a safe third-party static form provider is selected.
- [ ] Add accessible fallback text for canvas simulations.
- [ ] Respect `prefers-reduced-motion`.
- [ ] Keep decorative simulations non-essential so content remains readable and accessible.
- [ ] Confirm `robots.txt`, `sitemap.xml`, and canonical URLs match the deployed domain.
- [ ] Review Open Graph and Twitter metadata before public sharing.

## Domain

- [ ] Enable registrar 2FA.
- [ ] Enable auto-renewal if appropriate.
- [ ] Verify custom domain in GitHub.
- [ ] Remove stale DNS records if deployment changes.
- [ ] Keep registrar account recovery information up to date and secured.
