interface BaseSimulationOptions {
  canvas?: HTMLCanvasElement | null;
  [key: string]: unknown;
}

interface BaseSimulation {
  options: BaseSimulationOptions;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  isRunning: boolean;
  frameRequest: number;
  lastTimestamp: number;
  boundLoop: (timestamp: number) => void;
  getContextOptions(): CanvasRenderingContext2DSettings;
  createContext(canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null;
  setCanvas(canvas: HTMLCanvasElement | null): void;
  start(): void;
  stop(): void;
  deactivate(): void;
  loop(timestamp: number): void;
}

// Keep BaseSimulation as a function constructor so the existing prototype-based
// simulations can continue to inherit via BaseSimulation.call(this, options).
function BaseSimulation(this: BaseSimulation, options: BaseSimulationOptions = {}) {
  this.options = options;
  this.canvas = options.canvas || null;
  this.context = this.createContext(this.canvas);
  this.isRunning = false;
  this.frameRequest = 0;
  this.lastTimestamp = 0;
  this.boundLoop = this.loop.bind(this);
}

BaseSimulation.prototype.getContextOptions = function (this: BaseSimulation): CanvasRenderingContext2DSettings {
  return {
    alpha: true,
    desynchronized: true
  };
};

BaseSimulation.prototype.createContext = function (
  this: BaseSimulation,
  canvas: HTMLCanvasElement | null
): CanvasRenderingContext2D | null {
  return canvas ? canvas.getContext("2d", this.getContextOptions()) : null;
};

BaseSimulation.prototype.setCanvas = function (this: BaseSimulation, canvas: HTMLCanvasElement | null): void {
  this.canvas = canvas;
  this.context = this.createContext(canvas);
};

BaseSimulation.prototype.start = function (this: BaseSimulation): void {
  if (this.isRunning || !this.context) {
    return;
  }

  this.isRunning = true;
  this.lastTimestamp = 0;
  this.frameRequest = window.requestAnimationFrame(this.boundLoop);
};

BaseSimulation.prototype.stop = function (this: BaseSimulation): void {
  if (this.frameRequest) {
    window.cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
  }

  this.isRunning = false;
};

BaseSimulation.prototype.deactivate = function (this: BaseSimulation): void {
  this.stop();
};

BaseSimulation.prototype.loop = function (this: BaseSimulation, timestamp: number): void {
  const deltaTime = this.lastTimestamp ? Math.min(0.2, (timestamp - this.lastTimestamp) / 1000) : 0.016;
  this.lastTimestamp = timestamp;

  const step = (this as BaseSimulation & {
    step?: (deltaTime: number, timestamp: number) => void;
    render?: () => void;
  }).step;
  const render = (this as BaseSimulation & {
    render?: () => void;
  }).render;

  if (typeof step === "function") {
    step.call(this, deltaTime, timestamp);
  }

  if (typeof render === "function") {
    render.call(this);
  }

  if (!this.isRunning) {
    return;
  }

  this.frameRequest = window.requestAnimationFrame(this.boundLoop);
};

window.Almejarav = window.Almejarav || {};
window.Almejarav.BaseSimulation = BaseSimulation;
