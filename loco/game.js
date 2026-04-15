/**
 * LOCO - Train Simulation Game
 *
 * A forever-running pixel-art train simulation.
 * A locomotive pulls 5 cargo carriages around an elliptical track,
 * looping smoothly at 60 FPS.
 *
 * Architecture:
 * - CONFIG: Centralized configuration
 * - Utility functions: Math and drawing helpers
 * - TrackSystem: Path generation and position lookup
 * - Train: Locomotive + 5 carriages, movement tracking
 * - Renderer: All canvas drawing operations
 * - Game loop: Main animation loop with delta-time calculation
 */

/* =========================================================
   CONFIGURATION - All tunable parameters
   ========================================================= */

const CONFIG = {
  // Canvas dimensions (fixed size)
  canvas: {
    width: 1200,
    height: 800
  },

  // Track system parameters
  track: {
    centerX: 600,           // Center of canvas
    centerY: 400,           // Center of canvas
    radiusX: 450,           // Horizontal radius (fills 3/4 of width)
    radiusY: 240,           // Vertical radius (fills 3/5 of height)
    railWidth: 4,           // Width of each rail line (pixels)
    railGap: 20             // Gap between outer and inner rail (pixels)
  },

  // Train system parameters
  train: {
    speed: 200,             // Pixels per second (full loop ~25 seconds)
    locoWidth: 32,          // Locomotive width (pixel art)
    locoHeight: 32,         // Locomotive height (pixel art)
    carriageWidth: 32,      // Carriage width (pixel art)
    carriageHeight: 32,     // Carriage height (pixel art)
    carriageCount: 5,       // Number of cargo carriages
    carriageSpacing: 40     // Distance between carriages (pixels along path)
  },

  // Color palette - Retro 8-bit arcade aesthetic (12 colors total)
  colors: {
    // Background & Environment
    grass: '#2d5016',      // Dark forest green
    dirt: '#6b4423',       // Brown earth
    stone: '#a0a0a0',      // Light gray stone

    // Track elements
    trackLight: '#4a4a4a', // Dark gray rails
    trackDark: '#2a2a2a',  // Very dark rail shadows
    sleeper: '#8b6914',    // Golden brown wood

    // Locomotive palette
    locoBody: '#1a1a1a',   // Pure black body
    locoGray: '#4a4a4a',   // Dark gray panels
    locoRed: '#ff3333',    // Bright red accent
    locoYellow: '#ffff00', // Bright yellow details

    // Carriage palette
    carriageGray: '#3a3a3a',    // Dark gray body
    carriageLight: '#707070',   // Light gray panels
    carriageAccent: '#ff3333'   // Red accent (matches loco)
  }
};

/* =========================================================
   UTILITY FUNCTIONS - Math and drawing helpers
   ========================================================= */

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Calculate distance between two points
 */
function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle from point (x1, y1) to point (x2, y2)
 * Returns angle in radians
 */
