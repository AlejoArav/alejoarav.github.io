(function () {
  window.Almejarav = window.Almejarav || {};
  var app = window.Almejarav;
  var BaseSimulation = app.BaseSimulation;
  var ToggleLatticeSimulation = app.ToggleLatticeSimulation;

  if (typeof BaseSimulation !== "function" || typeof ToggleLatticeSimulation !== "function") {
    return;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // Qualitative Barkley-style excitable medium inspired by Belousov-Zhabotinsky waves.
  function BZReactionSimulation(options) {
    BaseSimulation.call(this, options);
    this.mount = options.mount;
    this.setCanvas(options.canvas);
    this.prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.prefersReducedMotion = this.prefersReducedMotionQuery.matches;

    this.pixelWidth = 0;
    this.pixelHeight = 0;
    this.cols = 0;
    this.rows = 0;
    this.u = new Float32Array(0);
    this.v = new Float32Array(0);
    this.nextU = new Float32Array(0);
    this.nextV = new Float32Array(0);
    this.imageData = null;

    this.active = false;
    this.accumulator = 0;
    this.frameIntervalMs = 22;
    this.stepCounter = 0;
    this.renderRequested = true;
    this.backgroundPulseInterval = 0;

    // Barkley-style parameters for a continuously excitable medium.
    this.epsilon = 0.02;
    this.a = 0.78;
    this.b = 0.05;
    this.diffusionU = 1.08;
    this.diffusionV = 0.045;
    this.timeStep = 0.12;
    this.pacemakerInterval = 34;

    this.boundResize = this.handleResize.bind(this);
    this.boundVisibilityChange = this.handleVisibilityChange.bind(this);
    this.boundReducedMotionChange = this.handleReducedMotionChange.bind(this);
    this.boundReset = this.handleReset.bind(this);
    this.boundPerturb = this.handleExternalPerturb.bind(this);
    this.boundModelSelect = this.handleModelSelect.bind(this);

    this.attachListeners();
    this.handleResize();
  }

  BZReactionSimulation.prototype = Object.create(BaseSimulation.prototype);
  BZReactionSimulation.prototype.constructor = BZReactionSimulation;

  BZReactionSimulation.prototype.attachListeners = function () {
    window.addEventListener("resize", this.boundResize);
    document.addEventListener("visibilitychange", this.boundVisibilityChange);
    window.addEventListener("almejarav:reset", this.boundReset);
    window.addEventListener("almejarav:perturb", this.boundPerturb);
    window.addEventListener("almejarav:model-select", this.boundModelSelect);

    if (typeof this.prefersReducedMotionQuery.addEventListener === "function") {
      this.prefersReducedMotionQuery.addEventListener("change", this.boundReducedMotionChange);
    } else if (typeof this.prefersReducedMotionQuery.addListener === "function") {
      this.prefersReducedMotionQuery.addListener(this.boundReducedMotionChange);
    }
  };

  BZReactionSimulation.prototype.activate = function () {
    this.active = true;
    this.handleResize();
    this.syncTerminalStatus();
    this.renderRequested = true;
    this.render();

    if (!document.hidden) {
      this.start();
    } else {
      this.stop();
    }
  };

  BZReactionSimulation.prototype.deactivate = function () {
    this.active = false;
    this.stop();
  };

  BZReactionSimulation.prototype.syncTerminalStatus = function () {
    if (app.terminal && typeof app.terminal.setActiveModel === "function") {
      app.terminal.setActiveModel("bz reaction field");
    }
  };

  BZReactionSimulation.prototype.handleResize = function () {
    var viewportWidth = Math.max(320, window.innerWidth);
    var viewportHeight = Math.max(240, window.innerHeight);
    var targetWidth = Math.round(clamp(viewportWidth * 0.24, 220, 360));
    var aspectRatio = viewportHeight / viewportWidth;
    var targetHeight = Math.round(targetWidth * aspectRatio);

    this.pixelWidth = viewportWidth;
    this.pixelHeight = viewportHeight;
    this.cols = targetWidth;
    this.rows = Math.max(120, targetHeight);
    this.frameIntervalMs = this.prefersReducedMotion ? 130 : (viewportWidth <= 720 ? 24 : 16);
    this.pacemakerInterval = this.prefersReducedMotion ? 74 : (viewportWidth <= 720 ? 30 : 22);
    this.backgroundPulseInterval = this.prefersReducedMotion ? 136 : (viewportWidth <= 720 ? 56 : 40);

    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.imageSmoothingEnabled = true;

    this.u = new Float32Array(this.cols * this.rows);
    this.v = new Float32Array(this.cols * this.rows);
    this.nextU = new Float32Array(this.cols * this.rows);
    this.nextV = new Float32Array(this.cols * this.rows);
    this.imageData = this.context.createImageData(this.cols, this.rows);
    this.seedField();
    this.renderRequested = true;
    this.render();
  };

  BZReactionSimulation.prototype.toIndex = function (col, row) {
    return row * this.cols + col;
  };

  BZReactionSimulation.prototype.wrapColumn = function (col) {
    if (col < 0) {
      return this.cols - 1;
    }

    if (col >= this.cols) {
      return 0;
    }

    return col;
  };

  BZReactionSimulation.prototype.wrapRow = function (row) {
    if (row < 0) {
      return this.rows - 1;
    }

    if (row >= this.rows) {
      return 0;
    }

    return row;
  };

  BZReactionSimulation.prototype.seedField = function () {
    var index;

    for (index = 0; index < this.u.length; index += 1) {
      this.u[index] = 0;
      this.v[index] = 0.02 + (Math.random() * 0.02);
    }

    // Broken initial wavefronts encourage spiral defects instead of only concentric rings.
    this.injectBrokenWave(this.pixelWidth * 0.24, this.pixelHeight * 0.28, 0.082, Math.PI * 0.22);
    this.injectBrokenWave(this.pixelWidth * 0.62, this.pixelHeight * 0.38, 0.074, Math.PI * 1.16);
    this.injectBrokenWave(this.pixelWidth * 0.78, this.pixelHeight * 0.68, 0.068, Math.PI * 1.74);
    this.injectBrokenWave(this.pixelWidth * 0.42, this.pixelHeight * 0.78, 0.058, Math.PI * 0.94);
    this.stimulateAt(this.pixelWidth * 0.16, this.pixelHeight * 0.62, 0.032);
    this.stimulateAt(this.pixelWidth * 0.86, this.pixelHeight * 0.22, 0.028);
    this.stepCounter = 0;
  };

  BZReactionSimulation.prototype.computeLaplacian = function (field, col, row) {
    var center = field[this.toIndex(col, row)];
    var north = field[this.toIndex(col, this.wrapRow(row - 1))];
    var south = field[this.toIndex(col, this.wrapRow(row + 1))];
    var east = field[this.toIndex(this.wrapColumn(col + 1), row)];
    var west = field[this.toIndex(this.wrapColumn(col - 1), row)];
    var northeast = field[this.toIndex(this.wrapColumn(col + 1), this.wrapRow(row - 1))];
    var northwest = field[this.toIndex(this.wrapColumn(col - 1), this.wrapRow(row - 1))];
    var southeast = field[this.toIndex(this.wrapColumn(col + 1), this.wrapRow(row + 1))];
    var southwest = field[this.toIndex(this.wrapColumn(col - 1), this.wrapRow(row + 1))];

    return (
      north +
      south +
      east +
      west +
      (0.5 * (northeast + northwest + southeast + southwest)) -
      (6 * center)
    );
  };

  BZReactionSimulation.prototype.stepField = function () {
    var row;
    var col;

    for (row = 0; row < this.rows; row += 1) {
      for (col = 0; col < this.cols; col += 1) {
        var index = this.toIndex(col, row);
        var uValue = this.u[index];
        var vValue = this.v[index];
        var lapU = this.computeLaplacian(this.u, col, row);
        var lapV = this.computeLaplacian(this.v, col, row);
        var threshold = (vValue + this.b) / this.a;
        var reaction = (uValue * (1 - uValue) * (uValue - threshold)) / this.epsilon;
        var du = reaction + (this.diffusionU * lapU);
        var dv = (uValue - vValue) + (this.diffusionV * lapV);

        this.nextU[index] = clamp(uValue + (this.timeStep * du), 0, 1);
        this.nextV[index] = clamp(vValue + (this.timeStep * dv * 0.7), 0, 1);
      }
    }

    var previousU = this.u;
    var previousV = this.v;
    this.u = this.nextU;
    this.v = this.nextV;
    this.nextU = previousU;
    this.nextV = previousV;
    this.stepCounter += 1;

    if (this.stepCounter % this.pacemakerInterval === 0) {
      this.injectBrokenWave(this.pixelWidth * 0.14, this.pixelHeight * 0.62, 0.046, Math.PI * 0.45);
    }

    if ((this.stepCounter + Math.floor(this.pacemakerInterval * 0.5)) % this.pacemakerInterval === 0) {
      this.injectBrokenWave(this.pixelWidth * 0.82, this.pixelHeight * 0.18, 0.042, Math.PI * 1.34);
    }

    if (this.stepCounter % Math.max(16, Math.floor(this.pacemakerInterval * 0.72)) === 0) {
      this.injectBrokenWave(this.pixelWidth * 0.48, this.pixelHeight * 0.84, 0.036, Math.PI * 1.92);
    }

    if (this.stepCounter % this.backgroundPulseInterval === 0) {
      this.injectBrokenWave(
        Math.random() * this.pixelWidth,
        Math.random() * this.pixelHeight,
        this.pixelWidth <= 720 ? 0.032 : 0.026,
        Math.random() * Math.PI * 2
      );
    }

    this.renderRequested = true;
  };

  BZReactionSimulation.prototype.step = function (deltaTime) {
    if (!this.active) {
      this.stop();
      return;
    }

    if (document.hidden) {
      this.stop();
      return;
    }

    this.accumulator += deltaTime * 1000;
    var substeps = 0;

    while (this.accumulator >= this.frameIntervalMs && substeps < 5) {
      this.stepField();
      this.accumulator -= this.frameIntervalMs;
      substeps += 1;
    }
  };

  BZReactionSimulation.prototype.render = function () {
    if (!this.context || !this.renderRequested || !this.imageData) {
      return;
    }

    var pixels = this.imageData.data;
    var index;

    for (index = 0; index < this.u.length; index += 1) {
      var uValue = this.u[index];
      var vValue = this.v[index];
      var activator = clamp(uValue - (0.32 * vValue), 0, 1);
      var recovery = clamp(vValue - (0.24 * uValue), 0, 1);
      var signal = Math.max(activator, recovery * 0.82);
      var highlight = clamp((signal - 0.54) / 0.46, 0, 1);
      var pixelIndex = index * 4;

      pixels[pixelIndex] = Math.round(9 + (82 * recovery) + (168 * signal) + (56 * highlight));
      pixels[pixelIndex + 1] = Math.round(4 + (18 * recovery) + (88 * signal) + (150 * highlight));
      pixels[pixelIndex + 2] = Math.round(24 + (74 * recovery) + (26 * signal) + (18 * highlight));
      pixels[pixelIndex + 3] = Math.round(26 + (108 * signal));
    }

    this.context.putImageData(this.imageData, 0, 0);
    this.renderRequested = false;
  };

  BZReactionSimulation.prototype.toGridCoordinates = function (x, y) {
    return {
      col: clamp(Math.floor((x / this.pixelWidth) * this.cols), 0, this.cols - 1),
      row: clamp(Math.floor((y / this.pixelHeight) * this.rows), 0, this.rows - 1)
    };
  };

  BZReactionSimulation.prototype.stimulateAt = function (x, y, radiusScale) {
    var center = this.toGridCoordinates(x, y);
    var radius = Math.max(3, Math.round(Math.min(this.cols, this.rows) * radiusScale));
    var radiusSquared = radius * radius;
    var row;
    var col;

    for (row = Math.max(0, center.row - radius); row <= Math.min(this.rows - 1, center.row + radius); row += 1) {
      for (col = Math.max(0, center.col - radius); col <= Math.min(this.cols - 1, center.col + radius); col += 1) {
        var dx = col - center.col;
        var dy = row - center.row;
        var distanceSquared = (dx * dx) + (dy * dy);

        if (distanceSquared > radiusSquared) {
          continue;
        }

        var falloff = 1 - (distanceSquared / radiusSquared);
        var index = this.toIndex(col, row);
        this.u[index] = Math.max(this.u[index], 0.82 + (0.16 * falloff));
        this.v[index] = Math.min(this.v[index], 0.05 + (0.06 * (1 - falloff)));
      }
    }

    this.renderRequested = true;
  };

  BZReactionSimulation.prototype.injectBrokenWave = function (x, y, radiusScale, angle) {
    var center = this.toGridCoordinates(x, y);
    var radius = Math.max(5, Math.round(Math.min(this.cols, this.rows) * radiusScale));
    var radiusSquared = radius * radius;
    var gapDirectionX = Math.cos(angle);
    var gapDirectionY = Math.sin(angle);
    var row;
    var col;

    for (row = Math.max(0, center.row - radius); row <= Math.min(this.rows - 1, center.row + radius); row += 1) {
      for (col = Math.max(0, center.col - radius); col <= Math.min(this.cols - 1, center.col + radius); col += 1) {
        var dx = col - center.col;
        var dy = row - center.row;
        var distanceSquared = (dx * dx) + (dy * dy);

        if (distanceSquared > radiusSquared) {
          continue;
        }

        var direction = (dx * gapDirectionX) + (dy * gapDirectionY);
        if (direction > 0 && Math.abs(direction) < (radius * 0.42)) {
          continue;
        }

        var ringDistance = Math.abs(Math.sqrt(distanceSquared) - (radius * 0.76));
        if (ringDistance > (radius * 0.28)) {
          continue;
        }

        var index = this.toIndex(col, row);
        this.u[index] = Math.max(this.u[index], 0.94);
        this.v[index] = Math.min(this.v[index], 0.02);
      }
    }

    this.renderRequested = true;
  };

  BZReactionSimulation.prototype.handleReset = function () {
    if (!this.active) {
      return;
    }

    this.seedField();
    this.renderRequested = true;
    this.render();
  };

  BZReactionSimulation.prototype.handleExternalPerturb = function () {
    if (!this.active) {
      return;
    }

    this.injectBrokenWave(
      Math.random() * this.pixelWidth,
      Math.random() * this.pixelHeight,
      this.pixelWidth <= 720 ? 0.072 : 0.055,
      Math.random() * Math.PI * 2
    );
    this.render();
  };

  BZReactionSimulation.prototype.handleModelSelect = function (event) {
    if (!event.detail || event.detail.model !== "bz-reaction") {
      return;
    }

    this.activate();
  };

  BZReactionSimulation.prototype.handleVisibilityChange = function () {
    if (document.hidden) {
      this.stop();
      return;
    }

    if (this.active) {
      this.start();
    }
  };

  BZReactionSimulation.prototype.handleReducedMotionChange = function (event) {
    this.prefersReducedMotion = event.matches;
    this.handleResize();

    this.renderRequested = true;
    this.render();

    if (!document.hidden && this.active) {
      this.start();
    }
  };

  function createSimulationApi(simulations) {
    var api = {
      activate: function (name) {
        return simulations.activate(name);
      },
      activateReaction: function () {
        return simulations.activate("bz-reaction");
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
    var canvas = document.querySelector("[data-simulation-canvas]");

    if (!mount || !canvas) {
      return;
    }

    var simulations = ensureSimulationManager();
    var sharedOptions = {
      mount: mount,
      canvas: canvas
    };
    var toggle = new ToggleLatticeSimulation(sharedOptions);
    var reaction = new BZReactionSimulation(sharedOptions);

    simulations.register("toggle-lattice", toggle);
    simulations.register("bz-reaction", reaction);
    simulations.toggleLattice = toggle;
    simulations.bzReaction = reaction;
    createSimulationApi(simulations);
    simulations.activate("bz-reaction");
  }

  initializeSimulationSuite();
  app.BZReactionSimulation = BZReactionSimulation;
}());
