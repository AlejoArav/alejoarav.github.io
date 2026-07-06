(function () {
  window.Almejarav = window.Almejarav || {};
  var app = window.Almejarav;
  var BaseSimulation = app.BaseSimulation;
  var ToggleLatticeSimulation = app.ToggleLatticeSimulation;
  var VicsekFlockEngine = app.VicsekFlockEngine;

  if (
    typeof BaseSimulation !== "function" ||
    typeof ToggleLatticeSimulation !== "function" ||
    typeof VicsekFlockEngine !== "function"
  ) {
    return;
  }

  function setCanvasVisible(canvas, visible) {
    if (!canvas) {
      return;
    }

    canvas.style.visibility = visible ? "visible" : "hidden";
  }

  function MainThreadVicsekSimulation(options) {
    BaseSimulation.call(this, options);
    this.engine = new VicsekFlockEngine();
    this.active = false;
    this.hidden = document.hidden;
  }

  MainThreadVicsekSimulation.prototype = Object.create(BaseSimulation.prototype);
  MainThreadVicsekSimulation.prototype.constructor = MainThreadVicsekSimulation;

  MainThreadVicsekSimulation.prototype.configure = function (state) {
    if (!this.canvas || !this.context) {
      return;
    }

    this.canvas.width = Math.floor(state.pixelWidth * state.devicePixelRatio);
    this.canvas.height = Math.floor(state.pixelHeight * state.devicePixelRatio);
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.context.setTransform(state.devicePixelRatio, 0, 0, state.devicePixelRatio, 0, 0);
    this.context.imageSmoothingEnabled = true;

    this.engine.configure({
      pixelWidth: state.pixelWidth,
      pixelHeight: state.pixelHeight,
      isMobileLayout: state.isMobileLayout,
      prefersReducedMotion: state.prefersReducedMotion
    });
    this.engine.renderRequested = true;
    this.render();
  };

  MainThreadVicsekSimulation.prototype.activate = function () {
    this.active = true;
    setCanvasVisible(this.canvas, true);
    this.engine.renderRequested = true;
    this.render();

    if (!this.hidden) {
      this.start();
    }
  };

  MainThreadVicsekSimulation.prototype.deactivate = function () {
    this.active = false;
    setCanvasVisible(this.canvas, false);
    this.stop();
  };

  MainThreadVicsekSimulation.prototype.setHidden = function (hidden) {
    this.hidden = hidden;

    if (hidden) {
      this.stop();
    } else if (this.active) {
      this.lastTimestamp = 0;
      this.start();
    }
  };

  MainThreadVicsekSimulation.prototype.step = function (deltaTime) {
    if (!this.active || this.hidden) {
      this.stop();
      return;
    }

    this.engine.step(deltaTime);
  };

  MainThreadVicsekSimulation.prototype.render = function () {
    this.engine.render(this.context);
  };

  MainThreadVicsekSimulation.prototype.reset = function () {
    this.engine.seedField();
    this.engine.renderRequested = true;
    this.render();
  };

  MainThreadVicsekSimulation.prototype.perturb = function (x, y) {
    this.engine.addPulse(x, y);
    this.engine.renderRequested = true;
    this.render();
  };

  function VicsekFlockSimulation(options) {
    this.mount = options.mount;
    this.canvas = options.canvas;
    this.windowRoot = document.querySelector("[data-window-root]");
    this.prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.prefersReducedMotion = this.prefersReducedMotionQuery.matches;
    this.active = false;

    this.boundResize = this.handleResize.bind(this);
    this.boundVisibilityChange = this.handleVisibilityChange.bind(this);
    this.boundReducedMotionChange = this.handleReducedMotionChange.bind(this);
    this.boundReset = this.handleReset.bind(this);
    this.boundPerturb = this.handleExternalPerturb.bind(this);
    this.boundModelSelect = this.handleModelSelect.bind(this);
    this.boundPointerDown = this.handlePointerDown.bind(this);

    this.runtime = this.createRuntime(options);
    this.attachListeners();
    this.handleResize();
  }

  VicsekFlockSimulation.prototype.createRuntime = function (options) {
    var state = this.collectViewportState();
    var runtime = new MainThreadVicsekSimulation(options);
    runtime.configure(state);
    return runtime;
  };

  VicsekFlockSimulation.prototype.attachListeners = function () {
    window.addEventListener("resize", this.boundResize);
    document.addEventListener("visibilitychange", this.boundVisibilityChange);
    window.addEventListener("almejarav:reset", this.boundReset);
    window.addEventListener("almejarav:perturb", this.boundPerturb);
    window.addEventListener("almejarav:model-select", this.boundModelSelect);
    document.addEventListener("pointerdown", this.boundPointerDown);

    if (typeof this.prefersReducedMotionQuery.addEventListener === "function") {
      this.prefersReducedMotionQuery.addEventListener("change", this.boundReducedMotionChange);
    } else if (typeof this.prefersReducedMotionQuery.addListener === "function") {
      this.prefersReducedMotionQuery.addListener(this.boundReducedMotionChange);
    }
  };

  VicsekFlockSimulation.prototype.collectViewportState = function () {
    var pixelWidth = Math.max(320, window.innerWidth);
    var pixelHeight = Math.max(240, window.innerHeight);
    var isMobileLayout = pixelWidth <= 720;

    return {
      pixelWidth: pixelWidth,
      pixelHeight: pixelHeight,
      isMobileLayout: isMobileLayout,
      prefersReducedMotion: this.prefersReducedMotion,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2)
    };
  };

  VicsekFlockSimulation.prototype.syncTerminalStatus = function () {
    if (app.terminal && typeof app.terminal.setActiveModel === "function") {
      app.terminal.setActiveModel("vicsek flock");
    }
  };

  VicsekFlockSimulation.prototype.activate = function () {
    this.active = true;
    this.syncTerminalStatus();
    this.handleResize();
    this.runtime.activate();
    this.runtime.setHidden(document.hidden);
  };

  VicsekFlockSimulation.prototype.deactivate = function () {
    this.active = false;
    this.runtime.deactivate();
  };

  VicsekFlockSimulation.prototype.handleResize = function () {
    this.runtime.configure(this.collectViewportState());
  };

  VicsekFlockSimulation.prototype.handleVisibilityChange = function () {
    this.runtime.setHidden(document.hidden);
  };

  VicsekFlockSimulation.prototype.handleReducedMotionChange = function (event) {
    this.prefersReducedMotion = event.matches;
    this.handleResize();
  };

  VicsekFlockSimulation.prototype.handleReset = function () {
    if (!this.active) {
      return;
    }

    this.runtime.reset();
  };

  VicsekFlockSimulation.prototype.handleExternalPerturb = function () {
    if (!this.active) {
      return;
    }

    var state = this.collectViewportState();
    this.runtime.perturb(Math.random() * state.pixelWidth, Math.random() * state.pixelHeight);
  };

  VicsekFlockSimulation.prototype.handlePointerDown = function (event) {
    if (!this.active) {
      return;
    }

    if (this.windowRoot && typeof this.windowRoot.contains === "function" && this.windowRoot.contains(event.target)) {
      return;
    }

    this.runtime.perturb(event.clientX, event.clientY);
  };

  VicsekFlockSimulation.prototype.handleModelSelect = function (event) {
    if (!event.detail) {
      return;
    }

    if (event.detail.model !== "vicsek-flock" && event.detail.model !== "bz-reaction") {
      return;
    }

    this.activate();
  };

  function createSimulationApi(simulations) {
    var api = {
      activate: function (name) {
        return simulations.activate(name);
      },
      activateFlock: function () {
        return simulations.activate("vicsek-flock");
      },
      activateReaction: function () {
        return simulations.activate("vicsek-flock");
      },
      activateToggle: function () {
        return simulations.activate("toggle-lattice");
      },
      perturb: function () {
        var active = simulations.getActive();

        if (active && typeof active.handleExternalPerturb === "function") {
          active.handleExternalPerturb();
          return true;
        }

        return false;
      },
      reset: function () {
        var active = simulations.getActive();

        if (active && typeof active.handleReset === "function") {
          active.handleReset();
          return true;
        }

        return false;
      },
      getActiveModel: function () {
        return simulations.active || "";
      }
    };

    window.AlmejaSimulations = api;
    return api;
  }

  function ensureSimulationManager() {
    app.simulations = app.simulations || {};
    app.simulations.registry = app.simulations.registry || {};

    app.simulations.register = function (name, simulation) {
      this.registry[name] = simulation;
      return simulation;
    };

    app.simulations.activate = function (name) {
      var target = this.registry[name];

      if (!target) {
        return false;
      }

      var registryNames = Object.keys(this.registry);
      for (var index = 0; index < registryNames.length; index += 1) {
        var key = registryNames[index];
        var simulation = this.registry[key];

        if (key === name) {
          if (typeof simulation.activate === "function") {
            simulation.activate();
          }
        } else if (typeof simulation.deactivate === "function") {
          simulation.deactivate();
        }

        if (simulation && simulation.canvas) {
          setCanvasVisible(simulation.canvas, key === name);
        }
      }

      this.active = name;
      return true;
    };

    app.simulations.getActive = function () {
      return this.registry[this.active] || null;
    };

    return app.simulations;
  }

  function initializeSimulationSuite() {
    var mount = document.querySelector("[data-simulation-surface]");
    var toggleCanvas = document.querySelector("[data-simulation-canvas]");

    if (!mount || !toggleCanvas) {
      return;
    }

    var flockCanvas = document.createElement("canvas");
    flockCanvas.className = "simulation-canvas simulation-canvas-flock";
    flockCanvas.setAttribute("aria-hidden", "true");
    flockCanvas.style.visibility = "hidden";
    mount.insertBefore(flockCanvas, toggleCanvas.nextSibling);

    var simulations = ensureSimulationManager();
    var toggle = new ToggleLatticeSimulation({
      mount: mount,
      canvas: toggleCanvas
    });
    var flock = new VicsekFlockSimulation({
      mount: mount,
      canvas: flockCanvas
    });

    simulations.register("toggle-lattice", toggle);
    simulations.register("vicsek-flock", flock);
    simulations.toggleLattice = toggle;
    simulations.vicsekFlock = flock;
    createSimulationApi(simulations);
    simulations.activate("vicsek-flock");
  }

  initializeSimulationSuite();
  app.VicsekFlockSimulation = VicsekFlockSimulation;
}());
