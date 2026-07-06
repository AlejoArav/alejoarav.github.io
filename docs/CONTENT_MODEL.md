# Content Model

## Site identity

Name:

```txt
Alejandro Aravena Lazo
```

Domain:

```txt
almejarav.xyz
```

Tagline:

```txt
complex biological systems · synthetic circuits · collective behavior
```

Homepage summary:

```txt
I study how biological entities switch, communicate, synchronize,
compete, and form patterns — from genetic circuits to bacterial colonies.
```

## Pages

### Home

Purpose: interactive identity page with terminal and biological simulation background.

Content:

- name,
- tagline,
- short intro,
- navigation,
- terminal commands,
- active model label.

### About

Purpose: human/scientific profile.

Sections:

- short bio,
- background,
- current interests,
- technical tools,
- open-source/teaching identity.

### Research

Purpose: formal research overview.

Sections:

- current focus,
- synthetic gene circuits,
- collective behavior,
- mathematical modeling,
- microscopy/data analysis,
- publications/posters.

### Projects

Purpose: portfolio of selected work.

Data source:

```txt
assets/data/projects.json
```

### Models

Purpose: interactive/educational model playground.

Models:

- toggle lattice,
- reaction–diffusion,
- quorum sensing,
- predator–prey,
- SIR,
- Ising-like lattice.

### Notes

Purpose: digital garden.

Initial notes:

- What is collective behavior in biology?
- Noise as a biological control parameter.
- Reaction–diffusion intuition.
- Quorum sensing as distributed computation.

### Teaching

Purpose: teaching and educational resources.

Sections:

- synthetic biology,
- molecular genetics/biochemistry lab,
- computational modeling notebooks,
- open technologies workshops.

### CV

Purpose: safe public CV downloads.

CV categories:

- Academic CV,
- Industry/Data CV,
- Computational Biology/AI CV.

### Contact

Purpose: safe professional contact.

Include:

- email,
- GitHub,
- LinkedIn,
- ORCID,
- location as `Santiago, Chile`.

Avoid:

- home address,
- phone number.

## Project data shape

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
  "technologies": [],
  "links": {
    "github": "",
    "publication": "",
    "poster": "",
    "notebook": "",
    "demo": ""
  },
  "featured": true
}
```
