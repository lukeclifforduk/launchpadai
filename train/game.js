/**
 * TRAIN - Tile-Based Train Simulation with SVG Sprites
 *
 * A train simulation with sprite-based track tiles and smooth animations.
 * The locomotive pulls bucket carriages around a track made from SVG sprites.
 * Sprites rotate smoothly using canvas transforms (no discrete directions).
 */

/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {
  canvas: {
    width: 1200,
    height: 800
  },

  train: {
    speed: 100,              // pixels per second along path
    carriageCount: 3,
    carriageSpacing: 60,     // pixels between train units (larger scale)
    scale: 1.5               // 1.5x size: 32 * 1.5 = 48 pixels
  },

  tile: {
    size: 32                 // 32x32 pixel tiles matching SVG sprites
  }
};

/* =========================================================
   SPRITE LOADER - Load and cache SVG sprites
   ========================================================= */

const SPRITES = {};
const spriteIds = [
  'train-loco-e', 'carriage-bucket-e',
  'track-straight-v', 'track-straight-h',
  'track-curve-ne', 'track-curve-nw', 'track-curve-se', 'track-curve-sw'
];

async function loadSprites() {
  try {
    const response = await fetch('sprites.svg');
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

    if (svgDoc.documentElement.nodeName === 'parsererror') {
      console.error('Failed to parse sprites.svg');
      return false;
    }

    const defs = svgDoc.querySelector('defs');
    if (!defs) {
      console.error('No defs section found in SVG');
      return false;
    }

    const loadPromises = [];

    for (const id of spriteIds) {
      const symbol = defs.querySelector(`symbol[id="${id}"]`);
      if (!symbol) {
        console.warn(`Sprite symbol not found: ${id}`);
        continue;
      }

      const loadPromise = new Promise((resolve) => {
        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = 32;
        spriteCanvas.height = 32;
        const spriteCtx = spriteCanvas.getContext('2d');

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 32 32');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        svg.setAttribute('shape-rendering', 'crispEdges');

        for (let child of symbol.children) {
          svg.appendChild(child.cloneNode(true));
        }

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          spriteCtx.drawImage(img, 0, 0, 32, 32);
          SPRITES[id] = spriteCanvas;
          URL.revokeObjectURL(url);
          resolve(true);
        };
        img.onerror = () => {
          console.warn(`Failed to load sprite: ${id}`);
          URL.revokeObjectURL(url);
          resolve(false);
        };
        img.src = url;
      });

      loadPromises.push(loadPromise);
    }

    await Promise.all(loadPromises);
    console.log(`Loaded ${Object.keys(SPRITES).length} sprites`);
    return true;
  } catch (error) {
    console.error('Failed to load sprites:', error);
    return false;
  }
}

/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/* =========================================================
   TRACK SYSTEM - Tile-based track with smooth arc corners
   ========================================================= */

class TrackSystem {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.tiles = [];      // Array of {x, y, type} for rendering
    this.waypoints = [];  // Array of {x, y, angle, cumulativeDistance}
    this.totalLength = 0;

