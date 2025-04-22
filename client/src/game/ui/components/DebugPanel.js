import Phaser from "phaser";
/**
 * DebugPanel.js
 * A reusable debug panel for Phaser games that displays performance metrics
 * and provides debugging tools and options
 */

export default class DebugPanel {
  /**
   * Create a new DebugPanel instance
   * @param {Phaser.Scene} scene - The scene this debug panel belongs to
   * @param {Object} config - Configuration options
   */
  constructor(scene, config = {}) {
    this.scene = scene;

    // Default configuration
    this.config = {
      // Panel position and size
      x: 10,
      y: 10,
      width: 300,
      height: 0, // Auto height based on content

      // Display options
      showFPS: true,
      showMemory: false,
      showSceneInfo: true,
      showCustomMetrics: true,
      collapsed: false,
      toggleKey: "F2", // Key to toggle visibility

      // Style options
      backgroundColor: 0x000000,
      backgroundAlpha: 0.6,
      textColor: "#FFFFFF",
      fontFamily: "Courier",
      fontSize: "14px",
      padding: 10,

      // Depth settings
      depth: 1000, // Very high to ensure it's on top

      // Custom debug entries
      customMetrics: {},

      // Blend all provided config options
      ...config,
    };

    // Initialize panel variables
    this.visible = !this.config.collapsed;
    this.metrics = {
      fps: 0,
      memory: 0,
      drawCalls: 0,
      customMetrics: {},
      ...this.config.customMetrics,
    };

    // Create the panel container
    this.createPanel();

    // Register keyboard shortcut if specified
    this.registerKeyboardShortcut();

    // Start update loop
    this.updateEvent = this.scene.events.on("update", this.update, this);

    // Add shutdown handler
    this.scene.events.once("shutdown", this.destroy, this);
  }

  /**
   * Creates the debug panel graphics and text
   */
  createPanel() {
    // Create container for all panel elements
    this.container = this.scene.add
      .container(this.config.x, this.config.y)
      .setDepth(this.config.depth)
      .setVisible(this.visible);

    // Create background
    this.background = this.scene.add
      .graphics()
      .fillStyle(this.config.backgroundColor, this.config.backgroundAlpha)
      .lineStyle(1, 0xffffff, 0.3);

    this.container.add(this.background);

    // Create title text with toggle info
    this.titleText = this.scene.add.text(
      this.config.padding,
      this.config.padding,
      `Debug Panel [${this.config.toggleKey} to toggle]`,
      {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        color: "#FFFF00",
        fontStyle: "bold",
      }
    );

    this.container.add(this.titleText);

    // Create metrics text
    this.metricsText = this.scene.add.text(
      this.config.padding,
      this.titleText.y + this.titleText.height + 5,
      this.getMetricsString(),
      {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        color: this.config.textColor,
      }
    );

    this.container.add(this.metricsText);

    // Add close button
    const closeButtonSize = 20;
    const closeButtonX = this.config.width - closeButtonSize - 5;
    const closeButtonY = 5;

    this.closeButton = this.scene.add
      .graphics()
      .fillStyle(0xff0000, 0.7)
      .fillCircle(
        closeButtonX + closeButtonSize / 2,
        closeButtonY + closeButtonSize / 2,
        closeButtonSize / 2
      )
      .lineStyle(2, 0xffffff)
      .moveTo(closeButtonX + 6, closeButtonY + 6)
      .lineTo(
        closeButtonX + closeButtonSize - 6,
        closeButtonY + closeButtonSize - 6
      )
      .moveTo(closeButtonX + 6, closeButtonY + closeButtonSize - 6)
      .lineTo(closeButtonX + closeButtonSize - 6, closeButtonY + 6);

    this.closeButton.setInteractive(
      new Phaser.Geom.Circle(
        closeButtonX + closeButtonSize / 2,
        closeButtonY + closeButtonSize / 2,
        closeButtonSize / 2
      ),
      Phaser.Geom.Circle.Contains
    );

    this.closeButton.on("pointerdown", () => {
      this.toggle();
    });

    this.container.add(this.closeButton);

    // Create debug menu buttons
    this.createDebugButtons();

    // Draw the panel background based on content
    this.updatePanelSize();
  }

