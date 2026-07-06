# Stage 4 Prompt — Content Pages and Structured Data

## Goal

Turn the site from a visual prototype into a real personal portfolio/digital garden by adding structured project, research, teaching, CV, notes, and contact content.

## Constraints

- Keep the website static and GitHub Pages-compatible.
- Use JSON data and HTML rendering with vanilla JavaScript where useful.
- Do not add a database, CMS, backend, or contact form.
- Do not expose private address, phone number, secrets, or private datasets.
- CV files should be placed in `assets/cv/` only after they have been checked/sanitized.

## Tasks

1. Update `assets/data/projects.json` with initial project entries:

- Synthetic genetic network for biochemical noise and pattern formation.
- Mathematical and computational modeling of an optogenetic circuit.
- Lattice-based self-activating toggle-switch model.
- Ising-like spatial patterns in bacterial populations.
- Python microscopy image-processing pipelines.
- Open-source biotechnology and molecular biology education.

Each project should include:

```json
{
  "title": "",
  "slug": "",
  "summary": "",
  "period": "",
  "status": "active | completed | in-preparation",
  "tags": [],
  "methods": [],
  "links": {}
}
```

2. Update `projects.html` to render project cards from JSON.

3. Update `research.html` with sections:

- current research focus,
- synthetic gene circuits,
- collective behavior and pattern formation,
- mathematical modeling and inference,
- microscopy/data analysis.

4. Update `about.html` with a short profile:

- computational/synthetic biologist,
- background in biological sciences and biological/medical engineering,
- interest in how biological systems switch, communicate, compete, and form patterns.

5. Update `teaching.html` with teaching/workshop areas:

- synthetic biology,
- molecular genetics/biochemistry lab,
- computational modeling notebooks,
- open technologies and molecular biology education.

6. Update `cv.html` with safe placeholders/download links for:

- Academic CV,
- Industry/Data CV,
- Computational Biology/AI CV.

Do not invent actual file names unless the files exist. If files are missing, show “coming soon” or a placeholder.

7. Update `contact.html` with:

- email link,
- GitHub link placeholder,
- LinkedIn link placeholder,
- ORCID link placeholder.

8. Add `notes.html` with initial note cards/placeholders:

- What is collective behavior in biology?
- Noise as a biological control parameter.
- Reaction–diffusion intuition.
- Quorum sensing as distributed computation.

## Success criteria

- Core content pages feel coherent and useful.
- Project cards render from structured data.
- No private personal information appears.
- Links are placeholders if real URLs are not available.
- Site remains fast and static.