    this.buildTrack();
    this.generateWaypoints();
  }

  buildTrack() {
    const T = 32; // tile size
    const tiles = [];

    // Build an oval track using tiles
    // Tile layout: 38 tiles wide (3-35), 20 tiles tall (4-19)

    // Top straight (left to right)
    for (let tx = 3; tx <= 35; tx++) {
      tiles.push({ tx, ty: 4, type: 'straight-h' });
    }

    // Top-right corner (curve)
    tiles.push({ tx: 36, ty: 4, type: 'curve-ne' });

    // Right straight (top to bottom)
    for (let ty = 5; ty <= 18; ty++) {
      tiles.push({ tx: 36, ty, type: 'straight-v' });
    }

    // Bottom-right corner (curve)
    tiles.push({ tx: 36, ty: 19, type: 'curve-se' });

    // Bottom straight (right to left)
    for (let tx = 35; tx >= 3; tx--) {
      tiles.push({ tx, ty: 19, type: 'straight-h' });
    }

    // Bottom-left corner (curve)
    tiles.push({ tx: 2, ty: 19, type: 'curve-sw' });

    // Left straight (bottom to top)
    for (let ty = 18; ty >= 5; ty--) {
      tiles.push({ tx: 2, ty, type: 'straight-v' });
    }

    // Top-left corner (curve)
    tiles.push({ tx: 2, ty: 4, type: 'curve-nw' });

    // Store tiles and convert to pixel coordinates
    this.tiles = tiles.map(t => ({
      x: t.tx * T,
      y: t.ty * T,
      type: t.type
    }));
  }

  /**
   * Generate waypoints that follow the actual track tile layout
   * with smooth quarter-circle curves at corners
   */
  generateWaypoints() {
    const T = 32; // tile size
    const waypoints = [];
    let cumulativeDistance = 0;

    // Helper: Add straight segment waypoints
    const addStraightSegment = (start, end, angle) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const stepSize = 2; // waypoint every 2 pixels for smoothness

      for (let d = 0; d <= length; d += stepSize) {
        const t = length > 0 ? d / length : 0;
        waypoints.push({
          x: start.x + dx * t,
          y: start.y + dy * t,
          angle: angle,
          cumulativeDistance: cumulativeDistance + d
        });
      }
      // Always add endpoint
      if (length > 0) {
        waypoints[waypoints.length - 1] = {
          x: end.x,
          y: end.y,
          angle: angle,
          cumulativeDistance: cumulativeDistance + length
        };
      }
      cumulativeDistance += length;
    };

    // Helper: Add a quarter-circle arc corner
    // Connects from incoming direction to outgoing direction
    const addQuarterArcCorner = (centerX, centerY, radius, startAngle, endAngle) => {
      const arcLength = radius * Math.PI / 2; // Quarter circle arc length
      const angleStep = 0.1; // radians

      for (let a = startAngle;
           (endAngle > startAngle ? a <= endAngle : a >= endAngle);
           a += angleStep * (endAngle > startAngle ? 1 : -1)) {

        const x = centerX + radius * Math.cos(a);
        const y = centerY + radius * Math.sin(a);

        // Tangent angle to circle
        const tangentAngle = a + Math.PI / 2;

        waypoints.push({
          x: x,
          y: y,
          angle: tangentAngle,
          cumulativeDistance: cumulativeDistance
        });

        cumulativeDistance += 2;
      }

      // Ensure endpoint
      const x = centerX + radius * Math.cos(endAngle);
      const y = centerY + radius * Math.sin(endAngle);
      const tangentAngle = endAngle + Math.PI / 2;

      waypoints[waypoints.length - 1] = {
        x: x,
        y: y,
        angle: tangentAngle,
        cumulativeDistance: cumulativeDistance
      };

      cumulativeDistance += radius * Math.PI / 2;
    };

    // The track layout in tile coordinates:
    // Top:    (3-35, 4)
    // NE corner: (36, 4)
    // Right:  (36, 5-18)
    // SE corner: (36, 19)
    // Bottom: (3-35, 19) going backwards
    // SW corner: (2, 19)
    // Left:   (2, 5-18) going backwards
    // NW corner: (2, 4)

    // 1. TOP STRAIGHT (left to right)
    addStraightSegment(
      { x: 3 * T + T/2, y: 4 * T + T/2 },
      { x: 35 * T + T/2, y: 4 * T + T/2 },
      0 // angle pointing right
    );

    // 2. TOP-RIGHT CORNER
    // From (1120, 128) heading right (0°) to (1152, 160) heading down (-90°)
    // Arc center is at corner tile center (1152, 128)
    addQuarterArcCorner(
      36 * T + T/2, 4 * T + T/2,  // center at corner tile
      T/2,                         // radius = half tile = 16px
      0,                          // start: right
      -Math.PI / 2                // end: down
    );

    // 3. RIGHT STRAIGHT (top to bottom)
    addStraightSegment(
      { x: 36 * T + T/2, y: 5 * T + T/2 },
      { x: 36 * T + T/2, y: 18 * T + T/2 },
      -Math.PI / 2 // angle pointing down
    );

    // 4. BOTTOM-RIGHT CORNER
    // From (1152, 576) heading down (-90°) to (1120, 608) heading left (180°)
    // Arc center at corner tile (1152, 608)
    addQuarterArcCorner(
      36 * T + T/2, 19 * T + T/2,  // center at corner tile
      T/2,                          // radius
      -Math.PI / 2,                // start: down
      -Math.PI                     // end: left
    );

    // 5. BOTTOM STRAIGHT (right to left)
    addStraightSegment(
      { x: 35 * T + T/2, y: 19 * T + T/2 },
      { x: 3 * T + T/2, y: 19 * T + T/2 },
      Math.PI // angle pointing left
    );

    // 6. BOTTOM-LEFT CORNER
    // From (96, 608) heading left (180°) to (64, 576) heading up (90°)
    // Arc center at corner tile (64, 608)
    addQuarterArcCorner(
      2 * T + T/2, 19 * T + T/2,  // center at corner tile
      T/2,                         // radius
      Math.PI,                    // start: left
      Math.PI / 2                 // end: up
    );

    // 7. LEFT STRAIGHT (bottom to top)
    addStraightSegment(
      { x: 2 * T + T/2, y: 18 * T + T/2 },
      { x: 2 * T + T/2, y: 5 * T + T/2 },
      Math.PI / 2 // angle pointing up
    );

    // 8. TOP-LEFT CORNER
    // From (64, 160) heading up (90°) to (96, 128) heading right (0°)
    // Arc center at corner tile (64, 128)
    addQuarterArcCorner(
      2 * T + T/2, 4 * T + T/2,  // center at corner tile
      T/2,                        // radius
      Math.PI / 2,               // start: up
      0                          // end: right (2π wraps to 0)
    );

    this.waypoints = waypoints;
    this.totalLength = cumulativeDistance;

    console.log(`Generated ${waypoints.length} waypoints, total track length: ${cumulativeDistance.toFixed(2)} pixels`);
  }

  getTotalLength() {
    return this.totalLength;
  }

  getPositionAtDistance(distance) {
    // Handle wraparound
    if (this.totalLength <= 0) {
      return { x: 0, y: 0, angle: 0 };
    }

    if (distance < 0) {
      distance = this.totalLength + (distance % this.totalLength);
    } else if (distance >= this.totalLength) {
      distance = distance % this.totalLength;
    }

    // Binary search for waypoint
    let low = 0;
    let high = this.waypoints.length - 1;
    let index = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.waypoints[mid].cumulativeDistance <= distance) {
        index = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const current = this.waypoints[index];
    const next = this.waypoints[(index + 1) % this.waypoints.length];

    const segmentStart = current.cumulativeDistance;
    const segmentEnd = next.cumulativeDistance;
    let segmentLength = segmentEnd - segmentStart;

    if (segmentLength <= 0) {
      segmentLength = this.totalLength - segmentStart + next.cumulativeDistance;
    }

    if (segmentLength === 0) {
      return { x: current.x, y: current.y, angle: current.angle };
    }

    const t = (distance - segmentStart) / segmentLength;
    const tClamped = clamp(t, 0, 1);

    // Interpolate position and angle smoothly
    return {
      x: lerp(current.x, next.x, tClamped),
      y: lerp(current.y, next.y, tClamped),
      angle: current.angle + (next.angle - current.angle) * tClamped
    };
  }
}

