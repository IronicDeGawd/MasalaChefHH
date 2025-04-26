import Phaser from "phaser";
import recipes from "../data/recipes";
import CursorManager from "../ui/components/CursorManager";
import UIHelper from "../ui/UIHelper";

class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
    this.cursorManager = null;
    this.isSaving = false;
    this.saveCompleted = false;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Get game data from registry
    const gameData = this.registry.get("gameData");
    const recipe = recipes[gameData.selectedRecipe];

    // Create tiled background pattern using UIHelper
    UIHelper.createTiledBackground(this, width, height);

    // Add wooden counter as a decorative element using UIHelper
    UIHelper.createWoodenCounter(this, width, height);

    // Add decorative spice bowls
    UIHelper.createDecorativeElements(this, width, height);

    // Add title with stylized text and outline
    UIHelper.addStylizedTitle(this, width / 2, 120, "Recipe Results", 60);

    // Add dish name as section header
    UIHelper.addSectionHeader(this, width / 2, 200, recipe.name, 36);

    // Add completion time - Fix time calculation
    let timeString = "0:00";
    let timeTakenInSeconds = 0;

    if (gameData.startTime && gameData.endTime) {
      const timeTaken = gameData.endTime - gameData.startTime;
      const minutes = Math.floor(timeTaken / 60000);
      const seconds = Math.floor((timeTaken % 60000) / 1000);
      timeString = `${minutes}m ${seconds}s`;
      timeTakenInSeconds = minutes * 60 + seconds;

      // Store the time taken in the gameData
      gameData.timeTaken = timeTakenInSeconds;
    } else if (gameData.cookingTime) {
      timeString = gameData.cookingTime;
    }

    this.add
      .text(width / 2, 260, `Time Taken: ${timeString}`, {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#5c2e0d",
      })
      .setOrigin(0.5)
      .setShadow(1, 1, "#00000044", 1);

    // Calculate and add score based on completion time and steps
    const maxScore = 100;
    const targetTime = recipe.targetTime || 300; // Default 5 minutes
    const timeScore = Math.max(
      0,
      50 - (Math.abs(timeTakenInSeconds - targetTime) / targetTime) * 25
    );

    // Calculate step score based on completed vs required steps
    const completedSteps = new Set(gameData.completedStepIds || []);
    const requiredSteps = recipe.steps
      .filter((step) => step.required)
      .map((step) => step.id);
    const stepScore =
      requiredSteps.length > 0
        ? (requiredSteps.filter((id) => completedSteps.has(id)).length /
            requiredSteps.length) *
          50
        : 50;

    // Combined score
    const score = Math.round(timeScore + stepScore);
    gameData.score = score;

    // Convert score to stars (max 5)
    const stars = Math.round((score / maxScore) * 5);
    let starDisplay = "★".repeat(stars) + "☆".repeat(5 - stars);

    // Gold color for stars to match title style
    this.add
      .text(width / 2, 320, `Cooking Score: ${starDisplay} (${score}/100)`, {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#c27c0e",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#00000044", 1);

    // Add feedback header
    UIHelper.addSectionHeader(this, width / 2, 380, "Feedback");

    // Create feedback panel using UIHelper
    UIHelper.createPanel(this, width / 2, 445, 700, 180);

    // Generate feedback text
    const feedbackText = `Your ${recipe.name} was cooked perfectly! The potatoes were diced nicely and cooked to perfection. The spice balance was good, though a bit more turmeric would enhance the flavor. Overall, a very good attempt at this classic dish!`;
    gameData.feedback = feedbackText;

    // Adjust feedback text to be properly contained within the panel
    this.add
      .text(width / 2, 445, feedbackText, {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#5c2e0d",
        align: "center",
        wordWrap: { width: 650 },
      })
      .setOrigin(0.5, 0.5); // Center both horizontally and vertically

    // Add buttons - Move buttons up from bottom of screen
    const buttonY = height - 180; // Position higher (was height - 140)
    const buttonWidth = 220;
    const buttonHeight = 70;

    // Replay button using UIHelper
    const replayButton = UIHelper.createStyledButton(
      this,
      width / 3,
      buttonY,
      buttonWidth,
      buttonHeight,
      0xd35400, // Orange
      0xc0392b // Dark red border
    );

    replayButton.setInteractive().on("pointerdown", () => {
      // Reset game data
      this.registry.get("gameData").steps = [];
      this.registry.get("gameData").ingredients = {};
      this.registry.get("gameData").completedStepIds = [];
      this.registry.get("gameData").startTime = null;
      this.registry.get("gameData").endTime = null;

      // Restart game scene
      this.scene.start("GameScene");
    });

    // Add text for replay button
    this.add
      .text(width / 3, buttonY, "Try Again", {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#00000066", 2);

    // Menu button using UIHelper
    const menuButton = UIHelper.createStyledButton(
      this,
      (2 * width) / 3,
      buttonY,
      buttonWidth,
      buttonHeight,
      0xd35400, // Orange
      0xc0392b // Dark red border
    );

    menuButton.setInteractive().on("pointerdown", () => {
      // Go back to menu
      this.scene.start("MenuScene");
    });

    // Add text for menu button
    this.add
      .text((2 * width) / 3, buttonY, "Main Menu", {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#00000066", 2);

    // Add hover effects
    replayButton.on("pointerover", () => {
      replayButton.graphics.clear();
      replayButton.graphics.fillStyle(0x000000, 0.3);
      replayButton.graphics.fillRoundedRect(
        replayButton.x - replayButton.width / 2 + 4,
        replayButton.y - replayButton.height / 2 + 4,
        replayButton.width,
        replayButton.height,
        16
      );
      replayButton.graphics.fillStyle(0xe74c3c, 1);
      replayButton.graphics.fillRoundedRect(
        replayButton.x - replayButton.width / 2,
        replayButton.y - replayButton.height / 2,
        replayButton.width,
        replayButton.height,
        16
      );
      replayButton.graphics.lineStyle(3, 0xc0392b, 1);
      replayButton.graphics.strokeRoundedRect(
        replayButton.x - replayButton.width / 2,
        replayButton.y - replayButton.height / 2,
        replayButton.width,
        replayButton.height,
        16
      );
    });

    replayButton.on("pointerout", () => {
      replayButton.graphics.clear();
      replayButton.graphics.fillStyle(0x000000, 0.3);
      replayButton.graphics.fillRoundedRect(
        replayButton.x - replayButton.width / 2 + 4,
        replayButton.y - replayButton.height / 2 + 4,
        replayButton.width,
        replayButton.height,
        16
      );
      replayButton.graphics.fillStyle(0xd35400, 1);
      replayButton.graphics.fillRoundedRect(
        replayButton.x - replayButton.width / 2,
        replayButton.y - replayButton.height / 2,
        replayButton.width,
        replayButton.height,
        16
      );
      replayButton.graphics.lineStyle(3, 0xc0392b, 1);
      replayButton.graphics.strokeRoundedRect(
        replayButton.x - replayButton.width / 2,
        replayButton.y - replayButton.height / 2,
        replayButton.width,
        replayButton.height,
        16
      );
    });

    menuButton.on("pointerover", () => {
      menuButton.graphics.clear();
      menuButton.graphics.fillStyle(0x000000, 0.3);
      menuButton.graphics.fillRoundedRect(
        menuButton.x - menuButton.width / 2 + 4,
        menuButton.y - menuButton.height / 2 + 4,
        menuButton.width,
        menuButton.height,
        16
      );
      menuButton.graphics.fillStyle(0xe74c3c, 1);
      menuButton.graphics.fillRoundedRect(
        menuButton.x - menuButton.width / 2,
        menuButton.y - menuButton.height / 2,
        menuButton.width,
        menuButton.height,
        16
      );
      menuButton.graphics.lineStyle(3, 0xc0392b, 1);
      menuButton.graphics.strokeRoundedRect(
        menuButton.x - menuButton.width / 2,
        menuButton.y - menuButton.height / 2,
        menuButton.width,
        menuButton.height,
        16
      );
    });

    menuButton.on("pointerout", () => {
      menuButton.graphics.clear();
      menuButton.graphics.fillStyle(0x000000, 0.3);
      menuButton.graphics.fillRoundedRect(
        menuButton.x - menuButton.width / 2 + 4,
        menuButton.y - menuButton.height / 2 + 4,
        menuButton.width,
        menuButton.height,
        16
      );
      menuButton.graphics.fillStyle(0xd35400, 1);
      menuButton.graphics.fillRoundedRect(
        menuButton.x - menuButton.width / 2,
        menuButton.y - menuButton.height / 2,
        menuButton.width,
        menuButton.height,
        16
      );
      menuButton.graphics.lineStyle(3, 0xc0392b, 1);
      menuButton.graphics.strokeRoundedRect(
        menuButton.x - menuButton.width / 2,
        menuButton.y - menuButton.height / 2,
        menuButton.width,
        menuButton.height,
        16
      );
    });

    // Initialize cursor manager
    this.cursorManager = new CursorManager(this, {
      cursorKey: "handCursor",
      scale: 0.5,
      originX: 0.1,
      originY: 0.1,
      depth: 9999,
    });

    // Add interactive objects to cursor manager
    this.cursorManager.addInteractive(replayButton.graphics);
    this.cursorManager.addInteractive(menuButton.graphics);

    // Automatically save game data
    this.saveGameDataAutomatic(gameData);
  }

  saveGameDataAutomatic(gameData) {
    // Set flag to indicate saving has started
    this.isSaving = true;

    // Create saving panel
    const savingPanel = UIHelper.createPanel(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height - 80,
      400,
      50,
      0xffffff,
      0x4caf50,
      3,
      10
    );

    // Create saving text
    this.savingText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 80,
        "Saving your achievement to blockchain...",
        {
          fontFamily: "Arial",
          fontSize: "20px",
          fontStyle: "bold",
          color: "#4CAF50",
          padding: { x: 10, y: 5 },
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    // Add a simple animation to indicate loading
    this.tweens.add({
      targets: this.savingText,
      alpha: { from: 1, to: 0.5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Prepare final game data
    const finalGameData = {
      selectedRecipe: gameData.selectedRecipe,
      score: gameData.score || 0,
      timeTaken: gameData.timeTaken || 0,
      stepsCompleted: (gameData.completedStepIds || []).length,
      totalSteps: recipes[gameData.selectedRecipe].steps.length,
      feedback: gameData.feedback || "",
      timestamp: new Date().toISOString(),
    };

    console.log("Automatically saving game data:", finalGameData);

    // Emit the gameCompleted event for the React component to handle
    this.events.emit("gameCompleted", finalGameData);

    // Also emit it to the global game events
    this.game.events.emit("gameCompleted", finalGameData);

    // Simulate blockchain save delay (since blockchain operations are asynchronous)
    this.time.delayedCall(2000, () => {
      // Update the status text after saving completes
      if (this.savingText) {
        this.savingText.setText("Achievement saved successfully!");
        this.tweens.killTweensOf(this.savingText);
        this.saveCompleted = true;
      }
    });
  }

  shutdown() {
    // Clean up the cursor manager when leaving the scene
    if (this.cursorManager) {
      // Make sure default cursor is restored
      this.cursorManager.showDefaultCursor();
      this.cursorManager.destroy();
      this.cursorManager = null;
    }

    // Ensure the cursor is visible at the system level
    document.body.style.cursor = "default";
    if (this.game && this.game.canvas) {
      this.game.canvas.style.cursor = "default";
    }
  }
}

export default ResultScene;
