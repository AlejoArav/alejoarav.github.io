(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var yearNodes = document.querySelectorAll("[data-current-year]");
  var currentYear = String(new Date().getFullYear());

  yearNodes.forEach(function (node) {
    node.textContent = currentYear;
  });

  function createTagList(items, className) {
    var list = document.createElement("ul");
    list.className = className;

    items.forEach(function (item) {
      var entry = document.createElement("li");
      entry.textContent = item;
      list.appendChild(entry);
    });

    return list;
  }

  function createProjectCard(project) {
    var article = document.createElement("article");
    article.className = "content-card";

    var meta = document.createElement("div");
    meta.className = "content-card-meta";

    var period = document.createElement("span");
    period.className = "content-meta-pill";
    period.textContent = project.period;
    meta.appendChild(period);

    var status = document.createElement("span");
    status.className = "content-meta-pill";
    status.textContent = project.status;
    meta.appendChild(status);

    var title = document.createElement("h3");
    title.textContent = project.title;

    var summary = document.createElement("p");
    summary.textContent = project.summary;

    article.appendChild(meta);
    article.appendChild(title);
    article.appendChild(summary);
    article.appendChild(createTagList(project.tags || [], "content-tag-list"));
    article.appendChild(createTagList(project.methods || [], "content-method-list"));

    return article;
  }

  function createNoteCard(note) {
    var article = document.createElement("article");
    article.className = "content-card";

    var meta = document.createElement("div");
    meta.className = "content-card-meta";

    var status = document.createElement("span");
    status.className = "content-meta-pill";
    status.textContent = note.status;
    meta.appendChild(status);

    var title = document.createElement("h3");
    title.textContent = note.title;

    var summary = document.createElement("p");
    summary.textContent = note.summary;

    article.appendChild(meta);
    article.appendChild(title);
    article.appendChild(summary);

    return article;
  }

  function createModelCard(model) {
    var article = document.createElement("article");
    article.className = "model-card";
    article.setAttribute("data-model-card", model.id);

    var meta = document.createElement("div");
    meta.className = "content-card-meta";

    var status = document.createElement("span");
    status.className = "content-meta-pill";
    status.textContent = model.status;
    meta.appendChild(status);

    var related = document.createElement("span");
    related.className = "content-meta-pill";
    related.textContent = model.relatedProject;
    meta.appendChild(related);

    var title = document.createElement("h3");
    title.textContent = model.title;

    var body = document.createElement("div");
    body.className = "model-card-body";

    var intuitionLabel = document.createElement("p");
    intuitionLabel.className = "model-label";
    intuitionLabel.textContent = "intuition";

    var intuition = document.createElement("p");
    intuition.textContent = model.intuition;

    var interpretationLabel = document.createElement("p");
    interpretationLabel.className = "model-label";
    interpretationLabel.textContent = "biological interpretation";

    var interpretation = document.createElement("p");
    interpretation.textContent = model.biologicalInterpretation;

    var controls = document.createElement("ul");
    controls.className = "model-command-list";

    (model.controls || []).forEach(function (item) {
      var entry = document.createElement("li");
      entry.textContent = item.label;
      entry.classList.add(item.live ? "is-live" : "is-placeholder");
      controls.appendChild(entry);
    });

    body.appendChild(intuitionLabel);
    body.appendChild(intuition);
    body.appendChild(interpretationLabel);
    body.appendChild(interpretation);
    body.appendChild(controls);

    article.appendChild(meta);
    article.appendChild(title);
    article.appendChild(body);

    return article;
  }

  function renderStructuredContent() {
    function renderCollection(selector, url, cardBuilder) {
      var roots = Array.prototype.slice.call(document.querySelectorAll(selector));

      if (!roots.length || typeof window.fetch !== "function") {
        return;
      }

      window.fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Request failed");
          }

          return response.json();
        })
        .then(function (items) {
          roots.forEach(function (root) {
            var fragment = document.createDocumentFragment();

            items.forEach(function (item) {
              fragment.appendChild(cardBuilder(item));
            });

            root.innerHTML = "";
            root.appendChild(fragment);

            var fallback = root.parentElement.querySelector("[data-content-fallback]");
            if (fallback) {
              fallback.hidden = true;
            }
          });
        })
        .catch(function () {
          roots.forEach(function (root) {
            root.innerHTML = "";
          });
        });
    }

    renderCollection("[data-projects-list]", "assets/data/projects.json", createProjectCard);
    renderCollection("[data-notes-list]", "assets/data/notes.json", createNoteCard);
    renderCollection("[data-models-list]", "assets/data/models.json", createModelCard);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function initializeTerminalActionButtons() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-terminal-command]");

      if (!trigger) {
        return;
      }

      var command = trigger.getAttribute("data-terminal-command");
      var terminal = window.Almejarav && window.Almejarav.terminal;

      if (!command || !terminal || typeof terminal.execute !== "function") {
        return;
      }

      event.preventDefault();
      terminal.execute(command);
    });
  }

  function initializeModelIndex() {
    function highlightModel(id) {
      var modelCards = Array.prototype.slice.call(document.querySelectorAll("[data-model-card]"));
      var matchedCard = null;

      modelCards.forEach(function (card) {
        var isMatch = card.getAttribute("data-model-card") === id;
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

    window.addEventListener("almejarav:terminal-command", function (event) {
      if (!event.detail || !event.detail.command) {
        return;
      }

      if (event.detail.command === "model toggle") {
        highlightModel("toggle-lattice");
        return;
      }

      if (event.detail.command === "model reaction") {
        highlightModel("reaction-diffusion");
        return;
      }

      if (event.detail.command === "model quorum") {
        highlightModel("quorum-sensing");
      }
    });

    window.Almejarav = window.Almejarav || {};
    window.Almejarav.modelIndex = {
      highlightModel: highlightModel
    };
  }

  function initializeModelPreviews() {
    var canvases = Array.prototype.slice.call(document.querySelectorAll("[data-model-preview]"));

    if (!canvases.length) {
      return;
    }

    var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var reducedMotion = reducedMotionQuery.matches;
    var animationFrame = 0;
    var lastTimestamp = 0;

    function wrapCoordinate(value, max) {
      if (value < 0) {
        return max - 1;
      }

      if (value >= max) {
        return 0;
      }

      return value;
    }

    function buildPreview(canvas) {
      var context = canvas.getContext("2d");
      var state = {
        canvas: canvas,
        context: context,
        cols: 46,
        rows: 24,
        width: 0,
        height: 0,
        cellWidth: 0,
        cellHeight: 0,
        cells: new Int8Array(46 * 24),
        nextCells: new Int8Array(46 * 24)
      };

      function toIndex(col, row) {
        return row * state.cols + col;
      }

      function seed() {
        var sigma = 6.5;
        var sigmaSquared = 2 * sigma * sigma;
        var seeds = [];

        for (var index = 0; index < 6; index += 1) {
          seeds.push({
            x: Math.random() * state.cols,
            y: Math.random() * state.rows,
            sign: Math.random() < 0.5 ? -1 : 1
          });
        }

        for (var row = 0; row < state.rows; row += 1) {
          for (var col = 0; col < state.cols; col += 1) {
            var field = 0;

            seeds.forEach(function (seedPoint) {
              var dx = col - seedPoint.x;
              var dy = row - seedPoint.y;
              field += seedPoint.sign * Math.exp(-((dx * dx) + (dy * dy)) / sigmaSquared);
            });

            field += (Math.random() * 2 - 1) * 0.25;

            if (field > 0.18) {
              state.cells[toIndex(col, row)] = 1;
            } else if (field < -0.18) {
              state.cells[toIndex(col, row)] = -1;
            } else {
              state.cells[toIndex(col, row)] = 0;
            }
          }
        }
      }

      function resize() {
        var bounds = canvas.getBoundingClientRect();
        var width = Math.max(240, Math.round(bounds.width || canvas.width));
        var height = Math.max(160, Math.round(bounds.height || canvas.height));
        var devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * devicePixelRatio);
        canvas.height = Math.round(height * devicePixelRatio);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        state.width = width;
        state.height = height;
        state.cellWidth = width / state.cols;
        state.cellHeight = height / state.rows;
      }

      function iterate() {
        for (var row = 0; row < state.rows; row += 1) {
          for (var col = 0; col < state.cols; col += 1) {
            var index = toIndex(col, row);
            var current = state.cells[index];
            var weightedSum = 0;
            var totalWeight = 0;

            for (var rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
              for (var colOffset = -1; colOffset <= 1; colOffset += 1) {
                if (rowOffset === 0 && colOffset === 0) {
                  continue;
                }

                var weight = rowOffset === 0 || colOffset === 0 ? 1 : 0.7;
                var neighbor = state.cells[toIndex(
                  wrapCoordinate(col + colOffset, state.cols),
                  wrapCoordinate(row + rowOffset, state.rows)
                )];

                weightedSum += neighbor * weight;
                totalWeight += weight;
              }
            }

            var field = (weightedSum / totalWeight) * 0.76;
            field += current * 0.12;
            field += (Math.random() * 2 - 1) * 0.04;

            if (current === 0) {
              state.nextCells[index] = field > 0.14 ? 1 : (field < -0.14 ? -1 : 0);
            } else if (current === 1) {
              state.nextCells[index] = field < -0.24 ? -1 : (field < 0 ? 0 : 1);
            } else {
              state.nextCells[index] = field > 0.24 ? 1 : (field > 0 ? 0 : -1);
            }
          }
        }

        var previous = state.cells;
        state.cells = state.nextCells;
        state.nextCells = previous;
      }

      function render() {
        context.clearRect(0, 0, state.width, state.height);

        for (var row = 0; row < state.rows; row += 1) {
          for (var col = 0; col < state.cols; col += 1) {
            var value = state.cells[toIndex(col, row)];
            var x = col * state.cellWidth;
            var y = row * state.cellHeight;

            if (value > 0) {
              context.fillStyle = "rgba(118, 242, 170, 0.3)";
            } else if (value < 0) {
              context.fillStyle = "rgba(255, 116, 136, 0.28)";
            } else {
              context.fillStyle = "rgba(18, 28, 26, 0.42)";
            }

            context.fillRect(
              x + 0.45,
              y + 0.45,
              Math.max(1, state.cellWidth - 0.9),
              Math.max(1, state.cellHeight - 0.9)
            );
          }
        }
      }

      resize();
      seed();
      render();

      return {
        resize: function () {
          resize();
          render();
        },
        step: function () {
          iterate();
          render();
        },
        render: render
      };
    }

    var previews = canvases.map(buildPreview);

    function stop() {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }

    function tick(timestamp) {
      if (document.hidden || reducedMotion) {
        stop();
        return;
      }

      if (!lastTimestamp || timestamp - lastTimestamp >= 120) {
        previews.forEach(function (preview) {
          preview.step();
        });
        lastTimestamp = timestamp;
      }

      animationFrame = window.requestAnimationFrame(tick);
    }

    function start() {
      stop();
      lastTimestamp = 0;

      previews.forEach(function (preview) {
        preview.render();
      });

      if (!document.hidden && !reducedMotion) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    }

    window.addEventListener("resize", function () {
      previews.forEach(function (preview) {
        preview.resize();
      });
      start();
    });

    document.addEventListener("visibilitychange", start);

    function onReducedMotionChange(event) {
      reducedMotion = event.matches;
      start();
    }

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", onReducedMotionChange);
    } else if (typeof reducedMotionQuery.addListener === "function") {
      reducedMotionQuery.addListener(onReducedMotionChange);
    }

    start();
  }

  function createWindowUi() {
    var stage = document.querySelector(".terminal-stage");
    var windowRoot = document.querySelector("[data-window-root]");
    var dragHandle = document.querySelector("[data-window-drag-handle]");
    var tabLinks = Array.prototype.slice.call(document.querySelectorAll("[data-tab-link]"));
    var tabPanels = Array.prototype.slice.call(document.querySelectorAll("[data-tab-panel]"));
    var closeButton = document.querySelector("[data-window-close]");
    var minimizeButton = document.querySelector("[data-window-minimize]");
    var maximizeButton = document.querySelector("[data-window-maximize]");
    var activeTabLabel = document.querySelector("[data-active-tab-label]");

    if (!stage || !windowRoot || !dragHandle || !tabLinks.length || !tabPanels.length) {
      return null;
    }

    var dragState = {
      active: false,
      pointerId: null,
      originX: 0,
      originY: 0,
      startLeft: 0,
      startTop: 0
    };

    var layoutState = {
      left: 0,
      top: 0,
      hasManualPosition: false
    };

    function getWindowSize() {
      return {
        width: windowRoot.offsetWidth,
        height: windowRoot.offsetHeight
      };
    }

    function setWindowPosition(left, top) {
      var stageRect = stage.getBoundingClientRect();
      var windowSize = getWindowSize();
      var maxLeft = Math.max(0, stageRect.width - windowSize.width);
      var maxTop = Math.max(0, stageRect.height - Math.max(windowSize.height, 52));

      layoutState.left = clamp(left, 0, maxLeft);
      layoutState.top = clamp(top, 0, maxTop);

      windowRoot.style.left = layoutState.left + "px";
      windowRoot.style.top = layoutState.top + "px";
    }

    function centerWindow() {
      if (windowRoot.classList.contains("is-maximized")) {
        return;
      }

      var stageRect = stage.getBoundingClientRect();
      var windowSize = getWindowSize();
      var left = (stageRect.width - windowSize.width) * 0.5;
      var top = Math.max(18, Math.min(42, stageRect.height * 0.06));
      setWindowPosition(left, top);
    }

    function setWindowState() {
      if (minimizeButton) {
        minimizeButton.setAttribute("aria-expanded", String(!windowRoot.classList.contains("is-minimized")));
      }

      if (maximizeButton) {
        maximizeButton.setAttribute("aria-pressed", String(windowRoot.classList.contains("is-maximized")));
      }
    }

    function restoreWindow() {
      windowRoot.classList.remove("is-minimized");
      windowRoot.classList.remove("is-maximized");
      setWindowState();
      centerWindow();
    }

    function activateTab(name, options) {
      var settings = options || {};
      var activated = false;

      tabLinks.forEach(function (link) {
        var isActive = link.getAttribute("data-tab-target") === name;
        link.classList.toggle("is-active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "page");
          activated = true;
          if (activeTabLabel) {
            activeTabLabel.textContent = name;
          }
        } else {
          link.removeAttribute("aria-current");
        }
      });

      tabPanels.forEach(function (panel) {
        var isActive = panel.getAttribute("data-tab-name") === name;
        panel.classList.toggle("is-active", isActive);
      });

      if (activated && settings.updateHash !== false) {
        history.replaceState(null, "", "#tab-" + name);
      }

      return activated;
    }

    function applyHash() {
      var hash = window.location.hash || "";

      if (hash.indexOf("#tab-") === 0) {
        if (!activateTab(hash.slice(5), { updateHash: false })) {
          activateTab("home", { updateHash: false });
        }
      } else {
        activateTab("home", { updateHash: false });
      }
    }

    function onPointerMove(event) {
      if (!dragState.active || event.pointerId !== dragState.pointerId) {
        return;
      }

      setWindowPosition(
        dragState.startLeft + (event.clientX - dragState.originX),
        dragState.startTop + (event.clientY - dragState.originY)
      );
    }

    function endDrag(event) {
      if (!dragState.active) {
        return;
      }

      if (event && event.pointerId !== undefined && event.pointerId !== dragState.pointerId) {
        return;
      }

      dragState.active = false;
      dragState.pointerId = null;

      if (dragHandle && typeof dragHandle.releasePointerCapture === "function" && event) {
        try {
          dragHandle.releasePointerCapture(event.pointerId);
        } catch (error) {
          // Ignore capture release failures after layout state changes.
        }
      }
    }

    tabLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        activateTab(link.getAttribute("data-tab-target"));
      });
    });

    dragHandle.addEventListener("pointerdown", function (event) {
      if (windowRoot.classList.contains("is-maximized")) {
        return;
      }

      if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) {
        return;
      }

      dragState.active = true;
      dragState.pointerId = event.pointerId;
      dragState.originX = event.clientX;
      dragState.originY = event.clientY;
      dragState.startLeft = layoutState.left;
      dragState.startTop = layoutState.top;
      layoutState.hasManualPosition = true;

      if (typeof dragHandle.setPointerCapture === "function") {
        dragHandle.setPointerCapture(event.pointerId);
      }
    });

    dragHandle.addEventListener("pointermove", onPointerMove);
    dragHandle.addEventListener("pointerup", endDrag);
    dragHandle.addEventListener("pointercancel", endDrag);

    if (closeButton) {
      closeButton.addEventListener("click", function () {
        window.location.reload();
      });
    }

    if (minimizeButton) {
      minimizeButton.addEventListener("click", function () {
        if (windowRoot.classList.contains("is-minimized")) {
          restoreWindow();
          return;
        }

        windowRoot.classList.remove("is-maximized");
        windowRoot.classList.add("is-minimized");
        setWindowState();
        setWindowPosition(18, Math.max(18, stage.getBoundingClientRect().height - 64));
      });
    }

    if (maximizeButton) {
      maximizeButton.addEventListener("click", function () {
        if (windowRoot.classList.contains("is-maximized")) {
          restoreWindow();
          return;
        }

        windowRoot.classList.remove("is-minimized");
        windowRoot.classList.add("is-maximized");
        setWindowState();
      });
    }

    window.addEventListener("hashchange", applyHash);
    window.addEventListener("resize", function () {
      if (windowRoot.classList.contains("is-maximized")) {
        return;
      }

      if (windowRoot.classList.contains("is-minimized")) {
        setWindowPosition(18, Math.max(18, stage.getBoundingClientRect().height - 64));
        return;
      }

      if (layoutState.hasManualPosition) {
        setWindowPosition(layoutState.left, layoutState.top);
        return;
      }

      centerWindow();
    });

    applyHash();
    setWindowState();
    centerWindow();

    return {
      activateTab: activateTab,
      getActiveTab: function () {
        var activeLink = document.querySelector("[data-tab-link].is-active");
        return activeLink ? activeLink.getAttribute("data-tab-target") : "home";
      },
      restoreWindow: restoreWindow
    };
  }

  window.Almejarav = window.Almejarav || {};
  window.Almejarav.windowUi = createWindowUi();
  window.Almejarav.site = {
    stage: "07-vite-typescript",
    currentPage: window.location.pathname.split("/").pop() || "index.html"
  };
  renderStructuredContent();
  initializeTerminalActionButtons();
  initializeModelPreviews();
  initializeModelIndex();
}());
