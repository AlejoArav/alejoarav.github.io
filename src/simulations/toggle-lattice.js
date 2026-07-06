(function () {
  window.Almejarav = window.Almejarav || {};
  var app = window.Almejarav;
  var BaseSimulation = app.BaseSimulation;

  if (typeof BaseSimulation !== "function") {
    return;
  }

  function ToggleLatticeSimulation(options) {
    BaseSimulation.call(this, options);
    this.mount = options.mount;
    this.setCanvas(options.canvas);
    this.prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.prefersReducedMotion = this.prefersReducedMotionQuery.matches;
    this.isMobileLayout = window.innerWidth <= 720;
    this.gridWidth = 0;
    this.gridHeight = 0;
    this.cellWidth = 0;
    this.cellHeight = 0;
    this.cols = 0;
    this.rows = 0;
    this.cells = new Int8Array(0);
    this.nextCells = new Int8Array(0);
    this.accumulator = 0;
    this.active = false;
    this.renderRequested = true;

    // Coupling represents how strongly nearby cells encourage matching expression states.
    this.coupling = 0.74;
    // Noise represents spontaneous switching and biological variability.
    this.noise = 0.05;
    // External field weakly biases the lattice toward green or red expression.
    this.externalField = 0.01;

    // State-to-color mapping: red is RFP-like (-1), dark is low-expression (0), green is GFP-like (+1).
    this.stateColors = {
      "-1": "rgba(255, 116, 136, 0.22)",
      "0": "rgba(20, 32, 28, 0.38)",
      "1": "rgba(120, 242, 170, 0.24)"
    };

    this.boundResize = this.handleResize.bind(this);
    this.boundVisibilityChange = this.handleVisibilityChange.bind(this);
    this.boundReducedMotionChange = this.handleReducedMotionChange.bind(this);
    this.boundReset = this.handleReset.bind(this);
    this.boundPerturb = this.handleExternalPerturb.bind(this);
    this.boundModelSelect = this.handleModelSelect.bind(this);

    this.attachListeners();
    this.handleResize();
  }

  ToggleLatticeSimulation.prototype = Object.create(BaseSimulation.prototype);
  ToggleLatticeSimulation.prototype.constructor = ToggleLatticeSimulation;

  ToggleLatticeSimulation.prototype.attachListeners = function () {
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

  ToggleLatticeSimulation.prototype.activate = function () {
    this.active = true;
    this.handleResize();
    this.renderRequested = true;
    this.syncTerminalStatus();
    this.render();

    if (!document.hidden) {
      this.start();
    } else {
      this.stop();
    }
  };

  ToggleLatticeSimulation.prototype.deactivate = function () {
    this.active = false;
    this.stop();
  };

  ToggleLatticeSimulation.prototype.syncTerminalStatus = function () {
    if (app.terminal && typeof app.terminal.setActiveModel === "function") {
      app.terminal.setActiveModel("toggle lattice");
    }
  };

  ToggleLatticeSimulation.prototype.handleResize = function () {
    var rect = this.mount.getBoundingClientRect();
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(220, Math.round(rect.height));
    this.isMobileLayout = window.innerWidth <= 720;
    var devicePixelRatio = Math.min(window.devicePixelRatio || 1, this.isMobileLayout ? 1.35 : 1.8);

    this.canvas.width = Math.round(width * devicePixelRatio);
    this.canvas.height = Math.round(height * devicePixelRatio);
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    this.gridWidth = width;
    this.gridHeight = height;

    this.buildGrid();
    this.renderRequested = true;
    this.render();
  };

  ToggleLatticeSimulation.prototype.buildGrid = function () {
    var baseCellSize = this.isMobileLayout ? 15 : 12;

    if (this.prefersReducedMotion) {
      baseCellSize += 3;
    }

    this.cols = Math.max(18, Math.round(this.gridWidth / baseCellSize));
    this.rows = Math.max(14, Math.round(this.gridHeight / baseCellSize));
    this.cellWidth = this.gridWidth / this.cols;
    this.cellHeight = this.gridHeight / this.rows;
    this.cells = new Int8Array(this.cols * this.rows);
    this.nextCells = new Int8Array(this.cols * this.rows);
    this.seedLattice();
  };

  ToggleLatticeSimulation.prototype.seedLattice = function () {
    var seedCount = Math.max(5, Math.round((this.cols + this.rows) / 16));
    var seeds = [];
    var sigma = Math.max(this.cols, this.rows) * 0.18;
    var sigmaSquared = 2 * sigma * sigma;
    var row;
    var col;

    for (var index = 0; index < seedCount; index += 1) {
      seeds.push({
        x: Math.random() * this.cols,
        y: Math.random() * this.rows,
        sign: Math.random() < 0.5 ? -1 : 1
      });
    }

    for (row = 0; row < this.rows; row += 1) {
      for (col = 0; col < this.cols; col += 1) {
        var field = 0;

        for (var seedIndex = 0; seedIndex < seeds.length; seedIndex += 1) {
          var seed = seeds[seedIndex];
          var dx = col - seed.x;
          var dy = row - seed.y;
          field += seed.sign * Math.exp(-((dx * dx) + (dy * dy)) / sigmaSquared);
        }

        field += (Math.random() * 2 - 1) * 0.18;

        if (field > 0.22) {
          this.cells[this.toIndex(col, row)] = 1;
        } else if (field < -0.22) {
          this.cells[this.toIndex(col, row)] = -1;
        } else {
          this.cells[this.toIndex(col, row)] = 0;
        }
      }
    }

    for (var warmup = 0; warmup < 3; warmup += 1) {
      this.iterateGrid(0.018);
    }
  };

  ToggleLatticeSimulation.prototype.toIndex = function (col, row) {
    return row * this.cols + col;
  };

  ToggleLatticeSimulation.prototype.wrapColumn = function (col) {
    if (col < 0) {
      return this.cols - 1;
    }

    if (col >= this.cols) {
      return 0;
    }

    return col;
  };

  ToggleLatticeSimulation.prototype.wrapRow = function (row) {
    if (row < 0) {
      return this.rows - 1;
    }

    if (row >= this.rows) {
      return 0;
    }

    return row;
  };

  ToggleLatticeSimulation.prototype.sampleNeighborMean = function (col, row) {
    var weightedSum = 0;
    var totalWeight = 0;

    for (var rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (var colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }

        var weight = rowOffset === 0 || colOffset === 0 ? 1 : 0.7;
        var neighborRow = this.wrapRow(row + rowOffset);
        var neighborCol = this.wrapColumn(col + colOffset);
        weightedSum += this.cells[this.toIndex(neighborCol, neighborRow)] * weight;
        totalWeight += weight;
      }
    }

    return totalWeight ? weightedSum / totalWeight : 0;
  };

  ToggleLatticeSimulation.prototype.iterateGrid = function (noiseOverride) {
    var activeNoise = typeof noiseOverride === "number" ? noiseOverride : this.noise;

    for (var row = 0; row < this.rows; row += 1) {
      for (var col = 0; col < this.cols; col += 1) {
        var index = this.toIndex(col, row);
        var currentState = this.cells[index];
        var neighborMean = this.sampleNeighborMean(col, row);
        var stochasticField = (Math.random() * 2 - 1) * activeNoise;
        var persistenceField = currentState * 0.12;
        var totalField = (this.coupling * neighborMean) + this.externalField + persistenceField + stochasticField;
        var nextState = currentState;

        if (currentState === 0) {
          if (totalField > 0.16) {
            nextState = 1;
          } else if (totalField < -0.16) {
            nextState = -1;
          } else if (Math.abs(totalField) > 0.07 && Math.random() < 0.14 + (Math.abs(totalField) * 0.4)) {
            nextState = totalField > 0 ? 1 : -1;
          } else {
            nextState = 0;
          }
        } else if (currentState === 1) {
          if (totalField < -0.34 && Math.random() < 0.24 + (activeNoise * 4)) {
            nextState = -1;
          } else if (totalField < 0.04 && Math.random() < 0.08 + (activeNoise * 1.9)) {
            nextState = 0;
          } else {
            nextState = 1;
          }
        } else {
          if (totalField > 0.34 && Math.random() < 0.24 + (activeNoise * 4)) {
            nextState = 1;
          } else if (totalField > -0.04 && Math.random() < 0.08 + (activeNoise * 1.9)) {
            nextState = 0;
          } else {
            nextState = -1;
          }
        }

        this.nextCells[index] = nextState;
      }
    }

    var previousCells = this.cells;
    this.cells = this.nextCells;
    this.nextCells = previousCells;
    this.renderRequested = true;
  };

  ToggleLatticeSimulation.prototype.step = function (deltaTime) {
    if (!this.active) {
      this.stop();
      return;
    }

    if (document.hidden) {
      this.stop();
      return;
    }

    this.accumulator += deltaTime * 1000;
    var stepInterval = this.prefersReducedMotion ? (this.isMobileLayout ? 220 : 180) : (this.isMobileLayout ? 120 : 88);
    var steps = 0;

    while (this.accumulator >= stepInterval && steps < 2) {
      this.iterateGrid();
      this.accumulator -= stepInterval;
      steps += 1;
    }
  };

  ToggleLatticeSimulation.prototype.render = function () {
    if (!this.context || !this.renderRequested) {
      return;
    }

    var context = this.context;
    var cellPadding = this.isMobileLayout ? 0.3 : 0.45;

    context.clearRect(0, 0, this.gridWidth, this.gridHeight);

    for (var row = 0; row < this.rows; row += 1) {
      for (var col = 0; col < this.cols; col += 1) {
        var state = this.cells[this.toIndex(col, row)];
        var x = col * this.cellWidth;
        var y = row * this.cellHeight;
        context.fillStyle = this.stateColors[state];
        context.fillRect(
          x + cellPadding,
          y + cellPadding,
          Math.max(1, this.cellWidth - (cellPadding * 2)),
          Math.max(1, this.cellHeight - (cellPadding * 2))
        );
      }
    }

    this.renderRequested = false;
  };

  ToggleLatticeSimulation.prototype.perturbAt = function (x, y, radiusScale) {
    var targetCol = Math.max(0, Math.min(this.cols - 1, Math.floor((x / this.gridWidth) * this.cols)));
    var targetRow = Math.max(0, Math.min(this.rows - 1, Math.floor((y / this.gridHeight) * this.rows)));
    var radius = Math.max(2, Math.round(Math.min(this.cols, this.rows) * radiusScale));
    var radiusSquared = radius * radius;

    for (var row = Math.max(0, targetRow - radius); row <= Math.min(this.rows - 1, targetRow + radius); row += 1) {
      for (var col = Math.max(0, targetCol - radius); col <= Math.min(this.cols - 1, targetCol + radius); col += 1) {
        var dx = col - targetCol;
        var dy = row - targetRow;
        var distanceSquared = (dx * dx) + (dy * dy);

        if (distanceSquared > radiusSquared) {
          continue;
        }

        var distanceFactor = 1 - (distanceSquared / radiusSquared);
        var roll = Math.random();
        var index = this.toIndex(col, row);

        if (roll < 0.18 + (distanceFactor * 0.32)) {
          this.cells[index] = 0;
        } else if (roll < 0.58 + (distanceFactor * 0.2)) {
          this.cells[index] = Math.random() < 0.5 ? -1 : 1;
        } else {
          this.cells[index] = this.cells[index] === 0 ? (Math.random() < 0.5 ? -1 : 1) : this.cells[index] * -1;
        }
      }
    }

    this.renderRequested = true;
    this.render();
  };

  ToggleLatticeSimulation.prototype.handleReset = function () {
    if (!this.active) {
      return;
    }

    this.seedLattice();
    this.renderRequested = true;
    this.render();
  };

  ToggleLatticeSimulation.prototype.handleExternalPerturb = function () {
    if (!this.active) {
      return;
    }

    this.perturbAt(
      Math.random() * this.gridWidth,
      Math.random() * this.gridHeight,
      this.isMobileLayout ? 0.12 : 0.09
    );
  };

  ToggleLatticeSimulation.prototype.handleModelSelect = function (event) {
    if (!event.detail || event.detail.model !== "toggle-lattice") {
      return;
    }

    this.activate();
  };

  ToggleLatticeSimulation.prototype.handleVisibilityChange = function () {
    if (document.hidden) {
      this.stop();
      return;
    }

    if (this.active) {
      this.start();
    }
  };

  ToggleLatticeSimulation.prototype.handleReducedMotionChange = function (event) {
    this.prefersReducedMotion = event.matches;
    this.handleResize();

    this.renderRequested = true;
    this.render();

    if (!document.hidden && this.active) {
      this.start();
    }
  };

  app.ToggleLatticeSimulation = ToggleLatticeSimulation;
}());
