# Stage 3 Prompt — Toggle Lattice Simulation

## Goal

Implement the first signature interactive background: a GFP/RFP-like toggle lattice representing local coupling, stochastic switching, and collective spatial pattern formation.

## Scientific concept

This is an abstract browser visualization inspired by synthetic gene circuits and Ising-like collective behavior in bacterial colonies. It is not meant to be a quantitatively exact simulator. It should visually communicate how local interactions and noise can generate domains, switching, and emergent patterns.

## Constraints

- Continue using buildless HTML/CSS/vanilla JavaScript.
- Use Canvas 2D.
- Do not add dependencies.
- Keep performance reasonable on laptops and mobile.
- Respect `prefers-reduced-motion`.
- Text must remain readable over/near the canvas.

## Tasks

1. Create `assets/js/simulations/toggle-lattice.js`.

2. Add a canvas layer to `index.html` or create it dynamically from JavaScript.

3. Implement a grid model with states:

```txt
-1 = red / RFP-like
 0 = dark / low-expression
+1 = green / GFP-like
```

4. Implement update rules:

- each cell samples local neighbor influence,
- stochastic noise can flip state,
- local coupling encourages nearby cells to align,
- external field can bias green or red,
- dark cells can activate into either state depending on local field/noise.

5. Add public controls through terminal events:

- `model toggle`: activate toggle lattice if not active.
- `perturb`: randomly disturb a local area or several cells.
- `reset`: randomize or reinitialize the lattice.

6. Add optional keyboard/mouse interaction:

- click/tap perturbs the lattice locally,
- pointer movement may lightly perturb if performance allows.

7. Add accessibility/performance safeguards:

- pause or reduce updates when document is hidden,
- lower resolution on small/mobile screens,
- static fallback if reduced motion is preferred,
- no rapid flashing.

8. Add comments explaining the biological interpretation of parameters:

- coupling,
- noise,
- external field,
- state/color mapping.

## Success criteria

- Homepage shows subtle animated toggle-lattice background.
- Terminal `perturb` and `reset` affect the simulation.
- Simulation does not obscure text.
- No console errors.
- Performance remains acceptable.
