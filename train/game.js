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
    carriageSpacing: 40      // pixels between train units
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
   TRACK SYSTEM - Tile-based track from SVG sprites
   ========================================================= */

class TrackSystem {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.tiles = [];      // Array of {x, y, type} for rendering
    this.waypoints = [];  // Array of {x, y, angle} for train path
    this.totalLength = 0;

    this.buildTrack();
    this.generateWaypoints();
  }

  buildTrack() {
    const T = 32; // tile size
    const tiles = [];

    // Build an oval track using tiles
    // The track fits in roughly 38x22 tiles (1216x704 pixels)
    // Canvas is 1200x800, so we'll center it

    // Tile coordinates for track layout
    // Using a simple oval made of straight and curved pieces

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

  generateWaypoints() {
    // Generate waypoints by tracing through the track
    // Center of each tile becomes a waypoint
    // Angles are calculated based on track flow

    const T = 32;
    const waypoints = [];

    // Define the path segments with their flow direction
    const path = [
      // Top straight: moving right
      { start: { x: 3 * T + T/2, y: 4 * T + T/2 }, end: { x: 35 * T + T/2, y: 4 * T + T/2 } },
      // Top-right curve: moving right-to-down
      { start: { x: 36 * T + T/2, y: 4 * T + T/2 }, end: { x: 36 * T + T/2, y: 5 * T + T/2 } },
      // Right straight: moving down
      { start: { x: 36 * T + T/2, y: 5 * T + T/2 }, end: { x: 36 * T + T/2, y: 18 * T + T/2 } },
      // Bottom-right curve: moving down-to-left
      { start: { x: 36 * T + T/2, y: 19 * T + T/2 }, end: { x: 35 * T + T/2, y: 19 * T + T/2 } },
      // Bottom straight: moving left
      { start: { x: 35 * T + T/2, y: 19 * T + T/2 }, end: { x: 3 * T + T/2, y: 19 * T + T/2 } },
      // Bottom-left curve: moving left-to-up
      { start: { x: 2 * T + T/2, y: 19 * T + T/2 }, end: { x: 2 * T + T/2, y: 18 * T + T/2 } },
      // Left straight: moving up
      { start: { x: 2 * T + T/2, y: 18 * T + T/2 }, end: { x: 2 * T + T/2, y: 5 * T + T/2 } },
      // Top-left curve: moving up-to-right
      { start: { x: 2 * T + T/2, y: 4 * T + T/2 }, end: { x: 3 * T + T/2, y: 4 * T + T/2 } }
    ];

    // Create detailed waypoints
    let cumulativeDistance = 0;
    for (let seg = 0; seg < path.length; seg++) {
      const segment = path[seg];
      const dx = segment.end.x - segment.start.x;
      const dy = segment.end.y - segment.start.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Add waypoints every few pixels for smooth movement
      const step = 2;
      for (let d = 0; d <= segmentLength; d += step) {
        const t = d / segmentLength;
        waypoints.push({
          x: segment.start.x + dx * t,
          y: segment.start.y + dy * t,
          angle: angle,
          cumulativeDistance: cumulativeDistance + d
        });
      }

      cumulativeDistance += segmentLength;
    }

    // Add final waypoint if not at end
    if (waypoints.length > 0) {
      const lastWaypoint = waypoints[waypoints.length - 1];
      const firstWaypoint = waypoints[0];
      const finalDist = distance(lastWaypoint.x, lastWaypoint.y, firstWaypoint.x, firstWaypoint.y);
      cumulativeDistance += finalDist;
    }

    this.waypoints = waypoints;
    this.totalLength = cumulativeDistance;
  }

  getTotalLength() {
    return this.totalLength;
  }

  getPositionAtDistance(distance) {
    // Handle wraparound
    if (distance < 0) {
      distance = this.totalLength + (distance % this.totalLength);
    } else if (distance >= this.totalLength) {
      distance = distance % this.totalLength;
    }

    // Find waypoint indices
    let index = 0;
    for (let i = 0; i < this.waypoints.length; i++) {
      if (this.waypoints[i].cumulativeDistance <= distance) {
        index = i;
      } else {
        break;
      }
    }

    const current = this.waypoints[index];
    const next = this.waypoints[(index + 1) % this.waypoints.length];

    const segmentStart = current.cumulativeDistance;
    const segmentEnd = next.cumulativeDistance;
    let segmentLength = segmentEnd - segmentStart;

    if (segmentLength <= 0) {
      segmentLength = this.totalLength - segmentStart;
    }

    if (segmentLength === 0) {
      return { x: current.x, y: current.y, angle: current.angle };
    }

    const t = (distance - segmentStart) / segmentLength;
    const tClamped = clamp(t, 0, 1);

    return {
      x: lerp(current.x, next.x, tClamped),
      y: lerp(current.y, next.y, tClamped),
      angle: current.angle
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

  draw(renderer) {
    // Draw locomotive with smooth rotation
    renderer.drawSpriteWithRotation(
      'train-loco-e',
      this.locomotive.x,
      this.locomotive.y,
      this.locomotive.angle
    );

    // Draw carriages with smooth rotation
    for (let carriage of this.carriages) {
      renderer.drawSpriteWithRotation(
        'carriage-bucket-e',
        carriage.x,
        carriage.y,
        carriage.angle
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

  drawSpriteWithRotation(spriteId, x, y, angle) {
    if (!this.ctx) return;

    const sprite = SPRITES[spriteId];
    if (!sprite) {
      console.warn(`Sprite not found: ${spriteId}`);
      return;
    }

    // Save context state
    this.ctx.save();

    // Move to sprite center, rotate, then draw centered
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.drawImage(sprite, -16, -16, 32, 32);

    // Restore context state
    this.ctx.restore();
  }

  drawTrain(train) {
    if (!this.ctx) return;
    train.draw(this);
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
  renderer.drawTrain(train);

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