function angleBetweenPoints(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Point on an ellipse at angle t (in radians)
 * Returns {x, y}
 */
function ellipsePoint(centerX, centerY, radiusX, radiusY, t) {
  return {
    x: centerX + radiusX * Math.cos(t),
    y: centerY + radiusY * Math.sin(t)
  };
}

/**
 * Tangent angle to an ellipse at angle t
 * Returns angle in radians that is tangent to the ellipse path
 */
function ellipseTangent(radiusX, radiusY, t) {
  // Derivative: dx/dt = -radiusX * sin(t), dy/dt = radiusY * cos(t)
  // Tangent angle = atan2(dy/dt, dx/dt)
  return Math.atan2(radiusY * Math.cos(t), -radiusX * Math.sin(t));
}

/* =========================================================
   TRACK SYSTEM - Path generation and position lookup
   ========================================================= */

/**
 * TrackSystem manages the train's path around the circular track.
 *
 * It precomputes waypoints for smooth movement and allows looking up
 * position and angle at any distance along the path.
 */
class TrackSystem {
  /**
   * @param {Object} config - Track configuration (from CONFIG.track)
   */
  constructor(config) {
    this.centerX = config.centerX;
    this.centerY = config.centerY;
    this.radiusX = config.radiusX;
    this.radiusY = config.radiusY;
    this.railWidth = config.railWidth;
    this.railGap = config.railGap;

    // Path waypoints will be generated on demand
    this.waypoints = [];
    this.totalLength = 0;

    // Generate the path at construction time
    this.generatePath();
  }

  /**
   * Generate waypoints around the elliptical track
   * Creates one waypoint per degree (360 total) for smooth movement
   */
  generatePath() {
    this.waypoints = [];
    const segments = 360;  // One waypoint per degree
    let cumulativeDistance = 0;

    for (let i = 0; i < segments; i++) {
      const t = degreesToRadians(i);
      const nextT = degreesToRadians((i + 1) % segments);

      // Current point on ellipse
      const point = ellipsePoint(
        this.centerX,
        this.centerY,
        this.radiusX,
        this.radiusY,
        t
      );

      // Next point (for distance calculation)
      const nextPoint = ellipsePoint(
        this.centerX,
        this.centerY,
        this.radiusX,
        this.radiusY,
        nextT
      );

      // Distance to next waypoint
      const segmentDistance = distance(point.x, point.y, nextPoint.x, nextPoint.y);

      // Tangent angle at this point (direction of travel)
      const angle = ellipseTangent(this.radiusX, this.radiusY, t);

      // Store waypoint
      this.waypoints.push({
        x: point.x,
        y: point.y,
        angle: angle,
        cumulativeDistance: cumulativeDistance
      });

      cumulativeDistance += segmentDistance;
    }

    // Store total path length
    this.totalLength = cumulativeDistance;

    // Validate path was generated
    if (this.waypoints.length === 0 || this.totalLength <= 0) {
      console.error('TrackSystem: Failed to generate valid path');
    }
  }

  /**
   * Get total distance around the track
   */
  getTotalLength() {
    return this.totalLength;
  }

  /**
   * Get position and angle at a given distance along the track
   * Uses waypoint lookup with wraparound handling
   *
   * @param {number} distance - Distance along the track
   * @returns {Object} {x, y, angle}
   */
  getPositionAtDistance(distance) {
    // Handle wraparound
    if (distance < 0) {
      distance = this.totalLength + (distance % this.totalLength);
    } else if (distance >= this.totalLength) {
      distance = distance % this.totalLength;
    }

    // Find waypoint index (simple linear search - could use binary search for optimization)
    let index = 0;
    for (let i = 0; i < this.waypoints.length; i++) {
      if (this.waypoints[i].cumulativeDistance <= distance) {
        index = i;
      } else {
        break;
      }
    }

    // Get current and next waypoint
    const current = this.waypoints[index];
    const next = this.waypoints[(index + 1) % this.waypoints.length];

    // Interpolation factor between waypoints
    const segmentStart = current.cumulativeDistance;
    const segmentEnd = next.cumulativeDistance;
    let segmentLength = segmentEnd - segmentStart;

    // Handle wraparound at loop end
    if (segmentLength <= 0) {
      segmentLength = this.totalLength - segmentStart + segmentEnd;
    }

    const t = (distance - segmentStart) / segmentLength;
    const tClamped = clamp(t, 0, 1);

    // Linear interpolation between waypoints
    return {
      x: lerp(current.x, next.x, tClamped),
      y: lerp(current.y, next.y, tClamped),
      angle: current.angle  // Use current waypoint's angle (could interpolate for smoother turning)
    };
  }
}

/* =========================================================
   TRAIN SYSTEM - Locomotive and carriages
   ========================================================= */

/**
 * Train represents a locomotive pulling 5 cargo carriages.
 *
 * The train moves along the track path, with each carriage following
 * at a fixed distance behind.
 */
class Train {
  /**
   * @param {TrackSystem} trackSystem - The track this train travels on
   * @param {Object} config - Train configuration (from CONFIG.train)
   */
  constructor(trackSystem, config) {
    this.trackSystem = trackSystem;
    this.speed = config.speed;
    this.locoWidth = config.locoWidth;
    this.locoHeight = config.locoHeight;
    this.carriageWidth = config.carriageWidth;
    this.carriageHeight = config.carriageHeight;
    this.carriageCount = config.carriageCount;
    this.carriageSpacing = config.carriageSpacing;

    // Current position along the track (in pixels)
    this.position = 0;

    // Initialize locomotive
    const locoPos = this.trackSystem.getPositionAtDistance(this.position);
    this.locomotive = {
      x: locoPos.x,
      y: locoPos.y,
      angle: locoPos.angle,
      width: this.locoWidth,
      height: this.locoHeight
    };

    // Initialize carriages (empty array, will be updated each frame)
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

    // Update carriages with initial positions
    this.updateCarriagePositions();
  }

  /**
   * Update train position and all carriage positions
   * Called once per frame
   *
   * @param {number} deltaTime - Time since last frame (in seconds)
   */
  update(deltaTime) {
    // Move the train forward
    this.position += this.speed * deltaTime;

    // Handle wraparound
    const trackLength = this.trackSystem.getTotalLength();
    if (this.position >= trackLength) {
      this.position = this.position % trackLength;
    }

    // Update locomotive position
    const locoPos = this.trackSystem.getPositionAtDistance(this.position);
    this.locomotive.x = locoPos.x;
    this.locomotive.y = locoPos.y;
    this.locomotive.angle = locoPos.angle;

    // Update carriage positions
    this.updateCarriagePositions();
  }

  /**
   * Update all carriage positions based on locomotive position
   * Each carriage follows at a fixed distance behind
   */
  updateCarriagePositions() {
    for (let i = 0; i < this.carriageCount; i++) {
      // Distance along track for this carriage
      // Each carriage is offset from the locomotive
      const carriageDistance = this.position - (i + 1) * this.carriageSpacing;

      // Get position at this distance (handles wraparound internally)
      const carriagePos = this.trackSystem.getPositionAtDistance(carriageDistance);

      // Update carriage
      this.carriages[i].x = carriagePos.x;
      this.carriages[i].y = carriagePos.y;
      this.carriages[i].angle = carriagePos.angle;
    }
  }

  /**
   * Draw the train (locomotive + all carriages)
   *
   * @param {Renderer} renderer - The renderer to use for drawing
   */
  draw(renderer) {
    // Draw locomotive
    renderer.drawLocomotive(
      this.locomotive.x,
      this.locomotive.y,
      this.locomotive.angle,
      CONFIG.train,
      CONFIG.colors
    );

    // Draw carriages in order (closest to furthest)
    for (let i = 0; i < this.carriages.length; i++) {
      const carriage = this.carriages[i];
      renderer.drawCarriage(
        carriage.x,
        carriage.y,
        carriage.angle,
        CONFIG.train,
        CONFIG.colors
      );
    }
  }

  /**
   * Reset train to starting position
   */
  reset() {
    this.position = 0;
    this.updateCarriagePositions();
  }
}

/* =========================================================
   RENDERER - All canvas drawing operations
   ========================================================= */

/**
 * Renderer handles all drawing to the canvas.
 *
 * Provides high-level methods for rendering game elements
 * and low-level helper functions for primitives.
 */
class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas - The canvas to render to
   * @param {Object} config - Game configuration (from CONFIG)
   */
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;

    // Get 2D context
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Renderer: Failed to get 2D context');
      return;
    }

    // Disable anti-aliasing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Clear canvas with background color and add scattered textures
   */
  clear() {
    if (!this.ctx) return;

    // Fill background with grass color
    this.ctx.fillStyle = this.config.colors.grass;
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);

    // Add scattered texture elements (static stones/grass tufts)
    this.addScatteredTextures();
  }

  /**
   * Add scattered stone and grass textures for environment detail
   */
  addScatteredTextures() {
    if (!this.ctx) return;

    const stone = this.config.colors.stone;
    const dirt = this.config.colors.dirt;

    // Pseudo-random texture placement (deterministic seed-based)
    const textureSpacing = 120;
    const textureSize = 3;

    for (let x = 0; x < this.config.canvas.width; x += textureSpacing) {
      for (let y = 0; y < this.config.canvas.height; y += textureSpacing) {
        // Simple deterministic pseudo-random based on position
        const seed = (x * 73856093 ^ y * 19349663) & 0xffffffff;
        const rand = Math.abs(Math.sin(seed) * 10000) % 1;

        if (rand < 0.3) {
          // Draw small stone clusters
          this.ctx.fillStyle = stone;
          const offsetX = x + (seed % 20) - 10;
          const offsetY = y + ((seed / 20) % 20) - 10;
          this.ctx.fillRect(offsetX, offsetY, textureSize, textureSize);
          this.ctx.fillRect(offsetX + 4, offsetY, textureSize, textureSize);
          this.ctx.fillRect(offsetX + 2, offsetY - 4, textureSize, textureSize);
        } else if (rand < 0.5) {
          // Draw dirt patches
          this.ctx.fillStyle = dirt;
          const offsetX = x + (seed % 30) - 15;
          const offsetY = y + ((seed / 30) % 30) - 15;
          this.ctx.fillRect(offsetX, offsetY, 4, 4);
        }
      }
    }
  }

  /**
   * Draw background (currently just solid color, cleared by clear() method)
   */
  drawBackground() {
    // Background is cleared by clear() method, so nothing needed here
    // (Could add pattern or gradient here in future)
  }

  /**
   * Draw the track (two parallel rails with sleepers and middle section)
   *
   * @param {TrackSystem} trackSystem - The track to draw
   */
  drawTrack(trackSystem) {
    if (!this.ctx) return;
    this.drawStandardTrack(trackSystem);
  }

  /**
   * Draw track system with two parallel rails and sleepers
   * Retro 8-bit aesthetic with simplified details
   */
  drawStandardTrack(trackSystem) {
    if (!this.ctx) return;

    const waypoints = trackSystem.waypoints;
    const trackWidth = 50;        // Total width between outer rails
    const railWidth = 4;          // Width of each rail line (thicker for retro look)
    const sleeperWidth = 20;      // Width of sleeper ties
    const sleeperSpacing = 3;     // Draw more frequently for pattern effect
    const railColor = this.config.colors.trackLight;     // Dark gray rails
    const sleeperColor = this.config.colors.sleeper;    // Golden brown sleepers
    const bedColor = this.config.colors.trackDark;      // Very dark rail bed

    // Draw sleeper ties first (behind the rails)
    this.ctx.fillStyle = sleeperColor;
    for (let i = 0; i < waypoints.length; i += sleeperSpacing) {
      const waypoint = waypoints[i];
      const angle = waypoint.angle;
      const perpendicular = angle + Math.PI / 2;

      // Draw sleeper as a rotated rectangle
      this.ctx.save();
      this.ctx.translate(waypoint.x, waypoint.y);
      this.ctx.rotate(perpendicular);
      this.ctx.fillRect(-trackWidth / 2, -sleeperWidth / 2, trackWidth, sleeperWidth);
      this.ctx.restore();
    }

    // Draw middle bed section (simplified, darker)
    this.ctx.fillStyle = bedColor;
    this.ctx.beginPath();
    const innerOffset = (trackWidth / 2) - 12;
    for (let i = 0; i < waypoints.length; i++) {
      const waypoint = waypoints[i];
      const angle = waypoint.angle;
      const perpendicular = angle + Math.PI / 2;
      const offsetX = Math.cos(perpendicular) * innerOffset;
      const offsetY = Math.sin(perpendicular) * innerOffset;
      if (i === 0) {
        this.ctx.moveTo(waypoint.x + offsetX, waypoint.y + offsetY);
      } else {
        this.ctx.lineTo(waypoint.x + offsetX, waypoint.y + offsetY);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Draw two rails (outer lines)
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

  /**
   * Draw locomotive - Pixel art top-down view
   * 32x32 sprite with realistic proportions and detail
   *
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} angle - Rotation angle (radians)
   * @param {Object} trainConfig - Train configuration
   * @param {Object} colors - Color palette
   */
  drawLocomotive(x, y, angle, trainConfig, colors) {
    if (!this.ctx) return;

    const size = 32;
    const half = size / 2;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    // Draw pixel art locomotive (32x32 grid)

    // Wheels (bottom, visible)
    this.ctx.fillStyle = colors.locoBody;
    this.ctx.fillRect(-8, 10, 6, 6);    // Left rear wheel
    this.ctx.fillRect(2, 10, 6, 6);     // Right rear wheel

    // Main body - red locomotive
    this.ctx.fillStyle = colors.locoRed;
    this.ctx.fillRect(-10, -8, 20, 16); // Main cargo/boiler area

    // Cab area - darker red back section
    this.ctx.fillStyle = colors.locoBody;
    this.ctx.fillRect(-10, -8, 5, 16);  // Back wall of cab

    // Smokestack - bright gray cylinder
    this.ctx.fillStyle = colors.locoGray;
    this.ctx.fillRect(-3, -12, 6, 4);   // Smokestack pipe

    // Smokestack cap
    this.ctx.fillStyle = colors.locoBody;
    this.ctx.fillRect(-4, -14, 8, 2);   // Top ring

    // Windows (yellow headlight at front)
    this.ctx.fillStyle = colors.locoYellow;
    this.ctx.fillRect(8, -3, 4, 4);     // Front headlight
    this.ctx.fillRect(8, 0, 4, 4);      // Front light

    // Connector plate (gray detail)
    this.ctx.fillStyle = colors.locoGray;
    this.ctx.fillRect(10, -4, 2, 8);    // Coupling connector

    // Wheel detail outline
    this.ctx.strokeStyle = colors.locoBody;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-8, 10, 6, 6);
    this.ctx.strokeRect(2, 10, 6, 6);

    this.ctx.restore();
  }

  /**
   * Draw a cargo carriage - Pixel art top-down view
   * 32x32 sprite matching locomotive aesthetic
   *
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} angle - Rotation angle (radians)
   * @param {Object} trainConfig - Train configuration
   * @param {Object} colors - Color palette
   */
  drawCarriage(x, y, angle, trainConfig, colors) {
    if (!this.ctx) return;

    const half = 16;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    // Draw pixel art carriage (32x32 grid)

    // Wheels (bottom, visible)
    this.ctx.fillStyle = colors.locoBody;
    this.ctx.fillRect(-8, 10, 6, 6);    // Left wheel
    this.ctx.fillRect(2, 10, 6, 6);     // Right wheel

    // Main cargo body - dark gray
    this.ctx.fillStyle = colors.carriageGray;
    this.ctx.fillRect(-10, -8, 20, 16); // Main box

    // Side panels - lighter gray stripes for detail
    this.ctx.fillStyle = colors.carriageLight;
    this.ctx.fillRect(-10, -6, 2, 12);  // Left panel stripe
    this.ctx.fillRect(8, -6, 2, 12);    // Right panel stripe

    // Top panel detail
    this.ctx.fillStyle = colors.carriageGray;
    this.ctx.fillRect(-8, -8, 16, 2);   // Top edge

    // Connector area (front)
    this.ctx.fillStyle = colors.locoGray;
    this.ctx.fillRect(10, -4, 2, 8);    // Coupling connector

    // Wheel detail outline
    this.ctx.strokeStyle = colors.locoBody;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-8, 10, 6, 6);
    this.ctx.strokeRect(2, 10, 6, 6);

    this.ctx.restore();
  }

  /**
   * Draw entire train (locomotive + carriages)
   *
   * @param {Train} train - The train to draw
   */
  drawTrain(train) {
    if (!this.ctx) return;
    train.draw(this);
  }
}

