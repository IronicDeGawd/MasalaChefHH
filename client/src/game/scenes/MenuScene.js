import Phaser from "phaser";
import CursorManager from "../ui/components/CursorManager";
import UIHelper from "../ui/UIHelper";

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.selectedEnvironment = "kitchen";
    this.selectedRecipe = "alooBhujia";
    this.cursorManager = null; // Replace handCursor with cursorManager
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create a tiled background pattern using UIHelper
    UIHelper.createTiledBackground(this, width, height);

    // Add wooden counter as a decorative element using UIHelper
    UIHelper.createWoodenCounter(this, width, height);

    // Add decorative spice circles
    UIHelper.createDecorativeElements(this, width, height);

    // Title with stylized text and outline
    UIHelper.addStylizedTitle(this, width / 2, 120, "MasalaChef");

    // Environment selection with styled header
    UIHelper.addSectionHeader(
      this,
      width / 2,
      240,
      "Select Kitchen Environment"
    );

    // Environment options
    this.createEnvironmentOptions(width, 320);

    // Recipe selection with styled header
    UIHelper.addSectionHeader(this, width / 2, 480, "Select Recipe");

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
    this.cursorManager = new CursorManager(this, {
      cursorKey: "handCursor",
      scale: 0.5,
      originX: 0.1,
      originY: 0.1,
      depth: 9999,
    });
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

      // Create button using UIHelper
      const button = UIHelper.createStyledButton(
        this,
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
        UIHelper.createSelectionHighlight(this, env.x, yPosition, 280, 70);
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

      // Create button using UIHelper
      const button = UIHelper.createStyledButton(
        this,
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
        UIHelper.createSelectionHighlight(this, recipe.x, yPosition, 280, 70);
      }
    });
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
    UIHelper.createSelectionHighlight(this, selectedItem.x, yPosition, 280, 70);
  }

  shutdown() {
    // Clean up the cursor manager when leaving the scene
    if (this.cursorManager) {
      this.cursorManager.destroy();
      this.cursorManager = null;
    }
  }
}

export default MenuScene;
