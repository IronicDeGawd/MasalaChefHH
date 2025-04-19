import Phaser from 'phaser';
import recipes from '../data/recipes';

class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Get game data from registry
    const gameData = this.registry.get('gameData');
    const recipe = recipes[gameData.selectedRecipe];
    
    // Create background
    this.add.rectangle(0, 0, width, height, 0xF5DEB3).setOrigin(0, 0);
    
    // Add title
    this.add.text(width / 2, 120, 'Recipe Results', {
      font: 'bold 40px Arial',
      fill: '#8B4513'
    }).setOrigin(0.5);
    
    // Add dish name
    this.add.text(width / 2, 200, recipe.name, {
      font: 'bold 32px Arial',
      fill: '#8B4513'
    }).setOrigin(0.5);
    
    // Add completion time
    const timeTaken = gameData.timeTaken || 0;
    const minutes = Math.floor(timeTaken / 60000);
    const seconds = Math.floor((timeTaken % 60000) / 1000);
    
    this.add.text(width / 2, 260, `Time Taken: ${minutes}m ${seconds}s`, {
      font: '26px Arial',
      fill: '#000000'
    }).setOrigin(0.5);
    
    // Add cooking score (placeholder)
    this.add.text(width / 2, 320, 'Cooking Score: ★★★★☆', {
      font: '26px Arial',
      fill: '#000000'
    }).setOrigin(0.5);
    
    // Add feedback panel
    const feedbackPanel = this.add.rectangle(width / 2, 500, 700, 250, 0xFFFFFF)
      .setStrokeStyle(3, 0x8B4513);
    
    // Add AI feedback (placeholder)
    this.add.text(width / 2, 380, 'Feedback:', {
      font: 'bold 28px Arial',
      fill: '#000000'
    }).setOrigin(0.5);
    
    const feedbackText = `Your Aloo Bhujia was cooked perfectly! The potatoes were diced nicely and cooked to perfection. The spice balance was good, though a bit more turmeric would enhance the flavor. Overall, a very good attempt at this classic dish!`;
    
    this.add.text(width / 2, 500, feedbackText, {
      font: '22px Arial',
      fill: '#000000',
      align: 'center',
      wordWrap: { width: 650 }
    }).setOrigin(0.5);
    
    // Add buttons
    const buttonY = height - 140;
    
    // Replay button
    const replayButton = this.add.rectangle(width / 3, buttonY, 220, 70, 0x8B4513)
      .setInteractive()
      .on('pointerdown', () => {
        // Reset game data
        this.registry.get('gameData').steps = [];
        this.registry.get('gameData').ingredients = {};
        this.registry.get('gameData').timeTaken = 0;
        
        // Restart game scene
        this.scene.start('GameScene');
      });
    
    this.add.text(width / 3, buttonY, 'Try Again', {
      font: '26px Arial',
      fill: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Menu button
    const menuButton = this.add.rectangle(2 * width / 3, buttonY, 220, 70, 0x8B4513)
      .setInteractive()
      .on('pointerdown', () => {
        // Go back to menu
        this.scene.start('MenuScene');
      });
    
    this.add.text(2 * width / 3, buttonY, 'Main Menu', {
      font: '26px Arial',
      fill: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Add hover effects
    [replayButton, menuButton].forEach(button => {
      button.on('pointerover', () => {
        button.fillColor = 0x9B5523;
      });
      
      button.on('pointerout', () => {
        button.fillColor = 0x8B4513;
      });
    });
    
    // Save game data to blockchain (placeholder)
    this.saveGameData(gameData);
  }
  
  saveGameData(gameData) {
    // In the MVP, this would make an API call to the backend
    // to store the data in the Monad contract
    console.log('Saving game data to blockchain...', gameData);
    
    // Placeholder: This would be replaced with actual API calls
    setTimeout(() => {
      console.log('Game data saved successfully!');
    }, 1000);
  }
}

export default ResultScene; 