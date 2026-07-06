(function (globalScope) {
  var TAU = Math.PI * 2;
  var TRIANGLE_SPREAD = 2.45;
  var TRIANGLE_COS = Math.cos(TRIANGLE_SPREAD);
  var TRIANGLE_SIN = Math.sin(TRIANGLE_SPREAD);
  var MAX_PULSES = 6;
  var SPECIES_COUNT = 3;
  var SPECIES_FILL = [
    "rgba(119, 242, 161, 0.64)",
    "rgba(255, 111, 149, 0.60)",
    "rgba(127, 216, 255, 0.58)"
  ];
  var SPECIES_STROKE = [
    "rgba(184, 255, 207, 0.34)",
    "rgba(255, 189, 205, 0.32)",
    "rgba(190, 239, 255, 0.32)"
  ];
  var SPECIES_PHASE = [0, TAU / 3, (2 * TAU) / 3];
  var SPECIES_REPELLED_BY = [1, 2, 0];

  function randomBetween(min, max) {
    return min + (Math.random() * (max - min));
  }

  function wrapAngle(angle) {
    while (angle <= -Math.PI) {
      angle += TAU;
    }

    while (angle > Math.PI) {
      angle -= TAU;
    }

    return angle;
  }

  function minimumImageDelta(from, to, size) {
    var delta = to - from;

    if (delta > size * 0.5) {
      delta -= size;
    } else if (delta < size * -0.5) {
      delta += size;
    }

    return delta;
  }

  function VicsekFlockEngine() {
    this.pixelWidth = 1;
    this.pixelHeight = 1;
    this.columns = 1;
    this.rows = 1;
    this.cellCount = 1;
    this.totalParticles = 0;
    this.prefersReducedMotion = false;
    this.isMobileLayout = false;

    this.speed = 0.85;
    this.inverseSpeed = 1 / this.speed;
    this.neighborRadius = 58;
    this.repulsionRadius = 34;
    this.neighborRadiusSquared = this.neighborRadius * this.neighborRadius;
    this.repulsionRadiusSquared = this.repulsionRadius * this.repulsionRadius;
    this.alignmentWeight = 0.15;
    this.repulsionWeight = 2.0;
    this.noiseStrength = 0.15;
    this.turnRate = 0.16;
    this.particleSize = 6.4;
    this.trailAlpha = 0.20;
    this.pulseRadius = 190;
    this.pulseStrength = 1.75;
    this.frameIntervalMs = 16.67;
    this.cellSize = this.neighborRadius;
    this.accumulator = 0;
    this.renderRequested = true;

    this.x = null;
    this.y = null;
    this.vx = null;
    this.vy = null;
    this.angle = null;
    this.nextAngle = null;
    this.species = null;
    this.nextIndex = null;
    this.cellHead = null;

    this.pulseX = new Float32Array(MAX_PULSES);
    this.pulseY = new Float32Array(MAX_PULSES);
    this.pulseAge = new Float32Array(MAX_PULSES);
    this.pulseLife = new Float32Array(MAX_PULSES);
    this.pulseRadiusBuffer = new Float32Array(MAX_PULSES);
    this.pulseCount = 0;
  }

  VicsekFlockEngine.prototype.configure = function (settings) {
    this.pixelWidth = Math.max(320, settings.pixelWidth || 320);
    this.pixelHeight = Math.max(240, settings.pixelHeight || 240);
    this.prefersReducedMotion = !!settings.prefersReducedMotion;
    this.isMobileLayout = !!settings.isMobileLayout;

    this.frameIntervalMs = this.prefersReducedMotion ? 33.33 : 16.67;
    this.speed = 0.85;
    this.inverseSpeed = 1 / Math.max(this.speed, 0.001);
    this.neighborRadius = 58;
    this.repulsionRadius = 34;
    this.neighborRadiusSquared = this.neighborRadius * this.neighborRadius;
    this.repulsionRadiusSquared = this.repulsionRadius * this.repulsionRadius;
    this.alignmentWeight = 0.15;
    this.repulsionWeight = 2.0;
    this.noiseStrength = 0.15;
    this.turnRate = 0.16;
    this.particleSize = this.isMobileLayout ? 4.9 : 6.4;
    this.trailAlpha = 0.20;
    this.pulseRadius = 190;
    this.pulseStrength = 1.75;
    this.cellSize = this.neighborRadius;
    this.columns = Math.max(1, Math.ceil(this.pixelWidth / this.cellSize));
    this.rows = Math.max(1, Math.ceil(this.pixelHeight / this.cellSize));
    this.cellCount = this.columns * this.rows;

    this.allocateState(600, this.cellCount);
    this.seedField();
  };

  VicsekFlockEngine.prototype.allocateState = function (particleCount, cellCount) {
    if (!this.x || this.totalParticles !== particleCount) {
      this.totalParticles = particleCount;
      this.x = new Float32Array(particleCount);
      this.y = new Float32Array(particleCount);
      this.vx = new Float32Array(particleCount);
      this.vy = new Float32Array(particleCount);
      this.angle = new Float32Array(particleCount);
      this.nextAngle = new Float32Array(particleCount);
      this.species = new Uint8Array(particleCount);
      this.nextIndex = new Int32Array(particleCount);
    }

    if (!this.cellHead || this.cellHead.length !== cellCount) {
      this.cellHead = new Int32Array(cellCount);
    }
  };

  VicsekFlockEngine.prototype.clearPulses = function () {
    this.pulseCount = 0;
  };

  VicsekFlockEngine.prototype.seedField = function () {
    var perSpecies = Math.floor(this.totalParticles / SPECIES_COUNT);
    var particleIndex = 0;

    this.clearPulses();
    this.accumulator = 0;

    for (var speciesIndex = 0; speciesIndex < SPECIES_COUNT; speciesIndex += 1) {
      var phase = SPECIES_PHASE[speciesIndex];

      for (var localIndex = 0; localIndex < perSpecies; localIndex += 1) {
        var angle = phase + randomBetween(-0.85, 0.85);
        var velocityX = Math.cos(angle) * this.speed;
        var velocityY = Math.sin(angle) * this.speed;

        this.species[particleIndex] = speciesIndex;
        this.angle[particleIndex] = angle;
        this.vx[particleIndex] = velocityX;
        this.vy[particleIndex] = velocityY;
        this.x[particleIndex] = Math.random() * this.pixelWidth;
        this.y[particleIndex] = Math.random() * this.pixelHeight;
        particleIndex += 1;
      }
    }

    this.renderRequested = true;
  };

  VicsekFlockEngine.prototype.gridKey = function (column, row) {
    return (row * this.columns) + column;
  };

  VicsekFlockEngine.prototype.buildNeighborGrid = function () {
    this.cellHead.fill(-1);

    for (var index = 0; index < this.totalParticles; index += 1) {
      var column = Math.floor(this.x[index] / this.cellSize) % this.columns;
      var row = Math.floor(this.y[index] / this.cellSize) % this.rows;
      var key = this.gridKey(column, row);
      this.nextIndex[index] = this.cellHead[key];
      this.cellHead[key] = index;
    }
  };

  VicsekFlockEngine.prototype.addPulse = function (x, y) {
    var targetIndex = this.pulseCount;

    if (this.pulseCount >= MAX_PULSES) {
      for (var shiftIndex = 1; shiftIndex < MAX_PULSES; shiftIndex += 1) {
        this.pulseX[shiftIndex - 1] = this.pulseX[shiftIndex];
        this.pulseY[shiftIndex - 1] = this.pulseY[shiftIndex];
        this.pulseAge[shiftIndex - 1] = this.pulseAge[shiftIndex];
        this.pulseLife[shiftIndex - 1] = this.pulseLife[shiftIndex];
        this.pulseRadiusBuffer[shiftIndex - 1] = this.pulseRadiusBuffer[shiftIndex];
      }

      targetIndex = MAX_PULSES - 1;
      this.pulseCount = MAX_PULSES - 1;
    }

    this.pulseX[targetIndex] = x;
    this.pulseY[targetIndex] = y;
    this.pulseAge[targetIndex] = 0;
    this.pulseLife[targetIndex] = 95;
    this.pulseRadiusBuffer[targetIndex] = this.pulseRadius;
    this.pulseCount += 1;
    this.renderRequested = true;
  };

  VicsekFlockEngine.prototype.advanceParticles = function (dtScale) {
    var width = this.pixelWidth;
    var height = this.pixelHeight;
    var columns = this.columns;
    var rows = this.rows;
    var cellSize = this.cellSize;
    var inverseSpeed = this.inverseSpeed;

    this.buildNeighborGrid();

    for (var index = 0; index < this.totalParticles; index += 1) {
      var particleX = this.x[index];
      var particleY = this.y[index];
      var particleSpecies = this.species[index];
      var repelledBy = SPECIES_REPELLED_BY[particleSpecies];
      var particleColumn = Math.floor(particleX / cellSize) % columns;
      var particleRow = Math.floor(particleY / cellSize) % rows;
      var alignX = 0;
      var alignY = 0;
      var repelX = 0;
      var repelY = 0;
      var alignedNeighbors = 0;
      var repellingNeighbors = 0;

      for (var rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (var columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
          var scanColumn = (particleColumn + columnOffset + columns) % columns;
          var scanRow = (particleRow + rowOffset + rows) % rows;
          var neighborIndex = this.cellHead[this.gridKey(scanColumn, scanRow)];

          while (neighborIndex !== -1) {
            if (neighborIndex !== index) {
              var deltaX = minimumImageDelta(particleX, this.x[neighborIndex], width);
              var deltaY = minimumImageDelta(particleY, this.y[neighborIndex], height);
              var distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);

              if (distanceSquared >= 0.0001 && distanceSquared <= this.neighborRadiusSquared) {
                alignX += this.vx[neighborIndex] * inverseSpeed;
                alignY += this.vy[neighborIndex] * inverseSpeed;
                alignedNeighbors += 1;

                if (this.species[neighborIndex] === repelledBy && distanceSquared < this.repulsionRadiusSquared) {
                  var distance = Math.sqrt(distanceSquared);
                  var strength = (1 - (distance / this.repulsionRadius)) / Math.max(distance, 1);
                  repelX -= deltaX * strength;
                  repelY -= deltaY * strength;
                  repellingNeighbors += 1;
                }
              }
            }

            neighborIndex = this.nextIndex[neighborIndex];
          }
        }
      }

      if (alignedNeighbors > 0) {
        alignX /= alignedNeighbors;
        alignY /= alignedNeighbors;
      } else {
        alignX = this.vx[index] * inverseSpeed;
        alignY = this.vy[index] * inverseSpeed;
      }

      if (repellingNeighbors > 0) {
        repelX /= repellingNeighbors;
        repelY /= repellingNeighbors;
      }

      var pulseX = 0;
      var pulseY = 0;

      for (var pulseIndex = 0; pulseIndex < this.pulseCount; pulseIndex += 1) {
        var pulseDeltaX = minimumImageDelta(this.pulseX[pulseIndex], particleX, width);
        var pulseDeltaY = minimumImageDelta(this.pulseY[pulseIndex], particleY, height);
        var pulseDistanceSquared = (pulseDeltaX * pulseDeltaX) + (pulseDeltaY * pulseDeltaY);
        var pulseRadius = this.pulseRadiusBuffer[pulseIndex];
        var pulseRadiusSquared = pulseRadius * pulseRadius;

        if (pulseDistanceSquared >= 0.0001 && pulseDistanceSquared <= pulseRadiusSquared) {
          var pulseDistance = Math.sqrt(pulseDistanceSquared);
          var falloff = (1 - (pulseDistance / pulseRadius)) * (1 - (this.pulseAge[pulseIndex] / this.pulseLife[pulseIndex]));
          var pulseAngle = Math.atan2(pulseDeltaY, pulseDeltaX) + (Math.PI * 0.5) + SPECIES_PHASE[particleSpecies];
          pulseX += Math.cos(pulseAngle) * falloff;
          pulseY += Math.sin(pulseAngle) * falloff;
        }
      }

      var currentHeadingX = this.vx[index] * inverseSpeed;
      var currentHeadingY = this.vy[index] * inverseSpeed;
      var desiredX = (alignX * this.alignmentWeight) + (repelX * this.repulsionWeight) + (pulseX * this.pulseStrength);
      var desiredY = (alignY * this.alignmentWeight) + (repelY * this.repulsionWeight) + (pulseY * this.pulseStrength);

      if (Math.abs(desiredX) + Math.abs(desiredY) < 0.0001) {
        desiredX = currentHeadingX;
        desiredY = currentHeadingY;
      }

      var targetAngle = Math.atan2(desiredY, desiredX) + randomBetween(this.noiseStrength * -1, this.noiseStrength);
      this.nextAngle[index] = this.angle[index] + (wrapAngle(targetAngle - this.angle[index]) * this.turnRate * dtScale);
    }

    for (var updateIndex = 0; updateIndex < this.totalParticles; updateIndex += 1) {
      var updatedAngle = this.nextAngle[updateIndex];
      var updatedVX = Math.cos(updatedAngle) * this.speed;
      var updatedVY = Math.sin(updatedAngle) * this.speed;

      this.angle[updateIndex] = updatedAngle;
      this.vx[updateIndex] = updatedVX;
      this.vy[updateIndex] = updatedVY;
      this.x[updateIndex] = (this.x[updateIndex] + (updatedVX * dtScale) + width) % width;
      this.y[updateIndex] = (this.y[updateIndex] + (updatedVY * dtScale) + height) % height;
    }

    if (this.pulseCount) {
      var nextPulseCount = 0;

      for (var activeIndex = 0; activeIndex < this.pulseCount; activeIndex += 1) {
        var nextAge = this.pulseAge[activeIndex] + dtScale;

        if (nextAge < this.pulseLife[activeIndex]) {
          this.pulseX[nextPulseCount] = this.pulseX[activeIndex];
          this.pulseY[nextPulseCount] = this.pulseY[activeIndex];
          this.pulseAge[nextPulseCount] = nextAge;
          this.pulseLife[nextPulseCount] = this.pulseLife[activeIndex];
          this.pulseRadiusBuffer[nextPulseCount] = this.pulseRadiusBuffer[activeIndex];
          nextPulseCount += 1;
        }
      }

      this.pulseCount = nextPulseCount;
    }

    this.renderRequested = true;
  };

  VicsekFlockEngine.prototype.step = function (deltaTimeSeconds) {
    this.accumulator += Math.min(48, deltaTimeSeconds * 1000);

    while (this.accumulator >= this.frameIntervalMs) {
      this.advanceParticles(this.frameIntervalMs / 16.67);
      this.accumulator -= this.frameIntervalMs;
    }
  };

  VicsekFlockEngine.prototype.drawPulseOverlay = function (context) {
    for (var index = 0; index < this.pulseCount; index += 1) {
      var progress = this.pulseAge[index] / this.pulseLife[index];
      context.beginPath();
      context.arc(this.pulseX[index], this.pulseY[index], this.pulseRadiusBuffer[index] * progress, 0, TAU);
      context.strokeStyle = "rgba(155, 231, 255, " + (0.22 * (1 - progress)) + ")";
      context.lineWidth = 1.2;
      context.stroke();
    }
  };

  VicsekFlockEngine.prototype.drawSpecies = function (context, speciesIndex) {
    context.beginPath();

    for (var index = 0; index < this.totalParticles; index += 1) {
      if (this.species[index] !== speciesIndex) {
        continue;
      }

      var particleX = this.x[index];
      var particleY = this.y[index];
      var headingX = this.vx[index] * this.inverseSpeed;
      var headingY = this.vy[index] * this.inverseSpeed;
      var size = this.particleSize;
      var tipX = particleX + (headingX * size * 1.35);
      var tipY = particleY + (headingY * size * 1.35);
      var leftX = particleX + (((headingX * TRIANGLE_COS) - (headingY * TRIANGLE_SIN)) * size);
      var leftY = particleY + (((headingX * TRIANGLE_SIN) + (headingY * TRIANGLE_COS)) * size);
      var rightX = particleX + (((headingX * TRIANGLE_COS) + (headingY * TRIANGLE_SIN)) * size);
      var rightY = particleY + (((headingY * TRIANGLE_COS) - (headingX * TRIANGLE_SIN)) * size);

      context.moveTo(tipX, tipY);
      context.lineTo(leftX, leftY);
      context.lineTo(rightX, rightY);
      context.closePath();
    }

    context.fillStyle = SPECIES_FILL[speciesIndex];
    context.fill();
    context.strokeStyle = SPECIES_STROKE[speciesIndex];
    context.lineWidth = 0.65;
    context.stroke();
  };

  VicsekFlockEngine.prototype.render = function (context) {
    if (!context || !this.renderRequested) {
      return;
    }

    context.fillStyle = "rgba(5, 7, 10, " + this.trailAlpha + ")";
    context.fillRect(0, 0, this.pixelWidth, this.pixelHeight);

    if (this.pulseCount) {
      this.drawPulseOverlay(context);
    }

    for (var speciesIndex = 0; speciesIndex < SPECIES_COUNT; speciesIndex += 1) {
      this.drawSpecies(context, speciesIndex);
    }

    this.renderRequested = false;
  };

  globalScope.Almejarav = globalScope.Almejarav || {};
  globalScope.Almejarav.VicsekFlockEngine = VicsekFlockEngine;
}(typeof self !== "undefined" ? self : window));
