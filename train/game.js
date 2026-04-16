/**
 * TRAIN - Simple Train Simulation with SVG Sprites
 *
 * A forever-running 2D top-down train simulation.
 * A locomotive pulls bucket carriages around an elliptical track,
 * looping smoothly at 60 FPS using SVG sprites.
 *
 * Architecture:
 * - CONFIG: Centralized configuration
 * - SpriteLoader: SVG sprite loading and caching
 * - Utility functions: Math helpers
 * - TrackSystem: Elliptical path with waypoints
 * - Train: Locomotive + carriages with movement
 * - Renderer: Canvas drawing with sprite rendering
 * - Game loop: Animation loop with delta-time
 */

/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {
  canvas: {
    width: 1200,
    height: 800
  },

  track: {
    centerX: 600,
    centerY: 400,
    radiusX: 450,
    radiusY: 240,
    railWidth: 4,
    railGap: 20
  },

  train: {
    speed: 180,           // pixels per second
    locoWidth: 32,
    locoHeight: 32,
    carriageWidth: 32,
    carriageHeight: 32,
    carriageCount: 3,     // Simplified: 3 carriages instead of 5
    carriageSpacing: 45
  },

  colors: {
    grass: '#d4c4b0',
    dirt: '#6b4423',
    stone: '#a0a0a0',
    trackLight: '#4a4a4a',
    trackDark: '#2a2a2a',
    sleeper: '#8b6914'
  }
};

/* =========================================================
   SPRITE LOADER - Load and cache SVG sprites
   ========================================================= */

const SPRITES = {};
const spriteIds = [
  'train-loco-n', 'train-loco-e', 'train-loco-s', 'train-loco-w',
  'carriage-bucket-n', 'carriage-bucket-e', 'carriage-bucket-s', 'carriage-bucket-w',
  'track-straight-v', 'track-straight-h'
];

