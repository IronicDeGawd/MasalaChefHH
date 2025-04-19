import Phaser from 'phaser';
import recipes from '../data/recipes';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentStep = 0;
    this.startTime = null;
    this.items = {};
    this.itemPositions = {
      // Ingredients from Figma layout
      potato: { x: 694, y: 431, width: 60, height: 60 },
      'potato-peeled': { x: 172, y: 480, width: 60, height: 60 },
      'potato-diced': { x: 240, y: 486, width: 80, height: 64 },
      'potato-cooked': { x: 441, y: 582, width: 300, height: 200 },
      onion: { x: 654, y: 431, width: 60, height: 60 },
      
      // Spice containers on shelf
      container1: { x: 280, y: 327, width: 44, height: 63 }, // Turmeric/Haldi
      container2: { x: 318, y: 327, width: 44, height: 63 }, // Red Chilli
      'container-big': { x: 362, y: 324, width: 44, height: 66 }, // Zeera/Cumin
      salt: { x: 412, y: 315, width: 59, height: 76 },
      oil: { x: 477, y: 266, width: 44, height: 125 },
      
      // Kitchen equipment
      choppingBoard: { x: 87, y: 435, width: 286, height: 190 },
      stove: { x: 318, y: 591, width: 470, height: 301 },
      pan: { x: 40, y: 652, width: 300, height: 180 },
      'pan-on-stove': { x: 424, y: 566, width: 366, height: 219 }, // New position from Figma
      woodenSpoon: { x: 483, y: 510, width: 124, height: 66 },
      mixingSpoon: { x: 373, y: 466, width: 188, height: 100 },
      
      // UI elements
      basket: { x: 607, y: 366, width: 200, height: 200 },
      recipeBook: { x: 788, y: 629, width: 189, height: 202 },
      recipeMenu: { x: 909, y: 215, width: 350, height: 517 },
      shelf: { x: 242, y: 330, width: 310, height: 144 }
    };

    // Mapping from container sprites to spice names
    this.spiceMap = {
      'container1': 'turmeric',
      'container2': 'redChilli',
      'container-big': 'zeera'
    };
    
    this.optionsPanel = null;
    this.actionInProgress = false;
    this.steps = [];
    this.recipe = null;
    this.stoveHeat = null;
    this.panOnStove = false;
    this.checklist = null;
    this.completedStepIds = [];
    this.gameScore = 0; // Track score
    this.mistakes = []; // Track mistakes
  }

  create() {
    // Get game data from registry or initialize it
    let gameData = this.registry.get('gameData');
    if (!gameData) {
      gameData = {
        selectedRecipe: 'alooBhujia',
        ingredients: {},
        steps: [],
        startTime: Date.now()
      };
      this.registry.set('gameData', gameData);
    }
    
    // Ensure ingredients object exists
    if (!gameData.ingredients) {
      gameData.ingredients = {};
    }
    
    // Ensure steps array exists
    if (!gameData.steps) {
      gameData.steps = [];
    }
    
    this.recipe = recipes[gameData.selectedRecipe];
    this.steps = this.recipe.steps;
    
    // Start timer
    this.startTime = Date.now();
    gameData.startTime = this.startTime;
    
    // Log asset keys for debugging
    console.log("Available texture keys:", this.textures.getTextureKeys());
    
    // Debug flag - set to true to show interactive areas
    this.showInteractiveAreas = false;
    this.debugGraphics = this.add.graphics();
    
    // Add key listener for debug toggle
    this.input.keyboard.on('keydown-D', () => {
      this.showInteractiveAreas = !this.showInteractiveAreas;
      console.log(`Debug visualization ${this.showInteractiveAreas ? 'enabled' : 'disabled'}`);
      this.updateDebugVisualization();
    });
    
    // Create layered background
    this.createBackground();
    
    // Set up kitchen items
    this.setupKitchenItems();
    
    // Set up recipe checklist (hidden by default)
    this.setupRecipeChecklist();
    
    // Add custom hand cursor
    this.setHandCursor();
    
    // Add UI elements
    this.createUI();
    
    // Show debug info
    this.addDebugInfoText();
    
    // Log game initialization
    console.log('Game scene initialized with recipe:', this.recipe.name);
    console.log('Player should click on basket to start the cooking process');
    console.log('Press "D" key to toggle visualization of interactive areas');
  }
  
  update() {
    // Update game timer
    this.updateTimer();
    
    // Update debug visualization if enabled
    if (this.showInteractiveAreas) {
      this.updateDebugVisualization();
    }
  }
  
  createBackground() {
    // Use actual background layer images with exact Figma positions
    // Background layer (furthest back)
    this.add.image(640, 480, 'background')
      .setDepth(0);
    
    // Mid-layer elements (using updated Figma coordinates)
    this.add.image(640, 474 + 308/2, 'mid')
      .setDepth(1);
    
    // Front layer elements (using updated Figma coordinates)
    this.add.image(640, 669 + 291/2, 'front')
      .setDepth(2);
  }
  
  setupKitchenItems() {
    // Create interactive kitchen items
    Object.keys(this.itemPositions).forEach(key => {
      const pos = this.itemPositions[key];
      
      // Skip UI elements that are handled elsewhere
      if (key === 'recipeMenu') return;
      
      // Skip creating potato-diced initially (it will be created when chopped)
      if (key === 'potato-diced') return;
      
      // Skip creating potato-peeled initially (it will be created after peeling)
      if (key === 'potato-peeled') return;
      
      // Skip pan-on-stove position as it's just a reference
      if (key === 'pan-on-stove') return;
      
      // Special case for cooked potato - initially hidden
      if (key === 'potato-cooked') {
        const item = this.add.image(pos.x + pos.width/2, pos.y + pos.height/2, key)
          .setDepth(3)
          .setVisible(false);
        this.items[key] = item;
        return;
      }
      
      // Add a visible potato to the basket using exact Figma coordinates
      if (key === 'potato') {
        // Try using 'potato' or 'potato-raw' as the texture key
        const textureKey = this.textures.exists('potato') ? 'potato' : 
                          (this.textures.exists('potato-raw') ? 'potato-raw' : 'potato');
        
        console.log(`Using potato texture key: ${textureKey}`);
        
        // Use exact Figma coordinates
        const item = this.add.image(pos.x + pos.width/2, pos.y + pos.height/2, textureKey)
          .setInteractive()
          .setDepth(3);
        
        // Log the item status
        console.log(`Created potato in basket at position:`, {x: pos.x + pos.width/2, y: pos.y + pos.height/2});
        
        this.items[key] = item;
        return;
      }
      
      // Add items with exact positions from Figma without resizing
      const item = this.add.image(pos.x + pos.width/2, pos.y + pos.height/2, key)
        .setInteractive()
        .setDepth(3);
      
      // Special case for pan initially if not on stove
      if (key === 'pan' && !this.panOnStove) {
        // Keep it in the Figma position as intended
      }
      
      // Adjust depth for specific items
      if (key === 'basket') {
        item.setDepth(1); // Ensure basket is below other items
      }

      if (key === 'choppingBoard') {
        item.setDepth(1); // Ensure chopping board is below other items
      }
      
      // Add click handlers based on item type
      if (key === 'stove') {
        item.on('pointerdown', () => {
          // Only allow if this is the current step
          const relevantStep = this.getCurrentStep();
          if (relevantStep && relevantStep.item === 'stove' && !this.actionInProgress) {
            this.showStoveOptions(item);
          } else if (!this.actionInProgress) {
            this.showFloatingText(item.x, item.y, 'Not yet time for this step!', '#FF0000');
          }
        });
      } else if (key === 'recipeBook') {
        item.on('pointerdown', () => {
          // Toggle recipe menu visibility
          const isVisible = this.checklistElements.panel.visible ? false : true;
          
          console.log('Recipe book clicked, toggling menu visibility to:', isVisible);
          
          // Toggle checklist elements visibility
          this.checklistElements.panel.setVisible(isVisible);
          this.checklistElements.title.setVisible(isVisible);
          
          // Toggle checklist items visibility and make sure they are positioned correctly
          this.checklist.forEach(item => {
            item.text.setVisible(isVisible);
            item.checkbox.setVisible(isVisible);
          });
          
          // Visual feedback for recipe book click
          this.showFloatingText(item.x, item.y, isVisible ? 'Recipe opened!' : 'Recipe closed', '#008000');
        });
      } else if (key === 'container1' || key === 'container2' || key === 'container-big') {
        // Spice containers (turmeric, red chilli, zeera)
        item.on('pointerdown', () => {
          // Get the spice name from the map
          const spiceName = this.spiceMap[key];
          console.log(`Clicked ${key} which contains ${spiceName}`);
          
          // Add a more permissive check - allow interaction more freely for debugging
          const relevantStep = this.getCurrentStep();
          console.log("Current step:", relevantStep);
          
          // Make interaction more permissive for now
          if (!this.actionInProgress) {
            // Show options for adding this spice
            this.showSpiceOptions(item, key, relevantStep || { 
              id: 999,
              item: spiceName,
              description: `Add ${spiceName}`
            }, spiceName);
            
            // Log that this interaction happened
            console.log(`Showing options for ${spiceName} from ${key}`);
          } else {
            this.showFloatingText(item.x, item.y, 'Action in progress...', '#FFA500');
          }
        });
      } else if (key === 'salt') {
        // Salt container
        item.on('pointerdown', () => {
          console.log("Salt container clicked");
          // Only allow if this is the current step
          const relevantStep = this.getCurrentStep();
          
          // Make interaction more permissive for now
          if (!this.actionInProgress) {
            this.showSpiceOptions(item, key, relevantStep || {
              id: 999,
              item: 'salt',
              description: 'Add salt'
            });
            
            console.log(`Showing options for salt`);
          } else {
            this.showFloatingText(item.x, item.y, 'Action in progress...', '#FFA500');
          }
        });
      } else if (key === 'oil') {
        // Oil container
        item.on('pointerdown', () => {
          console.log("Oil container clicked");
          // Only allow if this is the current step
          const relevantStep = this.getCurrentStep();
          
          // Make interaction more permissive for now
          if (!this.actionInProgress) {
            // Show oil-specific options
            this.showOilOptions(item, relevantStep || {
              id: 999,
              item: 'oil',
              description: 'Add oil'
            });
            
            console.log(`Showing options for oil`);
          } else {
            this.showFloatingText(item.x, item.y, 'Action in progress...', '#FFA500');
          }
        });
      }
      
      this.items[key] = item;
    });
    
    // Setup heat indicator for stove
    this.stoveHeat = this.add.text(
      this.itemPositions.stove.x + this.itemPositions.stove.width/2, 
      this.itemPositions.stove.y + 50, 
      '', 
      {
        font: '16px Arial',
        fill: '#FF0000',
        backgroundColor: '#FFFFFF',
        padding: { x: 5, y: 5 }
      }
    ).setOrigin(0.5).setDepth(4).setVisible(false);
    
    // Set up interactions for all items
    this.setupInteractions();
  }
  
  createItemPositions() {
    // Convert the absolute Figma positions to relative screen percentages
    const width = this.scale.width;
    const height = this.scale.height;
    const positions = {};
    
    // For each item in our fixed positions, calculate the relative position
    Object.keys(this.itemPositions).forEach(key => {
      const pos = this.itemPositions[key];
      positions[key] = { 
        x: (pos.x + pos.width/2) / 1280 * width, 
        y: (pos.y + pos.height/2) / 960 * height,
        width: pos.width / 1280 * width,
        height: pos.height / 960 * height
      };
    });
    
    return positions;
  }

  setupInteractions() {
    // Handle basket interactions - starting point for selecting raw potato
    if (this.items['basket']) {
      this.items['basket'].on('pointerdown', () => {
        // Only allow at the beginning of the recipe
        const relevantStep = this.getCurrentStep();
        if (relevantStep && (relevantStep.item === 'potato-raw' || relevantStep.item === 'potato') && !this.actionInProgress) {
          console.log("Basket clicked - should add potato to chopping board");
          
          // Define position for potato on chopping board using Figma coordinates
          const potatoPeeledPos = this.itemPositions['potato-peeled'];
          const chopBoardX = potatoPeeledPos.x + potatoPeeledPos.width/2;
          const chopBoardY = potatoPeeledPos.y + potatoPeeledPos.height/2;
          
          // Check if potato is already on the chopping board
          if (this.items['potato-on-board']) {
            this.showFloatingText(this.items['basket'].x, this.items['basket'].y, 'Potato already selected!', '#FFA500');
            return;
          }
          
          // Move the potato from basket to chopping board with animation
          this.actionInProgress = true;
          
          // Tween the potato from basket to chopping board
          this.tweens.add({
            targets: this.items['potato'],
            x: chopBoardX,
            y: chopBoardY,
            duration: 500,
            onComplete: () => {
              // After animation completes, rename it to potato-on-board to distinguish from the basket potato
              const potatoOnBoard = this.items['potato'];
              this.items['potato-on-board'] = potatoOnBoard;
              
              // Determine the correct texture key to use
              const textureKey = this.textures.exists('potato') ? 'potato' : 
                               (this.textures.exists('potato-raw') ? 'potato-raw' : 'potato');
              
              // Create a new potato in the basket using Figma coordinates
              const potatoPos = this.itemPositions['potato'];
              const newBasketPotato = this.add.image(
                potatoPos.x + potatoPos.width/2, 
                potatoPos.y + potatoPos.height/2, 
                textureKey
              ).setInteractive().setDepth(3);
              
              // Log creation of new basket potato
              console.log("Created new potato in basket at position:", 
                {x: potatoPos.x + potatoPos.width/2, y: potatoPos.y + potatoPos.height/2});
              
              // Update the basket potato reference
              this.items['potato'] = newBasketPotato;
              
              // Add click handler to the potato on the chopping board
              potatoOnBoard.off('pointerdown'); // Remove old handlers if any
              potatoOnBoard.on('pointerdown', () => {
                console.log("Potato clicked on chopping board");
                const currentStep = this.getCurrentStep();
                if (currentStep && (currentStep.item === 'potato-raw' || currentStep.item === 'potato') && !this.actionInProgress) {
                  // Show options dialog for washing/peeling
                  this.showPrepOptions(potatoOnBoard, currentStep);
                } else if (!this.actionInProgress) {
                  this.showFloatingText(potatoOnBoard.x, potatoOnBoard.y, 'Not yet time for this step!', '#FF0000');
                }
              });
              
              this.showFloatingText(potatoOnBoard.x, potatoOnBoard.y, 'Potato placed on chopping board!', '#008000');
              this.actionInProgress = false;
            }
          });
        } else if (this.actionInProgress) {
          this.showFloatingText(this.items['basket'].x, this.items['basket'].y, 'Action in progress...', '#FFA500');
        } else {
          this.showFloatingText(this.items['basket'].x, this.items['basket'].y, 'Not yet time for this step!', '#FF0000');
        }
      });
    }
    
    // Handle chopping board interactions
    if (this.items['choppingBoard']) {
      this.items['choppingBoard'].on('pointerdown', () => {
        console.log("Chopping board clicked");
        
        // If potato is on chopping board and visible, delegate click to potato
        if (this.items['potato-on-board'] && this.items['potato-on-board'].visible && !this.actionInProgress) {
          console.log("Redirecting click to potato on board");
          this.items['potato-on-board'].emit('pointerdown');
          return;
        }
        
        // Check if we have a peeled potato to chop
        if (this.items['potato-peeled'] && this.items['potato-peeled'].visible && !this.actionInProgress) {
          const relevantStep = this.getCurrentStep();
          if (relevantStep && relevantStep.item === 'potato-peeled' && relevantStep.action === 'chop') {
            this.showChoppingOptions(this.items['choppingBoard'], relevantStep);
          } else if (!this.actionInProgress) {
            this.showFloatingText(this.items['choppingBoard'].x, this.items['choppingBoard'].y, 'Not yet time for this step!', '#FF0000');
          }
        } else {
          this.showFloatingText(this.items['choppingBoard'].x, this.items['choppingBoard'].y, 'Nothing to chop here!', '#FFA500');
        }
      });
    }
    
    // Handle pan interactions
    if (this.items['pan']) {
      this.items['pan'].on('pointerdown', () => {
        const relevantStep = this.getCurrentStep();
        if (relevantStep && relevantStep.item === 'pan' && relevantStep.action === 'place' && !this.actionInProgress) {
          this.showPanOptions(this.items['pan'], relevantStep);
        } else if (!this.actionInProgress) {
          this.showFloatingText(this.items['pan'].x, this.items['pan'].y, 'Not yet time for this step!', '#FF0000');
        }
      });
    }
    
    // Handle wooden spoon interactions
    if (this.items['woodenSpoon']) {
      this.items['woodenSpoon'].on('pointerdown', () => {
        const relevantStep = this.getCurrentStep();
        if (relevantStep && relevantStep.item === 'woodenSpoon' && !this.actionInProgress) {
          if (relevantStep.action === 'stir') {
            this.showSpoonOptions(this.items['woodenSpoon'], relevantStep, 'stir');
          } else if (relevantStep.action === 'cook') {
            this.showCookingOptions(this.items['woodenSpoon'], relevantStep);
          }
        } else if (!this.actionInProgress) {
          this.showFloatingText(this.items['woodenSpoon'].x, this.items['woodenSpoon'].y, 'Not yet time for this step!', '#FF0000');
        }
      });
    }
    
    // Log recipe flow for debugging
    console.log('Recipe flow: ', {
      steps: this.steps,
      recipe: this.recipe.name
    });
  }
  
  setupRecipeChecklist() {
    // Create a background panel for the checklist with rounded corners
    const checklistPanel = this.add.graphics();
    checklistPanel.fillStyle(0xFFF0E5, 0.95);
    checklistPanel.fillRoundedRect(885, 170, 350, 600, 16);
    checklistPanel.lineStyle(4, 0x8B4513, 1);
    checklistPanel.strokeRoundedRect(885, 170, 350, 600, 16);
    checklistPanel.setDepth(4)
      .setVisible(false);
    
    // Add recipe title
    const recipeTitle = this.add.text(1060, 205, this.recipe.name, {
      font: 'bold 32px Arial',
      fill: '#8B4513',
      align: 'center'
    }).setOrigin(0.5).setDepth(5).setVisible(false);
    
    // Add recipe steps with increased spacing to avoid overlap
    this.checklist = this.steps.map((step, index) => {
      const y = 250 + (index * 38); // Adjusted spacing
      
      // Checkbox
      const checkbox = this.add.graphics();
      checkbox.lineStyle(2, 0x000000, 1);
      checkbox.strokeRect(905 - 10, y - 10, 20, 20);
      checkbox.setDepth(5).setVisible(false);
      
      // Step number and description with smaller font and better wrapping
      const text = this.add.text(925, y, `${index + 1}. ${step.description}`, {
        font: '16px Arial',
        fill: '#000000',
        align: 'left',
        wordWrap: { width: 280 }
      }).setOrigin(0, 0.5).setDepth(5).setVisible(false);
      
      return { text, checkbox, completed: false };
    });

    // Highlight the first step
    if (this.checklist.length > 0) {
      this.checklist[0].text.setColor('#0000FF');
    }
    
    // Store references to control visibility
    this.checklistElements = {
      panel: checklistPanel,
      title: recipeTitle
    };
    
    console.log('Recipe checklist setup complete');
  }
  
  createUI() {
    // Add timer
    this.timerText = this.add.text(640, 50, 'Time: 00:00', {
      font: '24px Arial',
      fill: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(4);
    
    // Add back button
    const backButton = this.add.rectangle(120, 80, 150, 60, 0x8B4513)
      .setInteractive()
      .setDepth(4)
      .on('pointerdown', () => {
        this.scene.start('MenuScene');
      });
    
    this.add.text(120, 80, 'Back', {
      font: '20px Arial',
      fill: '#FFFFFF'
    }).setOrigin(0.5).setDepth(4);
    
    // Add debug button for mobile users
    const debugButton = this.add.rectangle(1200, 80, 150, 60, 0x004488)
      .setInteractive()
      .setDepth(4)
      .on('pointerdown', () => {
        this.showInteractiveAreas = !this.showInteractiveAreas;
        console.log(`Debug visualization ${this.showInteractiveAreas ? 'enabled' : 'disabled'}`);
        this.updateDebugVisualization();
        
        // Change button color based on state
        debugButton.fillColor = this.showInteractiveAreas ? 0x00AA00 : 0x004488;
      });
    
    this.add.text(1200, 80, 'Debug', {
      font: '20px Arial',
      fill: '#FFFFFF'
    }).setOrigin(0.5).setDepth(4);
  }
  
  setHandCursor() {
    // Hide the default cursor
    this.input.setDefaultCursor('none');
    
    // Create custom hand cursor with increased size
    this.handCursor = this.add.image(0, 0, 'handCursor')
      .setScale(0.5) // Increase from 0.25 to 0.5 for better visibility
      .setDepth(10);
    
    // Update hand cursor position
    this.input.on('pointermove', (pointer) => {
      this.handCursor.setPosition(pointer.x, pointer.y);
    });
  }
  
  updateTimer() {
    if (this.startTime) {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      
      this.timerText.setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  }
  
  showStoveOptions(stove) {
    if (this.actionInProgress) return;
    
    const relevantStep = this.steps.find(step => step.item === 'stove' && !step.completed);
    if (!relevantStep) return;
    
    this.showOptions(stove.x, stove.y - 100, relevantStep.options, (option) => {
      // Set stove heat
      this.stoveHeat.setText(`Heat: ${option}`).setVisible(true);
      
      // Update step completion
      this.completeStep(relevantStep, option);
      
      // Add to game data
      this.registry.get('gameData').ingredients['stove_heat'] = option;
    });
  }
  
  showSpiceOptions(item, key, step, spiceName) {
    // Define quantity options based on item type
    let options = ['¼ tsp', '½ tsp', '1 tsp', '2 tsp'];
    
    // Special case for oil which needs different measurements
    if (key === 'oil' || step.item === 'oil') {
      options = ['1 tsp', '2 tsp', '1 tbsp', '2 tbsp'];
    }
    
    // Get the proper spice name if not provided
    if (!spiceName) {
      if (this.spiceMap && this.spiceMap[key]) {
        spiceName = this.spiceMap[key];
      } else {
        spiceName = step.itemName || key;
      }
    }
    
    console.log(`Showing spice options for ${spiceName} (${key}):`, options);
    
    this.showOptions(item.x, item.y - 100, options, (option) => {
      console.log(`Selected quantity for ${spiceName}: ${option}`);
      
      // Special handling for zeera (cumin seeds)
      const isZeera = spiceName === 'zeera' || key === 'zeera' || 
                    (key === 'container-big' && spiceName === 'zeera');
      
      if (isZeera) {
        console.log("Detected zeera, using special handler");
        this.handleZeeraAddition(key, option, step);
        return;
      }
      
      // Show visual feedback with the correct spice name
      this.showFloatingText(item.x, item.y, `Added ${option} of ${spiceName}`, '#008000');
      
      // Update step completion
      this.completeStep(step, option);
      
      // Add to game data with more detail
      this.registry.get('gameData').ingredients[spiceName] = option;
      
      // If we're adding to the pan, create smoke effect
      if (this.panOnStove) {
        // Choose smoke color based on spice
        let tint = 0xDDDDDD; // Default
        
        if (spiceName === 'turmeric') {
          tint = 0xFFCC00; // Yellow for turmeric
        } else if (spiceName === 'redChilli') {
          tint = 0xFF3300; // Red for red chilli
        }
        
        this.createSmokeEffect(this.itemPositions.stove.x, this.itemPositions.stove.y - 20, tint);
      } else {
        console.log("Pan not on stove, skipping smoke effect");
      }
      
      console.log(`${spiceName} added successfully with quantity ${option}`);
    });
  }
  
  showPrepOptions(potato, step) {
    console.log("Showing potato prep options:", step);
    
    // Check what action we need to take based on the step
    if (step.action === 'wash') {
      // Show options for washing potato
      this.showOptions(potato.x, potato.y - 60, ['Wash potato'], (option) => {
        this.washPotato(potato, step);
      });
    } else if (step.action === 'peel') {
      // Show options for peeling potato
      this.showOptions(potato.x, potato.y - 60, ['Peel potato'], (option) => {
        this.peelPotato(potato, step);
      });
    } else {
      // Default options if action not specified
      this.showOptions(potato.x, potato.y - 60, ['Wash potato', 'Peel potato'], (option) => {
        if (option === 'Wash potato') {
          this.washPotato(potato, step);
        } else if (option === 'Peel potato') {
          this.peelPotato(potato, step);
        }
      });
    }
  }
  
  washPotato(potato, step) {
    this.actionInProgress = true;
    
    // Create washing animation
    this.showFloatingText(potato.x, potato.y, 'Washing...', '#0000FF');
    
    // After delay, show completion
    this.time.delayedCall(1000, () => {
      this.showFloatingText(potato.x, potato.y, 'Washed!', '#008000');
      
      // After washing, update the step and allow further actions
      if (step) {
        this.completeStep(step);
      } else {
        // If no step provided, mark as washed in game data
        const gameData = this.registry.get('gameData');
        if (!gameData.ingredients) gameData.ingredients = {};
        gameData.ingredients.potato_washed = true;
      }
      
      this.actionInProgress = false;
    });
  }
  
  peelPotato(potato, step) {
    this.actionInProgress = true;
    
    // Create peeling animation
    this.showFloatingText(potato.x, potato.y, 'Peeling...', '#0000FF');
    
    // After delay, replace with peeled potato
    this.time.delayedCall(1500, () => {
      // Hide raw potato
      potato.setVisible(false);
      
      // Calculate position for peeled potato using Figma coordinates
      const potatoPeeledPos = this.itemPositions['potato-peeled'];
      const peelX = potatoPeeledPos.x + potatoPeeledPos.width/2;
      const peelY = potatoPeeledPos.y + potatoPeeledPos.height/2;
      
      // Create peeled potato
      console.log("Creating peeled potato at", peelX, peelY);
      const peeled = this.add.image(peelX, peelY, 'potato-peeled')
        .setInteractive()
        .setDepth(3);
      
      // Add click handler to peeled potato
      peeled.on('pointerdown', () => {
        console.log("Peeled potato clicked");
        const relevantStep = this.getCurrentStep();
        if (relevantStep && relevantStep.item === 'potato-peeled' && !this.actionInProgress) {
          if (relevantStep.action === 'chop') {
            this.showChoppingOptions(this.items['choppingBoard'], relevantStep);
          } else {
            this.showFloatingText(peeled.x, peeled.y, 'Click to choose an action', '#0000FF');
          }
        } else if (!this.actionInProgress) {
          this.showFloatingText(peeled.x, peeled.y, 'Not yet time for this step!', '#FF0000');
        }
      });
      
      // Remove reference to the raw potato on board since it's been replaced
      if (this.items['potato-on-board'] === potato) {
        delete this.items['potato-on-board'];
      }
      
      this.items['potato-peeled'] = peeled;
      this.showFloatingText(peeled.x, peeled.y, 'Peeled!', '#008000');
      this.completeStep(step);
      this.actionInProgress = false;
    });
  }
  
  showPanOptions(pan, step) {
    // Show options for placing pan
    this.showOptions(pan.x, pan.y - 60, ['Place on stove'], (option) => {
      this.placePanOnStove(pan, step);
    });
  }

  showSpoonOptions(spoon, step, action) {
    if (action === 'stir') {
      // Show options for stirring
      this.showOptions(spoon.x, spoon.y - 60, ['Stir gently', 'Stir medium', 'Stir vigorously'], (option) => {
        this.stirPotatoes(spoon, step);
      });
    }
  }
  
  placePanOnStove(pan, step) {
    this.actionInProgress = true;
    
    // Get the exact Figma coordinates for pan on stove
    const panOnStovePos = this.itemPositions['pan-on-stove'];
    const targetX = panOnStovePos.x + panOnStovePos.width/2;
    const targetY = panOnStovePos.y + panOnStovePos.height/2;
    
    console.log(`Moving pan to stove at position: (${targetX}, ${targetY})`);
    
    // Move pan to stove using precise coordinates
    this.tweens.add({
      targets: pan,
      x: targetX,
      y: targetY,
      duration: 500,
      onComplete: () => {
        this.panOnStove = true;
        this.showFloatingText(pan.x, pan.y, 'Pan placed on stove!', '#008000');
        this.completeStep(step);
        this.actionInProgress = false;
      }
    });
  }
  
  showChoppingOptions(choppingBoard, step) {
    const peeled = this.items['potato-peeled'];
    
    this.showOptions(peeled.x, peeled.y - 60, ['Dice finely', 'Dice medium', 'Dice roughly'], (option) => {
      this.actionInProgress = true;
      
      // Move peeled potato to chopping board center if needed
      const boardCenterX = choppingBoard.x; 
      const boardCenterY = choppingBoard.y;
      
      this.tweens.add({
        targets: peeled,
        x: boardCenterX,
        y: boardCenterY,
        duration: 500,
        onComplete: () => {
          // Hide peeled potato
          peeled.setVisible(false);
          
          // Show chopping animation
          this.showFloatingText(boardCenterX, boardCenterY, 'Chopping...', '#0000FF');
          
          // After delay, replace with diced potato
          this.time.delayedCall(1500, () => {
            // Create diced potato
            const diced = this.add.image(boardCenterX, boardCenterY, 'potato-diced')
              .setInteractive()
              .setDepth(3)
              .on('pointerdown', () => {
                // Check if it's time to add potatoes to pan
                const relevantStep = this.getCurrentStep();
                if (relevantStep && relevantStep.item === 'potato-diced' && relevantStep.action === 'add' && this.panOnStove) {
                  this.showDicedOptions(diced, relevantStep);
                } else if (!this.actionInProgress) {
                  this.showFloatingText(diced.x, diced.y, 'Not yet time for this step!', '#FF0000');
                }
              });
            
            this.items['potato-diced'] = diced;
            this.showFloatingText(diced.x, diced.y, `Chopped (${option})!`, '#008000');
            this.completeStep(step, option);
            this.actionInProgress = false;
          });
        }
      });
    });
  }
  
  showDicedOptions(diced, step) {
    this.showOptions(diced.x, diced.y - 60, ['Add to pan'], (option) => {
      this.addPotatoesToPan(diced, step);
    });
  }
  
  addPotatoesToPan(diced, step) {
    this.actionInProgress = true;
    
    // Move diced potato to pan
    this.tweens.add({
      targets: diced,
      x: this.itemPositions.stove.x,
      y: this.itemPositions.stove.y - 30, // Adjust to be visibly in the pan
      duration: 500,
      onComplete: () => {
        // Show cooking animation
        this.createSmokeEffect(this.itemPositions.stove.x, this.itemPositions.stove.y - 50);
        this.showFloatingText(diced.x, diced.y, 'Potatoes added to pan!', '#008000');
        this.completeStep(step);
        this.actionInProgress = false;
      }
    });
  }
  
  stirPotatoes(spoon, step) {
    this.actionInProgress = true;
    
    // Move wooden spoon to pan
    this.tweens.add({
      targets: spoon,
      x: this.itemPositions.stove.x + 30,
      y: this.itemPositions.stove.y - 30,
      duration: 500,
      onComplete: () => {
        // Rotate spoon for stirring effect
        this.tweens.add({
          targets: spoon,
          angle: { from: -20, to: 20 },
          ease: 'Sine.easeInOut',
          duration: 500,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            // Return spoon to original position
            this.tweens.add({
              targets: spoon,
              x: this.itemPositions.woodenSpoon.x,
              y: this.itemPositions.woodenSpoon.y,
              angle: 0,
              duration: 500,
              onComplete: () => {
                this.actionInProgress = false;
                this.showFloatingText(this.itemPositions.stove.x, this.itemPositions.stove.y - 30, 'Potatoes stirred!', '#008000');
                this.completeStep(step, 'medium'); // Default to medium stir
              }
            });
          }
        });
      }
    });
  }
  
  showCookingOptions(spoon, step) {
    this.showOptions(spoon.x, spoon.y - 100, step.options, (option) => {
      this.actionInProgress = true;
      
      // Show cooking timer
      const cookTime = parseInt(option);
      let countdown = cookTime * 60; // Convert to seconds
      
      const countdownText = this.add.text(this.itemPositions.stove.x, this.itemPositions.stove.y - 70, `Cooking: ${countdown}s`, {
        font: '16px Arial',
        fill: '#FF0000',
        backgroundColor: '#FFFFFF',
        padding: { x: 5, y: 5 }
      }).setOrigin(0.5).setDepth(4);
      
      // Start cooking interval
      const cookingInterval = setInterval(() => {
        countdown--;
        countdownText.setText(`Cooking: ${countdown}s`);
        
        // Create smoke effect randomly during cooking
        if (Math.random() < 0.2) {
          this.createSmokeEffect(this.itemPositions.stove.x, this.itemPositions.stove.y - 20);
        }
        
        if (countdown <= 0) {
          clearInterval(cookingInterval);
          countdownText.destroy();
          
          // Show cooked potatoes - make the cooked potato visible
          this.items['potato-diced'].setVisible(false);
          if (this.items['potato-cooked']) {
            this.items['potato-cooked'].setVisible(true);
          } else {
            this.items['potato-cooked'] = this.add.image(
              this.itemPositions['potato-cooked'].x + this.itemPositions['potato-cooked'].width/2, 
              this.itemPositions['potato-cooked'].y + this.itemPositions['potato-cooked'].height/2, 
              'potato-cooked'
            ).setDepth(3);
          }
          
          this.showFloatingText(this.itemPositions.stove.x, this.itemPositions.stove.y, 'Cooking complete!', '#008000');
          this.completeStep(step, option);
          this.actionInProgress = false;
          
          // Check if recipe is complete
          if (this.isRecipeComplete()) {
            this.finishCooking();
          }
        }
      }, 1000);
    });
  }
  
  showOptions(x, y, options, callback) {
    // Remove any existing options panel
    if (this.optionsPanel) {
      this.optionsPanel.destroy();
    }
    
    // Create options panel
    this.optionsPanel = this.add.container(x, y).setDepth(5);
    
    // Background
    const bg = this.add.rectangle(0, 0, 200, 40 * (options.length + 1) + 10, 0xFFFFFF)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2, 0x000000);
    
    this.optionsPanel.add(bg);
    
    // Add options
    options.forEach((option, index) => {
      const optionButton = this.add.rectangle(0, 20 + index * 40, 180, 30, 0xDDDDDD)
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .on('pointerover', () => optionButton.fillColor = 0xBBBBBB)
        .on('pointerout', () => optionButton.fillColor = 0xDDDDDD)
        .on('pointerdown', () => {
          this.optionsPanel.destroy();
          this.optionsPanel = null;
          callback(option);
        });
      
      const optionText = this.add.text(0, 20 + index * 40, option, {
        font: '16px Arial',
        fill: '#000000'
      }).setOrigin(0.5, 0.5);
      
      this.optionsPanel.add(optionButton);
      this.optionsPanel.add(optionText);
    });
    
    // Add cancel button
    const cancelY = 20 + options.length * 40;
    const cancelButton = this.add.rectangle(0, cancelY, 180, 30, 0xFF9999)
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerover', () => cancelButton.fillColor = 0xFF7777)
      .on('pointerout', () => cancelButton.fillColor = 0xFF9999)
      .on('pointerdown', () => {
        this.optionsPanel.destroy();
        this.optionsPanel = null;
      });
    
    const cancelText = this.add.text(0, cancelY, 'Cancel', {
      font: '16px Arial',
      fill: '#000000'
    }).setOrigin(0.5, 0.5);
    
    this.optionsPanel.add(cancelButton);
    this.optionsPanel.add(cancelText);
  }
  
  completeStep(step, option = null) {
    // Update step data
    step.completed = true;
    if (option) {
      step.selectedOption = option;
    }
    
    // Add to completed steps array
    this.completedStepIds.push(step.id);
    
    // Update checklist
    const checklistItem = this.checklist[step.id - 1];
    checklistItem.completed = true;
    
    // Fill in the checkbox to show it's completed
    if (checklistItem.checkbox && checklistItem.checkbox.visible) {
      checklistItem.checkbox.clear();
      checklistItem.checkbox.lineStyle(2, 0x000000, 1);
      checklistItem.checkbox.strokeRect(905 - 10, 250 + ((step.id - 1) * 38) - 10, 20, 20);
      checklistItem.checkbox.fillStyle(0x00FF00, 1);
      checklistItem.checkbox.fillRect(905 - 8, 250 + ((step.id - 1) * 38) - 8, 16, 16);
    }
    
    // Highlight the next step
    this.highlightCurrentStep();
    
    // Log step completion to game data with enhanced details
    const gameData = this.registry.get('gameData');
    const stepLog = {
      stepId: step.id,
      description: step.description,
      option: option,
      timestamp: Date.now() - this.startTime,
      timeFormatted: this.formatTime(Date.now() - this.startTime),
      item: step.item,
      action: step.action
    };
    gameData.steps.push(stepLog);
    
    // Update game score based on step completion
    this.updateScore(step, option);
  }
  
  // Format milliseconds to MM:SS format
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Update score based on step completion
  updateScore(step, option) {
    // Base points for completing a step
    let points = 10;
    
    // Check if step was done in correct order
    const expectedStepId = this.completedStepIds.length;
    if (step.id !== expectedStepId) {
      points -= 2; // Penalty for out of order
      this.mistakes.push({
        type: 'order',
        step: step.id,
        description: `Step completed out of order: ${step.description}`,
        expected: expectedStepId,
        actual: step.id
      });
    }
    
    // Check if correct quantities were used (if applicable)
    if (option && step.preferredOption && option !== step.preferredOption) {
      points -= 3; // Penalty for incorrect quantity
      this.mistakes.push({
        type: 'quantity',
        step: step.id,
        description: `Incorrect quantity used: ${option} instead of ${step.preferredOption}`,
        item: step.item
      });
    }
    
    // Add points to game score
    this.gameScore += points;
    
    // Log score update
    console.log(`Score updated: +${points} for step ${step.id}, total score: ${this.gameScore}`);
  }
  
  showFloatingText(x, y, message, color) {
    const text = this.add.text(x, y, message, {
      font: '16px Arial',
      fill: color,
      stroke: '#FFFFFF',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(5);
    
    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy()
    });
  }
  
  createSmokeEffect(x, y, tint = 0xDDDDDD, alpha = 0.6) {
    try {
      // Simple visual smoke effect using Phaser's default particle
      const particles = this.add.particles();
      
      // Use a circle shape for particles
      const circle = new Phaser.Geom.Circle(0, 0, 4);
      const emitter = particles.createEmitter({
        x: x,
        y: y,
        speed: { min: 20, max: 50 },
        angle: { min: -130, max: -50 },
        scale: { start: 0.3, end: 0.6 },
        alpha: { start: alpha, end: 0 },
        lifespan: 2000,
        gravityY: -30,
        quantity: 1,
        frequency: 100,
        blendMode: 'ADD',
        emitZone: { type: 'random', source: circle }
      });
      
      // Use graphics for particles
      const graphics = this.add.graphics();
      graphics.fillStyle(tint, 1);
      graphics.fillCircle(0, 0, 8);
      const texture = graphics.generateTexture('smoke-particle', 16, 16);
      graphics.destroy();
      
      emitter.setParticleTexture(texture);
      
      // Stop emission after a short time
      this.time.delayedCall(1500, () => {
        particles.destroy();
      });
    } catch (error) {
      console.error("Error creating smoke effect:", error);
      // Show feedback text even if particles fail
      this.showFloatingText(x, y - 20, "Sizzle...", '#ffffff');
    }
  }
  
  isRecipeComplete() {
    return this.steps.every(step => step.completed);
  }
  
  finishCooking() {
    // Stop timer
    const gameData = this.registry.get('gameData');
    const timeTaken = Date.now() - this.startTime;
    gameData.timeTaken = timeTaken;
    gameData.timeFormatted = this.formatTime(timeTaken);
    
    // Calculate final score based on various factors
    
    // Time bonus - if completed under expected time
    const expectedTimeMinutes = 5; // 5 minutes expected time for Aloo Bhujia
    const timeTakenMinutes = timeTaken / (1000 * 60);
    let timeBonus = 0;
    
    if (timeTakenMinutes < expectedTimeMinutes) {
      timeBonus = Math.floor((expectedTimeMinutes - timeTakenMinutes) * 5); // 5 points per minute saved
    }
    
    // Penalty for missing required ingredients
    const requiredIngredients = ['potato', 'oil', 'zeera', 'turmeric', 'salt', 'redChilli'];
    let missingIngredients = [];
    
    requiredIngredients.forEach(ingredient => {
      if (!gameData.ingredients[ingredient]) {
        missingIngredients.push(ingredient);
        this.gameScore -= 10; // 10 point penalty per missing ingredient
        this.mistakes.push({
          type: 'missing_ingredient',
          ingredient: ingredient,
          description: `Required ingredient not used: ${ingredient}`
        });
      }
    });
    
    // Add final time bonus
    this.gameScore += timeBonus;
    
    // Add detailed results to game data
    gameData.score = this.gameScore;
    gameData.timeBonus = timeBonus;
    gameData.mistakes = this.mistakes;
    gameData.missingIngredients = missingIngredients;
    
    // Create final JSON log for the cooking session
    const cookingLog = {
      dish: this.recipe.name,
      startTime: "00:00",
      endTime: gameData.timeFormatted,
      steps: gameData.steps,
      ingredients: gameData.ingredients,
      mistakes: this.mistakes,
      score: this.gameScore
    };
    
    // Save the cooking log
    gameData.cookingLog = cookingLog;
    console.log("Final cooking log:", cookingLog);
    
    // Show completion message
    this.showFloatingText(640, 480, `Recipe Complete! Score: ${this.gameScore}`, '#008000');
    
    // Wait before transitioning to results
    this.time.delayedCall(2000, () => {
      this.scene.start('ResultScene');
    });
  }

  getCurrentStep() {
    // Find the first uncompleted step
    return this.steps.find(step => !step.completed);
  }

  highlightCurrentStep() {
    // Clear any existing highlights
    this.checklist.forEach(item => {
      if (!item.completed) {
        item.text.setColor('#000000'); // Reset to black
      }
    });
    
    // Find the next uncompleted step
    const currentStep = this.getCurrentStep();
    if (currentStep) {
      const checklistItem = this.checklist[currentStep.id - 1];
      checklistItem.text.setColor('#0000FF'); // Highlight in blue
    }
  }

  // Special method for handling zeera (cumin) addition
  handleZeeraAddition(itemKey, quantity, step) {
    // Check if stove is hot and pan is on stove
    const gameData = this.registry.get('gameData');
    const stoveHeat = gameData.ingredients['stove_heat'] || '';
    
    // Get the proper spice name
    const spiceName = this.spiceMap[itemKey] || 'zeera';
    
    console.log(`Handling ${spiceName} addition with quantity ${quantity}`);
    
    // In debug mode, we'll warn but not prevent
    if (!this.panOnStove) {
      console.warn("Pan is not on stove yet for zeera addition!");
      this.showFloatingText(this.items[itemKey].x, this.items[itemKey].y, 
        'Warning: Pan should be on stove first (but allowing)', '#FFA500');
      
      // Still log the mistake
      this.mistakes.push({
        type: 'wrong_order',
        description: `Added ${spiceName} before placing pan on stove`,
        step: step.id
      });
    }
    
    if (!stoveHeat || stoveHeat === 'Off') {
      console.warn("Stove is not hot yet for zeera addition!");
      this.showFloatingText(this.items[itemKey].x, this.items[itemKey].y, 
        'Warning: Stove should be hot first (but allowing)', '#FFA500');
      
      // Still log the mistake
      this.mistakes.push({
        type: 'wrong_order',
        description: `Added ${spiceName} before turning on stove`,
        step: step.id
      });
    }
    
    if (!gameData.ingredients['oil']) {
      console.warn("Oil has not been added yet for zeera addition!");
      this.showFloatingText(this.items[itemKey].x, this.items[itemKey].y, 
        'Warning: Oil should be added first (but allowing)', '#FFA500');
      
      // Still log the mistake
      this.mistakes.push({
        type: 'wrong_order',
        description: `Added ${spiceName} before adding oil`,
        step: step.id
      });
    }
    
    // All conditions met - add zeera with crackling effect
    // Use the right position based on where the pan is
    const targetX = this.panOnStove ? 
      this.itemPositions.stove.x : 
      this.itemPositions.pan.x + this.itemPositions.pan.width/2;
      
    const targetY = this.panOnStove ? 
      this.itemPositions.stove.y - 30 : 
      this.itemPositions.pan.y + this.itemPositions.pan.height/4;
      
    this.createCrackleEffect(targetX, targetY);
    
    this.showFloatingText(this.items[itemKey].x, this.items[itemKey].y, 
      `Added ${quantity} of ${spiceName} - it's crackling!`, '#008000');
    
    // Complete step
    this.completeStep(step, quantity);
    
    // Add to game data
    gameData.ingredients[spiceName] = quantity;
    
    console.log(`${spiceName} added successfully with quantity ${quantity}`);
    
    return true;
  }
  
  // Create crackling effect for zeera
  createCrackleEffect(x, y) {
    try {
      // Crackling effect using particles
      const particles = this.add.particles();
      
      const emitter = particles.createEmitter({
        x: x,
        y: y,
        speed: { min: 30, max: 80 },
        scale: { start: 0.2, end: 0 },
        angle: { min: 0, max: 360 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 300, max: 600 },
        quantity: 2,
        frequency: 50,
        blendMode: 'ADD',
        tint: 0xFFAA00
      });
      
      // Create small dots for particles
      const graphics = this.add.graphics();
      graphics.fillStyle(0xFFAA00, 1);
      graphics.fillCircle(0, 0, 4);
      const texture = graphics.generateTexture('crackle-particle', 8, 8);
      graphics.destroy();
      
      emitter.setParticleTexture(texture);
      
      // Create sizzling sound effect
      // Note: We would add sound effect here if sound is implemented
      
      // Stop emission after a short time
      this.time.delayedCall(800, () => {
        particles.destroy();
      });
      
      // Make smoke appear after crackling
      this.time.delayedCall(600, () => {
        this.createSmokeEffect(x, y - 10);
      });
    } catch (error) {
      console.error("Error creating crackling effect:", error);
      this.showFloatingText(x, y - 20, "Crackle, crackle!", '#FFAA00');
    }
  }

  // Special method for oil options
  showOilOptions(oilItem, step) {
    // Define oil quantity options
    const options = ['1 tsp', '2 tsp', '1 tbsp', '2 tbsp'];
    
    console.log("Showing oil options dialog");
    
    // Show quantity selection dialog
    this.showOptions(oilItem.x, oilItem.y - 100, options, (option) => {
      console.log(`Selected oil quantity: ${option}`);
      
      // In debug mode, we'll warn but not prevent
      if (!this.panOnStove) {
        console.warn("Pan is not on stove yet!");
        this.showFloatingText(oilItem.x, oilItem.y, 
          'Warning: Pan should be on stove first (but allowing)', '#FFA500');
        
        // Still log the mistake
        this.mistakes.push({
          type: 'wrong_order',
          description: 'Added oil before placing pan on stove',
          step: step.id
        });
      }
      
      // Check if stove is hot (but allow it for debugging)
      const gameData = this.registry.get('gameData');
      const stoveHeat = gameData.ingredients['stove_heat'] || '';
      
      if (!stoveHeat || stoveHeat === 'Off') {
        console.warn("Stove is not hot yet!");
        this.showFloatingText(oilItem.x, oilItem.y, 
          'Warning: Stove should be hot first (but allowing)', '#FFA500');
        
        // Still log the mistake
        this.mistakes.push({
          type: 'wrong_order',
          description: 'Added oil before turning on stove',
          step: step.id
        });
      }
      
      // Visual effects for adding oil to pan
      const targetX = this.panOnStove ? 
        this.itemPositions.stove.x : 
        this.itemPositions.pan.x + this.itemPositions.pan.width/2;
      
      const targetY = this.panOnStove ? 
        this.itemPositions.stove.y - 20 : 
        this.itemPositions.pan.y + this.itemPositions.pan.height/4;
      
      this.createOilEffect(targetX, targetY);
      
      // Show feedback
      this.showFloatingText(oilItem.x, oilItem.y, `Added ${option} of oil to pan`, '#008000');
      
      // Complete step
      this.completeStep(step, option);
      
      // Add to game data
      gameData.ingredients['oil'] = option;
      
      console.log("Oil added successfully:", {
        quantity: option,
        panOnStove: this.panOnStove,
        stoveHeat: stoveHeat
      });
    });
  }
  
  // Create oil pouring effect
  createOilEffect(x, y) {
    try {
      // Create oil droplet particles
      const particles = this.add.particles();
      
      const emitter = particles.createEmitter({
        x: x,
        y: y - 40, // Start from above
        speed: { min: 100, max: 150 },
        angle: { min: 80, max: 100 }, // Mostly downward
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: { min: 600, max: 800 },
        quantity: 2,
        frequency: 50,
        blendMode: 'ADD',
        tint: 0xFFFF00 // Yellow tint for oil
      });
      
      // Create droplet particles
      const graphics = this.add.graphics();
      graphics.fillStyle(0xFFFF00, 1);
      graphics.fillCircle(0, 0, 4);
      const texture = graphics.generateTexture('oil-droplet', 8, 8);
      graphics.destroy();
      
      emitter.setParticleTexture(texture);
      
      // Stop emission after a short time
      this.time.delayedCall(800, () => {
        particles.destroy();
      });
      
      // Create slight sizzle effect after oil is added
      this.time.delayedCall(400, () => {
        this.createSmokeEffect(x, y - 10, 0xCCCCCC, 0.3); // Light gray smoke
      });
    } catch (error) {
      console.error("Error creating oil effect:", error);
      this.showFloatingText(x, y - 20, "Oil added!", '#FFFF00');
    }
  }

  // Debug method to visualize interactive areas
  updateDebugVisualization() {
    // Clear previous debug graphics
    this.debugGraphics.clear();
    
    if (!this.showInteractiveAreas) return;
    
    // Set style for interactive areas
    this.debugGraphics.lineStyle(2, 0x00ff00, 1);
    
    // Draw rectangles around all interactive items
    Object.keys(this.items).forEach(key => {
      const item = this.items[key];
      if (item && item.input && item.input.enabled) {
        // Calculate the hitbox size based on the sprite
        const bounds = item.getBounds();
        
        // Draw rectangle around interactive area
        this.debugGraphics.strokeRect(
          bounds.x, bounds.y, 
          bounds.width, bounds.height
        );
        
        // Add item name for clarity - center it above the sprite
        if (!this.debugTexts) this.debugTexts = {};
        
        if (!this.debugTexts[key]) {
          this.debugTexts[key] = this.add.text(
            bounds.x + bounds.width/2, 
            bounds.y - 5, 
            key, 
            { 
              font: '14px Arial', 
              fill: '#FF0000',
              backgroundColor: '#FFFFFF80',
              padding: { x: 3, y: 1 }
            }
          )
          .setOrigin(0.5, 1) // Center horizontally, align bottom
          .setDepth(10);
        } else {
          this.debugTexts[key]
            .setPosition(bounds.x + bounds.width/2, bounds.y - 5)
            .setVisible(true);
        }
      } else if (this.debugTexts && this.debugTexts[key]) {
        // Hide text for non-interactive items
        this.debugTexts[key].setVisible(false);
      }
    });
  }
  
  // Helper to add info text to screen
  addDebugInfoText() {
    const text = this.add.text(10, 10, 
      'Press "D" to toggle interactive areas visualization', 
      { font: '16px Arial', fill: '#FFFFFF', backgroundColor: '#000000', padding: {x: 5, y: 5} }
    ).setDepth(100);
    
    // Auto-hide after 5 seconds
    this.time.delayedCall(5000, () => {
      text.destroy();
    });
  }
}

export default GameScene; 