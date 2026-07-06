(function () {
  window.Almejarav = window.Almejarav || {};
  var app = window.Almejarav;
  var terminalRoot = document.querySelector("[data-terminal-root]");
  var outputNode = document.getElementById("terminal-output");
  var form = document.querySelector("[data-terminal-form]");
  var input = document.getElementById("terminal-input");
  var modelStatusNodes = Array.prototype.slice.call(document.querySelectorAll("[data-model-status]"));
  var currentModel = "vicsek flock";
  var history = [];
  var historyIndex = -1;
  var supportedCommands = [
    { command: "?", description: "Show available commands." },
    { command: "help", description: "Show available commands." },
    { command: "home", description: "Switch to the homepage tab." },
    { command: "about", description: "Switch to the profile and background tab." },
    { command: "projects", description: "Switch to selected projects and portfolio work." },
    { command: "research", description: "Switch to research interests and statement." },
    { command: "notes", description: "Switch to the digital garden notes tab." },
    { command: "teaching", description: "Switch to teaching and educational resources." },
    { command: "cv", description: "Switch to public-safe CV information." },
    { command: "contact", description: "Switch to public contact channels." },
    { command: "clear", description: "Clear the terminal output." },
    { command: "model toggle", description: "Switch to the GFP/RFP-like toggle lattice backup." },
    { command: "model flock", description: "Switch to the three-population Vicsek flock field." },
    { command: "perturb", description: "Inject a fresh excitation into the active model." },
    { command: "reset", description: "Reinitialize the active model." }
  ];
  var pageCommands = {
    home: {
      title: "Home",
      description: "Interactive introduction and current background simulation state."
    },
    about: {
      title: "About",
      description: "Scientific profile, background, and current interests."
    },
    projects: {
      title: "Projects",
      description: "Selected computational, microscopy, and open-source work."
    },
    research: {
      title: "Research",
      description: "Formal overview of systems biology, modeling, and spatial behavior."
    },
    notes: {
      title: "Notes",
      description: "Digital garden notes on noise, pattern formation, and distributed biology."
    },
    teaching: {
      title: "Teaching",
      description: "Educational resources, tutorials, and workshop material."
    },
    cv: {
      title: "CV",
      description: "Public-safe curriculum vitae downloads and related links."
    },
    contact: {
      title: "Contact",
      description: "Professional contact channels and public links."
    }
  };

  if (!terminalRoot || !outputNode || !form || !input || !modelStatusNodes.length) {
    app.terminal = {
      enabled: false,
      placeholder: "> type ? for commands",
      stage: "07-vite-typescript"
    };
    return;
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function printEntry(type, prefix, contentHtml) {
    var entry = document.createElement("p");
    entry.className = "terminal-entry terminal-entry-" + type;
    entry.innerHTML = '<span class="terminal-prefix">' + prefix + "</span><span>" + contentHtml + "</span>";
    outputNode.appendChild(entry);
    outputNode.scrollTop = outputNode.scrollHeight;
  }

  function printCommand(command) {
    printEntry("command", "&gt;", escapeHtml(command));
  }

  function printMessage(message) {
    printEntry("system", "system", escapeHtml(message));
  }

  function printError(message) {
    printEntry("error", "error", escapeHtml(message));
  }

  function printTabResult(item) {
    var safeTitle = escapeHtml(item.title);
    var safeDescription = escapeHtml(item.description);
    printEntry("link", safeTitle.toLowerCase(), safeDescription);
  }

  function renderHelp() {
    var lines = supportedCommands.map(function (item) {
      return "<code>" + escapeHtml(item.command) + "</code> - " + escapeHtml(item.description);
    });
    printEntry("system", "help", lines.join("<br>"));
  }

  function setModelStatus(label) {
    currentModel = label;
    modelStatusNodes.forEach(function (node) {
      node.textContent = label;
    });
  }

  function dispatchSimulationEvent(name) {
    window.dispatchEvent(new CustomEvent(name, {
      detail: {
        model: currentModel
      }
    }));
  }

  function dispatchModelSelect(modelName) {
    window.dispatchEvent(new CustomEvent("almejarav:model-select", {
      detail: {
        model: modelName
      }
    }));
  }

  function dispatchTerminalCommand(command) {
    window.dispatchEvent(new CustomEvent("almejarav:terminal-command", {
      detail: {
        command: command
      }
    }));
  }

  function getSimulationApi() {
    if (window.AlmejaSimulations) {
      return window.AlmejaSimulations;
    }

    if (app.simulations) {
      return app.simulations;
    }

    return null;
  }

  function clearOutput() {
    outputNode.innerHTML = "";
  }

  function highlightModelCard(name) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-model-card]"));
    var matchedCard = null;

    cards.forEach(function (card) {
      var isMatch = card.getAttribute("data-model-card") === name;
      card.classList.toggle("is-emphasized", isMatch);

      if (isMatch && !matchedCard) {
        matchedCard = card;
      }
    });

    if (!matchedCard) {
      return false;
    }

    matchedCard.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });

    return true;
  }

  function activateWindowTab(name) {
    if (app.windowUi && typeof app.windowUi.activateTab === "function") {
      return app.windowUi.activateTab(name);
    }

    return false;
  }

  function handleCommand(rawCommand) {
    var command = rawCommand.trim().toLowerCase();

    if (!command) {
      return;
    }

    printCommand(rawCommand.trim());
    dispatchTerminalCommand(command);

    if (command === "?" || command === "help") {
      renderHelp();
      return;
    }

    if (pageCommands[command]) {
      activateWindowTab(command);
      printTabResult(pageCommands[command]);
      return;
    }

    if (command === "clear") {
      clearOutput();
      return;
    }

    if (command === "model toggle") {
      setModelStatus("toggle lattice");
      highlightModelCard("toggle-lattice");
      var toggleApi = getSimulationApi();
      if (toggleApi && typeof toggleApi.activateToggle === "function") {
        toggleApi.activateToggle();
      } else if (toggleApi && typeof toggleApi.activate === "function") {
        toggleApi.activate("toggle-lattice");
      } else {
        dispatchModelSelect("toggle-lattice");
      }
      printMessage("Active model set to the toggle lattice backup background.");
      return;
    }

    if (command === "model flock") {
      setModelStatus("vicsek flock");
      var flockApi = getSimulationApi();
      if (flockApi && typeof flockApi.activateFlock === "function") {
        flockApi.activateFlock();
      } else if (flockApi && typeof flockApi.activateReaction === "function") {
        flockApi.activateReaction();
      } else if (flockApi && typeof flockApi.activate === "function") {
        flockApi.activate("vicsek-flock");
      } else {
        dispatchModelSelect("vicsek-flock");
      }
      printMessage("Active model set to the autonomous Vicsek flock background.");
      return;
    }

    if (command === "perturb") {
      var perturbApi = getSimulationApi();
      if (perturbApi && typeof perturbApi.perturb === "function") {
        perturbApi.perturb();
      } else {
        dispatchSimulationEvent("almejarav:perturb");
      }
      printMessage("Perturbation signal dispatched to the active model.");
      return;
    }

    if (command === "reset") {
      var resetApi = getSimulationApi();
      if (resetApi && typeof resetApi.reset === "function") {
        resetApi.reset();
      } else {
        dispatchSimulationEvent("almejarav:reset");
      }
      printMessage("Reset signal dispatched to the active model.");
      return;
    }

    printError('Unknown command. Type "help" to list available commands.');
  }

  function onSubmit(event) {
    event.preventDefault();
    var value = input.value;
    var trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    history.push(trimmed);
    historyIndex = history.length;
    handleCommand(trimmed);
    input.value = "";
  }

  function onKeyDown(event) {
    if (event.key === "ArrowUp") {
      if (!history.length) {
        return;
      }

      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
      return;
    }

    if (event.key === "ArrowDown") {
      if (!history.length) {
        return;
      }

      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = historyIndex >= history.length ? "" : history[historyIndex];
      return;
    }

    if (event.key === "Escape") {
      input.value = "";
    }
  }

  terminalRoot.addEventListener("click", function (event) {
    if (event.target instanceof HTMLAnchorElement || event.target instanceof HTMLButtonElement) {
      return;
    }

    input.focus();
  });

  form.addEventListener("submit", onSubmit);
  input.addEventListener("keydown", onKeyDown);
  setModelStatus(currentModel);

  app.terminal = {
    enabled: true,
    placeholder: input.getAttribute("placeholder") || "",
    stage: "07-vite-typescript",
    execute: handleCommand,
    getHistory: function () {
      return history.slice();
    },
    getActiveModel: function () {
      return currentModel;
    },
    setActiveModel: function (label) {
      setModelStatus(label);
    },
    getSupportedCommands: function () {
      return supportedCommands.slice();
    }
  };
}());
