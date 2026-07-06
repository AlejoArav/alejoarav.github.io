# Stage 2 Prompt — Terminal Interface

## Goal

Add a functional terminal-style command interface to the homepage. The terminal should reinforce the site's digital-garden identity and allow visitors to navigate and interact with the future simulations.

## Constraints

- Continue using buildless HTML/CSS/vanilla JavaScript.
- Do not add dependencies.
- Do not add simulations yet, except placeholder hooks/events.
- Preserve accessibility and normal navigation links.
- The site must still be usable without JavaScript.

## Tasks

1. Implement `assets/js/terminal.js`.

2. Add terminal behavior on `index.html`:

- input line,
- command history,
- output area,
- keyboard handling,
- help command.

3. Supported initial commands:

```txt
?
help
about
projects
research
models
notes
teaching
cv
contact
clear
model toggle
model reaction
model quorum
perturb
reset
```

4. Command behavior:

- `?` and `help`: print available commands.
- page commands: show a short description and a link to the page.
- `clear`: clear output.
- `model toggle`, `model reaction`, `model quorum`: update a visible model status label, but do not implement simulations yet.
- `perturb` and `reset`: dispatch custom browser events named `almejarav:perturb` and `almejarav:reset` for future simulation modules.

5. Add graceful fallback:

- If JavaScript fails, normal links remain usable.
- Terminal input should have a label for screen readers.
- Include reduced-motion considerations in CSS if any blinking cursor is added.

## Success criteria

- Terminal accepts commands and displays output.
- Commands do not break navigation.
- No console errors.
- Future simulation hooks exist but do not require simulations to be implemented.
