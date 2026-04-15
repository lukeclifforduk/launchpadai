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
    locoWidth: 48,          // Locomotive width
    locoHeight: 36,         // Locomotive height
    carriageWidth: 40,      // Carriage width
    carriageHeight: 30,     // Carriage height
    carriageCount: 5,       // Number of cargo carriages
    carriageSpacing: 50     // Distance between carriages (pixels along path)
  },

  // Color palette (matches CSS variables)
  colors: {
    grass: '#7cb342',
    trackLight: '#8b7355',
    trackDark: '#6b5344',
    locoBody: '#2a2a2a',
    locoDarkest: '#1a1a1a',
    locoAccent: '#ff6600',
    carriage: '#3a3a3a',
    carriageDark: '#2a2a2a'
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
   * Clear canvas with background color
   */
  clear() {
    if (!this.ctx) return;

    this.ctx.fillStyle = this.config.colors.grass;
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
  }

  /**
   * Draw background (currently just solid color, cleared by clear() method)
   */
  drawBackground() {
    // Background is cleared by clear() method, so nothing needed here
    // (Could add pattern or gradient here in future)
  }

  /**
   * Draw the track (double rails)
   *
   * @param {TrackSystem} trackSystem - The track to draw
   */
  drawTrack(trackSystem) {
    if (!this.ctx) return;

    // Draw outer rail
    this.drawTrackRail(trackSystem, 0, this.config.colors.trackLight);

    // Draw inner rail (offset inward)
    this.drawTrackRail(
      trackSystem,
      this.config.track.railGap,
      this.config.colors.trackDark
    );
  }

  /**
   * Draw a single rail line
   *
   * @param {TrackSystem} trackSystem - Track for waypoint data
   * @param {number} offset - Offset inward from main track
   * @param {string} color - Rail color
   */
  drawTrackRail(trackSystem, offset, color) {
    if (!this.ctx) return;

    const waypoints = trackSystem.waypoints;
    const railWidth = this.config.track.railWidth;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = railWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();

    // Draw lines connecting waypoints
    for (let i = 0; i < waypoints.length; i++) {
      const waypoint = waypoints[i];

      // Calculate perpendicular offset (inward toward track center)
      const angle = waypoint.angle;
      const perpendicular = angle + Math.PI / 2;  // 90 degrees clockwise
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

    // Close the path (connect last to first)
    const firstWaypoint = waypoints[0];
    const firstAngle = firstWaypoint.angle;
    const firstPerpendicular = firstAngle + Math.PI / 2;
    const firstOffsetX = Math.cos(firstPerpendicular) * offset;
    const firstOffsetY = Math.sin(firstPerpendicular) * offset;
    this.ctx.lineTo(firstWaypoint.x + firstOffsetX, firstWaypoint.y + firstOffsetY);

    this.ctx.stroke();
  }

  /**
   * Draw locomotive
   *
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} angle - Rotation angle (radians)
   * @param {Object} trainConfig - Train configuration
   * @param {Object} colors - Color palette
   */
  drawLocomotive(x, y, angle, trainConfig, colors) {
    if (!this.ctx) return;

    const width = trainConfig.locoWidth;
    const height = trainConfig.locoHeight;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    // Main body (dark)
    this.ctx.fillStyle = colors.locoBody;
    this.ctx.fillRect(-width / 2, -height / 2, width, height);

    // Smokestack (top-left, dark)
    this.ctx.fillStyle = colors.locoDarkest;
    const stackWidth = width * 0.2;
    const stackHeight = height * 0.4;
    this.ctx.fillRect(-width / 2 + 4, -height / 2 - stackHeight + 4, stackWidth, stackHeight);

    // Cabin (back section, slightly darker)
    this.ctx.fillStyle = colors.locoDarkest;
    const cabinWidth = width * 0.3;
    const cabinHeight = height * 0.5;
    this.ctx.fillRect(width / 2 - cabinWidth - 4, -cabinHeight / 2, cabinWidth, cabinHeight);

    // Windows/accent (orange details)
    this.ctx.fillStyle = colors.locoAccent;
    const windowSize = 6;
    this.ctx.fillRect(-4, -8, windowSize, windowSize);      // Front window
    this.ctx.fillRect(width / 2 - 12, -6, windowSize, 4);   // Cabin window

    // Wheels (dark circles at bottom)
    this.ctx.fillStyle = colors.locoDarkest;
    const wheelRadius = 4;
    const wheelY = height / 2 + 2;
    this.ctx.beginPath();
    this.ctx.arc(-width / 3, wheelY, wheelRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(width / 3, wheelY, wheelRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Border (subtle outline)
    this.ctx.strokeStyle = colors.locoDarkest;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-width / 2, -height / 2, width, height);

    this.ctx.restore();
  }

  /**
   * Draw a cargo carriage
   *
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} angle - Rotation angle (radians)
   * @param {Object} trainConfig - Train configuration
   * @param {Object} colors - Color palette
   */
  drawCarriage(x, y, angle, trainConfig, colors) {
    if (!this.ctx) return;

    const width = trainConfig.carriageWidth;
    const height = trainConfig.carriageHeight;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    // Main body
    this.ctx.fillStyle = colors.carriage;
    this.ctx.fillRect(-width / 2, -height / 2, width, height);

    // Border (darker)
    this.ctx.strokeStyle = colors.carriageDark;
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Small accent detail (side stripe)
    this.ctx.fillStyle = colors.locoAccent;
    const stripeHeight = height * 0.3;
    this.ctx.fillRect(width / 2 - 6, -stripeHeight / 2, 3, stripeHeight);

    // Wheels
    this.ctx.fillStyle = colors.carriageDark;
    const wheelRadius = 3;
    const wheelY = height / 2 + 1;
    this.ctx.beginPath();
    this.ctx.arc(-width / 3, wheelY, wheelRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(width / 3, wheelY, wheelRadius, 0, Math.PI * 2);
    this.ctx.fill();

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
