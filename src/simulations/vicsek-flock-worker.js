importScripts("vicsek-flock-engine.js");

(function () {
  var app = self.Almejarav || {};
  var VicsekFlockEngine = app.VicsekFlockEngine;

  if (typeof VicsekFlockEngine !== "function") {
    return;
  }

  var engine = new VicsekFlockEngine();
  var canvas = null;
  var context = null;
  var timerId = 0;
  var lastTimestamp = 0;
  var isActive = false;
  var isHidden = false;

  function cancelLoop() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = 0;
    }
  }

  function scheduleLoop() {
    if (!isActive || isHidden || !context) {
      return;
    }

    cancelLoop();
    timerId = setTimeout(runFrame, Math.max(10, engine.frameIntervalMs));
  }

  function runFrame() {
    if (!isActive || isHidden || !context) {
      return;
    }

    var now = performance.now();
    var deltaTime = lastTimestamp ? Math.min(0.2, (now - lastTimestamp) / 1000) : 0.016;
    lastTimestamp = now;

    engine.step(deltaTime);
    engine.render(context);
    scheduleLoop();
  }

  function configureCanvas(state) {
    if (!canvas || !context || !state) {
      return;
    }

    var devicePixelRatio = state.devicePixelRatio || 1;
    canvas.width = Math.floor(state.pixelWidth * devicePixelRatio);
    canvas.height = Math.floor(state.pixelHeight * devicePixelRatio);
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;

    engine.configure({
      pixelWidth: state.pixelWidth,
      pixelHeight: state.pixelHeight,
      isMobileLayout: state.isMobileLayout,
      prefersReducedMotion: state.prefersReducedMotion
    });
  }

  function renderOnce() {
    if (!context) {
      return;
    }

    engine.renderRequested = true;
    engine.render(context);
  }

  self.onmessage = function (event) {
    var data = event.data || {};

    if (data.type === "init") {
      canvas = data.canvas || null;

      if (!canvas) {
        return;
      }

      context = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true
      });
      configureCanvas(data.state);
      renderOnce();
      return;
    }

    if (!context) {
      return;
    }

    if (data.type === "activate") {
      isActive = true;
      isHidden = !!data.hidden;
      lastTimestamp = 0;
      renderOnce();
      scheduleLoop();
      return;
    }

    if (data.type === "deactivate") {
      isActive = false;
      cancelLoop();
      return;
    }

    if (data.type === "resize") {
      configureCanvas(data.state);
      renderOnce();

      if (isActive && !isHidden) {
        lastTimestamp = 0;
        scheduleLoop();
      }
      return;
    }

    if (data.type === "visibility") {
      isHidden = !!data.hidden;

      if (isHidden) {
        cancelLoop();
      } else if (isActive) {
        lastTimestamp = 0;
        scheduleLoop();
      }
      return;
    }

    if (data.type === "reset") {
      engine.seedField();
      renderOnce();
      return;
    }

    if (data.type === "perturb") {
      engine.addPulse(data.x, data.y);
      renderOnce();
    }
  };
}());
