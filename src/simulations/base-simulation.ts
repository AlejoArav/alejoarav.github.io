interface BaseSimulationOptions {
  canvas?: HTMLCanvasElement | null;
  [key: string]: unknown;
}

class BaseSimulation {
  options: BaseSimulationOptions;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  isRunning: boolean;
  frameRequest: number;
  lastTimestamp: number;
  boundLoop: (timestamp: number) => void;

  constructor(options: BaseSimulationOptions = {}) {
    this.options = options;
    this.canvas = options.canvas || null;
    this.context = this.createContext(this.canvas);
    this.isRunning = false;
    this.frameRequest = 0;
    this.lastTimestamp = 0;
    this.boundLoop = this.loop.bind(this);
  }

  getContextOptions(): CanvasRenderingContext2DSettings {
    return {
      alpha: true,
      desynchronized: true
    };
  }

  createContext(canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null {
    return canvas ? canvas.getContext("2d", this.getContextOptions()) : null;
  }

  setCanvas(canvas: HTMLCanvasElement | null): void {
    this.canvas = canvas;
    this.context = this.createContext(canvas);
  }

  start(): void {
    if (this.isRunning || !this.context) {
      return;
    }

    this.isRunning = true;
    this.lastTimestamp = 0;
    this.frameRequest = window.requestAnimationFrame(this.boundLoop);
  }

  stop(): void {
    if (this.frameRequest) {
      window.cancelAnimationFrame(this.frameRequest);
      this.frameRequest = 0;
    }

    this.isRunning = false;
  }

  deactivate(): void {
    this.stop();
  }

  loop(timestamp: number): void {
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
  }
}

window.Almejarav = window.Almejarav || {};
window.Almejarav.BaseSimulation = BaseSimulation;