  /**
   * Creates debug action buttons
   */
  createDebugButtons() {
    this.debugButtons = [];
    const buttonY = this.metricsText.y + this.metricsText.height + 15;
    const buttonWidth = (this.config.width - this.config.padding * 2) / 2 - 5;
    const buttonHeight = 30;
    const buttonSpacing = 10;

    // Helper function to create a button
    const createButton = (text, x, y, width, callback) => {
      const button = this.scene.add
        .graphics()
        .fillStyle(0x333333, 1)
        .fillRoundedRect(x, y, width, buttonHeight, 5)
        .lineStyle(1, 0xffffff, 0.5)
        .strokeRoundedRect(x, y, width, buttonHeight, 5);

      const buttonText = this.scene.add
        .text(x + width / 2, y + buttonHeight / 2, text, {
          fontFamily: this.config.fontFamily,
          fontSize: this.config.fontSize,
          color: "#FFFFFF",
        })
        .setOrigin(0.5);

      // Create hit area
      const hitArea = new Phaser.Geom.Rectangle(x, y, width, buttonHeight);
      button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      // Add hover effects
      button.on("pointerover", () => {
        button
          .clear()
          .fillStyle(0x666666, 1)
          .fillRoundedRect(x, y, width, buttonHeight, 5)
          .lineStyle(1, 0xffffff, 0.8)
          .strokeRoundedRect(x, y, width, buttonHeight, 5);
      });

      button.on("pointerout", () => {
        button
          .clear()
          .fillStyle(0x333333, 1)
          .fillRoundedRect(x, y, width, buttonHeight, 5)
          .lineStyle(1, 0xffffff, 0.5)
          .strokeRoundedRect(x, y, width, buttonHeight, 5);
      });

      button.on("pointerdown", callback);

      const group = this.scene.add.container(0, 0, [button, buttonText]);
      this.debugButtons.push(group);

      return group;
    };

    // Create common debug buttons
    const buttonConfigs = [
      {
        text: "Pause Game",
        callback: () => {
          if (this.scene.scene.isPaused()) {
            this.scene.scene.resume();
          } else {
            this.scene.scene.pause();
          }
          this.updateButtons();
        },
      },
      {
        text: "Restart Scene",
        callback: () => {
          this.scene.scene.restart();
        },
      },
      {
        text: "Show Hitboxes",
        callback: () => {
          this.togglePhysicsDebug();
          this.updateButtons();
        },
      },
      {
        text: "Take Screenshot",
        callback: () => {
          this.takeScreenshot();
        },
      },
    ];

    // Create the buttons
    let col = 0;
    let row = 0;

    buttonConfigs.forEach((config, index) => {
      col = index % 2;
      row = Math.floor(index / 2);

      const x = this.config.padding + col * (buttonWidth + buttonSpacing);
      const y = buttonY + row * (buttonHeight + buttonSpacing);

      const button = createButton(
        config.text,
        x,
        y,
        buttonWidth,
        config.callback
      );
      this.container.add(button);
    });

    // Store the last button y position for panel sizing
    this.lastButtonY =
      buttonY + (row + 1) * (buttonHeight + buttonSpacing) - buttonSpacing;

    this.updateButtons();
  }

  /**
   * Updates the button labels based on current state
   */
  updateButtons() {
    // Will be implemented when we have dynamic button states
    this.debugButtons.forEach((group) => {
      const buttonText = group.list[1]; // Get the text component

      if (buttonText.text === "Pause Game") {
        buttonText.setText(
          this.scene.scene.isPaused() ? "Resume Game" : "Pause Game"
        );
      }

      if (
        buttonText.text === "Show Hitboxes" ||
        buttonText.text === "Hide Hitboxes"
      ) {
        // Update based on physics debug state
        const debugging =
          this.scene.physics &&
          this.scene.physics.world &&
          this.scene.physics.world.debugGraphic &&
          this.scene.physics.world.debugGraphic.visible;

        buttonText.setText(debugging ? "Hide Hitboxes" : "Show Hitboxes");
      }
    });
  }

  /**
   * Toggle physics debug display
   */
  togglePhysicsDebug() {
    if (this.scene.physics && this.scene.physics.world) {
      const debugging = this.scene.physics.world.drawDebug;
      this.scene.physics.world.drawDebug = !debugging;

      if (this.scene.physics.world.debugGraphic) {
        this.scene.physics.world.debugGraphic.visible = !debugging;
      }
    }
  }

