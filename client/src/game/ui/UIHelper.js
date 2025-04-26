/**
 * UIHelper.js
 * Utility class for common UI components and styling across game scenes
 */
import Phaser from "phaser";

class UIHelper {
  /**
   * Create a tiled background
   * @param {Phaser.Scene} scene - The scene to add the background to
   * @param {number} width - The width of the background
   * @param {number} height - The height of the background
   * @returns {Phaser.GameObjects.Graphics} - The created graphics object
   */
  static createTiledBackground(scene, width, height) {
    // Create a tiled background that looks like kitchen tiles
    const tileSize = 50;
    const graphics = scene.add.graphics();

    // Light beige background
    graphics.fillStyle(0xf5e8d0, 1);
    graphics.fillRect(0, 0, width, height);

    // Draw tile grid lines
    graphics.lineStyle(1, 0xe0d0b7, 0.5);

    // Draw horizontal lines
    for (let y = 0; y <= height; y += tileSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
    }

    // Draw vertical lines
    for (let x = 0; x <= width; x += tileSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
    }

    graphics.strokePath();
    return graphics;
  }

  /**
   * Create a wooden counter decoration at the bottom of the screen
   * @param {Phaser.Scene} scene - The scene to add the counter to
   * @param {number} width - The width of the counter
   * @param {number} height - The height of the scene
   * @returns {Phaser.GameObjects.Graphics} - The created graphics object
   */
  static createWoodenCounter(scene, width, height) {
    // Create wooden counter at the bottom
    const graphics = scene.add.graphics();

    // Main counter - dark wood
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, height - 120, width, 120);

    // Wood grain effect - lighter streaks
    graphics.fillStyle(0xa0522d, 0.3);

    for (let i = 0; i < 20; i++) {
      const y = height - 120 + Math.random() * 120;
      const h = 2 + Math.random() * 5;
      graphics.fillRect(0, y, width, h);
    }

    // Counter top edge highlight
    graphics.fillStyle(0x6b3100, 1);
    graphics.fillRect(0, height - 120, width, 5);

