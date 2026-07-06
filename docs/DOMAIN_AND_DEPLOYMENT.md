# Domain and GitHub Pages Deployment Plan

## Goal

Publish the website at:

```txt
https://almejarav.xyz
```

using GitHub Pages and a GitHub repository.

## Selected repository

```txt
AlejoArav/alejoarav.github.io
```

This creates a user site at:

```txt
https://alejoarav.github.io
```

before the custom domain is connected.

Because this is a GitHub user-site repository:

- the published site lives at the domain root rather than a repo subpath
- root-relative asset URLs are valid
- the current Vite configuration should keep the default base path `/`

## Deployment mode — current repository state

The repository now uses a Vite + TypeScript build and should deploy with GitHub Actions:

1. Push the static site files to GitHub.
2. Open `Settings -> Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.
4. Commit the Vite and TypeScript source, public assets, and workflow files.
5. Push to `main` and wait for the first Pages deployment to complete.
6. Confirm that the deployed default URL is `https://alejoarav.github.io/` before attaching `almejarav.xyz`.

The workflow in `.github/workflows/deploy-pages.yml` installs dependencies,
builds the multi-page site into `dist/`, uploads the artifact, and deploys it
to GitHub Pages.

## Custom domain steps

1. Buy `almejarav.xyz` from a registrar.
2. Enable 2FA at the registrar.
3. Enable WHOIS/privacy protection if available.
4. In GitHub repository settings, open Pages settings.
5. Add the custom domain `almejarav.xyz`.
6. Save so GitHub writes a `CNAME` value for the Pages site configuration if needed.
7. Configure DNS at the registrar for the apex domain using the current GitHub Pages A records.
8. Optionally add `www.almejarav.xyz` as a CNAME pointing to the GitHub Pages host.
9. In the GitHub account-level domain verification area, verify `almejarav.xyz` to reduce takeover risk.
10. Wait for DNS propagation and confirm that the Pages settings show the custom domain as active.
11. Enable `Enforce HTTPS` in GitHub Pages settings once the certificate is ready.
12. Re-check `robots.txt`, `sitemap.xml`, and canonical URLs after the custom domain is live.

## DNS notes

- Apex domain records should follow GitHub's current published recommendations rather than hard-coded values copied into old notes.
- Remove stale A, AAAA, ALIAS, or CNAME records if the hosting strategy changes.
- If `www` is enabled, decide whether `https://www.almejarav.xyz` redirects to `https://almejarav.xyz` or the other way around and keep canonical tags aligned with that decision.

## HTTPS and verification checklist

1. Confirm the Pages deployment is green in GitHub.
2. Open `https://almejarav.xyz` directly.
3. Check that the browser certificate is valid.
4. In Pages settings, confirm `Enforce HTTPS` is checked.
5. Verify that canonical tags, Open Graph URLs, and sitemap URLs all use `https://almejarav.xyz/`.
6. Confirm that no private or draft-only files were accidentally published.

## Suggested URL strategy

Primary:

```txt
https://almejarav.xyz
```

Optional redirect/subdomain:

```txt
https://www.almejarav.xyz
```

## Do not host sensitive data

GitHub Pages sites are public. Do not commit or publish:

- secrets,
- tokens,
- private datasets,
- home address,
- phone number,
- private drafts,
- unpublished sensitive research data.

This includes:

- unsanitized CV PDFs,
- unpublished microscopy data,
- internal lab notes,
- credentials or API tokens,
- draft manuscripts not meant for public release.