  /**
   * Take a screenshot of the game
   */
  takeScreenshot() {
    // Hide the debug panel temporarily for the screenshot
    const wasVisible = this.container.visible;
    this.container.setVisible(false);

    // Wait one frame to ensure debug panel is hidden
    this.scene.time.delayedCall(10, () => {
      // Take the screenshot
      const dataURL = this.scene.game.canvas.toDataURL("image/png");

      // Create download link
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `masalachef-screenshot-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show notification
      this.showNotification("Screenshot taken!");

      // Restore debug panel visibility
      this.container.setVisible(wasVisible);
    });
  }

  /**
   * Updates the size of the panel based on content
   */
  updatePanelSize() {
    // Calculate total height based on content
    let contentHeight = this.lastButtonY + this.config.padding;

    // Make sure the panel is at least as high as specified in config
    if (this.config.height > 0) {
      contentHeight = Math.max(contentHeight, this.config.height);
    }

    // Redraw the background
    this.background
      .clear()
      .fillStyle(this.config.backgroundColor, this.config.backgroundAlpha)
      .fillRoundedRect(0, 0, this.config.width, contentHeight, 5)
      .lineStyle(1, 0xffffff, 0.3)
      .strokeRoundedRect(0, 0, this.config.width, contentHeight, 5);
  }

  /**
   * Updates metrics and display
   */
  update() {
    if (!this.visible) return;

    // Update metrics every 10 frames to avoid performance issues
    if (this.scene.game.loop.frame % 10 === 0) {
      // Update FPS
      this.metrics.fps = Math.round(this.scene.game.loop.actualFps);

      // Update memory usage if browser supports it
      if (
        this.config.showMemory &&
        window.performance &&
        window.performance.memory
      ) {
        const memoryInfo = window.performance.memory;
        this.metrics.memory = Math.round(
          memoryInfo.usedJSHeapSize / (1024 * 1024)
        );
      }

      // Update draw calls if available
      if (this.scene.renderer && this.scene.renderer.stats) {
        this.metrics.drawCalls = this.scene.renderer.stats.drawCalls;
      }

      // Update text display
      this.metricsText.setText(this.getMetricsString());
    }
  }

  /**
   * Generate the metrics display string
   * @returns {string} - Formatted metrics string
   */
  getMetricsString() {
    let str = "";

    if (this.config.showFPS) {
      str += `FPS: ${this.metrics.fps}\n`;
    }

    if (
      this.config.showMemory &&
      window.performance &&
      window.performance.memory
    ) {
      str += `Memory: ${this.metrics.memory} MB\n`;
    }

    if (this.config.showSceneInfo) {
      str += `Scene: ${this.scene.scene.key}\n`;
      str += `Game Objects: ${this.scene.children.length}\n`;

      if (this.scene.physics && this.scene.physics.world) {
        str += `Physics Bodies: ${this.scene.physics.world.bodies.size}\n`;
      }

      if (this.scene.renderer && this.scene.renderer.stats) {
        str += `Draw Calls: ${this.metrics.drawCalls}\n`;
      }
    }

    // Add custom metrics
    if (
      this.config.showCustomMetrics &&
      Object.keys(this.metrics.customMetrics).length > 0
    ) {
      str += "\nCustom Metrics:\n";

      for (const [key, value] of Object.entries(this.metrics.customMetrics)) {
        str += `${key}: ${value}\n`;
      }
    }

    return str;
  }

  /**
   * Add or update a custom metric to be displayed
   * @param {string} key - Metric name
   * @param {any} value - Metric value
   * @returns {DebugPanel} - This DebugPanel instance for chaining
   */
  setMetric(key, value) {
    this.metrics.customMetrics[key] = value;

    if (this.visible) {
      this.metricsText.setText(this.getMetricsString());
    }

    return this;
  }

  /**
   * Remove a custom metric
   * @param {string} key - Metric name to remove
   * @returns {DebugPanel} - This DebugPanel instance for chaining
   */
  removeMetric(key) {
    if (this.metrics.customMetrics[key] !== undefined) {
      delete this.metrics.customMetrics[key];

      if (this.visible) {
        this.metricsText.setText(this.getMetricsString());
      }
    }

    return this;
  }

  /**
   * Register keyboard shortcut to toggle the panel
   */
  registerKeyboardShortcut() {
    // Check if a toggle key is specified
    if (!this.config.toggleKey) return;

    const keyCode = this.config.toggleKey;

    // Add the key to the Phaser input system
    this.toggleKey = this.scene.input.keyboard.addKey(keyCode);

    // Listener for toggling the panel
    this.scene.input.keyboard.on("keydown-" + keyCode, () => {
      this.toggle();
    });
  }

  /**
   * Toggle the panel visibility
   * @returns {DebugPanel} - This DebugPanel instance for chaining
   */
  toggle() {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
    return this;
  }

  /**
   * Show a temporary notification message in the game
   * @param {string} message - Message to display
   * @param {number} duration - Display duration in milliseconds
   * @returns {DebugPanel} - This DebugPanel instance for chaining
   */
  showNotification(message, duration = 3000) {
    // Create notification container
    const notificationContainer = this.scene.add
      .container(this.scene.cameras.main.width / 2, 50)
      .setDepth(this.config.depth + 10);

    // Create notification text
    const notificationText = this.scene.add
      .text(0, 0, message, {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        color: "#FFFFFF",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5);

    // Add to container
    notificationContainer.add(notificationText);

    // Animate in
    notificationContainer.setAlpha(0);
    notificationContainer.y = 30;

    this.scene.tweens.add({
      targets: notificationContainer,
      y: 50,
      alpha: 1,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        // Hold for duration then fade out
        this.scene.time.delayedCall(duration, () => {
          this.scene.tweens.add({
            targets: notificationContainer,
            y: 30,
            alpha: 0,
            duration: 300,
            ease: "Power2",
            onComplete: () => notificationContainer.destroy(),
          });
        });
      },
    });

    return this;
  }

  /**
   * Clean up resources when the scene is shut down
   */
  destroy() {
    // Remove event listeners
    if (this.updateEvent) {
      this.scene.events.off("update", this.update, this);
      this.updateEvent = null;
    }

    // Unregister keyboard shortcut
    if (this.toggleKey) {
      this.scene.input.keyboard.removeKey(this.toggleKey);
    }

    // Destroy container and all children
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