    return graphics;
  }

  /**
   * Create a styled button with shadow and hover effects
   * @param {Phaser.Scene} scene - The scene to add the button to
   * @param {number} x - X position of the button (center)
   * @param {number} y - Y position of the button (center)
   * @param {number} width - Width of the button
   * @param {number} height - Height of the button
   * @param {number} fillColor - Fill color of the button
   * @param {number} strokeColor - Stroke color of the button
   * @returns {Object} - Button object with graphics property
   */
  static createStyledButton(
    scene,
    x,
    y,
    width,
    height,
    fillColor,
    strokeColor
  ) {
    const graphics = scene.add.graphics();

    // Button shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRoundedRect(
      x - width / 2 + 4,
      y - height / 2 + 4,
      width,
      height,
      16
    );

    // Button fill
    graphics.fillStyle(fillColor, 1);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 16);

    // Button stroke
    graphics.lineStyle(3, strokeColor, 1);
    graphics.strokeRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      16
    );

    // Create a button object that has the graphics property
    const buttonObj = {
      x,
      y,
      width,
      height,
      fillColor,
      graphics: graphics, // Store reference to the graphics object
      setInteractive: function () {
        const hitArea = new Phaser.Geom.Rectangle(
          -width / 2,
          -height / 2,
          width,
          height
        );
        const hitAreaCallback = Phaser.Geom.Rectangle.Contains;

        // Directly set the graphics object as interactive without trying to set input.enabled
        this.graphics.setInteractive(hitArea, hitAreaCallback);
        return this.graphics;
      },
      on: function (event, callback) {
        this.graphics.on(event, callback);
        return this;
      },
    };

    return buttonObj;
  }

  /**
   * Creates a decorative spice bowl
   * @param {Phaser.Scene} scene - The scene to add the spice bowl to
   * @param {number} x - X position of the spice bowl
   * @param {number} y - Y position of the spice bowl
   * @param {number} color1 - First color of spice
   * @param {number} color2 - Second color of spice
   * @returns {Phaser.GameObjects.Graphics} - The created graphics object
   */
  static createSpiceBowl(scene, x, y, color1, color2) {
    const graphics = scene.add.graphics();

    // Bowl base
    graphics.fillStyle(0x6b3100, 1);
    graphics.fillEllipse(x, y + 10, 60, 20);

    // Bowl rim
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillEllipse(x, y, 70, 25);

    // Bowl inside
    graphics.fillStyle(0xa0522d, 1);
    graphics.fillEllipse(x, y, 60, 20);

    // Spice content - split in two colors
    graphics.fillStyle(color1, 1);
    graphics.fillEllipse(x - 15, y, 25, 15);

    graphics.fillStyle(color2, 1);
    graphics.fillEllipse(x + 15, y, 25, 15);

    return graphics;
  }

  /**
   * Creates decorative elements (spice bowls) for scene decoration
   * @param {Phaser.Scene} scene - The scene to add the decorations to
   * @param {number} width - The width of the scene
   * @param {number} height - The height of the scene
   */
  static createDecorativeElements(scene, width, height) {
    // Create decorative spice circles
    const colors = [0xe74c3c, 0xf39c12, 0xd35400, 0x27ae60];

    // Left side spice bowl
    UIHelper.createSpiceBowl(
      scene,
      width * 0.15,
      height - 70,
      colors[0],
      colors[1]
    );

    // Right side spice bowl
    UIHelper.createSpiceBowl(
      scene,
      width * 0.85,
      height - 70,
      colors[2],
      colors[3]
    );
  }

  /**
   * Add a stylized title with shadow and stroke
   * @param {Phaser.Scene} scene - The scene to add the title to
   * @param {number} x - X position of the title
   * @param {number} y - Y position of the title
   * @param {string} text - The title text
   * @param {number} fontSize - Font size in pixels
   * @returns {Phaser.GameObjects.Text} - The created text object
   */
  static addStylizedTitle(scene, x, y, text, fontSize = 70) {
    return scene.add
      .text(x, y, text, {
        fontFamily: "Arial",
        fontSize: `${fontSize}px`,
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setStroke("#8B4513", fontSize > 50 ? 8 : 5)
      .setShadow(4, 4, "#5c2e0d", 2);
  }

  /**
   * Add a section header with shadow
   * @param {Phaser.Scene} scene - The scene to add the header to
   * @param {number} x - X position of the header
   * @param {number} y - Y position of the header
   * @param {string} text - The header text
   * @param {number} fontSize - Font size in pixels
   * @returns {Phaser.GameObjects.Text} - The created text object
   */
  static addSectionHeader(scene, x, y, text, fontSize = 32) {
    return scene.add
      .text(x, y, text, {
        fontFamily: "Arial",
        fontSize: `${fontSize}px`,
        color: "#5c2e0d",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#00000033", 1);
  }

  /**
   * Creates a selection highlight effect around a button or UI element
   * @param {Phaser.Scene} scene - The scene to add the highlight to
   * @param {number} x - X position of the highlight (center)
   * @param {number} y - Y position of the highlight (center)
   * @param {number} width - Width of the highlight
   * @param {number} height - Height of the highlight
   * @returns {Phaser.GameObjects.Graphics} - The created graphics object
   */
  static createSelectionHighlight(scene, x, y, width, height) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(4, 0xffd700, 1);
    graphics.strokeRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      16
    );

    // Add a glow effect
    graphics.lineStyle(8, 0xffd700, 0.3);
    graphics.strokeRoundedRect(
      x - width / 2 - 2,
      y - height / 2 - 2,
      width + 4,
      height + 4,
      18
    );

    // Store a reference to identify this as a highlight
    graphics.isHighlight = true;
    graphics.highlightY = y;

    return graphics;
  }

  /**
   * Create a panel with a styled background and optional border
   * @param {Phaser.Scene} scene - The scene to add the panel to
   * @param {number} x - X position of the panel center
   * @param {number} y - Y position of the panel center
   * @param {number} width - Width of the panel
   * @param {number} height - Height of the panel
   * @param {number} fillColor - Fill color of the panel
   * @param {number} strokeColor - Stroke color of the panel border
   * @param {number} strokeWidth - Width of the border
   * @param {number} cornerRadius - Radius for rounded corners
   * @returns {Phaser.GameObjects.Graphics} - The created graphics object
   */
  static createPanel(
    scene,
    x,
    y,
    width,
    height,
    fillColor = 0xffffff,
    strokeColor = 0x8b4513,
    strokeWidth = 3,
    cornerRadius = 16
  ) {
    const graphics = scene.add.graphics();

    // Panel fill
    graphics.fillStyle(fillColor, 1);
    graphics.fillRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      cornerRadius
    );

    // Panel border
    if (strokeWidth > 0) {
      graphics.lineStyle(strokeWidth, strokeColor, 1);
      graphics.strokeRoundedRect(
        x - width / 2,
        y - height / 2,
        width,
        height,
        cornerRadius
      );
    }

    return graphics;
  }
}

export default UIHelper;
