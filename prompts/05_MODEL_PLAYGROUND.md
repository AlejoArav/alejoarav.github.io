# Stage 5 Prompt — Interactive Model Playground

## Goal

Create a `/models.html` model playground that introduces several biological collective-behavior simulations and gives each model a clear conceptual explanation. Implement only one additional lightweight simulation if feasible; otherwise create clean placeholders and controls for future implementation.

## Constraints

- Keep GitHub Pages compatibility.
- Use client-side JavaScript and Canvas.
- No dependencies unless explicitly requested.
- Do not overbuild all models in one stage.
- Prioritize clarity, performance, and scientific interpretation.

## Tasks

1. Update `models.html` to show model cards for:

- Toggle lattice.
- Reaction–diffusion.
- Quorum sensing.
- Predator–prey.
- SIR waves.
- Ising-like lattice.

2. Each model card should include:

- short intuition,
- biological interpretation,
- status: implemented / planned,
- related project tag,
- controls or placeholder controls.

3. Add a reusable mini-canvas area on `models.html` for demonstrations.

4. If implementing a second simulation now, choose reaction–diffusion only if it can be done simply and efficiently. Otherwise add a non-running placeholder and leave a clear TODO.

5. Add a small explanatory note:

```txt
These models are qualitative browser sketches meant to make collective behavior intuitive. They are not replacements for calibrated scientific simulation code.
```

6. Wire terminal homepage commands to model labels/links where possible.

## Success criteria

- `models.html` gives visitors a clear map of the interactive scientific direction.
- Toggle lattice is listed as implemented if Stage 3 is complete.
- Other models have honest planned status unless implemented.
- No performance regression on the homepage.