/* =========================================================
   TRAIN - Locomotive and carriages with smooth rotation
   ========================================================= */

class Train {
  constructor(trackSystem, config) {
    this.trackSystem = trackSystem;
    this.speed = config.speed;
    this.carriageCount = config.carriageCount;
    this.carriageSpacing = config.carriageSpacing;
    this.position = 0;

    const locoPos = this.trackSystem.getPositionAtDistance(this.position);
    this.locomotive = {
      x: locoPos.x,
      y: locoPos.y,
      angle: locoPos.angle
    };

    this.carriages = [];
    for (let i = 0; i < this.carriageCount; i++) {
      this.carriages.push({
        x: 0,
        y: 0,
        angle: 0,
        index: i
      });
    }

    this.updateCarriagePositions();
  }

  update(deltaTime) {
    this.position += this.speed * deltaTime;

    const trackLength = this.trackSystem.getTotalLength();
    if (this.position >= trackLength) {
      this.position = this.position % trackLength;
    }

    const locoPos = this.trackSystem.getPositionAtDistance(this.position);
    this.locomotive.x = locoPos.x;
    this.locomotive.y = locoPos.y;
    this.locomotive.angle = locoPos.angle;

    this.updateCarriagePositions();
  }

  updateCarriagePositions() {
    for (let i = 0; i < this.carriageCount; i++) {
      const carriageDistance = this.position - (i + 1) * this.carriageSpacing;
      const carriagePos = this.trackSystem.getPositionAtDistance(carriageDistance);

      this.carriages[i].x = carriagePos.x;
      this.carriages[i].y = carriagePos.y;
      this.carriages[i].angle = carriagePos.angle;
    }
  }

