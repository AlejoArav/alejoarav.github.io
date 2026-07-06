(function () {
  window.Almejarav = window.Almejarav || {};

  function BaseSimulation(options) {
    this.options = options || {};
    this.canvas = this.options.canvas || null;
    this.context = this.createContext(this.canvas);
    this.isRunning = false;
    this.frameRequest = 0;
    this.lastTimestamp = 0;
    this.boundLoop = this.loop.bind(this);
  }

  BaseSimulation.prototype.getContextOptions = function () {
    return {
      alpha: true,
      desynchronized: true
    };
  };

  BaseSimulation.prototype.createContext = function (canvas) {
    return canvas ? canvas.getContext("2d", this.getContextOptions()) : null;
  };

  BaseSimulation.prototype.setCanvas = function (canvas) {
    this.canvas = canvas;
    this.context = this.createContext(canvas);
  };

  BaseSimulation.prototype.start = function () {
    if (this.isRunning || !this.context) {
      return;
    }

    this.isRunning = true;
    this.lastTimestamp = 0;
    this.frameRequest = window.requestAnimationFrame(this.boundLoop);
  };

  BaseSimulation.prototype.stop = function () {
    if (this.frameRequest) {
      window.cancelAnimationFrame(this.frameRequest);
      this.frameRequest = 0;
    }

    this.isRunning = false;
  };

  BaseSimulation.prototype.deactivate = function () {
    this.stop();
  };

  BaseSimulation.prototype.loop = function (timestamp) {
    var deltaTime = this.lastTimestamp ? Math.min(0.2, (timestamp - this.lastTimestamp) / 1000) : 0.016;
    this.lastTimestamp = timestamp;

    if (typeof this.step === "function") {
      this.step(deltaTime, timestamp);
    }

    if (typeof this.render === "function") {
      this.render();
    }

    if (!this.isRunning) {
      return;
    }

    this.frameRequest = window.requestAnimationFrame(this.boundLoop);
  };

  window.Almejarav.BaseSimulation = BaseSimulation;
}());
