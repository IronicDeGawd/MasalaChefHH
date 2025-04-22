/**
 * GameTimer.js
 * A flexible timer component for game scenes
 * Supports countdown or stopwatch mode with different display formats
 */

export default class GameTimer {
  /**
   * Create a new GameTimer instance
   * @param {Phaser.Scene} scene - The scene this timer belongs to
   * @param {Object} config - Configuration options
   */
  constructor(scene, config = {}) {
    this.scene = scene;

    // Default configuration
    this.config = {
      // Position
      x: scene.cameras.main.width / 2,
      y: 50,

      // Timer behavior
      countDown: false, // true for countdown, false for stopwatch
      initialTime: 0, // in milliseconds (for countdown, this is the starting time)
      autoStart: true, // Start timer automatically

      // Display options
      showHours: false,
      showMilliseconds: false,
      fontFamily: "Arial",
      fontSize: "24px",
      fontColor: "#FFFFFF",
      showBackground: false,
      backgroundColor: "#000000",
      backgroundAlpha: 0.7,
      padding: { x: 15, y: 8 },

      // Event options
      onComplete: null, // Callback when countdown reaches zero
      warning: {
        // Warning threshold for countdown
        threshold: 10000, // 10 seconds
        color: "#FF0000",
        pulse: true,
      },

      // Depth settings
      depth: 100,

      // Blend all provided config options
      ...config,
    };

    // Initialize time tracking variables
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPauseTime = 0;

    // Initialize warning states
    this.isWarning = false;
    this.warningTween = null;

    // Create the timer text
    this.timerText = this.scene.add
      .text(
        this.config.x,
        this.config.y,
        this.getFormattedTime(this.config.initialTime),
        {
          fontFamily: this.config.fontFamily,
          fontSize: this.config.fontSize,
          color: this.config.fontColor,
        }
      )
      .setOrigin(0.5)
      .setDepth(this.config.depth);

    // Add background if enabled
    if (this.config.showBackground) {
      // Create a background rectangle behind the text
      // We'll adjust its size after the text is created
      const bounds = this.timerText.getBounds();
      const padding = this.config.padding;

      this.background = this.scene.add
        .rectangle(
          this.config.x,
          this.config.y,
          bounds.width + padding.x * 2,
          bounds.height + padding.y * 2,
          parseInt(this.config.backgroundColor.replace("#", "0x")),
          this.config.backgroundAlpha
        )
        .setOrigin(0.5)
        .setDepth(this.config.depth - 1);
    }

    // Auto-start if enabled
    if (this.config.autoStart) {
      this.start();
    }

    // Add update event to scene
    this.updateEvent = this.scene.events.on("update", this.update, this);

    // Add shutdown event to clean up
    this.scene.events.once("shutdown", this.destroy, this);
  }

  /**
   * Start the timer
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  start() {
    if (this.isRunning) return this;

    this.startTime = Date.now();
    this.isRunning = true;
    this.isPaused = false;
    this.totalPauseTime = 0;
    this.pauseStartTime = 0;

    return this;
  }

  /**
   * Stop the timer
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;

    if (this.warningTween) {
      this.warningTween.stop();
      this.warningTween = null;
      this.timerText.setColor(this.config.fontColor);
    }

    return this;
  }

  /**
   * Pause the timer
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  pause() {
    if (!this.isRunning || this.isPaused) return this;

    this.isPaused = true;
    this.pauseStartTime = Date.now();

    return this;
  }

  /**
   * Resume the timer after pausing
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return this;

    // Add pause duration to total pause time
    this.totalPauseTime += Date.now() - this.pauseStartTime;
    this.isPaused = false;
    this.pauseStartTime = 0;

    return this;
  }

  /**
   * Reset the timer to initial state
   * @param {boolean} autoStart - Whether to auto-start after reset
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  reset(autoStart = true) {
    this.stop();
    this.elapsedTime = 0;

    if (this.config.countDown) {
      this.timerText.setText(this.getFormattedTime(this.config.initialTime));
    } else {
      this.timerText.setText(this.getFormattedTime(0));
    }

    // Reset warning state
    this.isWarning = false;
    if (this.warningTween) {
      this.warningTween.stop();
      this.warningTween = null;
    }

    if (autoStart) {
      this.start();
    }

    return this;
  }

  /**
   * Update the timer display (called automatically)
   */
  update() {
    if (!this.isRunning || this.isPaused) return;

    // Calculate current time
    if (this.config.countDown) {
      this.updateCountdown();
    } else {
      this.updateStopwatch();
    }
  }

