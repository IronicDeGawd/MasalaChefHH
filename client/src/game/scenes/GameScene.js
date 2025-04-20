import Phaser from "phaser";
import recipes from "../data/recipes";

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.currentStep = 0;
    this.startTime = null;
    this.items = {};
    this.coordinateText = null; // Add coordinate text reference
    this.itemPositions = {
      // Ingredients from Figma layout
      potato: { x: 694, y: 431, width: 60, height: 60 },
      "potato-peeled": { x: 172, y: 480, width: 60, height: 60 },
      "potato-diced": { x: 240, y: 486, width: 80, height: 64 }, // Updated from Figma
      "potato-cooked": { x: 512, y: 651, width: 80, height: 64 }, // Updated from Figma (potato cooking on pan)
      onion: { x: 654, y: 431, width: 60, height: 60 },

      // Spice containers on shelf
      container1: { x: 280, y: 327, width: 44, height: 63 }, // Turmeric/Haldi
      container2: { x: 318, y: 327, width: 44, height: 63 }, // Red Chilli
      "container-big": { x: 362, y: 324, width: 44, height: 66 }, // Zeera/Cumin
      salt: { x: 412, y: 315, width: 59, height: 76 },
      oil: { x: 477, y: 266, width: 44, height: 125 },

      // Kitchen equipment
      choppingBoard: { x: 87, y: 435, width: 286, height: 190 },
      stove: { x: 318, y: 591, width: 470, height: 301 },
      pan: { x: 40, y: 652, width: 300, height: 180 },
      "pan-on-stove": { x: 424, y: 566, width: 366, height: 219 }, // New position from Figma
      woodenSpoon: { x: 483, y: 510, width: 124, height: 66 },
      mixingSpoon: { x: 373, y: 466, width: 188, height: 100 },

      // UI elements
      basket: { x: 607, y: 407, width: 200, height: 200 },
      recipeBook: { x: 788, y: 629, width: 189, height: 202 },
      recipeMenu: { x: 909, y: 215, width: 350, height: 517 },
      shelf: { x: 242, y: 330, width: 310, height: 144 },
    };

    // Mapping from container sprites to spice names
    this.spiceMap = {
      container1: "turmeric",
      container2: "redChilli",
      "container-big": "zeera",
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

    // Initialize cursor variables
    this.handCursor = null;
    this.cursorListenerActive = false;
  }

  create() {
    // Get game data from registry or initialize it
    let gameData = this.registry.get("gameData");
    if (!gameData) {
      gameData = {
        selectedRecipe: "alooBhujia",
        ingredients: {},
        steps: [],
        startTime: Date.now(),
      };
      this.registry.set("gameData", gameData);
    }

    // Reset game state variables
    this.currentStep = 0;
    this.completedStepIds = [];
    this.items = {};
    this.actionInProgress = false;
    this.panOnStove = false;

    // Ensure ingredients object exists
    if (!gameData.ingredients) {
      gameData.ingredients = {};
    } else {
      // Reset ingredients for a fresh start
      gameData.ingredients = {};
    }

    // Ensure steps array exists
    if (!gameData.steps) {
      gameData.steps = [];
    } else {
      // Clear previous steps for a fresh start
      gameData.steps = [];
    }

    // Check if all required textures are loaded
    this.checkRequiredTextures();

    // Reset handCursor to ensure it's created on restart
    this.handCursor = null;
    this.cursorListenerActive = false;

    // Add scene event handler for shutdown/restart
    this.events.on("shutdown", this.shutdown, this);

    // Make sure handCursor texture is loaded
    if (!this.textures.exists("handCursor")) {
      console.log("handCursor texture not found, loading it directly...");
      this.load.image("handCursor", "assets/player.png");
      this.load.once("complete", () => {
        console.log("handCursor loaded successfully");
        // Set up hand cursor now that the texture is loaded
        this.setHandCursor();
      });
      this.load.start();
    } else {
      // If texture already exists, set up cursor directly
      this.setHandCursor();
    }

    this.recipe = recipes[gameData.selectedRecipe];
    this.steps = this.recipe.steps;

    // Make sure steps are reset to uncompleted state when restarting
    this.steps.forEach((step) => {
      step.completed = false;
      if (step.selectedOption) delete step.selectedOption;
    });

    // Start timer
    this.startTime = Date.now();
    gameData.startTime = this.startTime;

    // Log asset keys for debugging
    console.log("Available texture keys:", this.textures.getTextureKeys());

    // Debug flag - set to true to show interactive areas
    this.showInteractiveAreas = false;
    this.debugGraphics = this.add.graphics();

    // Add key listener for debug toggle
    this.input.keyboard.on("keydown-D", () => {
      this.showInteractiveAreas = !this.showInteractiveAreas;
      console.log(
        `Debug visualization ${
          this.showInteractiveAreas ? "enabled" : "disabled"
        }`
      );
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
    console.log("Game scene initialized with recipe:", this.recipe.name);
    console.log("Player should click on basket to start the cooking process");
    console.log('Press "D" key to toggle visualization of interactive areas');

    // Create the coordinate display text in the top right corner
    this.coordinateText = this.add
      .text(this.cameras.main.width - 10, 10, "X: 0, Y: 0", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(999);

    // Add pointer move listener
    this.input.on("pointermove", (pointer) => {
      this.updateCoordinateDisplay(pointer);
    });
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
    this.add.image(640, 480, "background").setDepth(0);

    // Mid-layer elements (using updated Figma coordinates)
    this.add.image(640, 474 + 308 / 2, "mid").setDepth(1);

    // Front layer elements (using updated Figma coordinates)
    this.add.image(640, 669 + 291 / 2, "front").setDepth(2);
  }

  setupKitchenItems() {
    // Create kitchen items like pans, knives, ingredients, etc.
    // Logic to create all kitchen items
    console.log("Setting up kitchen items...");

    // Add kitchen equipment from Figma layout
    const setupItem = (key, interactable = true, depth = 1) => {
      const pos = this.itemPositions[key];

      if (!pos) {
        console.error(`Position for ${key} not defined!`);
        return null;
      }

      // Check if item already exists to prevent duplicates
      if (this.items[key]) {
        console.warn(
          `Item ${key} already exists! Skipping duplicate creation.`
        );
        return this.items[key];
      }

      console.log(
        `Creating item: ${key} at position (${pos.x + pos.width / 2}, ${
          pos.y + pos.height / 2
        })`
      );

      const x = pos.x + pos.width / 2;
      const y = pos.y + pos.height / 2;

      // Create the sprite
      const sprite = this.add.image(x, y, key).setDepth(depth);

      // Set different origin points based on the item type for better interaction
      if (key === "mixingSpoon" || key === "woodenSpoon") {
        // For spoons, set origin to handle part so clicking the middle works better
        // 0.5, 0.3 makes the clickable center closer to the spoon's head
        sprite.setOrigin(0.5, 0.3);

        // If the sprite is interactive, set a much larger hit area centered on the spoon
        if (interactable) {
          sprite.setInteractive({
            useHandCursor: true,
            pixelPerfect: false,
            hitArea: new Phaser.Geom.Rectangle(
              -pos.width / 2,
              -pos.height / 2,
              pos.width * 2,
              pos.height * 2
            ),
          });
          console.log(`Set extra large hit area for ${key}`);
        }
      } else if (
        key === "potato" ||
        key === "potato-peeled" ||
        key === "potato-diced"
      ) {
        // Center potatoes properly
        sprite.setOrigin(0.5);

        // Make it interactive if needed
        if (interactable) {
          sprite.setInteractive({ useHandCursor: true, pixelPerfect: false });
        }
      } else {
        // Default center origin for other items
        sprite.setOrigin(0.5);

        // Make it interactive if needed
        if (interactable) {
          sprite.setInteractive({ useHandCursor: true, pixelPerfect: false });
        }
      }

      // Set hand cursor for all interactive items
      if (interactable) {
        this.setHandCursor(sprite);
      }

      // Store reference
      this.items[key] = sprite;
      return sprite;
    };

    // Set up kitchen equipment first
    const stove = setupItem("stove", true, 3); // Increased from 0 to 3

    // Make stove's hit area larger for easier interaction
    if (stove && stove.input) {
      const pos = this.itemPositions["stove"];
      stove.input.hitArea.setTo(-30, -30, pos.width + 60, pos.height + 60);
      console.log("Set larger hit area for stove");
    }

    const choppingBoard = setupItem("choppingBoard", true, 3); // Increased from 0 to 3

    // Pan initially not on stove
    const pan = setupItem("pan", true, 4); // Increased from 1 to 4
    this.panOnStove = false;

    // Set up interactive spoons/utensils
    const woodenSpoon = setupItem("woodenSpoon", true, 5); // Increased from 2 to 5
    const mixingSpoon = setupItem("mixingSpoon", true, 5); // Increased from 2 to 5

    // Add debug information about the mixing spoon
    console.log("Mixing spoon details:", {
      created: !!mixingSpoon,
      position: mixingSpoon ? { x: mixingSpoon.x, y: mixingSpoon.y } : null,
      interactive: mixingSpoon ? !!mixingSpoon.input : false,
      visible: mixingSpoon ? mixingSpoon.visible : false,
      textureKey: mixingSpoon ? mixingSpoon.texture.key : null,
      hitArea:
        mixingSpoon && mixingSpoon.input ? mixingSpoon.input.hitArea : null,
    });

    // Make the mixing spoon's hit area larger for easier interaction
    if (mixingSpoon && mixingSpoon.input) {
      const pos = this.itemPositions["mixingSpoon"];
      mixingSpoon.input.hitArea.setTo(
        -30,
        -30,
        pos.width + 60,
        pos.height + 60
      );
      console.log("Set larger hit area for mixing spoon");
    }

    // Adding click handler for wooden spoon
    if (woodenSpoon) {
      woodenSpoon.on("pointerdown", () => {
        const relevantStep = this.getCurrentStep();
        console.log("Wooden spoon clicked, current step:", relevantStep);
        if (
          relevantStep &&
          relevantStep.action === "cook" &&
          relevantStep.id !== 13 && // Skip the final cooking step - user must click pan
          !this.actionInProgress
        ) {
          if (relevantStep.action === "cook") {
            this.showCookingOptions(woodenSpoon, relevantStep);
          }
        } else if (
          relevantStep &&
          relevantStep.id === 13 &&
          relevantStep.action === "cook"
        ) {
          // Guide user to click on the pan for the final step
          this.showFloatingText(
            woodenSpoon.x,
            woodenSpoon.y,
            "For the final cooking step, click on the pan!",
            "#FFA500" // Orange color for guidance
          );
        } else if (!this.actionInProgress) {
          this.showFloatingText(
            woodenSpoon.x,
            woodenSpoon.y,
            "Not yet time for this step!",
            "#FF0000"
          );
        }
      });
    } else {
      console.error("Failed to create wooden spoon!");
    }

    // Adding click handler for mixing spoon, similar to wooden spoon
    if (mixingSpoon) {
      mixingSpoon.on("pointerdown", () => {
        const relevantStep = this.getCurrentStep();
        console.log("Mixing spoon clicked, current step:", relevantStep);
        if (
          relevantStep &&
          (relevantStep.action === "mix" || relevantStep.action === "stir") &&
          relevantStep.id !== 13 && // Skip the final cooking step - user must click pan
          !this.actionInProgress
        ) {
          this.showSpoonOptions(mixingSpoon, relevantStep, relevantStep.action);
        } else if (
          relevantStep &&
          relevantStep.id === 13 &&
          relevantStep.action === "cook"
        ) {
          // Guide user to click on the pan for the final step
          this.showFloatingText(
            mixingSpoon.x,
            mixingSpoon.y,
            "For the final cooking step, click on the pan!",
            "#FFA500" // Orange color for guidance
          );
        } else if (!this.actionInProgress) {
          this.showFloatingText(
            mixingSpoon.x,
            mixingSpoon.y,
            "Not yet time for this step!",
            "#FF0000"
          );
        }
      });
    } else {
      console.error("Failed to create mixing spoon!");
    }

    // Create interactive kitchen items
    Object.keys(this.itemPositions).forEach((key) => {
      const pos = this.itemPositions[key];

      // Skip UI elements that are handled elsewhere
      if (key === "recipeMenu") return;

      // Skip creating potato-diced initially (it will be created when chopped)
      if (key === "potato-diced") return;

      // Skip creating potato-peeled initially (it will be created after peeling)
      if (key === "potato-peeled") return;

      // Skip pan-on-stove position as it's just a reference
      if (key === "pan-on-stove") return;

      // Skip items that are already created directly
      if (
        key === "woodenSpoon" ||
        key === "mixingSpoon" ||
        key === "pan" ||
        key === "stove" ||
        key === "choppingBoard"
      )
        return;

      // Special case for cooked potato - initially hidden
      if (key === "potato-cooked") {
        const item = this.add
          .image(pos.x + pos.width / 2, pos.y + pos.height / 2, key)
          .setDepth(6) // Increased from 3 to 6
          .setVisible(false);
        this.items[key] = item;
        return;
      }

      // Add a visible potato to the basket using exact Figma coordinates
      if (key === "potato") {
        // Try using 'potato' or 'potato-raw' as the texture key
        const textureKey = this.textures.exists("potato")
          ? "potato"
          : this.textures.exists("potato-raw")
          ? "potato-raw"
          : "potato";

        console.log(`Using potato texture key: ${textureKey}`);

        // Use exact Figma coordinates
        const item = this.add
          .image(pos.x + pos.width / 2, pos.y + pos.height / 2, textureKey)
          .setInteractive({ useHandCursor: true, pixelPerfect: false })
          .setDepth(5); // Increased depth to be above other sprites (was 3)

        // Make hitbox larger for easier interaction
        item.input.hitArea.setTo(-30, -30, pos.width + 60, pos.height + 60);

        // Add click handler directly to the potato instead of the basket
        item.on("pointerdown", () => {
          // Only allow at the beginning of the recipe
          const relevantStep = this.getCurrentStep();
          console.log("Potato clicked - checking step:", relevantStep);
          if (
            relevantStep &&
            (relevantStep.item === "potato-raw" ||
              relevantStep.item === "potato") &&
            !this.actionInProgress
          ) {
            console.log("Potato clicked - should add potato to chopping board");

            // Define position for potato on chopping board using Figma coordinates
            const potatoPeeledPos = this.itemPositions["potato-peeled"];
            const chopBoardX = potatoPeeledPos.x + potatoPeeledPos.width / 2;
            const chopBoardY = potatoPeeledPos.y + potatoPeeledPos.height / 2;

            // Check if potato is already on the chopping board
            if (this.items["potato-on-board"]) {
              this.showFloatingText(
                item.x,
                item.y,
                "Potato already selected!",
                "#FFA500"
              );
              return;
            }

            // Move the potato from basket to chopping board with animation
            this.actionInProgress = true;

            // Tween the potato from basket to chopping board
            this.tweens.add({
              targets: item,
              x: chopBoardX,
              y: chopBoardY,
              duration: 500,
              onComplete: () => {
                // After animation completes, rename it to potato-on-board to distinguish from the basket potato
                const potatoOnBoard = item;
                this.items["potato-on-board"] = potatoOnBoard;

                // Determine the correct texture key to use
                const textureKey = this.textures.exists("potato")
                  ? "potato"
                  : this.textures.exists("potato-raw")
                  ? "potato-raw"
                  : "potato";

                // Create a new potato in the basket using Figma coordinates
                const potatoPos = this.itemPositions["potato"];
                const newBasketPotato = this.add
                  .image(
                    potatoPos.x + potatoPos.width / 2,
                    potatoPos.y + potatoPos.height / 2,
                    textureKey
                  )
                  .setInteractive({ useHandCursor: true, pixelPerfect: false })
                  .setDepth(5); // Keep the same depth for consistency

                // Add the same click handler to the new potato
                newBasketPotato.on("pointerdown", () => {
                  // Check the current step before proceeding
                  const currentStep = this.getCurrentStep();
                  console.log(
                    "New basket potato clicked - checking step:",
                    currentStep
                  );

                  if (
                    currentStep &&
                    (currentStep.item === "potato-raw" ||
                      currentStep.item === "potato") &&
                    !this.actionInProgress
                  ) {
                    // If it's the correct time for potato interaction, delegate to the original handler
                    item.emit("pointerdown");
                  } else if (!this.actionInProgress) {
                    this.showFloatingText(
                      newBasketPotato.x,
                      newBasketPotato.y,
                      "Not yet time for this step!",
                      "#FF0000"
                    );
                  } else {
                    this.showFloatingText(
                      newBasketPotato.x,
                      newBasketPotato.y,
                      "Action in progress...",
                      "#FFA500"
                    );
                  }
                });

                // Make hitbox larger for easier interaction
                newBasketPotato.input.hitArea.setTo(
                  -30,
                  -30,
                  pos.width + 60,
                  pos.height + 60
                );

                // Log creation of new basket potato
                console.log("Created new potato in basket at position:", {
                  x: potatoPos.x + potatoPos.width / 2,
                  y: potatoPos.y + potatoPos.height / 2,
                });

                // Update the basket potato reference
                this.items["potato"] = newBasketPotato;

                // Add click handler to the potato on the chopping board
                potatoOnBoard.off("pointerdown"); // Remove old handlers if any
                potatoOnBoard.on("pointerdown", () => {
                  console.log("Potato clicked on chopping board");
                  const currentStep = this.getCurrentStep();
                  if (
                    currentStep &&
                    (currentStep.item === "potato-raw" ||
                      currentStep.item === "potato") &&
                    !this.actionInProgress
                  ) {
                    // Show options dialog for washing/peeling
                    this.showPrepOptions(potatoOnBoard, currentStep);
                  } else if (!this.actionInProgress) {
                    this.showFloatingText(
                      potatoOnBoard.x,
                      potatoOnBoard.y,
                      "Not yet time for this step!",
                      "#FF0000"
                    );
                  }
                });

                this.showFloatingText(
                  potatoOnBoard.x,
                  potatoOnBoard.y,
                  "Potato placed on chopping board!",
                  "#008000"
                );
                this.actionInProgress = false;
              },
            });
          } else if (this.actionInProgress) {
            this.showFloatingText(
              item.x,
              item.y,
              "Action in progress...",
              "#FFA500"
            );
          } else {
            this.showFloatingText(
              item.x,
              item.y,
              "Not yet time for this step!",
              "#FF0000"
            );
          }
        });

        // Log the item status
        console.log(`Created potato in basket at position:`, {
          x: pos.x + pos.width / 2,
          y: pos.y + pos.height / 2,
        });

        this.items[key] = item;
        return;
      }

      // Add items with exact positions from Figma without resizing
      const item = this.add
        .image(pos.x + pos.width / 2, pos.y + pos.height / 2, key)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      // Special case for pan initially if not on stove
      if (key === "pan" && !this.panOnStove) {
        // Keep it in the Figma position as intended
      }

      // Adjust depth for specific items
      if (key === "basket") {
        item.setDepth(1); // Ensure basket is below other items
      }

      if (key === "choppingBoard") {
        item.setDepth(1); // Ensure chopping board is below other items
      }

      // Add click handlers based on item type
      if (key === "stove") {
        item.on("pointerdown", () => {
          // Only allow if this is the current step
          const relevantStep = this.getCurrentStep();
          if (
            relevantStep &&
            relevantStep.item === "stove" &&
            !this.actionInProgress
          ) {
            this.showStoveOptions(item);
          } else if (!this.actionInProgress) {
            this.showFloatingText(
              item.x,
              item.y,
              "Not yet time for this step!",
              "#FF0000"
            );
          }
        });
      } else if (key === "recipeBook") {
        item.on("pointerdown", () => {
          // Toggle recipe menu visibility
          const isVisible = this.checklistElements.panel.visible ? false : true;

          console.log(
            "Recipe book clicked, toggling menu visibility to:",
            isVisible
          );

          // Toggle checklist elements visibility
          this.checklistElements.panel.setVisible(isVisible);
          this.checklistElements.title.setVisible(isVisible);

          // Toggle checklist items visibility and make sure they are positioned correctly
          this.checklist.forEach((item) => {
            item.text.setVisible(isVisible);
            item.checkbox.setVisible(isVisible);
          });

          // Visual feedback for recipe book click
          this.showFloatingText(
            item.x,
            item.y,
            isVisible ? "Recipe opened!" : "Recipe closed",
            "#008000"
          );
        });
      } else if (
        key === "container1" ||
        key === "container2" ||
        key === "container-big"
      ) {
        // Spice containers (turmeric, red chilli, zeera)
        item.on("pointerdown", () => {
          // Get the spice name from the map
          const spiceName = this.spiceMap[key];
          console.log(`Clicked ${key} which contains ${spiceName}`);

          // Add a more permissive check - allow interaction more freely for debugging
          const relevantStep = this.getCurrentStep();
          console.log("Current step:", relevantStep);

          // Make interaction more permissive for now
          if (!this.actionInProgress) {
            // Show options for adding this spice
            this.showSpiceOptions(
              item,
              key,
              relevantStep || {
                id: 999,
                item: spiceName,
                description: `Add ${spiceName}`,
              },
              spiceName
            );

            // Log that this interaction happened
            console.log(`Showing options for ${spiceName} from ${key}`);
          } else {
            this.showFloatingText(
              item.x,
              item.y,
              "Action in progress...",
              "#FFA500"
            );
          }
        });
      } else if (key === "salt") {
        // Salt container
        item.on("pointerdown", () => {
          console.log("Salt container clicked");
          // Only allow if this is the current step
          const relevantStep = this.getCurrentStep();

          // Make interaction more permissive for now
          if (!this.actionInProgress) {
            this.showSpiceOptions(
              item,
              key,
              relevantStep || {
                id: 999,
                item: "salt",
                description: "Add salt",
              }
            );

            console.log(`Showing options for salt`);
          } else {
            this.showFloatingText(
              item.x,
              item.y,
              "Action in progress...",
              "#FFA500"
            );
          }
        });
      } else if (key === "oil") {
        // Oil container
        item.on("pointerdown", () => {
          console.log("Oil container clicked");
          // Only allow if this is the current step
          const relevantStep = this.getCurrentStep();

          // Make interaction more permissive for now
          if (!this.actionInProgress) {
            // Show oil-specific options
            this.showOilOptions(
              item,
              relevantStep || {
                id: 999,
                item: "oil",
                description: "Add oil",
              }
            );

            console.log(`Showing options for oil`);
          } else {
            this.showFloatingText(
              item.x,
              item.y,
              "Action in progress...",
              "#FFA500"
            );
          }
        });
      }

      this.items[key] = item;
    });

    // Setup heat indicator for stove with enhanced styling
    const stovePos = this.itemPositions.stove;
    this.stoveHeat = this.add
      .container(
        stovePos.x + stovePos.width / 2,
        stovePos.y + stovePos.height - 30
      )
      .setDepth(8)
      .setVisible(false); // Increase depth to 8 to ensure visibility

    // Background panel for heat indicator
    const heatPanel = this.add.graphics();
    heatPanel.fillStyle(0x000000, 0.7);
    heatPanel.fillRoundedRect(-50, -15, 100, 30, 10);
    heatPanel.lineStyle(2, 0xff6600, 1);
    heatPanel.strokeRoundedRect(-50, -15, 100, 30, 10);

    // Heat text
    const heatText = this.add
      .text(0, 0, "Heat: Off", {
        // Set default text
        font: "16px Arial",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5);

    this.stoveHeat.add(heatPanel);
    this.stoveHeat.add(heatText);

    // Store reference to text for updates
    this.stoveHeatText = heatText;

    // Set up interactions for all items
    this.setupInteractions();
  }

  createItemPositions() {
    // Convert the absolute Figma positions to relative screen percentages
    const width = this.scale.width;
    const height = this.scale.height;
    const positions = {};

    // For each item in our fixed positions, calculate the relative position
    Object.keys(this.itemPositions).forEach((key) => {
      const pos = this.itemPositions[key];
      positions[key] = {
        x: ((pos.x + pos.width / 2) / 1280) * width,
        y: ((pos.y + pos.height / 2) / 960) * height,
        width: (pos.width / 1280) * width,
        height: (pos.height / 960) * height,
      };
    });

    return positions;
  }

  setupInteractions() {
    // Handle other kitchen interactions

    // Note: The basket click handler is removed since we moved it to the potato directly

    // Handle chopping board interactions
    if (this.items["choppingBoard"]) {
      this.items["choppingBoard"].on("pointerdown", () => {
        console.log("Chopping board clicked");

        // If potato is on chopping board and visible, delegate click to potato
        if (
          this.items["potato-on-board"] &&
          this.items["potato-on-board"].visible &&
          !this.actionInProgress
        ) {
          console.log("Redirecting click to potato on board");
          this.items["potato-on-board"].emit("pointerdown");
          return;
        }

        // Check if we have a peeled potato to chop
        if (
          this.items["potato-peeled"] &&
          this.items["potato-peeled"].visible &&
          !this.actionInProgress
        ) {
          const relevantStep = this.getCurrentStep();
          if (
            relevantStep &&
            relevantStep.item === "potato-peeled" &&
            relevantStep.action === "chop"
          ) {
            this.showChoppingOptions(this.items["choppingBoard"], relevantStep);
          } else if (!this.actionInProgress) {
            this.showFloatingText(
              this.items["choppingBoard"].x,
              this.items["choppingBoard"].y,
              "Not yet time for this step!",
              "#FF0000"
            );
          }
        } else {
          this.showFloatingText(
            this.items["choppingBoard"].x,
            this.items["choppingBoard"].y,
            "Nothing to chop here!",
            "#FFA500"
          );
        }
      });
    }

    // Handle pan interactions
    if (this.items["pan"]) {
      this.items["pan"].on("pointerdown", () => {
        const relevantStep = this.getCurrentStep();
        if (
          relevantStep &&
          relevantStep.item === "pan" &&
          relevantStep.action === "place" &&
          !this.actionInProgress
        ) {
          this.showPanOptions(this.items["pan"], relevantStep);
        } else if (
          relevantStep &&
          relevantStep.id === 13 && // Final cooking step
          relevantStep.action === "cook" &&
          !this.actionInProgress
        ) {
          // For the final step, allow clicking on the pan instead of the mixing spoon
          console.log("Pan clicked for final cooking step");
          this.showCookingOptionsFromPan(this.items["pan"], relevantStep);
        } else if (!this.actionInProgress) {
          // Show guidance if they're trying to skip step 12 (mixing step)
          const nextExpectedStepId = this.completedStepIds.length + 1;
          if (nextExpectedStepId === 12) {
            this.showFloatingText(
              this.items["pan"].x,
              this.items["pan"].y,
              "You need to mix the ingredients first with the mixing spoon!",
              "#FFA500" // Orange color for guidance
            );
          } else {
            this.showFloatingText(
              this.items["pan"].x,
              this.items["pan"].y,
              "Not yet time for this step!",
              "#FF0000"
            );
          }
        }
      });
    }

    // Handle stove interactions
    if (this.items["stove"]) {
      this.items["stove"].on("pointerdown", () => {
        const relevantStep = this.getCurrentStep();
        if (
          relevantStep &&
          relevantStep.item === "stove" &&
          relevantStep.action === "heat" &&
          !this.actionInProgress
        ) {
          console.log("Stove clicked for heat step");
          this.showStoveOptions(this.items["stove"]);
        } else if (!this.actionInProgress) {
          this.showFloatingText(
            this.items["stove"].x,
            this.items["stove"].y,
            "Not yet time for this step!",
            "#FF0000"
          );
        }
      });
    }

    // Log recipe flow for debugging
    console.log("Recipe flow: ", {
      steps: this.steps,
      recipe: this.recipe.name,
    });
  }

  setupRecipeChecklist() {
    // Create a more aesthetically pleasing background panel with wood texture
    const checklistPanel = this.add.graphics();
    checklistPanel.fillStyle(0xc19a6b, 0.95); // Light brown (wood-like) color
    checklistPanel.fillRoundedRect(885, 170, 350, 600, 16);
    checklistPanel.lineStyle(4, 0x8b4513, 1);
    checklistPanel.strokeRoundedRect(885, 170, 350, 600, 16);

    // Add wood grain effect (decorative lines)
    checklistPanel.lineStyle(1, 0x8b4513, 0.3);
    for (let i = 0; i < 20; i++) {
      checklistPanel.lineBetween(885, 190 + i * 30, 1235, 190 + i * 30);
    }

    checklistPanel.setDepth(4).setVisible(false);

    // Add recipe title with improved styling
    const recipeTitle = this.add
      .text(1060, 205, this.recipe.name, {
        font: "bold 32px Arial",
        fill: "#4b2504", // Darker brown for better contrast
        align: "center",
        stroke: "#ffecd0", // Light cream outline
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5)
      .setVisible(false);

    // Add decorative spoon icon at the top of the recipe
    if (this.textures.exists("woodenSpoon")) {
      const spoonIcon = this.add
        .image(910, 205, "woodenSpoon")
        .setOrigin(0.5)
        .setScale(0.2)
        .setRotation(-0.5)
        .setDepth(5)
        .setVisible(false);

      // Store reference
      this.recipeTitleIcon = spoonIcon;
    }

    // Add recipe steps with increased spacing to avoid overlap
    this.checklist = this.steps.map((step, index) => {
      const y = 250 + index * 38; // Adjusted spacing

      // Checkbox with improved styling
      const checkbox = this.add.graphics();
      checkbox.lineStyle(2, 0x4b2504, 1);
      checkbox.strokeRect(905 - 10, y - 10, 20, 20);
      checkbox.setDepth(5).setVisible(false);

      // Step number and description with smaller font and better wrapping
      const text = this.add
        .text(925, y, `${index + 1}. ${step.description}`, {
          font: "16px Arial",
          fill: "#000000",
          align: "left",
          wordWrap: { width: 280 },
        })
        .setOrigin(0, 0.5)
        .setDepth(5)
        .setVisible(false);

      return { text, checkbox, completed: false };
    });

    // Highlight the first step
    if (this.checklist.length > 0) {
      this.checklist[0].text.setColor("#0000FF");
    }

    // Store references to control visibility
    this.checklistElements = {
      panel: checklistPanel,
      title: recipeTitle,
    };

    console.log("Recipe checklist setup complete");
  }

  createUI() {
    // Add timer
    this.timerText = this.add
      .text(640, 50, "Time: 00:00", {
        font: "24px Arial",
        fill: "#FFFFFF",
        backgroundColor: "#000000",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(4);

    // Add back button
    const backButton = this.add
      .rectangle(120, 80, 150, 60, 0x8b4513)
      .setInteractive()
      .setDepth(4)
      .on("pointerdown", () => {
        this.scene.start("MenuScene");
      });

    this.add
      .text(120, 80, "Back", {
        font: "20px Arial",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5)
      .setDepth(4);

    // Add debug button for mobile users
    const debugButton = this.add
      .rectangle(1200, 80, 150, 60, 0x004488)
      .setInteractive()
      .setDepth(4)
      .on("pointerdown", () => {
        this.showInteractiveAreas = !this.showInteractiveAreas;
        console.log(
          `Debug visualization ${
            this.showInteractiveAreas ? "enabled" : "disabled"
          }`
        );
        this.updateDebugVisualization();

        // Change button color based on state
        debugButton.fillColor = this.showInteractiveAreas ? 0x00aa00 : 0x004488;

        // Handle visibility of debug texts
        if (this.debugTexts) {
          Object.values(this.debugTexts).forEach((text) => {
            text.setVisible(this.showInteractiveAreas);
          });
        }
      });

    this.add
      .text(1200, 80, "Debug", {
        font: "20px Arial",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5)
      .setDepth(4);

    // Add finishCooking debug button
    const finishCookingButton = this.add
      .rectangle(1200, 160, 200, 60, 0xff0000)
      .setInteractive()
      .setDepth(4)
      .on("pointerdown", () => {
        console.log("Debug: Triggering finishCooking method");
        this.finishCooking();
      });

    this.add
      .text(1200, 160, "Test Final Animation", {
        font: "16px Arial",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5)
      .setDepth(4);

    // Add key listener for debug toggle
    this.input.keyboard.on("keydown-D", () => {
      this.showInteractiveAreas = !this.showInteractiveAreas;
      console.log(
        `Debug visualization ${
          this.showInteractiveAreas ? "enabled" : "disabled"
        }`
      );
      this.updateDebugVisualization();

      // Change button color based on state
      debugButton.fillColor = this.showInteractiveAreas ? 0x00aa00 : 0x004488;

      // Handle visibility of debug texts
      if (this.debugTexts) {
        Object.values(this.debugTexts).forEach((text) => {
          text.setVisible(this.showInteractiveAreas);
        });
      }
    });
  }

  setHandCursor(sprite) {
    this.input.setDefaultCursor("none");
    if (sprite) {
      // Set cursor for specific sprite
      sprite.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
      });

      sprite.on("pointerout", () => {
        this.input.setDefaultCursor("default");
      });
    } else {
      // Set global cursor as before (legacy behavior)
      this.input.setDefaultCursor("none");

      // Create custom hand cursor with increased size if it doesn't exist yet
      if (!this.handCursor) {
        console.log("Creating hand cursor...");
        // Ensure the texture exists before creating the cursor
        if (this.textures.exists("handCursor")) {
          try {
            this.handCursor = this.add
              .image(0, 0, "handCursor")
              .setScale(0.5)
              .setOrigin(0.1, 0.1)
              .setDepth(12);

            console.log("Hand cursor created successfully");
          } catch (error) {
            console.error("Error creating hand cursor:", error);
            // Fall back to default cursor
            this.input.setDefaultCursor("default");
          }
        } else {
          console.error(
            "handCursor texture not found, attempting to load it again"
          );
          // Try loading it again
          this.load.image("handCursor", "assets/player.png");
          this.load.once("complete", () => {
            console.log("handCursor loaded successfully");
            // Try creating cursor again after loading
            this.setHandCursor();
          });
          this.load.start();

          // Fall back to default cursor in the meantime
          this.input.setDefaultCursor("default");
        }
      }

      // Set up pointer move listener only if we don't already have one
      if (!this.cursorListenerActive && this.handCursor) {
        this.cursorListenerActive = true;
        // Make sure we're passing a function reference to the event listener
        const moveHandler = (pointer) => {
          if (this.handCursor) {
            this.handCursor.x = pointer.x;
            this.handCursor.y = pointer.y;
            this.handCursor.setVisible(true);
          }
        };

        this.input.on("pointermove", moveHandler);
      }
    }
  }

  // Update coordinate display in the corner for debugging
  updateCoordinateDisplay(pointer) {
    if (this.coordinateText) {
      this.coordinateText.setText(
        `X: ${Math.floor(pointer.x)}, Y: ${Math.floor(pointer.y)}`
      );
    }
  }

  updateTimer() {
    if (this.startTime) {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;

      this.timerText.setText(
        `Time: ${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }
  }

  showStoveOptions(stove) {
    if (this.actionInProgress) return;

    console.log("Showing stove heat options");

    const relevantStep = this.steps.find(
      (step) => step.item === "stove" && !step.completed
    );

    if (!relevantStep) {
      console.warn("No relevant stove step found");
      return;
    }

    console.log("Found stove step:", relevantStep);

    this.showOptions(
      stove.x,
      stove.y - 100,
      relevantStep.options,
      (option) => {
        console.log(`Setting stove heat to: ${option}`);

        // Set stove heat with improved display
        if (this.stoveHeatText) {
          this.stoveHeatText.setText(`Heat: ${option}`);
        }

        // Make sure heat indicator is visible
        if (this.stoveHeat) {
          this.stoveHeat.setVisible(true);
        }

        // Update step completion
        this.completeStep(relevantStep, option);

        // Add to game data
        this.registry.get("gameData").ingredients["stove_heat"] = option;

        // Show feedback
        this.showFloatingText(
          stove.x,
          stove.y,
          `Stove set to ${option} heat!`,
          "#008000"
        );
      },
      "Choose Heat Level"
    );
  }

  showSpiceOptions(item, key, step, spiceName) {
    // Check if step is valid
    if (!step || typeof step !== "object") {
      console.error("Invalid step provided to showSpiceOptions:", step);
      this.showFloatingText(
        item.x,
        item.y,
        "Cannot process this step",
        "#FF0000"
      );
      return;
    }

    // Define quantity options based on item type
    let options = ["¼ tsp", "½ tsp", "1 tsp", "2 tsp"];

    // Special case for oil which needs different measurements
    if (key === "oil" || step.item === "oil") {
      options = ["1 tsp", "2 tsp", "1 tbsp", "2 tbsp"];
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

    // Create appropriate dialog title
    const dialogTitle = `Choose ${
      spiceName.charAt(0).toUpperCase() + spiceName.slice(1)
    } Amount`;

    this.showOptions(
      item.x,
      item.y - 100,
      options,
      (option) => {
        console.log(`Selected quantity for ${spiceName}: ${option}`);

        // Special handling for zeera (cumin seeds)
        const isZeera =
          spiceName === "zeera" ||
          key === "zeera" ||
          (key === "container-big" && spiceName === "zeera");

        if (isZeera) {
          console.log("Detected zeera, using special handler");
          this.handleZeeraAddition(key, option, step);
          return;
        }

        // Check if this ingredient has already been added
        const gameData = this.registry.get("gameData");
        if (gameData.ingredients[spiceName]) {
          // Ingredient already exists, just show feedback but don't complete step
          this.showFloatingText(
            item.x,
            item.y,
            `${spiceName} already added! Adding more...`,
            "#FFA500"
          );

          console.log(
            `${spiceName} was already added. Not completing step again.`
          );
          return;
        }

        // Show visual feedback with the correct spice name
        this.showFloatingText(
          item.x,
          item.y,
          `Added ${option} of ${spiceName}`,
          "#008000"
        );

        // Update step completion - create a dummy step if needed
        if (!step.id) {
          console.warn("Step without ID provided, creating a dummy step");
          step = {
            id: this.steps.length + 999,
            description: `Add ${spiceName}`,
            item: spiceName,
            completed: false,
          };
        }

        this.completeStep(step, option);

        // Add to game data with more detail
        this.registry.get("gameData").ingredients[spiceName] = option;

        // If we're adding to the pan, create smoke effect
        if (this.panOnStove) {
          // Choose smoke color based on spice
          let tint = 0xdddddd; // Default

          if (spiceName === "turmeric") {
            tint = 0xffcc00; // Yellow for turmeric
          } else if (spiceName === "redChilli") {
            tint = 0xff3300; // Red for red chilli
          }

          this.createSmokeEffect(
            this.itemPositions.stove.x,
            this.itemPositions.stove.y - 20,
            tint
          );
        } else {
          console.log("Pan not on stove, skipping smoke effect");
        }

        console.log(`${spiceName} added successfully with quantity ${option}`);
      },
      dialogTitle
    );
  }

  showPrepOptions(potato, step) {
    console.log("Showing potato prep options:", step);

    // Check what action we need to take based on the step
    if (step.action === "wash") {
      // Show options for washing potato
      this.showOptions(
        potato.x,
        potato.y - 60,
        ["Wash potato"],
        (option) => {
          this.washPotato(potato, step);
        },
        "Prepare Potato"
      );
    } else if (step.action === "peel") {
      // Show options for peeling potato
      this.showOptions(
        potato.x,
        potato.y - 60,
        ["Peel potato"],
        (option) => {
          this.peelPotato(potato, step);
        },
        "Prepare Potato"
      );
    } else {
      // Default options if action not specified
      this.showOptions(
        potato.x,
        potato.y - 60,
        ["Wash potato", "Peel potato"],
        (option) => {
          if (option === "Wash potato") {
            this.washPotato(potato, step);
          } else if (option === "Peel potato") {
            this.peelPotato(potato, step);
          }
        },
        "Prepare Potato"
      );
    }
  }

  washPotato(potato, step) {
    this.actionInProgress = true;

    // Create washing animation
    this.showFloatingText(potato.x, potato.y, "Washing...", "#0000FF");

    // After delay, show completion
    this.time.delayedCall(1000, () => {
      this.showFloatingText(potato.x, potato.y, "Washed!", "#008000");

      // After washing, update the step and allow further actions
      if (step) {
        this.completeStep(step);
      } else {
        // If no step provided, mark as washed in game data
        const gameData = this.registry.get("gameData");
        if (!gameData.ingredients) gameData.ingredients = {};
        gameData.ingredients.potato_washed = true;
      }

      this.actionInProgress = false;
    });
  }

  peelPotato(potato, step) {
    this.actionInProgress = true;

    // Create peeling animation
    this.showFloatingText(potato.x, potato.y, "Peeling...", "#0000FF");

    // After delay, replace with peeled potato
    this.time.delayedCall(1500, () => {
      // Hide raw potato
      potato.setVisible(false);

      // Calculate position for peeled potato using Figma coordinates
      const potatoPeeledPos = this.itemPositions["potato-peeled"];
      const peelX = potatoPeeledPos.x + potatoPeeledPos.width / 2;
      const peelY = potatoPeeledPos.y + potatoPeeledPos.height / 2;

      // Create peeled potato
      console.log("Creating peeled potato at", peelX, peelY);
      const peeled = this.add
        .image(peelX, peelY, "potato-peeled")
        .setInteractive()
        .setDepth(3);

      // Add click handler to peeled potato
      peeled.on("pointerdown", () => {
        console.log("Peeled potato clicked");
        const relevantStep = this.getCurrentStep();
        if (
          relevantStep &&
          relevantStep.item === "potato-peeled" &&
          !this.actionInProgress
        ) {
          if (relevantStep.action === "chop") {
            this.showChoppingOptions(this.items["choppingBoard"], relevantStep);
          } else {
            this.showFloatingText(
              peeled.x,
              peeled.y,
              "Click to choose an action",
              "#0000FF"
            );
          }
        } else if (!this.actionInProgress) {
          this.showFloatingText(
            peeled.x,
            peeled.y,
            "Not yet time for this step!",
            "#FF0000"
          );
        }
      });

      // Remove reference to the raw potato on board since it's been replaced
      if (this.items["potato-on-board"] === potato) {
        delete this.items["potato-on-board"];
      }

      this.items["potato-peeled"] = peeled;
      this.showFloatingText(peeled.x, peeled.y, "Peeled!", "#008000");

      // Check if step exists before completing it
      if (step) {
        this.completeStep(step);
      } else {
        console.warn("Cannot complete step: step is undefined in peelPotato");
      }

      this.actionInProgress = false;
    });
  }

  showPanOptions(pan, step) {
    // Show options for placing pan
    this.showOptions(
      pan.x,
      pan.y - 60,
      ["Place on stove"],
      (option) => {
        this.placePanOnStove(pan, step);
      },
      "Pan Options"
    );
  }

  showSpoonOptions(spoon, step, action) {
    console.log(`Showing spoon options for action: ${action}, step:`, step);

    if (action === "stir") {
      // Show options for stirring
      this.showOptions(
        spoon.x,
        spoon.y - 60,
        ["Stir gently", "Stir medium", "Stir vigorously"],
        (option) => {
          this.stirPotatoes(spoon, step);
        },
        "Choose Stirring Method"
      );
    } else if (action === "mix") {
      // Show options for mixing
      this.showOptions(
        spoon.x,
        spoon.y - 60,
        ["Mix gently", "Mix thoroughly"],
        (option) => {
          this.stirPotatoes(spoon, step); // Reuse the same animation logic
        },
        "Choose Mixing Method"
      );
    } else {
      console.warn(`Unknown spoon action: ${action}`);
      // Default to stirring as fallback
      this.showOptions(
        spoon.x,
        spoon.y - 60,
        ["Continue"],
        (option) => {
          this.stirPotatoes(spoon, step);
        },
        "Proceed with spoon"
      );
    }
  }

  placePanOnStove(pan, step) {
    this.actionInProgress = true;

    // Get the exact Figma coordinates for pan on stove
    const panOnStovePos = this.itemPositions["pan-on-stove"];
    const targetX = panOnStovePos.x + panOnStovePos.width / 2;
    const targetY = panOnStovePos.y + panOnStovePos.height / 2;

    console.log(`Moving pan to stove at position: (${targetX}, ${targetY})`);

    // Move pan to stove using precise coordinates
    this.tweens.add({
      targets: pan,
      x: targetX,
      y: targetY,
      duration: 500,
      onComplete: () => {
        this.panOnStove = true;
        this.showFloatingText(pan.x, pan.y, "Pan placed on stove!", "#008000");
        // Check if step exists before completing it
        if (step) {
          this.completeStep(step);
        } else {
          console.warn(
            "Cannot complete step: step is undefined in placePanOnStove"
          );
        }
        this.actionInProgress = false;
      },
    });
  }

  showChoppingOptions(choppingBoard, step) {
    const peeled = this.items["potato-peeled"];

    this.showOptions(
      peeled.x,
      peeled.y - 60,
      ["Dice finely", "Dice medium", "Dice roughly"],
      (option) => {
        this.actionInProgress = true;

        // Get the diced potato position from itemPositions
        const dicedPos = this.itemPositions["potato-diced"];
        const dicedX = dicedPos.x + dicedPos.width / 2;
        const dicedY = dicedPos.y + dicedPos.height / 2;

        // Show chopping animation text above the peeled potato
        this.showFloatingText(peeled.x, peeled.y, "Chopping...", "#0000FF");

        // Move peeled potato directly to the diced potato position
        this.tweens.add({
          targets: peeled,
          x: dicedX,
          y: dicedY,
          duration: 750,
          onComplete: () => {
            // Hide peeled potato
            peeled.setVisible(false);

            // After short delay, replace with diced potato
            this.time.delayedCall(250, () => {
              // Create diced potato at the correct position
              const diced = this.add
                .image(dicedX, dicedY, "potato-diced")
                .setInteractive()
                .setDepth(6) // Increased from 3 to 6
                .on("pointerdown", () => {
                  // Check if it's time to add potatoes to pan
                  const relevantStep = this.getCurrentStep();
                  if (
                    relevantStep &&
                    relevantStep.item === "potato-diced" &&
                    relevantStep.action === "add" &&
                    this.panOnStove
                  ) {
                    this.showDicedOptions(diced, relevantStep);
                  } else if (!this.actionInProgress) {
                    this.showFloatingText(
                      diced.x,
                      diced.y,
                      "Not yet time for this step!",
                      "#FF0000"
                    );
                  }
                });

              this.items["potato-diced"] = diced;
              this.showFloatingText(
                diced.x,
                diced.y,
                `Chopped (${option})!`,
                "#008000"
              );
              this.completeStep(step, option);
              this.actionInProgress = false;
            });
          },
        });
      },
      "Choose Chopping Style"
    );
  }

  showDicedOptions(diced, step) {
    this.showOptions(
      diced.x,
      diced.y - 60,
      ["Add to pan"],
      (option) => {
        this.addPotatoesToPan(diced, step);
      },
      "Potato Options"
    );
  }

  addPotatoesToPan(diced, step) {
    this.actionInProgress = true;

    // Get the pan-on-stove position for cooking
    const cookingPos = this.itemPositions["potato-cooked"];
    const cookingX = cookingPos.x + cookingPos.width / 2;
    const cookingY = cookingPos.y + cookingPos.height / 2;

    // Move diced potato to pan
    this.tweens.add({
      targets: diced,
      x: cookingX,
      y: cookingY,
      duration: 500,
      onComplete: () => {
        // Update the reference to make sure we can track the potato
        this.items["potato-diced"] = diced;

        // Create a reference to the cooking position
        if (!this.items["potato-cooked"]) {
          this.items["potato-cooked"] = diced;
        }

        // Show cooking animation
        this.createSmokeEffect(cookingX, cookingY - 30);
        this.showFloatingText(
          cookingX,
          cookingY,
          "Potatoes added to pan!",
          "#008000"
        );

        // Check if step exists before completing it
        if (step) {
          this.completeStep(step);
        } else {
          console.warn(
            "Cannot complete step: step is undefined in addPotatoesToPan"
          );
        }

        this.actionInProgress = false;
      },
    });
  }

  stirPotatoes(spoon, step) {
    this.actionInProgress = true;
    console.log("Starting stirPotatoes animation with spoon:", spoon);

    // Get the position of the diced potato for more accurate placement
    const stirPosition = {
      x: 635,
      y: 630,
    };

    // Store original position of the spoon
    const originalX = spoon.x;
    const originalY = spoon.y;
    const originalAngle = spoon.angle || 0;
    const originalDepth = spoon.depth || 2;

    // Make sure we're using the mixing spoon if available
    let stirSpoon = spoon;
    if (spoon.texture.key !== "mixingSpoon" && this.items["mixingSpoon"]) {
      console.log("Using mixing spoon instead of provided spoon");
      stirSpoon = this.items["mixingSpoon"];
    }

    // Move mixing spoon to pan at the exact cooking position
    this.tweens.add({
      targets: stirSpoon,
      x: stirPosition.x,
      y: stirPosition.y,
      duration: 500,
      onComplete: () => {
        // Make sure spoon is above potato in depth
        stirSpoon.setDepth(7); // Increased from 4 to 7

        // Create sizzle effect around the pan
        this.createSmokeEffect(550, 640, 0xcccccc, 0.3);

        // Rotate spoon for stirring effect
        this.tweens.add({
          targets: stirSpoon,
          angle: { from: -15, to: 15 },
          ease: "Sine.easeInOut",
          duration: 500,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            // Return spoon to original position
            this.tweens.add({
              targets: stirSpoon,
              x: originalX,
              y: originalY,
              angle: originalAngle,
              duration: 500,
              onComplete: () => {
                // Reset depth to original value
                stirSpoon.setDepth(originalDepth);

                this.actionInProgress = false;
                this.showFloatingText(
                  stirPosition.x,
                  stirPosition.y - 30,
                  "Potatoes stirred!",
                  "#008000"
                );

                // Replace potato-diced with potato-cooking sprite
                if (
                  this.items["potato-diced"] &&
                  this.items["potato-diced"].visible
                ) {
                  const potatoPos = {
                    x: this.items["potato-diced"].x,
                    y: this.items["potato-diced"].y,
                  };
                  const potatoDepth = this.items["potato-diced"].depth;

                  // Hide the diced potato
                  this.items["potato-diced"].setVisible(false);

                  // Create or show the cooking potato at the same position
                  if (this.items["potato-cooking"]) {
                    this.items["potato-cooking"].setVisible(true);
                    this.items["potato-cooking"].setPosition(
                      potatoPos.x,
                      potatoPos.y
                    );
                    this.items["potato-cooking"].setDepth(6); // Increased from potatoDepth to 6
                  } else {
                    this.items["potato-cooking"] = this.add
                      .image(potatoPos.x, potatoPos.y, "potato-cooking")
                      .setDepth(6); // Increased from potatoDepth to 6
                  }
                }

                // Check if step exists before completing it
                if (step) {
                  this.completeStep(step, "medium"); // Default to medium stir
                } else {
                  console.warn(
                    "Cannot complete step: step is undefined in stirPotatoes"
                  );
                }
              },
            });
          },
        });
      },
    });
  }

  showCookingOptions(spoon, step) {
    this.showOptions(
      spoon.x,
      spoon.y - 100,
      step.options,
      (option) => {
        this.actionInProgress = true;

        // Show cooking timer - use seconds instead of minutes for gameplay
        // Extract just the number value from the option
        const cookTimeMin = parseInt(option);
        // Convert to seconds for game purposes (fast cooking)
        let countdown = 7; // Just 7 seconds regardless of option

        const countdownText = this.add
          .text(
            550, //Below The Stove coordinates
            875,
            `Cooking: ${countdown}s`,
            {
              font: "16px Arial",
              fill: "#FF0000",
              backgroundColor: "#FFFFFF",
              padding: { x: 5, y: 5 },
            }
          )
          .setOrigin(0.5)
          .setDepth(4);

        // Start cooking interval
        const cookingInterval = setInterval(() => {
          countdown--;
          countdownText.setText(`Cooking: ${countdown}s`);

          // Create smoke effect randomly during cooking
          if (Math.random() < 0.2) {
            this.createSmokeEffect(
              this.itemPositions.stove.x,
              this.itemPositions.stove.y - 20
            );
          }

          if (countdown <= 0) {
            clearInterval(cookingInterval);
            countdownText.destroy();

            // Show cooked potatoes - make the cooked potato visible
            this.items["potato-diced"].setVisible(false);
            if (this.items["potato-cooked"]) {
              this.items["potato-cooked"].setVisible(true);
            } else {
              // Use the exact Figma coordinates from itemPositions
              const cookedPos = this.itemPositions["potato-cooked"];
              this.items["potato-cooked"] = this.add
                .image(
                  cookedPos.x + cookedPos.width / 2,
                  cookedPos.y + cookedPos.height / 2,
                  "potato-cooked"
                )
                .setDepth(6); // Increased from 3 to 6
            }

            this.showFloatingText(
              this.itemPositions.stove.x,
              this.itemPositions.stove.y,
              "Cooking complete!",
              "#008000"
            );

            // Check if step exists before completing it
            if (step) {
              this.completeStep(step, option);
            } else {
              console.warn(
                "Cannot complete step: step is undefined in showCookingOptions"
              );
            }

            this.actionInProgress = false;

            // Check if recipe is complete
            if (this.isRecipeComplete()) {
              this.finishCooking();
            }
          }
        }, 1000);
      },
      "Choose Cooking Time"
    );
  }

  showOilOptions(oilItem, step) {
    // Check if step is valid
    if (!step || typeof step !== "object") {
      console.error("Invalid step provided to showOilOptions:", step);
      this.showFloatingText(
        oilItem.x,
        oilItem.y,
        "Cannot process this step",
        "#FF0000"
      );
      return;
    }

    // Create a dummy step if needed
    if (!step.id) {
      console.warn("Step without ID provided, creating a dummy step for oil");
      step = {
        id: this.steps.length + 999,
        description: "Add oil",
        item: "oil",
        completed: false,
      };
    }

    // Define oil quantity options
    const options = ["1 tsp", "2 tsp", "1 tbsp", "2 tbsp"];

    console.log("Showing oil options dialog");

    // Show quantity selection dialog
    this.showOptions(
      oilItem.x,
      oilItem.y - 100,
      options,
      (option) => {
        console.log(`Selected oil quantity: ${option}`);

        // Get game data to check if oil was already added
        const gameData = this.registry.get("gameData");

        // Check if oil has already been added
        if (gameData.ingredients["oil"]) {
          // Oil already exists, just show feedback but don't complete step again
          this.showFloatingText(
            oilItem.x,
            oilItem.y,
            `Oil already added! Adding more...`,
            "#FFA500"
          );

          // Still create the visual effect
          this.createOilEffect(550, 650);

          console.log("Oil was already added. Not completing step again.");
          return;
        }

        // In debug mode, we'll warn but not prevent
        if (!this.panOnStove) {
          console.warn("Pan is not on stove yet!");
          this.showFloatingText(
            oilItem.x,
            oilItem.y,
            "Warning: Pan should be on stove first (but allowing)",
            "#FFA500"
          );

          // Still log the mistake
          this.mistakes.push({
            type: "wrong_order",
            description: "Added oil before placing pan on stove",
            step: step.id,
          });
        }

        // Check if stove is hot (but allow it for debugging)
        const stoveHeat = gameData.ingredients["stove_heat"] || "";

        if (!stoveHeat || stoveHeat === "Off") {
          console.warn("Stove is not hot yet!");
          this.showFloatingText(
            oilItem.x,
            oilItem.y,
            "Warning: Stove should be hot first (but allowing)",
            "#FFA500"
          );

          // Still log the mistake
          this.mistakes.push({
            type: "wrong_order",
            description: "Added oil before turning on stove",
            step: step.id,
          });
        }

        this.createOilEffect(550, 650);

        // Show feedback
        this.showFloatingText(
          oilItem.x,
          oilItem.y,
          `Added ${option} of oil to pan`,
          "#008000"
        );

        // Complete step
        this.completeStep(step, option);

        // Add to game data
        gameData.ingredients["oil"] = option;

        console.log("Oil added successfully:", {
          quantity: option,
          panOnStove: this.panOnStove,
          stoveHeat: stoveHeat,
        });
      },
      "Choose Oil Amount"
    );
  }

  // Create oil pouring effect
  createOilEffect(x, y) {
    try {
      // Use simpler approach for oil effect
      const oilDrops = [];
      const dropCount = 10;

      // Create multiple oil drops manually instead of using an emitter
      for (let i = 0; i < dropCount; i++) {
        // Delay each drop slightly for a pouring effect
        this.time.delayedCall(i * 50, () => {
          // Create oil droplet using circle
          const drop = this.add.circle(
            x + Phaser.Math.Between(-5, 5),
            y - 40 + Phaser.Math.Between(-5, 5),
            Phaser.Math.Between(2, 4),
            0xffff00,
            0.8
          );
          drop.setDepth(7); // Increased from 5 to 7
          oilDrops.push(drop);

          // Animate each oil drop falling
          this.tweens.add({
            targets: drop,
            y: y + Phaser.Math.Between(-5, 5),
            alpha: 0,
            duration: Phaser.Math.Between(300, 500),
            onComplete: () => {
              drop.destroy();
            },
          });
        });
      }

      // Create slight sizzle effect after oil is added
      this.time.delayedCall(400, () => {
        this.createSmokeEffect(x, y - 10, 0xcccccc, 0.3); // Light gray smoke
      });

      // Show feedback text
      this.showFloatingText(x, y - 20, "Oil added!", "#FFFF00");
    } catch (error) {
      console.error("Error creating oil effect:", error);
      this.showFloatingText(x, y - 20, "Oil added!", "#FFFF00");
    }
  }

  showCookingOptionsFromPan(pan, step) {
    this.showOptions(
      pan.x,
      pan.y - 100,
      step.options,
      (option) => {
        this.actionInProgress = true;

        // Show cooking timer - use seconds instead of minutes for gameplay
        // Extract just the number value from the option
        const cookTimeMin = parseInt(option);
        // Convert to seconds for game purposes (fast cooking)
        let countdown = 7; // Just 7 seconds regardless of option

        const countdownText = this.add
          .text(
            this.itemPositions.stove.x,
            this.itemPositions.stove.y - 70,
            `Cooking: ${countdown}s`,
            {
              font: "16px Arial",
              fill: "#FF0000",
              backgroundColor: "#FFFFFF",
              padding: { x: 5, y: 5 },
            }
          )
          .setOrigin(0.5)
          .setDepth(4);

        // Start cooking interval
        const cookingInterval = setInterval(() => {
          countdown--;
          countdownText.setText(`Cooking: ${countdown}s`);

          // Create smoke effect randomly during cooking
          if (Math.random() < 0.2) {
            this.createSmokeEffect(
              this.itemPositions.stove.x,
              this.itemPositions.stove.y - 20
            );
          }

          if (countdown <= 0) {
            clearInterval(cookingInterval);
            countdownText.destroy();

            // Show cooked potatoes - make the cooked potato visible
            this.items["potato-diced"].setVisible(false);
            if (this.items["potato-cooked"]) {
              this.items["potato-cooked"].setVisible(true);
            } else {
              // Use the exact Figma coordinates from itemPositions
              const cookedPos = this.itemPositions["potato-cooked"];
              this.items["potato-cooked"] = this.add
                .image(610, 710, "potato-cooked")
                .setDepth(6); // Increased from 3 to 6
            }

            this.showFloatingText(
              pan.x,
              pan.y,
              "Cooking complete - Dish is ready!",
              "#008000"
            );

            // Add extra stirring animation for visual effect
            const mixingSpoon = this.items["mixingSpoon"];
            if (mixingSpoon) {
              // Store original position
              const originalX = mixingSpoon.x;
              const originalY = mixingSpoon.y;
              const originalAngle = mixingSpoon.angle || 0;
              const originalDepth = mixingSpoon.depth || 2;

              // Move spoon to pan
              const stirPosition = { x: 550, y: 680 };
              mixingSpoon.setPosition(stirPosition.x, stirPosition.y);
              mixingSpoon.setDepth(7); // Increased from 4 to 7

              // Rotate spoon for stirring effect
              this.tweens.add({
                targets: mixingSpoon,
                angle: { from: -15, to: 15 },
                ease: "Sine.easeInOut",
                duration: 300,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                  // Return spoon to original position
                  this.tweens.add({
                    targets: mixingSpoon,
                    x: originalX,
                    y: originalY,
                    angle: originalAngle,
                    duration: 300,
                    onComplete: () => {
                      mixingSpoon.setDepth(originalDepth);
                    },
                  });
                },
              });
            }

            // Check if step exists before completing it
            if (step) {
              this.completeStep(step, option);
            } else {
              console.warn(
                "Cannot complete step: step is undefined in showCookingOptionsFromPan"
              );
            }

            this.actionInProgress = false;

            // Check if recipe is complete
            if (this.isRecipeComplete()) {
              this.finishCooking();
            }
          }
        }, 1000);
      },
      "Choose Cooking Time"
    );
  }

  // Debug method to visualize interactive areas
  updateDebugVisualization() {
    // Clear previous debug graphics
    this.debugGraphics.clear();

    if (!this.showInteractiveAreas) return;

    // Set style for interactive areas
    this.debugGraphics.lineStyle(2, 0x00ff00, 1);

    // Draw rectangles around all interactive items
    Object.keys(this.items).forEach((key) => {
      const item = this.items[key];
      if (item && item.input && item.input.enabled) {
        // Calculate the hitbox size based on the sprite
        const bounds = item.getBounds();

        // Draw rectangle around interactive area
        this.debugGraphics.strokeRect(
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height
        );

        // Add item name for clarity - center it above the sprite
        if (!this.debugTexts) this.debugTexts = {};

        if (!this.debugTexts[key]) {
          this.debugTexts[key] = this.add
            .text(bounds.x + bounds.width / 2, bounds.y - 5, key, {
              font: "14px Arial",
              fill: "#FF0000",
              backgroundColor: "#FFFFFF80",
              padding: { x: 3, y: 1 },
            })
            .setOrigin(0.5, 1) // Center horizontally, align bottom
            .setDepth(10);
        } else {
          this.debugTexts[key]
            .setPosition(bounds.x + bounds.width / 2, bounds.y - 5)
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
    const text = this.add
      .text(10, 10, 'Press "D" to toggle interactive areas visualization', {
        font: "16px Arial",
        fill: "#FFFFFF",
        backgroundColor: "#000000",
        padding: { x: 5, y: 5 },
      })
      .setDepth(100);

    // Auto-hide after 5 seconds
    this.time.delayedCall(5000, () => {
      text.destroy();
    });
  }

  showOptions(x, y, options, callback, title = "Choose Option") {
    // Remove any existing options panel
    if (this.optionsPanel) {
      this.optionsPanel.destroy();
    }

    // Create options panel with enhanced styling
    this.optionsPanel = this.add.container(x, y).setDepth(10);

    // Calculate optimal width based on option text lengths
    const minWidth = 220;
    const textPadding = 60; // Increased from 40 to provide more space
    const optionTexts = options.map((option) =>
      this.add.text(0, 0, option, {
        font: "18px Arial",
        fill: "#000000",
      })
    );

    let panelWidth = minWidth;
    optionTexts.forEach((text) => {
      panelWidth = Math.max(panelWidth, text.width + textPadding);
      text.destroy(); // Clean up temporary texts
    });

    // Ensure the panel is wide enough for all options
    panelWidth = Math.max(panelWidth, 240); // Minimum width to prevent text overflow

    // Calculate panel height based on number of options
    const buttonHeight = 40;
    const panelHeight = 40 * (options.length + 1) + 40; // Added extra padding at bottom

    // Background with rounded corners using a 9-slice approach
    const bgColor = 0xfff0e5; // Warm cream color to match kitchen theme
    const borderColor = 0x8b4513; // Brown border

    // Draw background with Phaser graphics for rounded corners
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 0.95);
    bg.lineStyle(4, borderColor, 1);
    bg.fillRoundedRect(-panelWidth / 2, 0, panelWidth, panelHeight, 16);
    bg.strokeRoundedRect(-panelWidth / 2, 0, panelWidth, panelHeight, 16);

    // Add decorative header
    bg.fillStyle(borderColor, 1);
    bg.fillRoundedRect(-panelWidth / 2, 0, panelWidth, 30, {
      tl: 16,
      tr: 16,
      bl: 0,
      br: 0,
    });

    this.optionsPanel.add(bg);

    // Title text for dialog
    const titleText = this.add
      .text(0, 15, title, {
        font: "bold 16px Arial",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5);

    this.optionsPanel.add(titleText);

    // Add decorative spoon icon (if available in assets)
    if (this.textures.exists("woodenSpoon")) {
      const spoonIcon = this.add
        .image(-panelWidth / 2 + 20, 15, "woodenSpoon")
        .setOrigin(0.5)
        .setScale(0.15);
      this.optionsPanel.add(spoonIcon);
    }

    // Add options with enhanced styling
    options.forEach((option, index) => {
      // Create button with hover effect
      const buttonY = 50 + index * buttonHeight;
      const buttonWidth = panelWidth - 40;

      const optionButton = this.add.graphics();
      optionButton.fillStyle(0xffcc99, 1); // Lighter orange for buttons
      optionButton.fillRoundedRect(
        -buttonWidth / 2,
        buttonY - 15,
        buttonWidth,
        30,
        8
      );

      // Add button to container
      this.optionsPanel.add(optionButton);

      // Create interactive zone over the button
      const hitArea = this.add
        .rectangle(0, buttonY, buttonWidth, 30)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          // Hover effect - darkens the button
          optionButton.clear();
          optionButton.fillStyle(0xffaa77, 1);
          optionButton.fillRoundedRect(
            -buttonWidth / 2,
            buttonY - 15,
            buttonWidth,
            30,
            8
          );

          // Add a subtle pulse scale effect
          this.tweens.add({
            targets: optionText,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
          });
        })
        .on("pointerout", () => {
          // Reset button on pointer out
          optionButton.clear();
          optionButton.fillStyle(0xffcc99, 1);
          optionButton.fillRoundedRect(
            -buttonWidth / 2,
            buttonY - 15,
            buttonWidth,
            30,
            8
          );

          // Reset scale
          this.tweens.add({
            targets: optionText,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
          });
        })
        .on("pointerdown", () => {
          // Add click animation
          this.tweens.add({
            targets: optionText,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            yoyo: true,
            onComplete: () => {
              // Close with animation
              this.tweens.add({
                targets: this.optionsPanel,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 200,
                ease: "Back.easeIn",
                onComplete: () => {
                  this.optionsPanel.destroy();
                  this.optionsPanel = null;
                  callback(option);
                },
              });
            },
          });
        });

      this.optionsPanel.add(hitArea);

      // Option text
      const optionText = this.add
        .text(0, buttonY, option, {
          font: "18px Arial",
          fill: "#000000",
        })
        .setOrigin(0.5);

      this.optionsPanel.add(optionText);
    });

    // Add cancel button with different styling
    const cancelY = 50 + options.length * buttonHeight;

    // Cancel button background
    const cancelButton = this.add.graphics();
    cancelButton.fillStyle(0xdddddd, 1); // Gray button for cancel
    cancelButton.fillRoundedRect(
      -panelWidth / 2 + 20,
      cancelY - 15,
      panelWidth - 40,
      30,
      8
    );

    this.optionsPanel.add(cancelButton);

    // Interactive hit area for cancel
    const cancelHitArea = this.add
      .rectangle(0, cancelY, panelWidth - 40, 30)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        // Hover effect
        cancelButton.clear();
        cancelButton.fillStyle(0xcccccc, 1);
        cancelButton.fillRoundedRect(
          -panelWidth / 2 + 20,
          cancelY - 15,
          panelWidth - 40,
          30,
          8
        );

        // Subtle scale effect
        this.tweens.add({
          targets: cancelText,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
        });
      })
      .on("pointerout", () => {
        // Reset on pointer out
        cancelButton.clear();
        cancelButton.fillStyle(0xdddddd, 1);
        cancelButton.fillRoundedRect(
          -panelWidth / 2 + 20,
          cancelY - 15,
          panelWidth - 40,
          30,
          8
        );

        // Reset scale
        this.tweens.add({
          targets: cancelText,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
      })
      .on("pointerdown", () => {
        // Close animation
        this.tweens.add({
          targets: this.optionsPanel,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: 200,
          ease: "Back.easeIn",
          onComplete: () => {
            this.optionsPanel.destroy();
            this.optionsPanel = null;
          },
        });
      });

    this.optionsPanel.add(cancelHitArea);

    // Cancel text
    const cancelText = this.add
      .text(0, cancelY, "Cancel", {
        font: "16px Arial",
        fill: "#666666",
      })
      .setOrigin(0.5);

    this.optionsPanel.add(cancelText);

    // Check if panel would go off-screen and adjust position
    if (y + panelHeight > this.scale.height) {
      // Move the panel upward if it would go off the bottom of the screen
      this.optionsPanel.y = this.scale.height - panelHeight - 20;
    }

    // Add open animation
    this.optionsPanel.setScale(0);
    this.tweens.add({
      targets: this.optionsPanel,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: "Back.easeOut",
    });
  }

  completeStep(step, option = null) {
    // Check if step exists before trying to modify it
    if (!step) {
      console.error("Cannot complete step: step is undefined");
      return;
    }

    // Update step data
    step.completed = true;
    if (option) {
      step.selectedOption = option;
    }

    // Add to completed steps array
    this.completedStepIds.push(step.id);

    // Update checklist - ALWAYS update even if not visible
    const checklistItem = this.checklist[step.id - 1];
    checklistItem.completed = true;

    // Fill in the checkbox to show it's completed - ALWAYS update graphics
    checklistItem.checkbox.clear();
    checklistItem.checkbox.lineStyle(2, 0x000000, 1);
    checklistItem.checkbox.strokeRect(
      905 - 10,
      250 + (step.id - 1) * 38 - 10,
      20,
      20
    );
    checklistItem.checkbox.fillStyle(0x00ff00, 1);
    checklistItem.checkbox.fillRect(
      905 - 8,
      250 + (step.id - 1) * 38 - 8,
      16,
      16
    );

    // Highlight the next step
    this.highlightCurrentStep();

    // Log step completion to game data with enhanced details
    const gameData = this.registry.get("gameData");
    const stepLog = {
      stepId: step.id,
      description: step.description,
      option: option,
      timestamp: Date.now() - this.startTime,
      timeFormatted: this.formatTime(Date.now() - this.startTime),
      item: step.item,
      action: step.action,
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
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
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
        type: "order",
        step: step.id,
        description: `Step completed out of order: ${step.description}`,
        expected: expectedStepId,
        actual: step.id,
      });
    }

    // Check if correct quantities were used (if applicable)
    if (option && step.preferredOption && option !== step.preferredOption) {
      points -= 3; // Penalty for incorrect quantity
      this.mistakes.push({
        type: "quantity",
        step: step.id,
        description: `Incorrect quantity used: ${option} instead of ${step.preferredOption}`,
        item: step.item,
      });
    }

    // Add points to game score
    this.gameScore += points;

    // Log score update
    console.log(
      `Score updated: +${points} for step ${step.id}, total score: ${this.gameScore}`
    );
  }

  showFloatingText(x, y, message, color) {
    const text = this.add
      .text(x, y, message, {
        font: "16px Arial",
        fill: color,
        stroke: "#FFFFFF",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy(),
    });
  }

  createSmokeEffect(x, y, tint = 0xdddddd, alpha = 0.6) {
    try {
      // Use a simpler approach for smoke effect since the particle API might have changed
      const smokeParticles = [];
      const particleCount = 5;

      // Use specific pan position for sizzle animation (corrected to match Figma)
      const panPosition = { x: 550, y: 650 };

      // Check if this is a cooking-related smoke (not oil or spice effects)
      // Look at the tint value - oil/spice effects use specific tints
      const isOilEffect = tint === 0xcccccc && alpha === 0.3;
      const isGenericEffect = tint === 0xdddddd;
      const isTurmericEffect = tint === 0xffcc00; // Yellow for turmeric
      const isRedChilliEffect = tint === 0xff3300; // Red for red chilli

      // Use pan position for cooking/frying effects
      if (
        (isGenericEffect || isTurmericEffect || isRedChilliEffect) &&
        this.panOnStove
      ) {
        x = panPosition.x;
        y = panPosition.y;
      }

      // If salt is being added to the pan (salt doesn't have a specific tint)
      // Use the panPosition when the pan is on the stove
      if (
        this.panOnStove &&
        (x === this.itemPositions.stove.x ||
          y === this.itemPositions.stove.y - 20)
      ) {
        x = panPosition.x;
        y = panPosition.y;
      }

      // Create multiple smoke particles manually instead of using an emitter
      for (let i = 0; i < particleCount; i++) {
        // Use simple circle graphics for particles
        const particle = this.add.circle(
          x + Phaser.Math.Between(-10, 10),
          y + Phaser.Math.Between(-10, 10),
          Phaser.Math.Between(5, 10),
          tint,
          alpha
        );
        particle.setDepth(5);
        smokeParticles.push(particle);

        // Animate each particle
        this.tweens.add({
          targets: particle,
          y: particle.y - Phaser.Math.Between(30, 50),
          x: particle.x + Phaser.Math.Between(-20, 20),
          alpha: 0,
          scale: { from: 1, to: 2 },
          duration: Phaser.Math.Between(1000, 2000),
          onComplete: () => {
            particle.destroy();
          },
        });
      }

      // Show feedback text as a fallback
      this.showFloatingText(x, y - 20, "Sizzle...", "#ffffff");
    } catch (error) {
      console.error("Error creating smoke effect:", error);
      // Show feedback text even if particles fail
      this.showFloatingText(x, y - 20, "Sizzle...", "#ffffff");
    }
  }

  isRecipeComplete() {
    return this.steps.every((step) => step.completed);
  }

  finishCooking() {
    // Stop timer
    const gameData = this.registry.get("gameData");
    const timeTaken = Date.now() - this.startTime;
    gameData.timeTaken = timeTaken;
    gameData.timeFormatted = this.formatTime(timeTaken);

    // Hide stirring options
    if (this.items["spoon"]) {
      this.items["spoon"].removeInteractive();
    }
    if (this.items["mixingSpoon"]) {
      this.items["mixingSpoon"].removeInteractive();
    }

    // Hide the pan and potato-cooking
    if (this.items["pan"]) {
      this.items["pan"].setVisible(false);
    }
    if (this.items["potato-cooking"]) {
      this.items["potato-cooking"].setVisible(false);
    }

    // Calculate final score based on various factors

    // Time bonus - if completed under expected time
    const expectedTimeMinutes = 5; // 5 minutes expected time for Aloo Bhujia
    const timeTakenMinutes = timeTaken / (1000 * 60);
    let timeBonus = 0;

    if (timeTakenMinutes < expectedTimeMinutes) {
      timeBonus = Math.floor((expectedTimeMinutes - timeTakenMinutes) * 5); // 5 points per minute saved
    }

    // Reset mistakes list before checking for missing ingredients
    // to avoid duplicate reports when testing with the debug button
    const previousMistakes = this.mistakes.filter(
      (m) => m.type !== "missing_ingredient"
    );
    this.mistakes = [...previousMistakes];

    // Penalty for missing required ingredients
    const requiredIngredients = [
      "oil",
      "zeera",
      "turmeric",
      "salt",
      "redChilli",
    ];
    let missingIngredients = [];

    // Special check for potato - we need to check steps, not just ingredients
    // If potato steps were completed, we consider it used
    const potatoStepsCompleted = gameData.steps.some(
      (step) =>
        step.item === "potato" ||
        step.item === "potato-raw" ||
        step.item === "potato-peeled" ||
        step.item === "potato-diced"
    );

    // If potato steps not found, add as missing
    if (!potatoStepsCompleted) {
      missingIngredients.push("potato");
      this.gameScore -= 10;
      this.mistakes.push({
        type: "missing_ingredient",
        ingredient: "potato",
        description: `Required ingredient not used: potato`,
      });
    }

    // Check other ingredients
    requiredIngredients.forEach((ingredient) => {
      if (!gameData.ingredients[ingredient]) {
        missingIngredients.push(ingredient);
        this.gameScore -= 10; // 10 point penalty per missing ingredient
        this.mistakes.push({
          type: "missing_ingredient",
          ingredient: ingredient,
          description: `Required ingredient not used: ${ingredient}`,
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
      score: this.gameScore,
    };

    // Save the cooking log
    gameData.cookingLog = cookingLog;
    console.log("Final cooking log:", cookingLog);

    // Get the exact screen dimensions
    const screenWidth = this.cameras.main.width || 1280;
    const screenHeight = this.cameras.main.height || 720;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;

    console.log(
      `Creating blur with dimensions: ${screenWidth}x${screenHeight}`
    );

    // Create blur effect for background - use a simple rectangle covering the entire screen
    const blurRect = this.add.rectangle(
      centerX,
      centerY,
      screenWidth,
      screenHeight,
      0x000000,
      0.7
    );
    blurRect.setDepth(10);

    // Log the center coordinates for debugging
    console.log(`Screen center coordinates: ${centerX}, ${centerY}`);

    // Show the final dish in the center of the screen
    const finalDish = this.add.image(centerX, centerY, "potato-cooked");
    finalDish.setDepth(15);
    finalDish.setScale(0); // Start at 0 for animation

    // Add a celebratory text
    const completeText = this.add
      .text(centerX, centerY - 200, `Recipe Complete!`, {
        font: "32px Arial",
        fill: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(15);

    const scoreText = this.add
      .text(centerX, centerY + 200, `Score: ${this.gameScore}`, {
        font: "32px Arial",
        fill: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(15);

    // Add scale animation to the dish
    this.tweens.add({
      targets: finalDish,
      scale: 1.5,
      duration: 1000,
      ease: "Bounce.Out",
    });

    // Wait before transitioning to results
    this.time.delayedCall(5000, () => {
      this.scene.start("ResultScene");
    });
  }

  handleZeeraAddition(itemKey, quantity, step) {
    // Check if step is valid
    if (!step || typeof step !== "object") {
      console.error("Invalid step provided to handleZeeraAddition:", step);
      this.showFloatingText(
        this.items[itemKey].x,
        this.items[itemKey].y,
        "Cannot process this step",
        "#FF0000"
      );
      return false;
    }

    // Create a dummy step if needed
    if (!step.id) {
      console.warn("Step without ID provided, creating a dummy step for zeera");
      step = {
        id: this.steps.length + 999,
        description: "Add zeera",
        item: "zeera",
        completed: false,
      };
    }

    const item = this.items[itemKey];
    if (!item) {
      console.error(`Item with key "${itemKey}" not found for zeera addition`);
      return false;
    }

    // Check if zeera has already been added
    const gameData = this.registry.get("gameData");
    if (gameData.ingredients["zeera"]) {
      // Zeera already exists, just show feedback but don't complete step again
      this.showFloatingText(
        item.x,
        item.y,
        `Zeera already added! Adding more...`,
        "#FFA500"
      );

      // Play sizzle effect for visual feedback anyway
      this.createSmokeEffect(
        this.itemPositions.stove.x,
        this.itemPositions.stove.y - 20,
        0xa0522d // Brown color for zeera
      );

      console.log(`Zeera was already added. Not completing step again.`);
      return false;
    }

    // Check if the pan is on the stove before adding zeera
    if (!this.panOnStove) {
      console.warn("Pan is not on stove yet!");
      this.showFloatingText(
        item.x,
        item.y,
        "Warning: Pan should be on stove first",
        "#FFA500"
      );

      // Log the mistake
      this.mistakes.push({
        type: "wrong_order",
        description: "Added zeera before placing pan on stove",
        step: step.id,
      });
    }

    // Play sizzle effect animation when adding zeera to hot oil
    this.createSmokeEffect(
      this.itemPositions.stove.x,
      this.itemPositions.stove.y - 20,
      0xa0522d // Brown color for zeera
    );

    // Show visual feedback
    this.showFloatingText(
      item.x,
      item.y,
      `Added ${quantity} of zeera`,
      "#008000"
    );

    // Complete the step
    this.completeStep(step, quantity);

    // Add to game data
    this.registry.get("gameData").ingredients["zeera"] = quantity;

    // Log successful addition
    console.log(`Zeera added successfully with quantity ${quantity}`);

    return true;
  }

  getCurrentStep() {
    // Find the first uncompleted step in sequential order
    // Get the next expected step ID (which is equal to completedStepIds.length + 1)
    const nextExpectedStepId = this.completedStepIds.length + 1;

    // Find that specific step by ID instead of just any uncompleted step
    const nextStep = this.steps.find((step) => step.id === nextExpectedStepId);

    if (nextStep) {
      return nextStep;
    }

    // If we can't find the exact next step, fall back to the old behavior as a safety measure
    return this.steps.find((step) => !step.completed);
  }

  highlightCurrentStep() {
    // Clear any existing highlights
    this.checklist.forEach((item) => {
      if (!item.completed) {
        item.text.setColor("#000000"); // Reset to black
      }
    });

    // Find the next uncompleted step
    const currentStep = this.getCurrentStep();
    if (currentStep) {
      const checklistItem = this.checklist[currentStep.id - 1];
      checklistItem.text.setColor("#0000FF"); // Highlight in blue
    }
  }

  checkRequiredTextures() {
    // Check if all required textures are loaded
    const requiredTextures = [
      "potato",
      "potato-raw",
      "potato-peeled",
      "potato-diced",
      "potato-cooked",
      "woodenSpoon",
      "mixingSpoon",
      "turmeric",
      "redChilli",
      "zeera",
      "salt",
      "oil",
      "pan",
      "stove",
      "choppingBoard",
    ];

    console.log("Checking texture availability:");
    requiredTextures.forEach((texture) => {
      const exists = this.textures.exists(texture);
      console.log(`Texture "${texture}": ${exists ? "✓ Loaded" : "✗ Missing"}`);
    });

    const missingTextures = requiredTextures.filter(
      (texture) => !this.textures.exists(texture)
    );

    if (missingTextures.length > 0) {
      console.warn(`Missing textures: ${missingTextures.join(", ")}`);
    } else {
      console.log("All required textures are loaded.");
    }
  }

  shutdown() {
    console.log("GameScene shutdown initiated");

    // Clear any active timers or intervals
    this.time.clearPendingEvents();

    // Destroy all interactive items
    Object.values(this.items).forEach((item) => {
      if (item && item.destroy) {
        item.destroy();
      }
    });

    // Clear debug graphics
    if (this.debugGraphics) {
      this.debugGraphics.clear();
      this.debugGraphics.destroy();
    }

    // Clear options panel
    if (this.optionsPanel) {
      this.optionsPanel.destroy();
      this.optionsPanel = null;
    }

    // Clear checklist elements
    if (this.checklistElements) {
      Object.values(this.checklistElements).forEach((element) => {
        if (element && element.destroy) {
          element.destroy();
        }
      });
    }

    // Clear checklist items
    if (this.checklist) {
      this.checklist.forEach((item) => {
        if (item.text && item.text.destroy) {
          item.text.destroy();
        }
        if (item.checkbox && item.checkbox.destroy) {
          item.checkbox.destroy();
        }
      });
    }

    // Clear hand cursor
    if (this.handCursor) {
      this.handCursor.destroy();
      this.handCursor = null;
    }

    console.log("GameScene shutdown complete");
  }
}

export default GameScene;