async function loadSprites() {
  try {
    const response = await fetch('sprites.svg');
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

    // Check for parse errors
    if (svgDoc.documentElement.nodeName === 'parsererror') {
      console.error('Failed to parse sprites.svg');
      return false;
    }

    const spriteGroup = svgDoc.querySelector('[id="sprites"]');
    if (!spriteGroup) {
      console.error('No sprites group found in SVG');
      return false;
    }

    for (const id of spriteIds) {
      const symbol = spriteGroup.querySelector(`[id="${id}"]`);
      if (!symbol) {
        console.warn(`Sprite symbol not found: ${id}`);
        continue;
      }

      // Create off-screen canvas for rendering
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 32;
      spriteCanvas.height = 32;
      const spriteCtx = spriteCanvas.getContext('2d');

      // Create temporary SVG wrapping symbol content
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      svg.setAttribute('width', '32');
      svg.setAttribute('height', '32');
      svg.setAttribute('shape-rendering', 'crispEdges');
      svg.setAttribute('image-rendering', 'pixelated');

      // Clone symbol children
      for (let child of symbol.children) {
        svg.appendChild(child.cloneNode(true));
      }

      // Convert SVG to image and render to canvas
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        spriteCtx.drawImage(img, 0, 0, 32, 32);
        SPRITES[id] = spriteCanvas;
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${id}`);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    return true;
  } catch (error) {
    console.error('Failed to load sprites:', error);
    return false;
  }
}

// Function to get directional sprite ID based on angle
function getDirectionId(baseId, angle) {
  let normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const deg = normalizedAngle * 180 / Math.PI;

  let direction;
  if (deg >= 315 || deg < 45) direction = 'e';
  else if (deg >= 45 && deg < 135) direction = 's';
  else if (deg >= 135 && deg < 225) direction = 'w';
  else direction = 'n';

  return `${baseId}-${direction}`;
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

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function ellipsePoint(centerX, centerY, radiusX, radiusY, t) {
  return {
    x: centerX + radiusX * Math.cos(t),
    y: centerY + radiusY * Math.sin(t)
  };
}

function ellipseTangent(radiusX, radiusY, t) {
  return Math.atan2(radiusY * Math.cos(t), -radiusX * Math.sin(t));
}

/* =========================================================
   TRACK SYSTEM
   ========================================================= */

class TrackSystem {
  constructor(config) {
    this.centerX = config.centerX;
    this.centerY = config.centerY;
    this.radiusX = config.radiusX;
    this.radiusY = config.radiusY;
    this.railWidth = config.railWidth;
    this.railGap = config.railGap;
    this.waypoints = [];
    this.totalLength = 0;
    this.generatePath();
  }

  generatePath() {
    this.waypoints = [];
    const segments = 360;
    let cumulativeDistance = 0;

    for (let i = 0; i < segments; i++) {
      const t = degreesToRadians(i);
      const nextT = degreesToRadians((i + 1) % segments);

      const point = ellipsePoint(this.centerX, this.centerY, this.radiusX, this.radiusY, t);
      const nextPoint = ellipsePoint(this.centerX, this.centerY, this.radiusX, this.radiusY, nextT);
      const segmentDistance = distance(point.x, point.y, nextPoint.x, nextPoint.y);
      const angle = ellipseTangent(this.radiusX, this.radiusY, t);

      this.waypoints.push({
        x: point.x,
        y: point.y,
        angle: angle,
        cumulativeDistance: cumulativeDistance
      });

      cumulativeDistance += segmentDistance;
    }

    this.totalLength = cumulativeDistance;

    if (this.waypoints.length === 0 || this.totalLength <= 0) {
      console.error('TrackSystem: Failed to generate valid path');
    }
  }

  getTotalLength() {
    return this.totalLength;
  }

  getPositionAtDistance(distance) {
    if (distance < 0) {
      distance = this.totalLength + (distance % this.totalLength);
    } else if (distance >= this.totalLength) {
      distance = distance % this.totalLength;
    }

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
      segmentLength = this.totalLength - segmentStart + segmentEnd;
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
   TRAIN
   ========================================================= */

class Train {
  constructor(trackSystem, config) {
    this.trackSystem = trackSystem;
    this.speed = config.speed;
    this.locoWidth = config.locoWidth;
    this.locoHeight = config.locoHeight;
    this.carriageWidth = config.carriageWidth;
    this.carriageHeight = config.carriageHeight;
    this.carriageCount = config.carriageCount;
    this.carriageSpacing = config.carriageSpacing;
    this.position = 0;

    const locoPos = this.trackSystem.getPositionAtDistance(this.position);
    this.locomotive = {
      x: locoPos.x,
      y: locoPos.y,
      angle: locoPos.angle,
      width: this.locoWidth,
      height: this.locoHeight
    };

    this.carriages = [];
    for (let i = 0; i < this.carriageCount; i++) {
      this.carriages.push({
        x: 0,
        y: 0,
        angle: 0,
        width: this.carriageWidth,
        height: this.carriageHeight,
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
    renderer.drawLocomotive(
      this.locomotive.x,
      this.locomotive.y,
      this.locomotive.angle
    );

    for (let i = 0; i < this.carriages.length; i++) {
      const carriage = this.carriages[i];
      renderer.drawCarriage(
        carriage.x,
        carriage.y,
        carriage.angle
      );
    }
  }

  reset() {
    this.position = 0;
    this.updateCarriagePositions();
  }
}

/* =========================================================
   RENDERER
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
    this.ctx.imageSmoothingQuality = 'high';
  }

  clear() {
    if (!this.ctx) return;
    this.ctx.fillStyle = this.config.colors.grass;
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
    this.addScatteredTextures();
  }

  addScatteredTextures() {
    if (!this.ctx) return;

    const stone = this.config.colors.stone;
    const dirt = this.config.colors.dirt;
    const textureSpacing = 120;
    const textureSize = 3;

    for (let x = 0; x < this.config.canvas.width; x += textureSpacing) {
      for (let y = 0; y < this.config.canvas.height; y += textureSpacing) {
        const seed = (x * 73856093 ^ y * 19349663) & 0xffffffff;
        const rand = Math.abs(Math.sin(seed) * 10000) % 1;

        if (rand < 0.3) {
          this.ctx.fillStyle = stone;
          const offsetX = x + (seed % 20) - 10;
          const offsetY = y + ((seed / 20) % 20) - 10;
          this.ctx.fillRect(offsetX, offsetY, textureSize, textureSize);
          this.ctx.fillRect(offsetX + 4, offsetY, textureSize, textureSize);
          this.ctx.fillRect(offsetX + 2, offsetY - 4, textureSize, textureSize);
        }
      }
    }
  }

  drawBackground() {
    // Background cleared by clear()
  }

  drawTrack(trackSystem) {
    if (!this.ctx) return;

    const waypoints = trackSystem.waypoints;
    const trackWidth = 50;
    const railWidth = 4;
    const sleeperWidth = 20;
    const sleeperSpacing = 3;
    const railColor = this.config.colors.trackLight;
    const sleeperColor = this.config.colors.sleeper;
    const bedColor = this.config.colors.trackDark;

    // Draw sleepers
    this.ctx.fillStyle = sleeperColor;
    for (let i = 0; i < waypoints.length; i += sleeperSpacing) {
      const waypoint = waypoints[i];
      const angle = waypoint.angle;
      const perpendicular = angle + Math.PI / 2;

      this.ctx.save();
      this.ctx.translate(waypoint.x, waypoint.y);
      this.ctx.rotate(perpendicular);
      this.ctx.fillRect(-trackWidth / 2, -sleeperWidth / 2, trackWidth, sleeperWidth);
      this.ctx.restore();
    }

    // Draw rails
    for (let offset of [-trackWidth / 2, trackWidth / 2]) {
      this.ctx.strokeStyle = railColor;
      this.ctx.lineWidth = railWidth;
      this.ctx.lineCap = 'butt';
      this.ctx.lineJoin = 'miter';
      this.ctx.beginPath();

      for (let i = 0; i < waypoints.length; i++) {
        const waypoint = waypoints[i];
        const angle = waypoint.angle;
        const perpendicular = angle + Math.PI / 2;
        const offsetX = Math.cos(perpendicular) * offset;
        const offsetY = Math.sin(perpendicular) * offset;
        const x = waypoint.x + offsetX;
        const y = waypoint.y + offsetY;

        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  drawLocomotive(x, y, angle) {
    if (!this.ctx) return;

    const spriteId = getDirectionId('train-loco', angle);
    const sprite = SPRITES[spriteId];

    if (!sprite) {
      console.warn(`Sprite not available: ${spriteId}`);
      return;
    }

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.drawImage(sprite, -16, -16, 32, 32);
    this.ctx.restore();
  }

  drawCarriage(x, y, angle) {
    if (!this.ctx) return;

    const spriteId = getDirectionId('carriage-bucket', angle);
    const sprite = SPRITES[spriteId];

    if (!sprite) {
      console.warn(`Sprite not available: ${spriteId}`);
      return;
    }

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.drawImage(sprite, -16, -16, 32, 32);
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
  renderer.drawBackground();
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

  // Load sprites first
  const spritesLoaded = await loadSprites();
  if (!spritesLoaded) {
    console.error('Failed to load sprites');
    return;
  }

  // Initialize systems
  renderer = new Renderer(canvas, CONFIG);
  if (!renderer.ctx) {
    console.error('Failed to initialize renderer');
    return;
  }

  trackSystem = new TrackSystem(CONFIG.track);
  if (trackSystem.waypoints.length === 0) {
    console.error('Failed to initialize track system');
    return;
  }

  train = new Train(trackSystem, CONFIG.train);

  // Start game loop
  requestAnimationFrame(gameLoop);

  console.log('Train simulation started');
});
