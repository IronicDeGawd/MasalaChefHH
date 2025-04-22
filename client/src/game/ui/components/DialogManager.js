/**
 * DialogManager.js
 * A reusable dialog system for Phaser games
 * Handles dialog boxes, option menus, tooltips, and notifications
 */

export default class DialogManager {
  /**
   * Create a new DialogManager instance
   * @param {Phaser.Scene} scene - The scene this dialog manager belongs to
   * @param {Object} config - Configuration options
   */
  constructor(scene, config = {}) {
    this.scene = scene;

    // Default configuration
    this.config = {
      // Styling options
      fontFamily: "Arial",
      fontSize: "18px",
      fontColor: "#000000",
      backgroundColor: 0xfff0e5,
      borderColor: 0x8b4513,
      borderThickness: 4,
      borderRadius: 16,
      padding: { x: 20, y: 15 },

      // Animation options
      animateIn: true,
      animateOut: true,
      animationDuration: 200,

      // Dialog behavior
      dismissOnClickOutside: true,
      modal: true, // If true, prevents interaction with elements below

      // Position
      x: scene.cameras.main.width / 2,
      y: scene.cameras.main.height / 2,

      // Icon settings
      iconKey: null,
      iconScale: 0.2,
      iconRotation: -0.5,

      // Depth settings
      depth: 100,

      // Blend all provided config options
      ...config,
    };

    // Track active dialogs
    this.activeDialog = null;
    this.activeOptions = null;

    // Create modal background (for blocking input to elements below)
    this.modalBackground = this.scene.add
      .rectangle(
        0,
        0,
        this.scene.cameras.main.width * 2,
        this.scene.cameras.main.height * 2,
        0x000000,
        0.5
      )
      .setOrigin(0.5)
      .setDepth(this.config.depth - 1)
      .setVisible(false)
      .setInteractive();
  }