/* =========================================================
   GAME STATE - Runtime state tracking
   ========================================================= */

/**
 * Central game state object
 */
const gameState = {
  elapsedTime: 0,      // Total time elapsed (seconds)
  frameCount: 0,       // Number of frames rendered
  isPaused: false,     // Whether game is paused (prepared for future use)

  reset() {
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.isPaused = false;
  }
};

/* =========================================================
   GAME LOOP - Animation and initialization
   ========================================================= */

// Global references (will be set during initialization)
let renderer = null;
let trackSystem = null;
let train = null;
let lastTimestamp = null;

/**
 * Main game loop - called once per frame via requestAnimationFrame
 *
 * @param {number} timestamp - Current timestamp (milliseconds)
 */
function gameLoop(timestamp) {
  // Initialize lastTimestamp on first frame
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }

  // Calculate delta time in seconds
  // Clamp to prevent huge jumps if tab was inactive
  const deltaMs = Math.min(timestamp - lastTimestamp, 33);  // Max 33ms (~30 FPS minimum)
  const deltaTime = deltaMs / 1000;
  lastTimestamp = timestamp;

  // Update
  if (!gameState.isPaused) {
    train.update(deltaTime);
    gameState.elapsedTime += deltaTime;
    gameState.frameCount++;
  }

  // Render
  renderer.clear();
  renderer.drawBackground();
  renderer.drawTrack(trackSystem);
  renderer.drawTrain(train);

  // Schedule next frame
  requestAnimationFrame(gameLoop);
}

/**
 * Initialize game when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Get canvas element
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Game: Canvas element not found');
    return;
  }

  try {
    // Create game objects
    renderer = new Renderer(canvas, CONFIG);
    trackSystem = new TrackSystem(CONFIG.track);
    train = new Train(trackSystem, CONFIG.train);

    // Validate initialization
    if (!renderer.ctx) {
      console.error('Game: Failed to initialize renderer');
      return;
    }

    if (trackSystem.getTotalLength() <= 0) {
      console.error('Game: Failed to initialize track system');
      return;
    }

    // Start game loop
    lastTimestamp = null;
    requestAnimationFrame(gameLoop);

    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Game initialization error:', error);
  }
});
