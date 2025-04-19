import Phaser from 'phaser';

// Game scenes
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import ResultScene from './scenes/ResultScene';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 960,
  parent: 'game-container',
  backgroundColor: '#f8f8f8',
  scene: [BootScene, MenuScene, GameScene, ResultScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 960
  }
};

class MasalaChefGame {
  constructor() {
    this.game = null;
    this.gameData = {
      selectedEnvironment: 'kitchen',
      selectedRecipe: 'alooBhujia',
      steps: [],
      timeTaken: 0,
      ingredients: {}
    };
  }

  init(parent) {
    // Create the game with the parent container
    config.parent = parent;
    this.game = new Phaser.Game(config);
    
    // Make gameData accessible to all scenes
    this.game.registry.set('gameData', this.gameData);
    
    return this.game;
  }

  // Method to add a step to the cooking log
  addStep(step) {
    this.gameData.steps.push({
      ...step,
      timestamp: Date.now()
    });
  }

  // Reset game data for a new game
  resetGameData() {
    this.gameData = {
      selectedEnvironment: 'kitchen',
      selectedRecipe: 'alooBhujia',
      steps: [],
      timeTaken: 0,
      ingredients: {}
    };
    this.game.registry.set('gameData', this.gameData);
  }

  // Get the current game data
  getGameData() {
    return this.gameData;
  }
}

export default MasalaChefGame; 