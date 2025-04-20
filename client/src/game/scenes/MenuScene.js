import Phaser from "phaser";

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.selectedEnvironment = "kitchen";
    this.selectedRecipe = "alooBhujia";
    this.handCursor = null; // Add reference for hand cursor
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create a tiled background pattern using graphics
    this.createTiledBackground(width, height);

    // Add wooden counter as a decorative element using graphics
    this.createWoodenCounter(width, height);

    // Add decorative spice circles
    this.createDecorativeElements(width, height);

    // Title with stylized text and outline
    this.add
      .text(width / 2, 120, "MasalaChef", {
        fontFamily: "Arial",
        fontSize: "70px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setStroke("#8B4513", 8)
      .setShadow(4, 4, "#5c2e0d", 2);

    // Environment selection with styled header
    this.add
      .text(width / 2, 240, "Select Kitchen Environment", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#5c2e0d",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#00000033", 1);

    // Environment options
    this.createEnvironmentOptions(width, 320);

    // Recipe selection with styled header
    this.add
      .text(width / 2, 480, "Select Recipe", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#5c2e0d",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#00000033", 1);

    // Recipe options
    this.createRecipeOptions(width, 560);

    // Create a container for the start button to handle interactions better
    const startButtonContainer = this.add.container(width / 2, height - 240);

    // Create the start button
    const graphics = this.add.graphics();

    // Button shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRoundedRect(-150 + 4, -40 + 4, 300, 80, 16);

    // Button fill
    graphics.fillStyle(0xd35400, 1);
    graphics.fillRoundedRect(-150, -40, 300, 80, 16);

    // Button stroke
    graphics.lineStyle(3, 0xc0392b, 1);
    graphics.strokeRoundedRect(-150, -40, 300, 80, 16);

    // Add graphics to the container
    startButtonContainer.add(graphics);

    // Start button text
    const startText = this.add
      .text(0, 0, "Start Cooking!", {
        fontFamily: "Arial",
        fontSize: "38px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#00000066", 3);

    // Add text to the container
    startButtonContainer.add(startText);

    // Make the container interactive
    startButtonContainer.setSize(300, 80);
    startButtonContainer.setInteractive({ useHandCursor: true });

    // Add event handlers to the container
    startButtonContainer.on("pointerdown", () => {
      console.log("Start button clicked!");
      // Store selections in registry for access in game scene
      this.registry.get("gameData").selectedEnvironment =
        this.selectedEnvironment;
      this.registry.get("gameData").selectedRecipe = this.selectedRecipe;

      // Start the game scene
      this.scene.start("GameScene");
    });

    startButtonContainer.on("pointerover", () => {
      graphics.clear();
      // Button shadow
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillRoundedRect(-150 + 4, -40 + 4, 300, 80, 16);
      // Button fill - brighter color on hover
      graphics.fillStyle(0xe74c3c, 1);
      graphics.fillRoundedRect(-150, -40, 300, 80, 16);
      // Button stroke
      graphics.lineStyle(3, 0xc0392b, 1);
      graphics.strokeRoundedRect(-150, -40, 300, 80, 16);

      startText.setScale(1.05);
    });

    startButtonContainer.on("pointerout", () => {
      graphics.clear();
      // Button shadow
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillRoundedRect(-150 + 4, -40 + 4, 300, 80, 16);
      // Button fill - normal color
      graphics.fillStyle(0xd35400, 1);
      graphics.fillRoundedRect(-150, -40, 300, 80, 16);
      // Button stroke
      graphics.lineStyle(3, 0xc0392b, 1);
      graphics.strokeRoundedRect(-150, -40, 300, 80, 16);

      startText.setScale(1);
    });

    // Set up custom cursor
    this.setHandCursor();
  }

  createTiledBackground(width, height) {
    // Create a tiled background that looks like kitchen tiles
    const tileSize = 50;
    const graphics = this.add.graphics();

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
  }

  createWoodenCounter(width, height) {
    // Create wooden counter at the bottom
    const graphics = this.add.graphics();

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
  }

  createDecorativeElements(width, height) {
    // Create decorative spice circles
    const colors = [0xe74c3c, 0xf39c12, 0xd35400, 0x27ae60];

    // Left side spice bowl
    this.createSpiceBowl(width * 0.15, height - 70, colors[0], colors[1]);

    // Right side spice bowl
    this.createSpiceBowl(width * 0.85, height - 70, colors[2], colors[3]);
  }

  createSpiceBowl(x, y, color1, color2) {
    const graphics = this.add.graphics();

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
  }

  createStyledButton(x, y, width, height, fillColor, strokeColor) {
    const graphics = this.add.graphics();

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

  createEnvironmentOptions(width, yPosition) {
    const environments = [
      { id: "kitchen", name: "Home Kitchen", x: width / 4 },
      { id: "dhaba", name: "Dhaba (Coming Soon)", x: width / 2 },
      {
        id: "restaurant",
        name: "Restaurant (Coming Soon)",
        x: (3 * width) / 4,
      },
    ];

    environments.forEach((env) => {
      const isLocked = env.id !== "kitchen";
      const buttonColor = isLocked ? 0x95a5a6 : 0xf39c12;
      const strokeColor = isLocked ? 0x7f8c8d : 0xe67e22;

      // Create button
      const button = this.createStyledButton(
        env.x,
        yPosition,
        260,
        60,
        buttonColor,
        strokeColor
      );

      if (!isLocked) {
        button.setInteractive().on("pointerdown", () => {
          this.selectedEnvironment = env.id;
          this.highlightSelected(environments, env.id, yPosition);
        });

        // Add hover effect for enabled buttons
        button.on("pointerover", () => {
          button.fillColor = 0xf1c40f;
        });

        button.on("pointerout", () => {
          button.fillColor = 0xf39c12;
        });
      }

      // Button text
      this.add
        .text(env.x, yPosition, env.name, {
          fontFamily: "Arial",
          fontSize: "22px",
          color: isLocked ? "#777777" : "#FFFFFF",
          fontStyle: isLocked ? "italic" : "bold",
        })
        .setOrigin(0.5)
        .setShadow(1, 1, "#00000044", 1);

      // Highlight initial selection
      if (env.id === this.selectedEnvironment) {
        this.createSelectionHighlight(env.x, yPosition, 280, 70);
      }
    });
  }

  createRecipeOptions(width, yPosition) {
    const recipes = [
      { id: "alooBhujia", name: "Aloo Bhujia", x: width / 3 },
      {
        id: "palakPaneer",
        name: "Palak Paneer (Coming Soon)",
        x: (2 * width) / 3,
      },
    ];

    recipes.forEach((recipe) => {
      const isLocked = recipe.id !== "alooBhujia";
      const buttonColor = isLocked ? 0x95a5a6 : 0xf39c12;
      const strokeColor = isLocked ? 0x7f8c8d : 0xe67e22;

      // Create button
      const button = this.createStyledButton(
        recipe.x,
        yPosition,
        260,
        60,
        buttonColor,
        strokeColor
      );

      if (!isLocked) {
        button.setInteractive().on("pointerdown", () => {
          this.selectedRecipe = recipe.id;
          this.highlightSelected(recipes, recipe.id, yPosition);
        });

        // Add hover effect for enabled buttons
        button.on("pointerover", () => {
          button.fillColor = 0xf1c40f;
        });

        button.on("pointerout", () => {
          button.fillColor = 0xf39c12;
        });
      }

      // Button text
      this.add
        .text(recipe.x, yPosition, recipe.name, {
          fontFamily: "Arial",
          fontSize: "22px",
          color: isLocked ? "#777777" : "#FFFFFF",
          fontStyle: isLocked ? "italic" : "bold",
        })
        .setOrigin(0.5)
        .setShadow(1, 1, "#00000044", 1);

      // Highlight initial selection
      if (recipe.id === this.selectedRecipe) {
        this.createSelectionHighlight(recipe.x, yPosition, 280, 70);
      }
    });
  }

  createSelectionHighlight(x, y, width, height) {
    const graphics = this.add.graphics();
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

  highlightSelected(items, selectedId, yPosition) {
    // Clear existing highlights
    this.children.list
      .filter(
        (child) =>
          child.type === "Graphics" &&
          child.isHighlight &&
          child.highlightY === yPosition
      )
      .forEach((highlight) => highlight.destroy());

    // Add new highlight
    const selectedItem = items.find((item) => item.id === selectedId);
    this.createSelectionHighlight(selectedItem.x, yPosition, 280, 70);
  }

  // Add custom hand cursor function (same as in GameScene)
  setHandCursor() {
    // Hide the default cursor
    this.input.setDefaultCursor("none");

    // Create custom hand cursor with increased size
    // Set origin to the tip of the finger (approximately 0.1, 0.1)
    // instead of center (0.5, 0.5) or top-left (0, 0)
    this.handCursor = this.add
      .image(0, 0, "handCursor")
      .setScale(0.5)
      .setOrigin(0.1, 0.1) // Set origin to finger tip
      .setDepth(10);

    // Update hand cursor position
    this.input.on("pointermove", (pointer) => {
      this.handCursor.setPosition(pointer.x, pointer.y);
    });
  }
}

export default MenuScene;