  /**
   * Update logic for countdown mode
   */
  updateCountdown() {
    // Calculate remaining time
    const now = Date.now();
    const pauseAdjustment = this.totalPauseTime;
    const elapsed = now - this.startTime - pauseAdjustment;
    const remaining = Math.max(0, this.config.initialTime - elapsed);

    // Update display
    this.timerText.setText(this.getFormattedTime(remaining));

    // Check for warning threshold
    if (
      this.config.warning &&
      !this.isWarning &&
      remaining <= this.config.warning.threshold
    ) {
      this.startWarning();
    }

    // Check for completion
    if (remaining <= 0) {
      this.stop();
      if (this.config.onComplete) {
        this.config.onComplete();
      }
    }
  }

  /**
   * Update logic for stopwatch mode
   */
  updateStopwatch() {
    // Calculate elapsed time
    const now = Date.now();
    const pauseAdjustment = this.totalPauseTime;
    const elapsed = now - this.startTime - pauseAdjustment;

    // Store elapsed time for reference
    this.elapsedTime = elapsed;

    // Update display
    this.timerText.setText(this.getFormattedTime(elapsed));
  }

  /**
   * Start warning animation when countdown is nearing completion
   */
  startWarning() {
    this.isWarning = true;

    // Change text color
    this.timerText.setColor(this.config.warning.color);

    // Add pulsing effect if enabled
    if (this.config.warning.pulse) {
      this.warningTween = this.scene.tweens.add({
        targets: this.timerText,
        alpha: { from: 1, to: 0.5 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * Format time in milliseconds to display string
   * @param {number} ms - Time in milliseconds
   * @returns {string} - Formatted time string
   */
  getFormattedTime(ms) {
    // Calculate time components
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10); // Hundredths of a second

    // Format the time based on configuration
    let formattedTime = "";

    if (this.config.showHours || hours > 0) {
      formattedTime += hours.toString().padStart(2, "0") + ":";
    }

    formattedTime += minutes.toString().padStart(2, "0") + ":";
    formattedTime += seconds.toString().padStart(2, "0");

    if (this.config.showMilliseconds) {
      formattedTime += "." + milliseconds.toString().padStart(2, "0");
    }

    return formattedTime;
  }

  /**
   * Get the current elapsed time in milliseconds
   * @returns {number} - Elapsed time in milliseconds
   */
  getElapsedTime() {
    if (!this.isRunning) {
      return this.elapsedTime;
    }

    const now = Date.now();
    const pauseAdjustment =
      this.totalPauseTime + (this.isPaused ? now - this.pauseStartTime : 0);
    return now - this.startTime - pauseAdjustment;
  }

  /**
   * Get the current remaining time in milliseconds (for countdown mode)
   * @returns {number} - Remaining time in milliseconds
   */
  getRemainingTime() {
    if (!this.config.countDown) {
      return 0;
    }

    return Math.max(0, this.config.initialTime - this.getElapsedTime());
  }

  /**
   * Change the timer's position
   * @param {number} x - New x position
   * @param {number} y - New y position
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  setPosition(x, y) {
    this.config.x = x;
    this.config.y = y;

    this.timerText.setPosition(x, y);

    if (this.background) {
      this.background.setPosition(x, y);
    }

    return this;
  }

  /**
   * Change the timer's text color
   * @param {string} color - New text color (hex code)
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  setTextColor(color) {
    this.config.fontColor = color;

    if (!this.isWarning) {
      this.timerText.setColor(color);
    }

    return this;
  }

  /**
   * Add time to the timer
   * @param {number} milliseconds - Amount of time to add (in milliseconds)
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  addTime(milliseconds) {
    if (this.config.countDown) {
      this.config.initialTime += milliseconds;
    } else {
      this.totalPauseTime += milliseconds;
    }
    return this;
  }

  /**
   * Set a specific time for the timer
   * @param {number} milliseconds - Time to set (in milliseconds)
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  setTime(milliseconds) {
    if (this.config.countDown) {
      this.config.initialTime = milliseconds;
      if (!this.isRunning) {
        this.timerText.setText(this.getFormattedTime(milliseconds));
      }
    } else {
      const now = Date.now();
      this.startTime = now - milliseconds;
      this.totalPauseTime = 0;
      if (!this.isRunning) {
        this.timerText.setText(this.getFormattedTime(milliseconds));
      }
    }
    return this;
  }

  /**
   * Set a callback to be called when a countdown timer completes
   * @param {Function} callback - Function to call when timer completes
   * @returns {GameTimer} - This GameTimer instance for chaining
   */
  setCompleteCallback(callback) {
    this.config.onComplete = callback;
    return this;
  }

  /**
   * Clean up resources when the scene is shut down
   */
  destroy() {
    // Remove scene event listeners
    if (this.updateEvent) {
      this.scene.events.off("update", this.update, this);
      this.updateEvent = null;
    }

    // Stop any active tweens
    if (this.warningTween) {
      this.warningTween.stop();
      this.warningTween = null;
    }

    // Destroy game objects
    if (this.timerText) {
      this.timerText.destroy();
      this.timerText = null;
    }

    if (this.background) {
      this.background.destroy();
      this.background = null;
    }
  }
}
