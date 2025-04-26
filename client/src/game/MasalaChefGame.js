import Phaser from "phaser";

// Game scenes
import BootScene from "./scenes/BootScene";
import MenuScene from "./scenes/MenuScene";
import GameScene from "./scenes/GameScene";
import ResultScene from "./scenes/ResultScene";

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 960,
  parent: "game-container",
  backgroundColor: "#f8f8f8",
  scene: [BootScene, MenuScene, GameScene, ResultScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 960,
  },
  audio: {
    noAudio: true,
  },
};

class MasalaChefGame {
  constructor() {
    this.game = null;
    this.gameData = {
      selectedEnvironment: "kitchen",
      selectedRecipe: "alooBhujia",
      steps: [],
      timeTaken: 0,
      ingredients: {},
      score: 0,
      completed: false,
    };
  }

  init(parent) {
    // Create the game with the parent container
    config.parent = parent;
    this.game = new Phaser.Game(config);

    // Make gameData accessible to all scenes
    this.game.registry.set("gameData", this.gameData);

    // Set up game completion listener for ResultScene
    this.setupEventListeners();

    return this.game;
  }

  // Method to add a step to the cooking log
  addStep(step) {
    this.gameData.steps.push({
      ...step,
      timestamp: Date.now(),
    });
  }

  // Reset game data for a new game
  resetGameData() {
    this.gameData = {
      selectedEnvironment: "kitchen",
      selectedRecipe: "alooBhujia",
      steps: [],
      timeTaken: 0,
      ingredients: {},
      score: 0,
      completed: false,
    };
    this.game.registry.set("gameData", this.gameData);
  }

  // Get the current game data
  getGameData() {
    return this.gameData;
  }

  // Setup listeners for game events
  setupEventListeners() {
    // Wait for the game to be created
    if (this.game) {
      // Listen for scene creation
      this.game.scene.scenes.forEach((scene) => {
        // If this is the ResultScene, add a listener for game completion
        if (scene.scene.key === "ResultScene") {
          const originalInit = scene.init;

          // Override the init method to add our listener
          scene.init = function (data) {
            // Call the original init method
            originalInit.call(this, data);

            // Add listener for the "finish" button
            this.events.once("gameCompleted", (gameData) => {
              // Pass game data to the game instance
              this.game.gameData = gameData;

              // Emit event for React to listen to
              this.game.events.emit("gameCompleted", gameData);
            });
          };
        }
      });
    }
  }

  // Method for ResultScene to call when game is complete
  completeGame(gameData) {
    // Update the gameData with final values
    this.gameData = {
      ...this.gameData,
      ...gameData,
      completed: true,
    };

    // Emit event for React components
    if (this.game && this.game.events) {
      this.game.events.emit("gameCompleted", this.gameData);
    }
  }
}

export default MasalaChefGame;