  /**
   * Show a dialog box with a message
   * @param {string} message - The message to display
   * @param {Object} options - Configuration overrides for this specific dialog
   * @returns {Phaser.GameObjects.Container} - The dialog container
   */
  showDialog(message, options = {}) {
    // Close any existing dialogs first
    this.closeAll();

    // Merge options with defaults
    const config = { ...this.config, ...options };

    // Create container at specified position
    const container = this.scene.add
      .container(config.x, config.y)
      .setDepth(config.depth);

    // Create background with rounded corners
    const background = this.scene.add.graphics();
    background.fillStyle(config.backgroundColor, 0.95);
    background.lineStyle(config.borderThickness, config.borderColor);

    // Create the text object to calculate required width/height
    const textObject = this.scene.add
      .text(0, 0, message, {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: config.fontColor,
        align: "center",
        wordWrap: { width: 400 },
      })
      .setOrigin(0.5);

    // Calculate dialog size based on text
    const width = Math.max(textObject.width + config.padding.x * 2, 250);
    const height = textObject.height + config.padding.y * 2 + 50; // Extra space for close button

    // Draw dialog background
    background.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      config.borderRadius
    );
    background.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      config.borderRadius
    );
    container.add(background);

    // Add text to container
    container.add(textObject);

    // Add close button
    const closeButtonBg = this.scene.add.graphics();
    closeButtonBg.fillStyle(0xdddddd, 1);
    closeButtonBg.fillRoundedRect(-60, height / 2 - 40, 120, 30, 8);
    container.add(closeButtonBg);

    const closeButton = this.scene.add
      .text(0, height / 2 - 25, "Close", {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: "#666666",
      })
      .setOrigin(0.5);
    container.add(closeButton);

    // Add interaction to close button
    const closeButtonHitArea = this.scene.add
      .rectangle(0, height / 2 - 25, 120, 30)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeButtonHitArea.on("pointerdown", () => this.closeDialog(container));
    closeButtonHitArea.on("pointerover", () => {
      closeButton.setColor("#000000");
      closeButtonBg.clear();
      closeButtonBg.fillStyle(0xffffff, 1);
      closeButtonBg.fillRoundedRect(-60, height / 2 - 40, 120, 30, 8);
    });
    closeButtonHitArea.on("pointerout", () => {
      closeButton.setColor("#666666");
      closeButtonBg.clear();
      closeButtonBg.fillStyle(0xdddddd, 1);
      closeButtonBg.fillRoundedRect(-60, height / 2 - 40, 120, 30, 8);
    });

    container.add(closeButtonHitArea);

    // Add icon if specified
    if (config.iconKey && this.scene.textures.exists(config.iconKey)) {
      const icon = this.scene.add
        .image(-width / 2 + 30, -height / 2 + 30, config.iconKey)
        .setOrigin(0.5)
        .setScale(config.iconScale)
        .setRotation(config.iconRotation);
      container.add(icon);
    }

    // Add click outside handler if enabled
    if (config.dismissOnClickOutside) {
      this.modalBackground.once("pointerdown", () => {
        this.closeDialog(container);
      });
    }

    // If modal, show the modal background
    if (config.modal) {
      this.modalBackground.setVisible(true);
      this.modalBackground.setDepth(config.depth - 1);
    }

    // Apply entry animation if enabled
    if (config.animateIn) {
      container.setScale(0);
      this.scene.tweens.add({
        targets: container,
        scale: 1,
        duration: config.animationDuration,
        ease: "Back.easeOut",
      });
    }

    // Store reference to active dialog
    this.activeDialog = container;

    return container;
  }

  /**
   * Close a specific dialog
   * @param {Phaser.GameObjects.Container} dialog - The dialog to close
   */
  closeDialog(dialog) {
    if (!dialog) return;

    const config = this.config;

    if (config.animateOut) {
      this.scene.tweens.add({
        targets: dialog,
        scale: 0,
        duration: config.animationDuration,
        ease: "Back.easeIn",
        onComplete: () => {
          dialog.destroy();
          if (dialog === this.activeDialog) {
            this.activeDialog = null;
            this.modalBackground.setVisible(false);
          }
        },
      });
    } else {
      dialog.destroy();
      if (dialog === this.activeDialog) {
        this.activeDialog = null;
        this.modalBackground.setVisible(false);
      }
    }
  }

  /**
   * Show an options menu with multiple choices
   * @param {number} x - X position of the menu
   * @param {number} y - Y position of the menu
   * @param {Array} options - Array of option strings
   * @param {Function} callback - Function to call when an option is selected
   * @param {string} title - Optional title for the menu
   * @returns {Phaser.GameObjects.Container} - The options container
   */
  showOptions(x, y, options, callback, title = "Choose Option") {
    // Close any existing options menus first
    this.closeOptions();

    // Create container at specified position
    const container = this.scene.add
      .container(x, y)
      .setDepth(this.config.depth);

    // Calculate optimal width based on option text lengths
    const minWidth = 220;
    const textPadding = 60;

    const optionTexts = options.map((option) =>
      this.scene.add.text(0, 0, option, {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        color: this.config.fontColor,
      })
    );

    // Find the width needed for the widest option
    let panelWidth = minWidth;
    optionTexts.forEach((text) => {
      panelWidth = Math.max(panelWidth, text.width + textPadding);
      text.destroy(); // Remove temporary text objects
    });

    // Ensure the panel is wide enough for all options
    panelWidth = Math.max(panelWidth, 240);

    // Calculate panel height based on number of options
    const buttonHeight = 40;
    const panelHeight = 40 * (options.length + 1) + 40;

    // Draw background with Phaser graphics for rounded corners
    const bg = this.scene.add.graphics();
    bg.fillStyle(this.config.backgroundColor, 0.95);
    bg.lineStyle(this.config.borderThickness, this.config.borderColor);
    bg.fillRoundedRect(
      -panelWidth / 2,
      0,
      panelWidth,
      panelHeight,
      this.config.borderRadius
    );
    bg.strokeRoundedRect(
      -panelWidth / 2,
      0,
      panelWidth,
      panelHeight,
      this.config.borderRadius
    );

    // Add decorative header
    bg.fillStyle(this.config.borderColor, 1);
    bg.fillRoundedRect(-panelWidth / 2, 0, panelWidth, 30, {
      tl: this.config.borderRadius,
      tr: this.config.borderRadius,
      bl: 0,
      br: 0,
    });

    container.add(bg);

    // Title text for dialog
    const titleText = this.scene.add
      .text(0, 15, title, {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        fontStyle: "bold",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    container.add(titleText);

    // Add decorative icon if specified
    if (
      this.config.iconKey &&
      this.scene.textures.exists(this.config.iconKey)
    ) {
      const icon = this.scene.add
        .image(-panelWidth / 2 + 25, 15, this.config.iconKey)
        .setOrigin(0.5)
        .setScale(this.config.iconScale * 0.8) // Smaller for header
        .setRotation(this.config.iconRotation);

      container.add(icon);
    }

    // Add options with enhanced styling
    options.forEach((option, index) => {
      const y = 50 + index * buttonHeight;

      // Option background (alternating colors for better readability)
      const optionBg = this.scene.add.graphics();
      const bgColor = index % 2 === 0 ? 0xf8f8f8 : 0xffffff;
      optionBg.fillStyle(bgColor, 0.6);
      optionBg.fillRoundedRect(
        -panelWidth / 2 + 20,
        y - 15,
        panelWidth - 40,
        30,
        6
      );
      container.add(optionBg);

      // Option text
      const optionText = this.scene.add
        .text(0, y, option, {
          fontFamily: this.config.fontFamily,
          fontSize: this.config.fontSize,
          color: this.config.fontColor,
        })
        .setOrigin(0.5);
      container.add(optionText);

      // Interactive hit area
      const hitArea = this.scene.add
        .rectangle(0, y, panelWidth - 40, 30)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Add hover effect
      hitArea.on("pointerover", () => {
        optionBg.clear();
        optionBg.fillStyle(0xffe0c0, 0.8);
        optionBg.fillRoundedRect(
          -panelWidth / 2 + 20,
          y - 15,
          panelWidth - 40,
          30,
          6
        );
        optionText.setColor("#8b4513");
      });

      hitArea.on("pointerout", () => {
        optionBg.clear();
        optionBg.fillStyle(bgColor, 0.6);
        optionBg.fillRoundedRect(
          -panelWidth / 2 + 20,
          y - 15,
          panelWidth - 40,
          30,
          6
        );
        optionText.setColor(this.config.fontColor);
      });

      // Handle click
      hitArea.on("pointerdown", () => {
        optionBg.clear();
        optionBg.fillStyle(0xffcc99, 1);
        optionBg.fillRoundedRect(
          -panelWidth / 2 + 20,
          y - 15,
          panelWidth - 40,
          30,
          6
        );

        // Execute callback after brief delay for visual feedback
        this.scene.time.delayedCall(100, () => {
          this.closeOptions();
          if (callback) {
            callback(option);
          }
        });
      });

      container.add(hitArea);
    });

    // Add cancel button with different styling
    const cancelY = 50 + options.length * buttonHeight;

    // Cancel button background
    const cancelButton = this.scene.add.graphics();
    cancelButton.fillStyle(0xdddddd, 1);
    cancelButton.fillRoundedRect(
      -panelWidth / 2 + 20,
      cancelY - 15,
      panelWidth - 40,
      30,
      6
    );
    container.add(cancelButton);

    // Interactive hit area for cancel
    const cancelHitArea = this.scene.add
      .rectangle(0, cancelY, panelWidth - 40, 30)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        cancelButton.clear();
        cancelButton.fillStyle(0xf0f0f0, 1);
        cancelButton.fillRoundedRect(
          -panelWidth / 2 + 20,
          cancelY - 15,
          panelWidth - 40,
          30,
          8
        );
        cancelText.setColor("#333333");
      })
      .on("pointerout", () => {
        cancelButton.clear();
        cancelButton.fillStyle(0xdddddd, 1);
        cancelButton.fillRoundedRect(
          -panelWidth / 2 + 20,
          cancelY - 15,
          panelWidth - 40,
          30,
          8
        );
        cancelText.setColor("#666666");
      })
      .on("pointerdown", () => {
        this.closeOptions();
      });

    container.add(cancelHitArea);

    // Cancel text
    const cancelText = this.scene.add
      .text(0, cancelY, "Cancel", {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        color: "#666666",
      })
      .setOrigin(0.5);

    container.add(cancelText);

    // Check if panel would go off-screen and adjust position
    if (y + panelHeight > this.scene.cameras.main.height) {
      container.y = this.scene.cameras.main.height - panelHeight - 20;
    }

    // Add entry animation
    container.setScale(0);
    this.scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: this.config.animationDuration,
      ease: "Back.easeOut",
    });

    // Store reference to active options menu
    this.activeOptions = container;

    return container;
  }

  /**
   * Close the current options menu
   */
  closeOptions() {
    if (!this.activeOptions) return;

    if (this.config.animateOut) {
      this.scene.tweens.add({
        targets: this.activeOptions,
        scale: 0,
        duration: this.config.animationDuration,
        ease: "Back.easeIn",
        onComplete: () => {
          this.activeOptions.destroy();
          this.activeOptions = null;
        },
      });
    } else {
      this.activeOptions.destroy();
      this.activeOptions = null;
    }
  }

  /**
   * Show a tooltip at a specific position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} text - Tooltip text
   * @param {Object} options - Configuration overrides
   * @returns {Phaser.GameObjects.Container} - The tooltip container
   */
  showTooltip(x, y, text, options = {}) {
    const config = { ...this.config, ...options };

    // Create container
    const container = this.scene.add.container(x, y).setDepth(config.depth);

    // Create text object to measure dimensions
    const tooltipText = this.scene.add
      .text(0, 0, text, {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    // Create background
    const width = tooltipText.width + 20;
    const height = tooltipText.height + 10;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);

    // Add to container
    container.add(bg);
    container.add(tooltipText);

    // Automatic destruction after timeout
    this.scene.time.delayedCall(2000, () => {
      container.destroy();
    });

    return container;
  }

  /**
   * Show a notification that automatically disappears
   * @param {string} message - Notification message
   * @param {string} type - Notification type ('info', 'success', 'warning', 'error')
   * @param {Object} options - Configuration overrides
   */
  showNotification(message, type = "info", options = {}) {
    const config = { ...this.config, ...options };

    // Determine background color based on type
    const typeColors = {
      info: { bg: 0x3498db, text: "#FFFFFF" },
      success: { bg: 0x2ecc71, text: "#FFFFFF" },
      warning: { bg: 0xf39c12, text: "#000000" },
      error: { bg: 0xe74c3c, text: "#FFFFFF" },
    };

    const colors = typeColors[type] || typeColors.info;

    // Create notification at top of screen
    const container = this.scene.add
      .container(config.x, 100)
      .setDepth(config.depth);

    // Create text object to measure dimensions
    const notificationText = this.scene.add
      .text(0, 0, message, {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: colors.text,
      })
      .setOrigin(0.5);

    // Create background
    const width = notificationText.width + 50;
    const height = notificationText.height + 20;
    const bg = this.scene.add.graphics();
    bg.fillStyle(colors.bg, 0.9);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

    // Add to container
    container.add(bg);
    container.add(notificationText);

    // Entry animation
    container.setAlpha(0);
    container.y = 50;

    this.scene.tweens.add({
      targets: container,
      y: 100,
      alpha: 1,
      duration: 500,
      ease: "Sine.easeOut",
      onComplete: () => {
        // Auto-dismiss after delay
        this.scene.time.delayedCall(3000, () => {
          this.scene.tweens.add({
            targets: container,
            y: 50,
            alpha: 0,
            duration: 500,
            onComplete: () => container.destroy(),
          });
        });
      },
    });
  }

  /**
   * Show a confirmation dialog with Yes/No options
   * @param {string} message - Question to confirm
   * @param {Function} onConfirm - Function to call when confirmed
   * @param {Function} onCancel - Function to call when canceled
   * @param {Object} options - Configuration overrides
   */
  showConfirmation(message, onConfirm, onCancel = null, options = {}) {
    // Close any existing dialogs
    this.closeAll();

    // Merge options with defaults
    const config = { ...this.config, ...options };

    // Create container at specified position
    const container = this.scene.add
      .container(config.x, config.y)
      .setDepth(config.depth);

    // Create background with rounded corners
    const background = this.scene.add.graphics();
    background.fillStyle(config.backgroundColor, 0.95);
    background.lineStyle(config.borderThickness, config.borderColor);

    // Create the text object to calculate required width/height
    const textObject = this.scene.add
      .text(0, -20, message, {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: config.fontColor,
        align: "center",
        wordWrap: { width: 400 },
      })
      .setOrigin(0.5);

    // Calculate dialog size based on text
    const width = Math.max(textObject.width + config.padding.x * 2, 300);
    const height = textObject.height + config.padding.y * 2 + 80; // Extra space for buttons

    // Draw dialog background
    background.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      config.borderRadius
    );
    background.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      config.borderRadius
    );
    container.add(background);

    // Add text to container
    container.add(textObject);

    // Create Yes button
    const yesButton = this.scene.add.graphics();
    yesButton.fillStyle(0x2ecc71, 1);
    yesButton.fillRoundedRect(-width / 2 + 40, height / 2 - 60, 100, 40, 8);
    container.add(yesButton);

    const yesText = this.scene.add
      .text(-width / 2 + 90, height / 2 - 40, "Yes", {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: "#FFFFFF",
      })
      .setOrigin(0.5);
    container.add(yesText);

    // Create No button
    const noButton = this.scene.add.graphics();
    noButton.fillStyle(0xe74c3c, 1);
    noButton.fillRoundedRect(width / 2 - 140, height / 2 - 60, 100, 40, 8);
    container.add(noButton);

    const noText = this.scene.add
      .text(width / 2 - 90, height / 2 - 40, "No", {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: "#FFFFFF",
      })
      .setOrigin(0.5);
    container.add(noText);

    // Add interactivity to Yes button
    const yesHitArea = this.scene.add
      .rectangle(-width / 2 + 90, height / 2 - 40, 100, 40)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    yesHitArea.on("pointerover", () => {
      yesButton.clear();
      yesButton.fillStyle(0x27ae60, 1);
      yesButton.fillRoundedRect(-width / 2 + 40, height / 2 - 60, 100, 40, 8);
    });

    yesHitArea.on("pointerout", () => {
      yesButton.clear();
      yesButton.fillStyle(0x2ecc71, 1);
      yesButton.fillRoundedRect(-width / 2 + 40, height / 2 - 60, 100, 40, 8);
    });

    yesHitArea.on("pointerdown", () => {
      this.closeDialog(container);
      if (onConfirm) onConfirm();
    });

    container.add(yesHitArea);

    // Add interactivity to No button
    const noHitArea = this.scene.add
      .rectangle(width / 2 - 90, height / 2 - 40, 100, 40)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    noHitArea.on("pointerover", () => {
      noButton.clear();
      noButton.fillStyle(0xc0392b, 1);
      noButton.fillRoundedRect(width / 2 - 140, height / 2 - 60, 100, 40, 8);
    });

    noHitArea.on("pointerout", () => {
      noButton.clear();
      noButton.fillStyle(0xe74c3c, 1);
      noButton.fillRoundedRect(width / 2 - 140, height / 2 - 60, 100, 40, 8);
    });

    noHitArea.on("pointerdown", () => {
      this.closeDialog(container);
      if (onCancel) onCancel();
    });

    container.add(noHitArea);

    // If modal, show the modal background
    if (config.modal) {
      this.modalBackground.setVisible(true);
      this.modalBackground.setDepth(config.depth - 1);
    }

    // Apply entry animation if enabled
    if (config.animateIn) {
      container.setScale(0);
      this.scene.tweens.add({
        targets: container,
        scale: 1,
        duration: config.animationDuration,
        ease: "Back.easeOut",
      });
    }

    // Store reference to active dialog
    this.activeDialog = container;

    return container;
  }

  /**
   * Close all active dialogs and options menus
   */
  closeAll() {
    if (this.activeDialog) {
      this.closeDialog(this.activeDialog);
    }

    if (this.activeOptions) {
      this.closeOptions();
    }

    // Hide modal background
    this.modalBackground.setVisible(false);
  }

  /**
   * Clean up resources when the scene is shut down
   */
  destroy() {
    this.closeAll();
    this.modalBackground.destroy();
  }

  /**
   * Create and show a recipe checklist
   * @param {Object} recipe - The recipe object containing steps
   * @param {Object} config - Configuration options
   * @returns {Object} - References to checklist elements
   */
  createRecipeChecklist(recipe, config = {}) {
    // Default configuration
    const defaultConfig = {
      x: 885,
      y: 170,
      width: 350,
      height: 600,
      backgroundColor: 0xc19a6b,
      borderColor: 0x8b4513,
      iconKey: 'woodenSpoon',
      iconScale: 0.2,
      iconRotation: -0.5,
      ...config
    };

    // Create a more aesthetically pleasing background panel with wood texture
    const checklistPanel = this.scene.add.graphics();
    checklistPanel.fillStyle(defaultConfig.backgroundColor, 0.95);
    checklistPanel.fillRoundedRect(
      defaultConfig.x,
      defaultConfig.y,
      defaultConfig.width,
      defaultConfig.height,
      16
    );
    checklistPanel.lineStyle(4, defaultConfig.borderColor, 1);
    checklistPanel.strokeRoundedRect(
      defaultConfig.x,
      defaultConfig.y,
      defaultConfig.width,
      defaultConfig.height,
      16
    );

    // Add wood grain effect (decorative lines)
    checklistPanel.lineStyle(1, defaultConfig.borderColor, 0.3);
    for (let i = 0; i < 20; i++) {
      checklistPanel.lineBetween(
        defaultConfig.x,
        defaultConfig.y + 20 + i * 30,
        defaultConfig.x + defaultConfig.width,
        defaultConfig.y + 20 + i * 30
      );
    }

    checklistPanel.setDepth(this.config.depth).setVisible(false);

    // Add recipe title with improved styling
    const recipeTitle = this.scene.add
      .text(defaultConfig.x + defaultConfig.width / 2, defaultConfig.y + 35, recipe.name, {
        font: "bold 32px Arial",
        fill: "#4b2504",
        align: "center",
        stroke: "#ffecd0",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(this.config.depth)
      .setVisible(false);

    // Add decorative spoon icon if specified
    let titleIcon = null;
    if (defaultConfig.iconKey && this.scene.textures.exists(defaultConfig.iconKey)) {
      titleIcon = this.scene.add
        .image(defaultConfig.x + 25, defaultConfig.y + 35, defaultConfig.iconKey)
        .setOrigin(0.5)
        .setScale(defaultConfig.iconScale)
        .setRotation(defaultConfig.iconRotation)
        .setDepth(this.config.depth)
        .setVisible(false);
    }

    // Create checklist items
    const checklist = recipe.steps.map((step, index) => {
      const y = defaultConfig.y + 80 + index * 38;

      // Checkbox with improved styling
      const checkbox = this.scene.add.graphics();
      checkbox.lineStyle(2, 0x4b2504, 1);
      checkbox.strokeRect(defaultConfig.x + 20 - 10, y - 10, 20, 20);
      checkbox.setDepth(this.config.depth).setVisible(false);

      // Step text
      const text = this.scene.add
        .text(defaultConfig.x + 40, y, `${index + 1}. ${step.description}`, {
          font: "16px Arial",
          fill: "#000000",
          align: "left",
          wordWrap: { width: defaultConfig.width - 60 },
        })
        .setOrigin(0, 0.5)
        .setDepth(this.config.depth)
        .setVisible(false);

      return { text, checkbox, completed: false };
    });

    // Return references to all elements
    return {
      panel: checklistPanel,
      title: recipeTitle,
      icon: titleIcon,
      items: checklist
    };
  }

  /**
   * Toggle recipe checklist visibility
   * @param {Object} elements - References to checklist elements
   * @param {boolean} visible - Whether to show or hide the checklist
   */
  toggleRecipeChecklist(elements, visible) {
    if (!elements) return;

    elements.panel?.setVisible(visible);
    elements.title?.setVisible(visible);
    elements.icon?.setVisible(visible);
    elements.items?.forEach(item => {
      item.text?.setVisible(visible);
      item.checkbox?.setVisible(visible);
    });
  }

  /**
   * Update recipe checklist step completion
   * @param {Object} elements - References to checklist elements
   * @param {number} stepIndex - Index of the completed step
   */
  updateRecipeChecklistStep(elements, stepIndex) {
    if (!elements?.items?.[stepIndex]) return;

    const item = elements.items[stepIndex];
    item.completed = true;

    // Update checkbox visualization
    if (item.checkbox) {
      item.checkbox.clear();
      item.checkbox.lineStyle(2, 0x4b2504, 1);
      item.checkbox.strokeRect(-10, -10, 20, 20);
      item.checkbox.fillStyle(0x4b2504, 1);
      item.checkbox.fillRect(-8, -8, 16, 16);
    }

    // Update text color
    if (item.text) {
      item.text.setColor("#008000");
    }
  }
}
