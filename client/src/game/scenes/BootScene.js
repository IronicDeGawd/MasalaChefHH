import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Show loading screen
    this.createLoadingBar();

    // Load background layers with correct filenames
    this.load.image('background', 'assets/backgroundlayer.png');
    this.load.image('mid', 'assets/midlayer.png');
    this.load.image('front', 'assets/frontlayer.png');
    
    // Load kitchen elements
    this.load.image('choppingBoard', 'assets/choppingboard.png');
    this.load.image('shelf', 'assets/shelf.png');
    this.load.image('pan', 'assets/pan.png');
    this.load.image('stove', 'assets/stove.png');
    this.load.image('woodenSpoon', 'assets/woodenspoon.png');
    //intentionally wrong spelling
    this.load.image('mixingSpoon', 'assets/mixng_spoon.png');
    
    // Fix container image paths - these need to be verified or created
    this.load.image('container', 'assets/container.png');
    this.load.image('container1', 'assets/container2.png');
    this.load.image('container2', 'assets/container2.png');
    this.load.image('container-big', 'assets/container-big.png');
    
    // Load ingredients with correct filenames
    this.load.image('potato', 'assets/potato_raw.png');
    this.load.image('potato-raw', 'assets/potato_raw.png');
    this.load.image('potato-peeled', 'assets/potato_peeled.png');
    this.load.image('potato-diced', 'assets/potato_diced.png');
    this.load.image('potato-cooking', 'assets/potato_cooking.png');
    this.load.image('potato-cooked', 'assets/potato_cooked.png');
    this.load.image('onion', 'assets/onion_raw.png');
    
    // Load other items
    this.load.image('oil', 'assets/oil.png');
    this.load.image('salt', 'assets/salt.png');
    this.load.image('kadhai', 'assets/kadhai.png');
    this.load.image('basket', 'assets/basket.png');
    this.load.image('recipeBook', 'assets/recipebook.png');
    
    // Make sure correct capitalization is used for recipe_menu.png
    console.log('Loading recipe menu image...');
    this.load.image('recipeMenu', 'assets/recipe_menu.png');
    
    // Load hand cursor
    this.load.image('handCursor', 'assets/player.png');
  }

  createContainerAssets() {
    // Create container graphics
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Draw the regular container
    graphics.fillStyle(0xFF9900);
    graphics.fillRect(0, 0, 44, 63);
    graphics.strokeRect(0, 0, 44, 63);
    graphics.generateTexture('container', 44, 63);
    graphics.clear();
    
    // Draw the big container
    graphics.fillStyle(0xCC6600);
    graphics.fillRect(0, 0, 44, 66);
    graphics.strokeRect(0, 0, 44, 66);
    graphics.generateTexture('container-big', 44, 66);
    graphics.clear();
    
    // Create copies of the textures
    graphics.generateTexture('container1', 44, 63);
    graphics.generateTexture('container2', 44, 63);
    
    graphics.destroy();
  }

  create() {
    // Start the menu scene
    this.scene.start('MenuScene');
  }

  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Loading text
    this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5, 0.5);
    
    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);
    
    // Loading progress events
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 10);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });
  }
}

export default BootScene; 