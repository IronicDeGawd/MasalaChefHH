import Phaser from 'phaser';

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.selectedEnvironment = 'kitchen';
    this.selectedRecipe = 'alooBhujia';
    this.handCursor = null; // Add reference for hand cursor
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Use a simple colored background instead of an image
    this.add.rectangle(0, 0, width, height, 0xF5DEB3).setOrigin(0, 0);
    
    // Title
    this.add.text(width / 2, 120, 'MasalaChef', {
      font: 'bold 60px Arial',
      fill: '#8B4513'
    }).setOrigin(0.5);
    
    // Environment selection
    this.add.text(width / 2, 240, 'Select Kitchen Environment', {
      font: '32px Arial',
      fill: '#8B4513'
    }).setOrigin(0.5);
    
    // Environment options
    this.createEnvironmentOptions(width, 320);
    
    // Recipe selection
    this.add.text(width / 2, 480, 'Select Recipe', {
      font: '32px Arial',
      fill: '#8B4513'
    }).setOrigin(0.5);
    
    // Recipe options
    this.createRecipeOptions(width, 560);
    
    // Start button
    const startButton = this.add.rectangle(width / 2, height - 160, 280, 70, 0x8B4513)
      .setInteractive()
      .on('pointerdown', () => {
        // Store selections in registry for access in game scene
        this.registry.get('gameData').selectedEnvironment = this.selectedEnvironment;
        this.registry.get('gameData').selectedRecipe = this.selectedRecipe;
        
        // Start the game scene
        this.scene.start('GameScene');
      });
    
    // Start button text
    this.add.text(width / 2, height - 160, 'Start Cooking!', {
      font: '32px Arial',
      fill: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Add hover effect
    startButton.on('pointerover', () => {
      startButton.fillColor = 0x9B5523;
    });
    
    startButton.on('pointerout', () => {
      startButton.fillColor = 0x8B4513;
    });
    
    // Set up custom cursor
    this.setHandCursor();
  }
  
  createEnvironmentOptions(width, yPosition) {
    const environments = [
      { id: 'kitchen', name: 'Home Kitchen', x: width / 4 },
      { id: 'dhaba', name: 'Dhaba (Coming Soon)', x: width / 2 },
      { id: 'restaurant', name: 'Restaurant (Coming Soon)', x: 3 * width / 4 }
    ];
    
    environments.forEach(env => {
      const isLocked = env.id !== 'kitchen';
      const color = isLocked ? 0xA9A9A9 : 0x8B4513;
      const textColor = isLocked ? '#A9A9A9' : '#000000';
      
      const button = this.add.rectangle(env.x, yPosition, 260, 50, color)
        .setOrigin(0.5);
      
      if (!isLocked) {
        button.setInteractive().on('pointerdown', () => {
          this.selectedEnvironment = env.id;
          this.highlightSelected(environments, env.id, yPosition);
        });
      }
      
      this.add.text(env.x, yPosition, env.name, {
        font: '22px Arial',
        fill: textColor
      }).setOrigin(0.5);
      
      // Highlight initial selection
      if (env.id === this.selectedEnvironment) {
        this.add.rectangle(env.x, yPosition, 280, 70, 0xFFD700).setOrigin(0.5).setDepth(-1);
      }
    });
  }
  
  createRecipeOptions(width, yPosition) {
    const recipes = [
      { id: 'alooBhujia', name: 'Aloo Bhujia', x: width / 3 },
      { id: 'palakPaneer', name: 'Palak Paneer (Coming Soon)', x: 2 * width / 3 }
    ];
    
    recipes.forEach(recipe => {
      const isLocked = recipe.id !== 'alooBhujia';
      const color = isLocked ? 0xA9A9A9 : 0x8B4513;
      const textColor = isLocked ? '#A9A9A9' : '#000000';
      
      const button = this.add.rectangle(recipe.x, yPosition, 260, 50, color)
        .setOrigin(0.5);
      
      if (!isLocked) {
        button.setInteractive().on('pointerdown', () => {
          this.selectedRecipe = recipe.id;
          this.highlightSelected(recipes, recipe.id, yPosition);
        });
      }
      
      this.add.text(recipe.x, yPosition, recipe.name, {
        font: '22px Arial',
        fill: textColor
      }).setOrigin(0.5);
      
      // Highlight initial selection
      if (recipe.id === this.selectedRecipe) {
        this.add.rectangle(recipe.x, yPosition, 280, 70, 0xFFD700).setOrigin(0.5).setDepth(-1);
      }
    });
  }
  
  highlightSelected(items, selectedId, yPosition) {
    // Clear existing highlights
    this.children.list
      .filter(child => child.type === 'Rectangle' && child.y === yPosition && child.width === 280)
      .forEach(highlight => highlight.destroy());
    
    // Add new highlight
    const selectedItem = items.find(item => item.id === selectedId);
    this.add.rectangle(selectedItem.x, yPosition, 280, 70, 0xFFD700).setOrigin(0.5).setDepth(-1);
  }
  
  // Add custom hand cursor function (same as in GameScene)
  setHandCursor() {
    // Hide the default cursor
    this.input.setDefaultCursor('none');
    
    // Create custom hand cursor with increased size
    this.handCursor = this.add.image(0, 0, 'handCursor')
      .setScale(0.5)
      .setDepth(10);
    
    // Update hand cursor position
    this.input.on('pointermove', (pointer) => {
      this.handCursor.setPosition(pointer.x, pointer.y);
    });
  }
}

export default MenuScene; 