  draw(renderer, scale = 1) {
    // Draw locomotive with smooth rotation
    renderer.drawSpriteWithRotation(
      'train-loco-e',
      this.locomotive.x,
      this.locomotive.y,
      this.locomotive.angle,
      scale
    );

    // Draw carriages with smooth rotation
    for (let carriage of this.carriages) {
      renderer.drawSpriteWithRotation(
        'carriage-bucket-e',
        carriage.x,
        carriage.y,
        carriage.angle,
        scale
      );
    }
  }
}

/* =========================================================
   RENDERER - Canvas drawing
   ========================================================= */

class Renderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.ctx = this.canvas.getContext('2d');

    if (!this.ctx) {
      console.error('Renderer: Failed to get 2D context');
      return;
    }

    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    if (!this.ctx) return;
    // Light tan background
    this.ctx.fillStyle = '#d4c4b0';
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
  }

  drawTrack(trackSystem) {
    if (!this.ctx) return;

    // Draw each track tile sprite at its position
    for (const tile of trackSystem.tiles) {
      const sprite = SPRITES[`track-${tile.type}`];
      if (!sprite) {
        console.warn(`Track sprite not found: track-${tile.type}`);
        continue;
      }

      // Draw sprite at tile position (already pixel-aligned)
      this.ctx.drawImage(sprite, tile.x, tile.y, 32, 32);
    }
  }

  drawSpriteWithRotation(spriteId, x, y, angle, scale = 1) {
    if (!this.ctx) return;

    const sprite = SPRITES[spriteId];
    if (!sprite) {
      console.warn(`Sprite not found: ${spriteId}`);
      return;
    }

    // Save context state
    this.ctx.save();

    // Move to sprite center, rotate, then draw centered (with scale)
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    const scaledSize = 32 * scale;
    const offset = scaledSize / 2;
    this.ctx.drawImage(sprite, -offset, -offset, scaledSize, scaledSize);

    // Restore context state
    this.ctx.restore();
  }

  drawTrain(train, scale = 1) {
    if (!this.ctx) return;
    train.draw(this, scale);
  }
}

/* =========================================================
   GAME STATE
   ========================================================= */

const gameState = {
  elapsedTime: 0,
  frameCount: 0,
  isPaused: false,

  reset() {
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.isPaused = false;
  }
};

/* =========================================================
   GAME LOOP
   ========================================================= */

let renderer = null;
let trackSystem = null;
let train = null;
let lastTimestamp = null;

function gameLoop(timestamp) {
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }

  const deltaMs = Math.min(timestamp - lastTimestamp, 33);
  const deltaTime = deltaMs / 1000;
  lastTimestamp = timestamp;

  if (!gameState.isPaused) {
    train.update(deltaTime);
    gameState.elapsedTime += deltaTime;
    gameState.frameCount++;
  }

  renderer.clear();
  renderer.drawTrack(trackSystem);
  renderer.drawTrain(train, CONFIG.train.scale);

  requestAnimationFrame(gameLoop);
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Load sprites
  const spritesLoaded = await loadSprites();
  if (!spritesLoaded) {
    console.error('Failed to load sprites');
    return;
  }

  // Initialize renderer
  renderer = new Renderer(canvas, CONFIG);
  if (!renderer.ctx) {
    console.error('Failed to initialize renderer');
    return;
  }

  // Initialize track system
  trackSystem = new TrackSystem(CONFIG.canvas.width, CONFIG.canvas.height);
  if (trackSystem.waypoints.length === 0) {
    console.error('Failed to initialize track system');
    return;
  }

  // Initialize train
  train = new Train(trackSystem, CONFIG.train);

  // Start game loop
  requestAnimationFrame(gameLoop);

  console.log('Train simulation started');
  console.log(`Track length: ${trackSystem.getTotalLength()} pixels`);
  console.log(`Waypoints: ${trackSystem.waypoints.length}`);
});
