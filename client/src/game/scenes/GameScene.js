import Phaser from "phaser";
import recipes from "../data/recipes";
import CursorManager from "../ui/components/CursorManager";

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.currentStep = 0;
    this.startTime = null;
    this.items = {};
    this.coordinateText = null;

    // Track loaded textures
    this.loadedTextures = new Set();

    // Add cursor manager
    this.cursorManager = null;

    // Track spices added
    this.addedSpices = {
      turmeric: false,
      redChilli: false,
      salt: false,
    };

    // Define cooking states for strict sequential progression
    this.cookingStates = {
      INITIAL: {
        canSelectPotato: true,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_1_POTATO_SELECTED: {
        canSelectPotato: false,
        canWash: true,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_2_POTATO_WASHED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: true,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_3_POTATO_PEELED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: true,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_4_POTATO_CHOPPED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: true,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_5_PAN_PLACED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: true,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_6_HEAT_SET: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: true,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_7_OIL_ADDED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: true,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_8_ZEERA_ADDED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: true,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
      STEP_9_POTATO_ADDED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: true,
        canStir: false,
        canCook: false,
      },
      STEP_10_TURMERIC_ADDED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: true,
        canStir: false,
        canCook: false,
      },
      STEP_11_REDCHILLI_ADDED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: true,
        canStir: false,
        canCook: false,
      },
      STEP_12_SALT_ADDED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: true,
        canCook: false,
      },
      STEP_13_STIRRED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: true,
      },
      STEP_14_COOKED: {
        canSelectPotato: false,
        canWash: false,
        canPeel: false,
        canChop: false,
        canPlacePan: false,
        canSetHeat: false,
        canAddOil: false,
        canAddZeera: false,
        canAddPotato: false,
        canAddSpices: false,
        canStir: false,
        canCook: false,
      },
    };

    // Current cooking state
    this.currentCookingState = "INITIAL";

    // Define prerequisites for each step
    this.prerequisites = {
      wash: { requires: ["potato_selected"], state: "POTATO_SELECTED" },
      peel: { requires: ["potato_washed"], state: "POTATO_WASHED" },
      chop: { requires: ["potato_peeled"], state: "POTATO_PEELED" },
      place_pan: { requires: ["potato_chopped"], state: "POTATO_CHOPPED" },
      set_heat: { requires: ["pan_placed"], state: "PAN_PLACED" },
      add_oil: { requires: ["heat_set"], state: "HEAT_SET" },
      add_zeera: { requires: ["oil_added"], state: "OIL_ADDED" },
      add_potato_to_pan: {
        requires: ["zeera_added", "potato_chopped"],
        state: "ZEERA_ADDED",
      },
      add_spice: { requires: ["potato_in_pan"], state: "POTATO_IN_PAN" },
      stir: { requires: ["potato_in_pan"], state: "POTATO_IN_PAN" },
      cook: { requires: ["stirred"], state: "STIRRED" },
    };

    // Track cooking progress flags
    this.cookingProgress = {
      potato_selected: false,
      potato_washed: false,
      potato_peeled: false,
      potato_chopped: false,
      pan_placed: false,
      heat_set: false,
      oil_added: false,
      zeera_added: false,
      potato_in_pan: false,
      turmeric_added: false,
      redchilli_added: false,
      salt_added: false,
      stirred: false,
      cooked: false,
    };

    // Track active hints
    this.activeHints = [];

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
      container1: "turmeric", // Turmeric/Haldi
      container2: "redChilli", // Red Chilli Powder
      "container-big": "zeera", // Zeera/Cumin Seeds
    };

    // Create alternate names mapping for better matching
    this.spiceNameVariants = {
      turmeric: ["turmeric", "haldi", "Turmeric"],
      redChilli: [
        "redChilli",
        "red chili powder",
        "Red Chili Powder",
        "red chilli",
      ],
      zeera: ["zeera", "cumin seeds", "Cumin Seeds", "jeera"],
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

    // Add texture mapping for fallbacks
    this.textureMap = {
      potato: ["potato", "potato-raw"],
      mixingSpoon: ["mixingSpoon", "mixing_spoon"],
      woodenSpoon: ["woodenSpoon", "wooden_spoon"],
      "potato-peeled": ["potato-peeled", "potato_peeled"],
      "potato-diced": ["potato-diced", "potato_diced"],
      "potato-cooked": ["potato-cooked", "potato_cooked"],
      // Other textures with fallbacks
    };

    // Track all event listeners for proper cleanup
    this.eventListeners = [];

    // Depth management system
    this.depths = {
      background: 0,
      midground: 1,
      foreground: 2,
      items: 3,
      interactiveItems: 4,
      cooking: 5,
      activeItem: 6,
      ui: 8,
      options: 10,
      debug: 15,
    };

    // Standard hit area sizes
    this.hitAreas = {
      small: { width: 50, height: 50 },
      medium: { width: 80, height: 80 },
      large: { width: 120, height: 120 },
      extraLarge: { width: 150, height: 150 },
    };

    // Initialize particle pool variables
    this.smokeParticles = [];
    this.maxSmokeParticles = 20;
  }

  // Update the cooking state based on progress
  updateCookingState(newState) {
    console.log(
      `Transitioning cooking state from ${this.currentCookingState} to ${newState}`
    );
    this.currentCookingState = newState;

    // Get game data
    const gameData = this.registry.get("gameData");
    if (!gameData.stateTransitions) {
      gameData.stateTransitions = [];
    }

    // Log state transition
    gameData.stateTransitions.push({
      from: this.currentCookingState,
      to: newState,
      timestamp: Date.now() - this.startTime,
      timeFormatted: this.formatTime(Date.now() - this.startTime),
    });

    // Update cooking progress flags based on state
    switch (newState) {
      case "STEP_1_POTATO_SELECTED":
        this.cookingProgress.potato_selected = true;
        break;
      case "STEP_2_POTATO_WASHED":
        this.cookingProgress.potato_washed = true;
        break;
      case "STEP_3_POTATO_PEELED":
        this.cookingProgress.potato_peeled = true;
        break;
      case "STEP_4_POTATO_CHOPPED":
        this.cookingProgress.potato_chopped = true;
        break;
      case "STEP_5_PAN_PLACED":
        this.cookingProgress.pan_placed = true;
        break;
      case "STEP_6_HEAT_SET":
        this.cookingProgress.heat_set = true;
        break;
      case "STEP_7_OIL_ADDED":
        this.cookingProgress.oil_added = true;
        break;
      case "STEP_8_ZEERA_ADDED":
        this.cookingProgress.zeera_added = true;
        break;
      case "STEP_9_POTATO_ADDED":
        this.cookingProgress.potato_in_pan = true;
        break;
      case "STEP_10_TURMERIC_ADDED":
        this.cookingProgress.turmeric_added = true;
        break;
      case "STEP_11_REDCHILLI_ADDED":
        this.cookingProgress.redchilli_added = true;
        break;
      case "STEP_12_SALT_ADDED":
        this.cookingProgress.salt_added = true;
        break;
      case "STEP_13_STIRRED":
        this.cookingProgress.stirred = true;
        break;
      case "STEP_14_COOKED":
        this.cookingProgress.cooked = true;
        // Recipe is now complete, prepare for showing final animation
        break;
      default:
        console.log(`No specific flag updates for state: ${newState}`);
        break;
    }

    // Show visual hints and update UI
    this.updateHints();
  }

  // Validate if an action is allowed in current cooking state
  isActionAllowed(action) {
    const currentState = this.cookingStates[this.currentCookingState];
    if (!currentState) return false;

    switch (action) {
      case "select_potato":
        return currentState.canSelectPotato;
      case "wash":
        return currentState.canWash;
      case "peel":
        return currentState.canPeel;
      case "chop":
        return currentState.canChop;
      case "place_pan":
        return currentState.canPlacePan;
      case "set_heat":
        return currentState.canSetHeat;
      case "add_oil":
        return currentState.canAddOil;
      case "add_zeera":
        return currentState.canAddZeera;
      case "add_potato_to_pan":
        return currentState.canAddPotato;
      case "add_spice":
        // Special handling for zeera (step 8)
        const currentStep = this.getCurrentStep();
        if (currentStep && currentStep.id === 8) {
          return currentState.canAddZeera;
        }
        // Only allow spices for steps 10-12
        return (
          currentStep &&
          (currentStep.id === 10 ||
            currentStep.id === 11 ||
            currentStep.id === 12)
        );
      case "stir":
        return currentState.canStir;
      case "cook":
        return currentState.canCook;
      default:
        console.log(`Unknown action: ${action}`);
        return false;
    }
  }

  // Validate action with prerequisites
  validateAction(action) {
    // First check if the action is allowed in the current cooking state
    if (!this.isActionAllowed(action)) {
      // Get the current step
      const currentStep = this.getCurrentStep();
      if (!currentStep)
        return { valid: false, message: "No more steps available" };

      // Create a user-friendly message based on the sequence
      const expectedStepId = this.completedStepIds.length + 1;
      let message = `You must complete step ${expectedStepId} first!`;

      return { valid: false, message };
    }

    return { valid: true };
  }

  // Special check for spices, oil and salt which can be added in any amount
  // but should still follow the proper sequence
  validateSpiceAddition(stepId) {
    // Must follow exact sequence
    const expectedStepId = this.completedStepIds.length + 1;
    return stepId === expectedStepId;
  }

  // Update visual hints based on current cooking state
  updateHints() {
    // Clear previous hints
    this.clearHints();

    // Create new hints based on current state and completed steps
    const nextExpectedStep = this.getCurrentStep();
    if (!nextExpectedStep) return;

    switch (nextExpectedStep.id) {
      case 1:
        this.createHint(this.items["potato"], "Start by selecting a potato");
        break;
      case 2:
        if (this.items["potato-on-board"]) {
          this.createHint(this.items["potato-on-board"], "Wash the potato");
        }
        break;
      case 3:
        if (this.items["potato-on-board"]) {
          this.createHint(this.items["potato-on-board"], "Peel the potato");
        }
        break;
      case 4:
        if (this.items["potato-peeled"]) {
          this.createHint(this.items["potato-peeled"], "Dice the potato");
        }
        break;
      case 5:
        this.createHint(this.items["pan"], "Place the pan on the stove");
        break;
      case 6:
        this.createHint(this.items["stove"], "Set the stove heat");
        break;
      case 7:
        this.createHint(this.items["oil"], "Add oil to the pan");
        break;
      case 8:
        // Only highlight the big container for cumin seeds (zeera)
        this.createHint(this.items["container-big"], "Add cumin seeds (zeera)");
        break;
      case 9:
        // Highlight diced potatoes to add to pan
        if (this.items["potato-diced"]) {
          this.createHint(
            this.items["potato-diced"],
            "Add diced potatoes to pan"
          );
        }
        break;
      case 10:
        // Only highlight container1 for turmeric
        this.createHint(this.items["container1"], "Add turmeric powder");
        break;
      case 11:
        // Only highlight container2 for red chilli
        this.createHint(this.items["container2"], "Add red chilli powder");
        break;
      case 12:
        // Only highlight salt container
        this.createHint(this.items["salt"], "Add salt");
        break;
      case 13:
        this.createHint(this.items["mixingSpoon"], "Stir the potatoes");
        break;
      case 14:
        this.createHint(
          this.items["pan"],
          "Click on the pan to finish cooking"
        );
        break;
    }
  }

  // Create a visual hint around an interactive element
  createHint(item, message) {
    if (!item) return;

    // Create a pulsing outline effect around the item
    const outline = this.add.graphics();
    const bounds = item.getBounds();

    // Expand bounds slightly
    const padding = 10;
    const x = bounds.x - padding;
    const y = bounds.y - padding;
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;

    // Draw outline
    outline.lineStyle(3, 0xffff00, 0.8);
    outline.strokeRoundedRect(x, y, width, height, 8);
    outline.setDepth(this.depths.ui - 1); // Just below UI elements

    // Create pulse animation
    this.tweens.add({
      targets: outline,
      alpha: { from: 0.8, to: 0.2 },
      duration: 800,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // Add tooltip text that appears on hover
    const tooltipBg = this.add
      .graphics()
      .fillStyle(0x000000, 0.7)
      .fillRoundedRect(0, 0, 200, 30, 8)
      .setVisible(false)
      .setDepth(this.depths.ui + 5);

    const tooltipText = this.add
      .text(0, 0, message, {
        font: "16px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(this.depths.ui + 6);

    // Position tooltip above the item
    const repositionTooltip = () => {
      const centerX = bounds.x + bounds.width / 2;
      const tooltipY = bounds.y - 40;
      tooltipBg.setPosition(centerX - 100, tooltipY - 15);
      tooltipText.setPosition(centerX, tooltipY);
    };

    repositionTooltip();

    // Show tooltip on hover
    if (item.input && item.input.enabled) {
      this.addManagedListener(item, "pointerover", () => {
        repositionTooltip();
        tooltipBg.setVisible(true);
        tooltipText.setVisible(true);
      });

      this.addManagedListener(item, "pointerout", () => {
        tooltipBg.setVisible(false);
        tooltipText.setVisible(false);
      });
    }

    // Store hint elements for later cleanup
    this.activeHints.push({
      outline,
      tooltipBg,
      tooltipText,
    });
  }

  // Clear all active hints
  clearHints() {
    if (!this.activeHints) return;

    this.activeHints.forEach((hint) => {
      if (hint.outline) hint.outline.destroy();
      if (hint.tooltipBg) hint.tooltipBg.destroy();
      if (hint.tooltipText) hint.tooltipText.destroy();

      // Stop any related tweens
      this.tweens.killTweensOf(hint.outline);
    });

    this.activeHints = [];
  }

  // Modified completeStep function to update cooking state
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
    if (!this.completedStepIds.includes(step.id)) {
      this.completedStepIds.push(step.id);
    }

    // Update checklist - ALWAYS update even if not visible
    this.updateChecklist(step.id);

    // Log step completion to game data with enhanced details
    const gameData = this.registry.get("gameData");
    const stepLog = {
      stepId: step.id,
      description: step.description,
      item: step.item,
      action: step.action,
      quantity: option,
      correct: true, // Default to true, can be modified by validation
      orderValid: this.validateStepOrder(step.id), // Check if step was done in correct order
      timestamp: Date.now() - this.startTime,
      timeFormatted: this.formatTime(Date.now() - this.startTime),
      mistakes: [], // Array to track any mistakes made during this step
    };

    // Check for mistakes
    const lastCompletedStep =
      this.completedStepIds[this.completedStepIds.length - 2];
    if (lastCompletedStep && step.id < lastCompletedStep) {
      stepLog.mistakes.push("wrong_order");
      stepLog.orderValid = false;
    }

    // Add step log to game data
    if (!gameData.steps) {
      gameData.steps = [];
    }
    gameData.steps.push(stepLog);

    // Track mistakes separately for easier AI analysis
    if (!gameData.mistakes) {
      gameData.mistakes = [];
    }
    if (stepLog.mistakes.length > 0) {
      gameData.mistakes.push({
        stepId: step.id,
        mistakes: stepLog.mistakes,
        timestamp: stepLog.timestamp,
        timeFormatted: stepLog.timeFormatted,
      });
    }

    // Update game score based on step completion
    this.updateScore(step, option);

    // Update cooking state based on step completion
    this.updateCookingStateFromStep(step);

    // Add event emission for step completion
    this.events.emit("step_completed", step.id);

    // Check if step 14 is completed, hide pan and potato-cooked and check if recipe is complete
    if (step.id === 14) {
      // Check if recipe is complete
      if (this.isRecipeComplete()) {
        // We need to hide the pan and potato-cooked visually before triggering finish animation
        if (this.items["pan"]) {
          this.items["pan"].setVisible(false);
        }
        if (this.items["potato-cooked"]) {
          this.items["potato-cooked"].setVisible(false);
        }

        // Trigger recipe completion
        this.time.delayedCall(500, () => {
          this.finishCooking();
        });
      }
    }
  }

  // Update cooking state based on completed step
  updateCookingStateFromStep(step) {
    if (!step) return;

    switch (step.id) {
      case 1: // Select potato
        this.updateCookingState("STEP_1_POTATO_SELECTED");
        break;
      case 2: // Wash potatoes
        this.updateCookingState("STEP_2_POTATO_WASHED");
        break;
      case 3: // Peel the potatoes
        this.updateCookingState("STEP_3_POTATO_PEELED");
        break;
      case 4: // Dice the potatoes
        this.updateCookingState("STEP_4_POTATO_CHOPPED");
        break;
      case 5: // Place pan on stove
        this.updateCookingState("STEP_5_PAN_PLACED");
        break;
      case 6: // Set stove to medium heat
        this.updateCookingState("STEP_6_HEAT_SET");
        break;
      case 7: // Add oil to the pan
        this.updateCookingState("STEP_7_OIL_ADDED");
        break;
      case 8: // Add cumin seeds (first spice)
        this.updateCookingState("STEP_8_ZEERA_ADDED");
        break;
      case 9: // Add diced potatoes to pan
        if (step.item === "potato-diced" && step.action === "add") {
          this.updateCookingState("STEP_9_POTATO_ADDED");
        }
        break;
      case 10: // Add turmeric
        this.updateCookingState("STEP_10_TURMERIC_ADDED");
        break;
      case 11: // Add red chilli powder
        this.updateCookingState("STEP_11_REDCHILLI_ADDED");
        break;
      case 12: // Add salt
        this.updateCookingState("STEP_12_SALT_ADDED");
        break;
      case 13: // Stir the potatoes
        this.updateCookingState("STEP_13_STIRRED");
        break;
      case 14: // Final cooking step
        this.updateCookingState("STEP_14_COOKED");
        break;
      default:
        console.log(`No cooking state update for step: ${step.id}`);
        break;
    }

    // Update visual hints
    this.updateHints();
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

    // Ensure ingredients object exists
    if (!gameData.ingredients) {
      gameData.ingredients = {};
    }

    // Ensure ingredientAdditions exists and has correct structure
    // if (!gameData.ingredientAdditions) {
    //   gameData.ingredientAdditions = {
    //     turmeric: [],
    //     redChilli: [],
    //     salt: [],
    //   };
    // } else {
    //   // Reset only spice additions for a fresh start
    //   gameData.ingredientAdditions = {
    //     turmeric: [],
    //     redChilli: [],
    //     salt: [],
    //   };
    // }

    // Reset ingredients for a fresh start
    gameData.ingredients = {};

    // Initialize cursor manager
    this.cursorManager = new CursorManager(this, {
      cursorKey: "handCursor",
      cursorPath: "assets/player.png",
      scale: 0.5,
      originX: 0.1,
      originY: 0.1,
    });

    // Rest of create method...

    // Track loaded textures when loading completes
    this.load.on("filecomplete", (key, type) => {
      if (type === "image") {
        this.loadedTextures.add(key);
        console.log(`Texture loaded and tracked: ${key}`);
      }
    });

    // Reset game state variables
    this.currentStep = 0;
    this.completedStepIds = [];
    this.items = {};
    this.actionInProgress = false;
    this.panOnStove = false;

    // Check if all required textures are loaded
    this.checkRequiredTextures();

    // Add scene event handler for shutdown/restart
    this.events.on("shutdown", this.shutdown, this);

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
    // this.showInteractiveAreas = false;
    // this.debugGraphics = this.add.graphics();

    // Add key listener for debug toggle
    // this.input.keyboard.on("keydown-D", () => {
    //   this.showInteractiveAreas = !this.showInteractiveAreas;
    //   console.log(
    //     `Debug visualization ${
    //       this.showInteractiveAreas ? "enabled" : "disabled"
    //     }`
    //   );
    //   this.updateDebugVisualization();
    // });

    // Create layered background
    this.createBackground();

    // Set up kitchen items
    this.setupKitchenItems();

    // Set up recipe checklist (hidden by default)
    this.setupRecipeChecklist();

    // Add UI elements
    this.createUI();

    // Show debug info
    // this.addDebugInfoText();

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
      .setDepth(this.depths.debug);

    // Add pointer move listener
    this.input.on("pointermove", (pointer) => {
      this.updateCoordinateDisplay(pointer);
    });

    // Initialize object pools
    this.textPool = [];
    this.particlePool = [];

    // Pre-create smoke particle pool
    this.preCreateParticles();

    // Initialize animation presets
    this.setupAnimationPresets();

    // After you setup the recipe checklist
    this.setupRecipeChecklist();

    // Add UI elements
    this.createUI();

    // Add initial highlight for recipe book if it's the player's first step
    if (this.currentStep === 0) {
      // Create a recipe book sprite at the specified position
      const recipeBook = this.add
        .sprite(
          (815 + 945 + 980 + 795) / 4,
          (645 + 645 + 815 + 815) / 4,
          "recipe-book"
        )
        .setDepth(this.depths.items);

      // If recipe-book texture doesn't exist, create a rectangle placeholder
      if (!this.textures.exists("recipe-book")) {
        // Calculate width and height from the provided coordinates
        const width = Math.abs(815 - 945);
        const height = Math.abs(645 - 815);
        recipeBook.destroy(); // Remove the sprite that failed to load

        // Create a rectangle instead
        const recipeBookRect = this.add
          .rectangle(
            (815 + 945 + 980 + 795) / 4,
            (645 + 645 + 815 + 815) / 4,
            width,
            height,
            0xd2b48c,
            0.01
          )
          .setDepth(this.depths.items);

        // Create a hint using the rectangle
        this.createHint(recipeBookRect, "Check the Recipe Book!");

        // Add text at the requested position (1030, 710)
        const hintText = this.add
          .text(1030, 710, "Check the\nRecipe Book!", {
            font: "bold 16px Arial",
            fill: "#000000",
            align: "center",
            stroke: "#ffffff",
            strokeThickness: 2,
          })
          .setOrigin(0.5, 0.5)
          .setDepth(this.depths.ui + 5);

        // Store references for cleanup
        this.recipeBookHighlight = {
          rectangle: recipeBookRect,
          text: hintText,
        };
      } else {
        // Use standard hint if texture exists
        this.createHint(recipeBook, "Check the Recipe Book!");

        // Add text at the requested position (1030, 710)
        const hintText = this.add
          .text(1030, 710, "Check the\nRecipe Book!", {
            font: "bold 16px Arial",
            fill: "#000000",
            align: "center",
            stroke: "#ffffff",
            strokeThickness: 2,
          })
          .setOrigin(0.5, 0.5)
          .setDepth(this.depths.ui + 5);

        // Store references for cleanup
        this.recipeBookHighlight = {
          sprite: recipeBook,
          text: hintText,
        };
      }

      // Remove highlight after 12 seconds
      this.time.delayedCall(12000, () => {
        if (this.recipeBookHighlight) {
          // Clear the text
          if (this.recipeBookHighlight.text) {
            this.recipeBookHighlight.text.destroy();
          }

          // Clear the sprite/rectangle if it exists
          if (this.recipeBookHighlight.sprite) {
            this.recipeBookHighlight.sprite.destroy();
          }
          if (this.recipeBookHighlight.rectangle) {
            this.recipeBookHighlight.rectangle.destroy();
          }

          // Clear any hints that might be associated with the recipe book
          this.clearHints();

          this.recipeBookHighlight = null;
        }
      });
    }
  }

  // Pre-create smoke particles for pooling
  preCreateParticles() {
    console.log(
      `Pre-creating ${this.maxSmokeParticles} smoke particles for pool`
    );
    this.smokeParticles = [];

    for (let i = 0; i < this.maxSmokeParticles; i++) {
      const particle = this.add
        .circle(0, 0, 10, 0xffffff, 0.6)
        .setDepth(this.depths.cooking)
        .setVisible(false);
      this.smokeParticles.push(particle);
    }
  }

  // Get an available smoke particle from the pool
  getSmokeParticle() {
    // Try to find an inactive particle in the pool
    const particle = this.smokeParticles.find((p) => !p.visible);

    // Return existing particle or create a new one if pool is depleted
    if (particle) {
      return particle;
    } else {
      console.warn("Smoke particle pool depleted, creating new particle");
      const newParticle = this.add
        .circle(0, 0, 10, 0xffffff, 0.6)
        .setDepth(this.depths.cooking)
        .setVisible(false);
      this.smokeParticles.push(newParticle);
      return newParticle;
    }
  }

  // Animation preset system
  setupAnimationPresets() {
    // Animation presets for consistent and easy-to-maintain animations
    this.animationPresets = {
      moveToStove: {
        duration: 500,
        ease: "Linear",
      },
      stirring: {
        angle: { from: -15, to: 15 },
        ease: "Sine.easeInOut",
        duration: 500,
        yoyo: true,
        repeat: 3,
      },
      floatingText: {
        y: "-=50",
        alpha: 0,
        duration: 1500,
      },
      scaleIn: {
        scale: { from: 0, to: 1 },
        duration: 200,
        ease: "Back.easeOut",
      },
      scaleOut: {
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 200,
        ease: "Back.easeIn",
      },
      buttonHover: {
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      },
      buttonClick: {
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
      },
      cookingEffect: {
        scale: { from: 1, to: 2 },
        alpha: 0,
        duration: 1500,
      },
      celebrationReveal: {
        scale: 1.5,
        duration: 1000,
        ease: "Bounce.Out",
      },
    };
  }

  // Unified animation player
  playAnimation(target, preset, customProps = {}) {
    // Check if preset exists
    if (!this.animationPresets[preset]) {
      console.warn(`Animation preset "${preset}" not found`);
      return null;
    }

    // Merge preset with custom properties
    const config = {
      targets: target,
      ...this.animationPresets[preset],
      ...customProps,
    };

    return this.tweens.add(config);
  }

  update() {
    // Update game timer
    this.updateTimer();

    // Update debug visualization if enabled
    if (this.showInteractiveAreas) {
      this.updateDebugVisualization();
    }
  }

  // Centralize checklist updates
  updateChecklist(stepId, completed = true) {
    if (stepId <= 0 || stepId > this.checklist.length) {
      console.warn(`Invalid step ID: ${stepId}`);
      return;
    }

    const item = this.checklist[stepId - 1];
    item.completed = completed;

    // Update the checkbox visual state
    item.checkbox.clear();
    if (completed) {
      // Draw checkbox with checkmark (filled)
      item.checkbox.fillStyle(0x4b2504, 0.2);
      item.checkbox.fillRect(905 - 10, item.text.y - 10, 20, 20);
      item.checkbox.lineStyle(2, 0x4b2504, 1);
      item.checkbox.strokeRect(905 - 10, item.text.y - 10, 20, 20);

      // Draw checkmark
      item.checkbox.lineStyle(3, 0x008000, 1);
      item.checkbox.beginPath();
      item.checkbox.moveTo(905 - 6, item.text.y);
      item.checkbox.lineTo(905, item.text.y + 5);
      item.checkbox.lineTo(905 + 5, item.text.y - 6);
      item.checkbox.strokePath();

      // Mark text as completed
      item.text.setColor("#008000");
    } else {
      // Draw empty checkbox
      item.checkbox.lineStyle(2, 0x4b2504, 1);
      item.checkbox.strokeRect(905 - 10, item.text.y - 10, 20, 20);

      // Reset text color
      item.text.setColor("#000000");
    }

    // Highlight the next step in the checklist
    this.highlightCurrentStep();
  }

  // Highlight the current step in the checklist
  highlightCurrentStep() {
    // Reset all text colors first
    this.checklist.forEach((item) => {
      if (!item.completed) {
        item.text.setColor("#000000");
      } else {
        item.text.setColor("#008000");
      }
    });

    // Find the first uncompleted step and highlight it
    const nextStep = this.checklist.find((item) => !item.completed);
    if (nextStep) {
      nextStep.text.setColor("#0000FF");
    }
  }

  createBackground() {
    // Use actual background layer images with exact Figma positions
    // Background layer (furthest back)
    this.add.image(640, 480, "background").setDepth(this.depths.background);

    // Mid-layer elements (using updated Figma coordinates)
    this.add.image(640, 474 + 308 / 2, "mid").setDepth(this.depths.midground);

    // Front layer elements (using updated Figma coordinates)
    this.add
      .image(640, 669 + 291 / 2, "front")
      .setDepth(this.depths.foreground);
  }

  setupKitchenItems() {
    // Create kitchen items like pans, knives, ingredients, etc.
    // Logic to create all kitchen items
    console.log("Setting up kitchen items...");

    // Add kitchen equipment from Figma layout
    const setupItem = (key, interactable = true, depth = this.depths.items) => {
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
      const sprite = this.add.image(x, y, this.getTexture(key)).setDepth(depth);

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
          console.log(`Set larger hit area for ${key}`);
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

          // Make hitbox larger for easier interaction
          sprite.input.hitArea.setTo(-30, -30, pos.width + 60, pos.height + 60);
          console.log(`Set larger hit area for ${key}`);
        }
      } else {
        // Default center origin for other items
        sprite.setOrigin(0.5);

        // Make it interactive if needed
        if (interactable) {
          sprite.setInteractive({ useHandCursor: true, pixelPerfect: false });

          // Add larger hit areas for specific items
          if (key === "stove") {
            sprite.input.hitArea.setTo(
              -30,
              -30,
              pos.width + 60,
              pos.height + 60
            );
            console.log("Set larger hit area for stove");
          } else if (key === "pan") {
            sprite.input.hitArea.setTo(
              -20,
              -20,
              pos.width + 40,
              pos.height + 40
            );
            console.log("Set larger hit area for pan");
          } else if (key === "choppingBoard") {
            sprite.input.hitArea.setTo(
              -20,
              -20,
              pos.width + 40,
              pos.height + 40
            );
            console.log("Set larger hit area for chopping board");
          } else if (
            key === "container1" ||
            key === "container2" ||
            key === "container-big" ||
            key === "salt"
          ) {
            sprite.input.hitArea.setTo(
              -15,
              -15,
              pos.width + 30,
              pos.height + 30
            );
            console.log(`Set larger hit area for ${key}`);
          } else if (key === "oil") {
            sprite.input.hitArea.setTo(
              -15,
              -20,
              pos.width + 30,
              pos.height + 40
            );
            console.log("Set larger hit area for oil");
          }
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
    setupItem("stove", true, this.depths.items);
    const choppingBoard = setupItem(
      "choppingBoard",
      true,
      this.depths.midground
    );

    // Pan initially not on stove
    const pan = setupItem("pan", true, this.depths.interactiveItems);
    this.panOnStove = false;

    // Set up interactive spoons/utensils
    const woodenSpoon = setupItem(
      "woodenSpoon",
      true,
      this.depths.interactiveItems
    );
    const mixingSpoon = setupItem(
      "mixingSpoon",
      true,
      this.depths.interactiveItems
    );

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

    // Adding click handler for wooden spoon
    if (woodenSpoon) {
      this.addManagedListener(woodenSpoon, "pointerdown", () => {
        const relevantStep = this.getCurrentStep();
        console.log("Wooden spoon clicked, current step:", relevantStep);
        if (
          relevantStep &&
          relevantStep.action === "cook" &&
          relevantStep.id !== 14 && // Skip the final cooking step - user must click pan
          !this.actionInProgress
        ) {
          if (relevantStep.action === "cook") {
            this.showCookingOptions(woodenSpoon, relevantStep);
          }
        } else if (
          relevantStep &&
          relevantStep.id === 14 &&
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
      this.addManagedListener(mixingSpoon, "pointerdown", () => {
        const relevantStep = this.getCurrentStep();
        console.log("Mixing spoon clicked, current step:", relevantStep);
        if (
          relevantStep &&
          (relevantStep.action === "mix" || relevantStep.action === "stir") &&
          relevantStep.id !== 14 && // Skip the final cooking step - user must click pan
          !this.actionInProgress
        ) {
          this.showSpoonOptions(mixingSpoon, relevantStep, relevantStep.action);
        } else if (
          relevantStep &&
          relevantStep.id === 14 &&
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
          .image(
            pos.x + pos.width / 2,
            pos.y + pos.height / 2,
            this.getTexture(key)
          )
          .setDepth(this.depths.cooking)
          .setVisible(false);
        this.items[key] = item;
        return;
      }

      // Add a visible potato to the basket using exact Figma coordinates
      if (key === "potato") {
        // Try using 'potato' or 'potato-raw' as the texture key
        const textureKey = this.getTexture(key);

        console.log(`Using potato texture key: ${textureKey}`);

        // Use exact Figma coordinates
        const item = this.add
          .image(pos.x + pos.width / 2, pos.y + pos.height / 2, textureKey)
          .setInteractive({ useHandCursor: true, pixelPerfect: false })
          .setDepth(this.depths.items);

        // Make hitbox larger for easier interaction
        item.input.hitArea.setTo(-30, -30, pos.width + 60, pos.height + 60);
        console.log("Set larger hit area for potato");

        // Add click handler directly to the potato instead of the basket
        this.addManagedListener(item, "pointerdown", () => {
          // Check if this action is allowed in current state
          const validationResult = this.validateAction("select_potato");

          if (validationResult.valid) {
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

                // Complete the potato selection step
                const potatoSelectionStep = this.steps.find(
                  (step) =>
                    !step.completed &&
                    (step.item === "potato" || step.item === "potato-raw") &&
                    step.action === "select"
                );
                if (potatoSelectionStep) {
                  this.completeStep(potatoSelectionStep);
                  this.updateCookingState("STEP_1_POTATO_SELECTED");
                }

                // Determine the correct texture key to use
                const textureKey = this.getTexture("potato");

                // Create a new potato in the basket using Figma coordinates
                const newBasketPotato = this.add
                  .image(
                    pos.x + pos.width / 2,
                    pos.y + pos.height / 2,
                    textureKey
                  )
                  .setInteractive({ useHandCursor: true, pixelPerfect: false })
                  .setDepth(this.depths.items);

                // Add click handler to the new basket potato
                this.addManagedListener(newBasketPotato, "pointerdown", () => {
                  // Check current step to see if we should take action
                  const currentStep = this.getCurrentStep();
                  if (
                    currentStep &&
                    (currentStep.item === "potato-raw" ||
                      currentStep.item === "potato") &&
                    !this.actionInProgress
                  ) {
                    // If it's the correct time for potato interaction, delegate to the original handler
                    item.emit("pointerdown");
                  } else if (!this.actionInProgress) {
                    const validationResult =
                      this.validateAction("select_potato");
                    if (!validationResult.valid) {
                      this.showFloatingText(
                        newBasketPotato.x,
                        newBasketPotato.y,
                        validationResult.message,
                        "#FF0000"
                      );
                    } else {
                      this.showFloatingText(
                        newBasketPotato.x,
                        newBasketPotato.y,
                        "Not yet time for this step!",
                        "#FF0000"
                      );
                    }
                  } else {
                    this.showFloatingText(
                      newBasketPotato.x,
                      newBasketPotato.y,
                      "Action in progress...",
                      "#FFA500"
                    );
                  }
                });

                // Update the basket potato reference
                this.items["potato"] = newBasketPotato;

                // Add click handler to the potato on the chopping board
                potatoOnBoard.off("pointerdown"); // Remove old handlers if any
                this.addManagedListener(potatoOnBoard, "pointerdown", () => {
                  console.log("Potato clicked on chopping board");

                  // Check state and determine allowed actions
                  if (this.currentCookingState === "INITIAL") {
                    // First interaction - transition to STEP_1_POTATO_SELECTED state
                    this.updateCookingState("STEP_1_POTATO_SELECTED");
                    this.showFloatingText(
                      potatoOnBoard.x,
                      potatoOnBoard.y,
                      "Potato selected! Now wash it.",
                      "#008000"
                    );
                  } else if (this.isActionAllowed("wash")) {
                    // Show options dialog for washing
                    const currentStep = this.getCurrentStep();
                    this.showPrepOptions(potatoOnBoard, currentStep);
                  } else if (this.isActionAllowed("peel")) {
                    // Show options dialog for peeling
                    const currentStep = this.getCurrentStep();
                    this.showPrepOptions(potatoOnBoard, currentStep);
                  } else if (!this.actionInProgress) {
                    const validationResult = this.validateAction(
                      this.cookingProgress.potato_washed ? "peel" : "wash"
                    );
                    this.showFloatingText(
                      potatoOnBoard.x,
                      potatoOnBoard.y,
                      validationResult.message || "Not yet time for this step!",
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
          } else {
            // Show error message if action isn't allowed
            this.showFloatingText(
              item.x,
              item.y,
              validationResult.message || "Can't select potato at this time",
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

      // Create the item with exact coordinates from Figma
      const item = this.add
        .image(
          pos.x + pos.width / 2,
          pos.y + pos.height / 2,
          this.getTexture(key)
        )
        .setInteractive({ useHandCursor: true, pixelPerfect: false })
        .setDepth(this.depths.items);

      // Adjust depth for specific items
      if (key === "basket") {
        item.setDepth(this.depths.midground); // Ensure basket is below other items
      }

      if (key === "recipeBook") {
        // Add larger hit area for recipe book
        item.input.hitArea.setTo(-20, -20, pos.width + 40, pos.height + 40);
      }

      // Add click handlers based on item type
      if (key === "stove") {
        this.addManagedListener(item, "pointerdown", () => {
          // Check if this action is allowed based on current state
          const validationResult = this.validateAction("set_heat");

          // Only allow if set_heat is valid in current state
          if (validationResult.valid) {
            this.showStoveOptions(item);
          } else {
            this.showFloatingText(
              item.x,
              item.y,
              validationResult.message || "Not yet time to set stove heat!",
              "#FF0000"
            );
          }
        });
      } else if (key === "recipeBook") {
        this.addManagedListener(item, "pointerdown", () => {
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

          // Remove the recipe book highlight if it exists
          if (this.recipeBookHighlight) {
            // Clear the text
            if (this.recipeBookHighlight.text) {
              this.recipeBookHighlight.text.destroy();
            }

            // Clear the sprite/rectangle if it exists
            if (this.recipeBookHighlight.sprite) {
              this.recipeBookHighlight.sprite.destroy();
            }
            if (this.recipeBookHighlight.rectangle) {
              this.recipeBookHighlight.rectangle.destroy();
            }

            // Clear any hints that might be associated with the recipe book
            this.clearHints();

            this.recipeBookHighlight = null;
          }

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
        this.addManagedListener(item, "pointerdown", () => {
          // Get the spice name from the map
          const spiceName = this.spiceMap[key];
          console.log(`Clicked ${key} which contains ${spiceName}`);

          // Get current step
          const currentStep = this.getCurrentStep();
          console.log("Current step:", currentStep);

          // Special handling for zeera (step 8)
          if (spiceName === "zeera" && currentStep && currentStep.id === 8) {
            const validationResult = this.validateAction("add_zeera");
            if (validationResult.valid) {
              this.showOptions(
                item.x,
                item.y - 100,
                ["¼ tsp", "½ tsp", "1 tsp"],
                (option) => this.handleZeeraAddition(item, option),
                "Choose Cumin Seeds Amount"
              );
              return;
            }
          }

          // For other spices
          const validationResult = this.validateAction("add_spice");
          if (validationResult.valid) {
            // Show options for adding this spice
            this.showSpiceOptions(
              item,
              key,
              currentStep || {
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
              validationResult.message || "Complete previous steps first!",
              "#FF0000"
            );
          }
        });
      } else if (key === "salt") {
        // Salt container
        this.addManagedListener(item, "pointerdown", () => {
          console.log("Salt container clicked");

          // Check if allowed in current state
          const validationResult = this.validateAction("add_spice");

          if (validationResult.valid) {
            // Show salt-specific options
            const relevantStep = this.getCurrentStep();
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
              validationResult.message || "Complete previous steps first!",
              "#FF0000"
            );
          }
        });
      } else if (key === "oil") {
        // Oil container
        this.addManagedListener(item, "pointerdown", () => {
          console.log("Oil container clicked");

          // Check if allowed in current state
          const validationResult = this.validateAction("add_oil");

          if (validationResult.valid) {
            // Show oil-specific options
            const relevantStep = this.getCurrentStep();
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
              validationResult.message || "Complete previous steps first!",
              "#FF0000"
            );
          }
        });
      }

      this.items[key] = item;
      console.log(`Created item: ${key}`);
    });

    // Setup heat indicator for stove with enhanced styling
    const stovePos = this.itemPositions.stove;
    this.stoveHeat = this.add
      .container(
        stovePos.x + stovePos.width / 2,
        stovePos.y + stovePos.height - 30
      )
      .setDepth(this.depths.ui)
      .setVisible(false);

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

    checklistPanel.setDepth(this.depths.ui).setVisible(false);

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
      .setDepth(this.depths.ui)
      .setVisible(false);

    // Add decorative spoon icon at the top of the recipe
    if (this.textures.exists("woodenSpoon")) {
      const spoonIcon = this.add
        .image(910, 205, "woodenSpoon")
        .setOrigin(0.5)
        .setScale(0.2)
        .setRotation(-0.5)
        .setDepth(this.depths.ui)
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
      checkbox.setDepth(this.depths.ui).setVisible(false);

      // Step number and description with smaller font and better wrapping
      const text = this.add
        .text(925, y, `${index + 1}. ${step.description}`, {
          font: "16px Arial",
          fill: "#000000",
          align: "left",
          wordWrap: { width: 280 },
        })
        .setOrigin(0, 0.5)
        .setDepth(this.depths.ui)
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
      .setDepth(this.depths.ui);

    // Add back button
    const backButton = this.add
      .rectangle(120, 80, 150, 60, 0x8b4513)
      .setDepth(this.depths.ui);

    // Set up interaction using our standard method
    this.setUpInteraction(backButton, "large").on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    // Add back button text
    const backText = this.add
      .text(120, 80, "Back", {
        font: "20px Arial",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5)
      .setDepth(this.depths.ui + 1);

    // Make sure the text doesn't interfere with button clicks
    backText.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    // Add debug button for mobile users
    // const debugButton = this.add
    //   .rectangle(1200, 80, 150, 60, 0x004488)
    //   .setDepth(this.depths.ui);

    // // Set up interaction using our standard method
    // this.setUpInteraction(debugButton, "medium").on("pointerdown", () => {
    //   this.showInteractiveAreas = !this.showInteractiveAreas;
    //   console.log(
    //     `Debug visualization ${
    //       this.showInteractiveAreas ? "enabled" : "disabled"
    //     }`
    //   );
    //   this.updateDebugVisualization();

    //   // Change button color based on state
    //   debugButton.fillColor = this.showInteractiveAreas ? 0x00aa00 : 0x004488;

    //   // Handle visibility of debug texts
    //   if (this.debugTexts) {
    //     Object.values(this.debugTexts).forEach((text) => {
    //       text.setVisible(this.showInteractiveAreas);
    //     });
    //   }
    // });

    // this.add
    //   .text(1200, 80, "Debug", {
    //     font: "20px Arial",
    //     fill: "#FFFFFF",
    //   })
    //   .setOrigin(0.5)
    //   .setDepth(this.depths.ui);

    // // Add finishCooking debug button
    // const finishCookingButton = this.add
    //   .rectangle(1200, 160, 200, 60, 0xff0000)
    //   .setDepth(this.depths.ui);

    // // Set up interaction using our standard method
    // this.setUpInteraction(finishCookingButton, "medium").on(
    //   "pointerdown",
    //   () => {
    //     console.log("Debug: Triggering finishCooking method");
    //     this.finishCooking();
    //   }
    // );

    // this.add
    //   .text(1200, 160, "Test Final Animation", {
    //     font: "16px Arial",
    //     fill: "#FFFFFF",
    //   })
    //   .setOrigin(0.5)
    //   .setDepth(this.depths.ui);

    // // Add key listener for debug toggle
    // this.input.keyboard.on("keydown-D", () => {
    //   this.showInteractiveAreas = !this.showInteractiveAreas;
    //   console.log(
    //     `Debug visualization ${
    //       this.showInteractiveAreas ? "enabled" : "disabled"
    //     }`
    //   );
    //   this.updateDebugVisualization();

    //   // Change button color based on state
    //   debugButton.fillColor = this.showInteractiveAreas ? 0x00aa00 : 0x004488;

    //   // Handle visibility of debug texts
    //   if (this.debugTexts) {
    //     Object.values(this.debugTexts).forEach((text) => {
    //       text.setVisible(this.showInteractiveAreas);
    //     });
    //   }
    // });

    // // Setup coordinate display for debugging
    if (this.registry.get("debugMode")) {
      this.setupCoordinateDisplay();
    }
  }

  setHandCursor(sprite) {
    if (sprite && this.cursorManager) {
      this.cursorManager.addInteractive(sprite);
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
    // Show medium/high heat options
    if (!this.panOnStove) {
      this.showFloatingText(
        stove.x,
        stove.y,
        "Place the pan on the stove first!",
        "#FF0000"
      );
      return;
    }

    const options = ["Medium Heat", "High Heat"];
    const step = this.steps.find((s) => s.id === 6); // Heat pan step

    this.showOptions(
      stove.x,
      stove.y - 100,
      options,
      (option) => {
        const heatLevel = option.includes("Medium") ? "medium" : "high";

        // Store heat level in game data
        const gameData = this.registry.get("gameData");
        if (!gameData.ingredients) gameData.ingredients = {};
        gameData.ingredients.stove_heat = heatLevel;

        // Update stove visual feedback
        const stoveHighlight = this.items.stoveHighlight;
        if (stoveHighlight) {
          stoveHighlight.setTint(heatLevel === "high" ? 0xff3300 : 0xff9900);
          stoveHighlight.setAlpha(0.5);
        }

        // Make the heat indicator visible
        if (this.stoveHeat) {
          this.stoveHeat.setVisible(true);
        }

        // Update heat level text with smaller font for medium heat to prevent overflow
        if (this.stoveHeatText) {
          this.stoveHeatText.setText(heatLevel.toUpperCase());
          // Adjust font size based on heat level to prevent overflow
          if (heatLevel === "medium") {
            this.stoveHeatText.setStyle({
              font: "14px Arial",
              fill: "#FFFFFF",
            });
          } else {
            this.stoveHeatText.setStyle({
              font: "16px Arial",
              fill: "#FFFFFF",
            });
          }
        }

        // Show hint
        this.showFloatingText(
          stove.x,
          stove.y - 30,
          `Stove set to ${heatLevel} heat!`,
          "#008000"
        );

        // Create multiple smoke particles for better visibility
        for (let i = 0; i < 5; i++) {
          this.time.delayedCall(i * 150, () => {
            this.createSmokeEffect(stove.x, stove.y - 50);
          });
        }

        // Complete step if it exists
        if (step) {
          this.completeStep(step, heatLevel);
        }
      },
      "Set Heat Level"
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

    // Special handling for zeera (step 8)
    if (step.id === 8) {
      const options = ["¼ tsp", "½ tsp", "1 tsp"];
      this.showOptions(
        item.x,
        item.y - 100,
        options,
        (option) => {
          this.handleZeeraAddition(item, option);
          // Disable the interaction after use
          item.disableInteractive();
          // Add visual indication that it's been used
          item.setAlpha(0.7);
        },
        "Choose Cumin Seeds Amount"
      );
      return;
    }

    // For other spices (steps 10-12), enforce strict order
    const expectedStepId = this.completedStepIds.length + 1;
    if (step.id !== expectedStepId) {
      this.showFloatingText(
        item.x,
        item.y,
        `You must complete step ${expectedStepId} first!`,
        "#FF0000"
      );
      return;
    }

    // Define quantity options
    const options = ["¼ tsp", "½ tsp", "1 tsp"];

    // Create appropriate dialog title based on step
    let dialogTitle = "Choose Amount";
    switch (step.id) {
      case 10:
        dialogTitle = "Choose Turmeric Amount";
        break;
      case 11:
        dialogTitle = "Choose Red Chilli Amount";
        break;
      case 12:
        dialogTitle = "Choose Salt Amount";
        break;
    }

    this.showOptions(
      item.x,
      item.y - 100,
      options,
      (option) => {
        console.log(`Selected quantity for step ${step.id}: ${option}`);

        // Get game data
        const gameData = this.registry.get("gameData");
        if (!gameData.ingredients) {
          gameData.ingredients = {};
        }

        // Record the ingredient addition
        let ingredientName;
        switch (step.id) {
          case 10:
            ingredientName = "turmeric";
            break;
          case 11:
            ingredientName = "redChilli";
            break;
          case 12:
            ingredientName = "salt";
            break;
          default:
            ingredientName = null;
            console.log(`Unknown step ID for ingredient name: ${step.id}`);
            break;
        }

        if (ingredientName) {
          gameData.ingredients[ingredientName] = option;
        }

        // Show success message
        this.showFloatingText(
          item.x,
          item.y,
          `Added ${option} of ${ingredientName}`,
          "#008000"
        );

        // Complete the step
        this.completeStep(step, option);

        // Disable the interaction after use
        item.disableInteractive();
        // Add visual indication that it's been used
        item.setAlpha(0.7);

        // Create smoke effect if pan is on stove
        if (this.panOnStove) {
          // Choose smoke color based on spice
          let tint;
          switch (step.id) {
            case 10:
              tint = 0xFFC107; // Turmeric yellow
              break;
            case 11:
              tint = 0xFF5722; // Red chili color
              break;
            case 12:
              tint = 0xFFFFFF; // White for salt
              break;
            default:
              tint = 0xdddddd; // Default gray smoke
              break;
          }

          // Create multiple smoke particles for better effect
          for (let i = 0; i < 4; i++) {
            this.time.delayedCall(i * 200, () => {
              this.createSmokeEffect(550, 640, tint, 0.8);
            });
          }
        }
      },
      dialogTitle
    );
  }

  showPrepOptions(potato, step) {
    console.log("Showing potato prep options:", step);

    // Check what action we need to take based on the step
    if (step.action === "wash") {
      // Show only washing option when that's the current step
      this.showOptions(
        potato.x,
        potato.y - 60,
        ["Wash potato"],
        (option) => {
          this.washPotato(potato, step);
        },
        "Prepare Potato"
      );
    } else if (step.action === "peel" && this.cookingProgress.potato_washed) {
      // Only show peel option if potato is washed
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
      // If no specific action or invalid state, show appropriate message
      this.showFloatingText(
        potato.x,
        potato.y,
        this.cookingProgress.potato_washed
          ? "Potato is already washed!"
          : "You need to wash the potato first!",
        "#FFA500"
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
        .image(peelX, peelY, this.getTexture("potato-peeled"))
        .setInteractive()
        .setDepth(this.depths.items);

      // Add click handler to peeled potato
      this.addManagedListener(peeled, "pointerdown", () => {
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

    // Use animation preset system
    this.playAnimation(pan, "moveToStove", {
      x: targetX,
      y: targetY,
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
                .image(dicedX, dicedY, this.getTexture("potato-diced"))
                .setInteractive()
                .setDepth(this.depths.cooking)
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

        // Disable interaction with the diced potato once it's in the pan
        diced.disableInteractive();

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

    // Create smoke interval for continuous effect during stirring
    let smokeInterval;

    // Store original position of the spoon
    const originalX = spoon.x;
    const originalY = spoon.y;
    const originalAngle = spoon.angle || 0;
    const originalDepth = spoon.depth || this.depths.interactiveItems;

    // Get stirring position
    const stirPosition = {
      x: 635,
      y: 630,
    };

    // Make sure we're using the mixing spoon if available
    let stirSpoon = spoon;
    if (spoon.texture.key !== "mixingSpoon" && this.items["mixingSpoon"]) {
      console.log("Using mixing spoon instead of provided spoon");
      stirSpoon = this.items["mixingSpoon"];
    }

    // Move mixing spoon to pan
    this.playAnimation(stirSpoon, "moveToStove", {
      x: stirPosition.x,
      y: stirPosition.y,
      onComplete: () => {
        stirSpoon.setDepth(this.depths.activeItem);

        // Start continuous smoke effect
        smokeInterval = setInterval(() => {
          this.createSmokeEffect(550, 640, 0xcccccc, 0.3);
        }, 200);

        // Use stirring animation preset
        this.playAnimation(stirSpoon, "stirring", {
          onComplete: () => {
            // Clear smoke interval
            if (smokeInterval) {
              clearInterval(smokeInterval);
            }

            // Return spoon to original position
            this.playAnimation(stirSpoon, "moveToStove", {
              x: originalX,
              y: originalY,
              angle: originalAngle,
              onComplete: () => {
                stirSpoon.setDepth(originalDepth);
                this.actionInProgress = false;

                // Hide diced potato and show cooking potato
                if (this.items["potato-diced"]) {
                  this.items["potato-diced"].setVisible(false);
                }

                // Get the cooking position
                const cookingPos =
                  this.itemPositions["potato-cooking"] ||
                  this.itemPositions["potato-cooked"];
                const cookingX = cookingPos.x + cookingPos.width / 2;
                const cookingY = cookingPos.y + cookingPos.height / 2;

                // Create or show the cooking potato - use potato-cooking instead of potato-cooked
                if (this.items["potato-cooking"]) {
                  this.items["potato-cooking"].setVisible(true);
                  this.items["potato-cooking"].setPosition(cookingX, cookingY);
                } else {
                  this.items["potato-cooking"] = this.add
                    .image(
                      cookingX,
                      cookingY,
                      this.getTexture("potato-cooking")
                    )
                    .setDepth(this.depths.cooking);
                }

                this.showFloatingText(
                  stirPosition.x,
                  stirPosition.y - 30,
                  "Potatoes stirred!",
                  "#008000"
                );

                if (step) {
                  this.completeStep(step, "medium");
                }
              },
            });
          },
        });
      },
    });
  }

  showCookingOptions(source, step, isFromPan = false) {
    this.showOptions(
      source.x,
      source.y - 100,
      step.options,
      (option) => {
        this.actionInProgress = true;

        const cookTimeMin = parseInt(option);
        let countdown = 7;

        // Position countdown text at 550, 905 for final cooking step
        const countdownPosition = {
          x: 550,
          y: step.id === 14 ? 905 : source.y - 70,
        };

        // Create a better-looking container for the countdown timer
        const countdownBg = this.add
          .graphics()
          .fillStyle(0x000000, 0.7)
          .fillRoundedRect(
            countdownPosition.x - 65,
            countdownPosition.y - 15,
            130,
            30,
            10
          )
          .setDepth(this.depths.ui);

        // Adding a border for better visibility
        const countdownBorder = this.add
          .graphics()
          .lineStyle(2, 0xffffff, 1)
          .strokeRoundedRect(
            countdownPosition.x - 65,
            countdownPosition.y - 15,
            130,
            30,
            10
          )
          .setDepth(this.depths.ui);

        const countdownText = this.add
          .text(
            countdownPosition.x,
            countdownPosition.y,
            `Cooking: ${countdown}s`,
            {
              font: "bold 18px Arial",
              fill: "#FF9900",
              stroke: "#000000",
              strokeThickness: 2,
              shadow: {
                blur: 2,
                color: "#000000",
                fill: true,
                offsetX: 1,
                offsetY: 1,
              },
            }
          )
          .setOrigin(0.5)
          .setDepth(this.depths.ui + 1);

        // Start cooking interval
        const cookingInterval = setInterval(() => {
          countdown--;
          countdownText.setText(`Cooking: ${countdown}s`);

          // Create smoke effect randomly during cooking
          if (Math.random() < 0.3) {
            // Increased probability from 0.2 to 0.3
            this.createSmokeEffect(
              this.itemPositions.stove.x,
              this.itemPositions.stove.y - 20
            );
          }

          if (countdown <= 0) {
            clearInterval(cookingInterval);
            countdownText.destroy();
            countdownBg.destroy();
            countdownBorder.destroy();

            // Show cooked potatoes - make the cooked potato visible
            this.items["potato-diced"].setVisible(false);
            if (this.items["potato-cooking"]) {
              this.items["potato-cooking"].setVisible(false);
            }

            if (this.items["potato-cooked"]) {
              this.items["potato-cooked"].setVisible(true);
            } else {
              // Use the exact Figma coordinates from itemPositions
              const cookedPos = this.itemPositions["potato-cooked"];
              this.items["potato-cooked"] = this.add
                .image(
                  isFromPan ? 610 : cookedPos.x + cookedPos.width / 2,
                  isFromPan ? 710 : cookedPos.y + cookedPos.height / 2,
                  this.getTexture("potato-cooked")
                )
                .setDepth(this.depths.cooking);
            }

            // Customize the completion message based on source
            const completionMsg = isFromPan
              ? "Cooking complete - Dish is ready!"
              : "Cooking complete!";

            this.showFloatingText(source.x, source.y, completionMsg, "#008000");

            // Add extra stirring animation only for final cooking step (from pan)
            if (isFromPan && step.id !== 14) {
              const mixingSpoon = this.items["mixingSpoon"];
              if (mixingSpoon) {
                // Store original position
                const originalX = mixingSpoon.x;
                const originalY = mixingSpoon.y;
                const originalAngle = mixingSpoon.angle || 0;
                const originalDepth =
                  mixingSpoon.depth || this.depths.interactiveItems;

                // Move spoon to pan
                const stirPosition = { x: 550, y: 680 };
                mixingSpoon.setPosition(stirPosition.x, stirPosition.y);
                mixingSpoon.setDepth(this.depths.activeItem);

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
                    this.playAnimation(mixingSpoon, "moveToStove", {
                      x: originalX,
                      y: originalY,
                      angle: originalAngle,
                      onComplete: () => {
                        mixingSpoon.setDepth(originalDepth);
                        this.actionInProgress = false;

                        // Complete the step
                        if (step) {
                          this.completeStep(step, option);
                        }
                      },
                    });
                  },
                });
              } else {
                this.actionInProgress = false;

                // Complete the step
                if (step) {
                  this.completeStep(step, option);
                }
              }
            } else {
              this.actionInProgress = false;

              // Complete the step
              if (step) {
                this.completeStep(step, option);
              }
            }
          }
        }, 1000);
      },
      "Choose Cooking Time"
    );
  }

  showOilOptions(item, step) {
    console.log("Showing oil options for step:", step);

    // Get game data
    const gameData = this.registry.get("gameData");
    if (!gameData.ingredients) {
      gameData.ingredients = {};
    }

    // Check if oil has already been added
    if (gameData.ingredients.oil) {
      this.showFloatingText(
        item.x,
        item.y,
        "Oil has already been added!",
        "#FF0000"
      );
      return;
    }

    // Check if proper prerequisites are met before allowing oil addition
    const validationResult = this.validateStepOrder(7); // Oil is step 7
    if (!validationResult) {
      // Show proper error message based on state
      if (!this.panOnStove) {
        this.showFloatingText(
          item.x,
          item.y,
          "You need to place the pan on the stove first!",
          "#FF0000"
        );
      } else if (!this.cookingProgress.heat_set) {
        this.showFloatingText(
          item.x,
          item.y,
          "You need to set the stove heat first!",
          "#FF0000"
        );
      } else {
        this.showFloatingText(
          item.x,
          item.y,
          "You need to complete the previous steps first!",
          "#FF0000"
        );
      }
      return;
    }

    // Define oil-specific options
    const options = ["1 tsp", "2 tsp", "1 tbsp", "2 tbsp"];

    this.showOptions(
      item.x,
      item.y - 100,
      options,
      (option) => {
        console.log(`Selected oil quantity: ${option}`);

        // Show visual feedback
        this.showFloatingText(
          item.x,
          item.y,
          `Added ${option} of oil`,
          "#008000"
        );

        // Complete the step
        this.completeStep(step, option);

        // Add to game data
        gameData.ingredients.oil = option;

        // If we're adding to the pan, create smoke effect
        if (this.panOnStove) {
          this.createSmokeEffect(
            this.itemPositions.stove.x,
            this.itemPositions.stove.y - 20,
            0xcccccc, // Light gray for oil
            0.3
          );
        } else {
          console.log("Pan not on stove, skipping smoke effect");
        }

        // Disable oil interaction after use
        if (this.items["oil"]) {
          this.items["oil"].disableInteractive();
          this.items["oil"].setAlpha(0.7); // Visual feedback that it's used
        }

        console.log(`Oil added successfully with quantity ${option}`);
      },
      "Choose Oil Amount"
    );
  }

  // Debug method to visualize interactive areas
  //   updateDebugVisualization() {
  //     // Clear previous debug graphics
  //     this.debugGraphics.clear();

  //     if (!this.showInteractiveAreas) return;

  //     // Set style for interactive areas
  //     this.debugGraphics.lineStyle(2, 0x00ff00, 1);

  //     // Draw rectangles around all interactive items
  //     Object.keys(this.items).forEach((key) => {
  //       const item = this.items[key];
  //       if (item && item.input && item.input.enabled) {
  //         // Calculate the hitbox size based on the sprite
  //         const bounds = item.getBounds();

  //         // Draw rectangle around interactive area
  //         this.debugGraphics.strokeRect(
  //           bounds.x,
  //           bounds.y,
  //           bounds.width,
  //           bounds.height
  //         );

  //         // Add item name for clarity - center it above the sprite
  //         if (!this.debugTexts) this.debugTexts = {};

  //         if (!this.debugTexts[key]) {
  //           this.debugTexts[key] = this.add
  //             .text(bounds.x + bounds.width / 2, bounds.y - 5, key, {
  //               font: "14px Arial",
  //               fill: "#FF0000",
  //               backgroundColor: "#FFFFFF80",
  //               padding: { x: 3, y: 1 },
  //             })
  //             .setOrigin(0.5, 1) // Center horizontally, align bottom
  //             .setDepth(this.depths.debug);
  //         } else {
  //           this.debugTexts[key]
  //             .setPosition(bounds.x + bounds.width / 2, bounds.y - 5)
  //             .setVisible(true);
  //         }
  //       } else if (this.debugTexts && this.debugTexts[key]) {
  //         // Hide text for non-interactive items
  //         this.debugTexts[key].setVisible(false);
  //       }
  //     });
  //   }

  // Helper to add info text to screen
  //   addDebugInfoText() {
  //     const text = this.add
  //       .text(10, 10, 'Press "D" to toggle interactive areas visualization', {
  //         font: "16px Arial",
  //         fill: "#FFFFFF",
  //         backgroundColor: "#000000",
  //         padding: { x: 5, y: 5 },
  //       })
  //       .setDepth(this.depths.debug);

  //     // Auto-hide after 5 seconds
  //     this.time.delayedCall(5000, () => {
  //       text.destroy();
  //     });
  //   }

  showOptions(x, y, options, callback, title = "Choose Option") {
    // Remove any existing options panel
    if (this.optionsPanel) {
      this.optionsPanel.destroy();
    }

    // Create options panel with enhanced styling
    this.optionsPanel = this.add.container(x, y).setDepth(this.depths.options);

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

  getFloatingText(x, y, message, color) {
    // Try to find an inactive text in pool
    const existing = this.textPool.find((t) => !t.visible);
    if (existing) {
      existing
        .setText(message)
        .setPosition(x, y)
        .setStyle({
          font: "16px Arial",
          fill: color,
          stroke: "#FFFFFF",
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(this.depths.ui)
        .setVisible(true)
        .setAlpha(1);
      return existing;
    }

    // Create new text if none available in pool
    const text = this.add
      .text(x, y, message, {
        font: "16px Arial",
        fill: color,
        stroke: "#FFFFFF",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(this.depths.ui);

    this.textPool.push(text);
    return text;
  }

  getParticle(x, y, radius, tint, alpha) {
    // Try to find an inactive particle in pool
    const existing = this.particlePool.find((p) => !p.visible);
    if (existing) {
      existing
        .setPosition(x, y)
        .setRadius(radius)
        .setFillStyle(tint, alpha)
        .setVisible(true)
        .setAlpha(alpha)
        .setDepth(this.depths.cooking);
      return existing;
    }

    // Create new particle if none available in pool
    const particle = this.add
      .circle(x, y, radius, tint, alpha)
      .setDepth(this.depths.cooking);
    this.particlePool.push(particle);
    return particle;
  }

  addManagedListener(target, event, callback) {
    target.on(event, callback);
    this.eventListeners.push({ target, event, callback });
    return callback;
  }

  shutdown() {
    console.log("GameScene shutdown initiated");

    // Clear any active timers or intervals
    this.time.clearPendingEvents();
    this.tweens.killAll(); // Kill all active tweens

    // Clean up all managed event listeners
    if (this.eventListeners) {
      this.eventListeners.forEach(({ target, event, callback }) => {
        if (target && target.off) {
          target.off(event, callback);
        }
      });
      this.eventListeners = [];
    }

    // Clear all groups and containers
    this.children.each((child) => {
      if (child.destroy) child.destroy();
    });

    // Explicitly destroy all game objects by category
    const destroyObjectsIn = (collection) => {
      if (!collection) return;
      Object.values(collection).forEach((item) => {
        if (item && item.destroy) {
          item.destroy();
        }
      });
    };

    // Destroy all tracked items
    destroyObjectsIn(this.items);
    this.items = {};

    // Clear texture references
    if (this.loadedTextures) {
      this.loadedTextures.clear();
    }

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

    // Clean up all pooled objects properly
    const cleanupPool = (pool) => {
      if (!pool) return;
      pool.forEach((item) => {
        if (item && item.destroy) {
          item.destroy();
        }
      });
      pool.length = 0; // Clear the array
    };

    // Clean up all object pools
    cleanupPool(this.textPool);
    cleanupPool(this.particlePool);
    cleanupPool(this.smokeParticles);

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
      this.checklist = null;
    }

    // Clear other UI elements
    if (this.coordinateText) {
      this.coordinateText.destroy();
      this.coordinateText = null;
    }

    if (this.timerText) {
      this.timerText.destroy();
      this.timerText = null;
    }

    if (this.handCursor) {
      this.handCursor.destroy();
      this.handCursor = null;
    }

    // Remove all input event listeners
    this.input.keyboard.removeAllKeys();
    this.input.removeAllListeners();

    // Ensure scene state is reset
    this.actionInProgress = false;
    this.panOnStove = false;

    // Clean up cursor manager
    if (this.cursorManager) {
      this.cursorManager.destroy();
      this.cursorManager = null;
    }

    console.log("GameScene shutdown complete - all resources cleaned");
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

    // Handle chopping board interactions
    if (this.items["choppingBoard"]) {
      this.addManagedListener(
        this.items["choppingBoard"],
        "pointerdown",
        () => {
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
            const validationResult = this.validateAction("chop");

            if (validationResult.valid) {
              const relevantStep = this.getCurrentStep();
              if (
                relevantStep &&
                relevantStep.item === "potato-peeled" &&
                relevantStep.action === "chop"
              ) {
                this.showChoppingOptions(
                  this.items["choppingBoard"],
                  relevantStep
                );
              }
            } else {
              this.showFloatingText(
                this.items["choppingBoard"].x,
                this.items["choppingBoard"].y,
                validationResult.message || "Not yet time for this step!",
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
        }
      );
    }

    // Handle pan interactions
    if (this.items["pan"]) {
      this.addManagedListener(this.items["pan"], "pointerdown", () => {
        // Check if this action is allowed in current state
        const validationResult = this.validateAction("place_pan");
        const currentStep = this.getCurrentStep();

        // Only allow pan interaction for step 5 (placement) and step 14 (final cooking)
        if (currentStep && (currentStep.id === 5 || currentStep.id === 14)) {
          if (validationResult.valid && currentStep.id === 5) {
            if (!this.actionInProgress) {
              this.showPanOptions(this.items["pan"], currentStep);
            }
          } else if (currentStep.id === 14 && !this.actionInProgress) {
            // For the final step, allow clicking on the pan
            console.log("Pan clicked for final cooking step");
            this.showCookingOptions(this.items["pan"], currentStep, true);
          }
        } else if (!this.actionInProgress) {
          // Show guidance if they're trying to interact with pan at wrong time
          this.showFloatingText(
            this.items["pan"].x,
            this.items["pan"].y,
            "Not yet time for this step!",
            "#FF0000"
          );
        }
      });

      // Manage pan hitbox visibility based on current step
      this.events.on("step_completed", (stepId) => {
        if (stepId === 5) {
          // Disable pan hitbox after placement
          this.items["pan"].disableInteractive();
        } else if (stepId === 13) {
          // Re-enable pan hitbox for final cooking step
          this.items["pan"].setInteractive({ useHandCursor: true });
        }
      });
    }

    // Handle stove interactions
    if (this.items["stove"]) {
      this.addManagedListener(this.items["stove"], "pointerdown", () => {
        const validationResult = this.validateAction("set_heat");

        if (validationResult.valid) {
          console.log("Stove clicked for heat step");
          this.showStoveOptions(this.items["stove"]);
        } else if (!this.actionInProgress) {
          this.showFloatingText(
            this.items["stove"].x,
            this.items["stove"].y,
            validationResult.message || "Not yet time for this step!",
            "#FF0000"
          );
        }
      });
    }

    // Handle mixing spoon interactions
    if (this.items["mixingSpoon"]) {
      this.addManagedListener(this.items["mixingSpoon"], "pointerdown", () => {
        const validationResult = this.validateAction("stir");

        if (validationResult.valid) {
          const relevantStep = this.getCurrentStep();
          if (
            relevantStep &&
            (relevantStep.action === "mix" || relevantStep.action === "stir") &&
            relevantStep.id !== 14 && // Skip the final cooking step
            !this.actionInProgress
          ) {
            this.showSpoonOptions(
              this.items["mixingSpoon"],
              relevantStep,
              relevantStep.action
            );
          } else if (!this.actionInProgress) {
            this.showFloatingText(
              this.items["mixingSpoon"].x,
              this.items["mixingSpoon"].y,
              "Not yet time for this step!",
              "#FF0000"
            );
          }
        } else {
          this.showFloatingText(
            this.items["mixingSpoon"].x,
            this.items["mixingSpoon"].y,
            validationResult.message || "Can't use mixing spoon yet",
            "#FF0000"
          );
        }
      });
    }

    // Handle wooden spoon interactions
    if (this.items["woodenSpoon"]) {
      this.addManagedListener(this.items["woodenSpoon"], "pointerdown", () => {
        const validationResult = this.validateAction("stir");

        if (validationResult.valid) {
          const relevantStep = this.getCurrentStep();
          if (
            relevantStep &&
            relevantStep.action === "cook" &&
            relevantStep.id !== 14 && // Skip the final cooking step
            !this.actionInProgress
          ) {
            this.showCookingOptions(this.items["woodenSpoon"], relevantStep);
          } else if (!this.actionInProgress) {
            this.showFloatingText(
              this.items["woodenSpoon"].x,
              this.items["woodenSpoon"].y,
              "Not yet time for this step!",
              "#FF0000"
            );
          }
        } else {
          this.showFloatingText(
            this.items["woodenSpoon"].x,
            this.items["woodenSpoon"].y,
            validationResult.message || "Can't use wooden spoon yet",
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

  // Get the current step that should be worked on next
  getCurrentStep() {
    // Find the first step that hasn't been completed yet
    const nextStep = this.steps.find((step) => !step.completed);
    return nextStep;
  }

  // Validate if steps are being performed in proper sequence
  validateStepOrder(stepId) {
    // For step 1, always allow
    if (stepId === 1) return true;

    // Calculate what step ID should be next
    const expectedStepId = this.completedStepIds.length + 1;

    // Must follow exact sequence for ALL steps
    if (stepId !== expectedStepId) {
      return false;
    }

    // Check if all previous steps are completed in order
    for (let i = 1; i < stepId; i++) {
      if (!this.completedStepIds.includes(i)) {
        return false;
      }
    }
    return true;
  }

  // Helper method to get spice type from step ID
  getSpiceTypeForStep(stepId) {
    switch (stepId) {
      case 10:
        return "turmeric";
      case 11:
        return "redChilli";
      case 12:
        return "salt";
      default:
        return null;
    }
  }

  // Check if a spice matches a certain type using name variants
  isSpiceType(spiceName, targetType) {
    if (!spiceName) return false;

    // Convert to lowercase for case-insensitive comparison
    const name = spiceName.toLowerCase();

    // Define variant mappings for different spice types
    const spiceVariants = {
      zeera: ["zeera", "cumin", "cumin seeds", "jeera"],
      turmeric: ["turmeric", "haldi", "yellow powder"],
      redChilli: [
        "red chilli",
        "red chilli powder",
        "chilli powder",
        "lal mirch",
      ],
      salt: ["salt", "namak"],
      coriander: ["coriander", "coriander powder", "dhania"],
    };

    // Check if the spice name matches any variant for the target type
    return (
      spiceVariants[targetType] && spiceVariants[targetType].includes(name)
    );
  }

  // Special handler for zeera (cumin seeds) which requires different animation
  handleZeeraAddition(item, quantity) {
    const currentStep = this.getCurrentStep();
    if (!currentStep || currentStep.id !== 8) {
      this.showFloatingText(
        item.x,
        item.y,
        "Not yet time to add zeera!",
        "#FF0000"
      );
      return;
    }

    // Get game data
    const gameData = this.registry.get("gameData");
    if (!gameData.ingredients) {
      gameData.ingredients = {};
    }

    // Record zeera addition
    gameData.ingredients.zeera = quantity;

    // Show success message
    this.showFloatingText(
      item.x,
      item.y,
      `Added ${quantity} of cumin seeds`,
      "#008000"
    );

    // Complete step 8
    this.completeStep(currentStep, quantity);

    // Create smoke effect
    if (this.panOnStove) {
      // Create brown smoke effect for zeera
      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(i * 200, () => {
          this.createSmokeEffect(550, 640, 0x8b4513, 0.6);
        });
      }
    }
  }

  // Check if all recipe steps are complete
  isRecipeComplete() {
    // Verify all steps are completed
    const allStepsComplete = this.steps.every((step) => step.completed);

    // Get game data
    const gameData = this.registry.get("gameData");

    // Check if we have all required ingredients
    const requiredIngredients = {
      oil: false,
      zeera: false,
      turmeric: false,
      redChilli: false,
      salt: false,
      stove_heat: false,
    };

    // Check what ingredients were actually added
    if (gameData && gameData.ingredients) {
      Object.keys(gameData.ingredients).forEach((ingredient) => {
        if (requiredIngredients.hasOwnProperty(ingredient)) {
          requiredIngredients[ingredient] = true;
        }
      });
    }

    // Count how many required ingredients are present
    const totalRequired = Object.keys(requiredIngredients).length;
    const presentCount =
      Object.values(requiredIngredients).filter(Boolean).length;

    // Calculate completeness level
    let hasAllRequiredIngredients = "Low";
    if (presentCount === totalRequired) {
      hasAllRequiredIngredients = "High";
    } else if (presentCount >= totalRequired * 0.7) {
      hasAllRequiredIngredients = "Medium";
    }

    // Log missing ingredients
    const missingIngredients = Object.entries(requiredIngredients)
      .filter(([_, present]) => !present)
      .map(([ingredient]) => ingredient);

    if (missingIngredients.length > 0) {
      console.log("Missing ingredients:", missingIngredients);
      if (gameData && !gameData.missingIngredients) {
        gameData.missingIngredients = missingIngredients;
      }
    }

    console.log("Recipe completion check:", {
      allStepsComplete,
      hasAllRequiredIngredients,
      ingredients: gameData && gameData.ingredients ? gameData.ingredients : {},
    });

    return allStepsComplete && hasAllRequiredIngredients === "High";
  }

  // Final cooking celebration - called when recipe is complete
  finishCooking() {
    if (this.actionInProgress) return;

    console.log("Finishing cooking process - starting celebration sequence");
    this.actionInProgress = true;

    const finalScore = this.updateScore();
    const gameData = this.registry.get("gameData");
    gameData.completed = true;
    gameData.endTime = Date.now();
    gameData.cookingTime = this.formatTime(
      gameData.endTime - gameData.startTime
    );
    gameData.score = finalScore;

    // Center positions
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Create dark overlay
    const darkOverlay = this.add
      .rectangle(
        centerX,
        centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000
      )
      .setDepth(this.depths.ui + 5)
      .setAlpha(0);

    // Add completed dish on plate - adjusted position
    const dish = this.add
      .image(centerX + 50, centerY - 30, "potato-cooked") // Shifted right and up more
      .setDepth(this.depths.ui + 11)
      .setScale(0)
      .setAlpha(0);

    // Create celebration text with particles
    const celebrationText = this.add
      .text(centerX, centerY - 180, "Recipe Complete!", {
        font: "bold 48px Arial",
        fill: "#FFD700",
        stroke: "#000000",
        strokeThickness: 8,
        shadow: { blur: 10, color: "#000000", fill: true },
      })
      .setOrigin(0.5)
      .setDepth(this.depths.ui + 12)
      .setAlpha(0);

    // Create score text - moved down further
    const scoreText = this.add
      .text(
        centerX,
        centerY + 155,
        `Score: ${finalScore}`, // Moved down 15 more
        {
          font: "bold 32px Arial",
          fill: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5)
      .setDepth(this.depths.ui + 12)
      .setAlpha(0);

    // Animate sequence with celebration particles
    this.tweens.add({
      targets: darkOverlay,
      alpha: 0.7,
      duration: 1000,
      onComplete: () => {
        this.playAnimation(dish, "celebrationReveal", {
          alpha: 1,
          delay: 200,
          onComplete: () => {
            // Show celebration text and score
            this.tweens.add({
              targets: [celebrationText, scoreText],
              alpha: 1,
              duration: 500,
              ease: "Power2",
            });

            // Display continue button to move to results scene
            this.time.delayedCall(2000, () => {
              const continueButton = this.add
                .rectangle(centerX, centerY + 250, 250, 60, 0x337722)
                .setDepth(this.depths.ui + 12)
                .setAlpha(0);

              const continueText = this.add
                .text(centerX, centerY + 250, "Continue to Results", {
                  font: "bold 24px Arial",
                  fill: "#FFFFFF",
                  stroke: "#000000",
                  strokeThickness: 3,
                })
                .setOrigin(0.5)
                .setDepth(this.depths.ui + 13)
                .setAlpha(0);

              // Fade in button
              this.tweens.add({
                targets: [continueButton, continueText],
                alpha: 1,
                duration: 300,
                onComplete: () => {
                  // Make button interactive
                  continueButton.setInteractive({ useHandCursor: true });
                  continueButton.on("pointerdown", () => {
                    this.scene.start("ResultScene");
                  });
                },
              });
            });
          },
        });
      },
    });
  }

  // New helper method to handle missing textures
  handleMissingTextures() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Create simple completion message
    const completionText = this.add
      .text(centerX, centerY - 50, "Recipe Complete!", {
        font: "bold 48px Arial",
        fill: "#FFD700",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(this.depths.ui + 12);

    const scoreText = this.add
      .text(centerX, centerY + 50, `Score: ${this.updateScore()}`, {
        font: "bold 32px Arial",
        fill: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(this.depths.ui + 12);

    // Add continue button
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonY = centerY + 150;

    const continueButton = this.add.graphics().setDepth(this.depths.ui + 12);

    continueButton.fillStyle(0x4caf50, 1);
    continueButton.fillRoundedRect(
      centerX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      15
    );

    const buttonText = this.add
      .text(centerX, buttonY, "Continue", {
        font: "bold 24px Arial",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5)
      .setDepth(this.depths.ui + 13);

    const buttonHitArea = this.add
      .rectangle(centerX, buttonY, buttonWidth, buttonHeight)
      .setInteractive({ useHandCursor: true })
      .setDepth(this.depths.ui + 12)
      .on("pointerdown", () => {
        const gameData = this.registry.get("gameData");
        this.scene.start("ResultScene", { gameData });
      });
  }

  // Format time from milliseconds to mm:ss format
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Calculate and update the player's score
  updateScore(step = null, option = null) {
    // Get game data
    const gameData = this.registry.get("gameData");

    if (!step) {
      // Final score calculation
      // Base score
      let score = 1000;

      // Time penalty: -10 points for every 15 seconds
      const timeElapsed = Math.floor((Date.now() - gameData.startTime) / 1000);
      const timePenalty = Math.floor(timeElapsed / 15) * 10;
      score -= timePenalty;

      // Step order bonus: +50 if steps completed in perfect order
      let stepOrderBonus = 50;
      // Check if any steps were completed out of order
      for (let i = 0; i < this.completedStepIds.length; i++) {
        if (this.completedStepIds[i] !== i + 1) {
          stepOrderBonus = 0;
          break;
        }
      }
      score += stepOrderBonus;

      // Mistake penalty: -20 for each mistake
      if (gameData.mistakes) {
        score -= gameData.mistakes.length * 20;
      }

      // Prevent negative scores
      score = Math.max(score, 0);

      console.log("Final score calculation:", {
        baseScore: 1000,
        timePenalty,
        stepOrderBonus,
        mistakePenalty: gameData.mistakes ? gameData.mistakes.length * 20 : 0,
        finalScore: score,
      });

      return score;
    } else {
      // Individual step scoring
      let stepScore = 10; // Base score for completing a step

      // Check if step was completed in correct order
      const lastCompletedStep =
        this.completedStepIds[this.completedStepIds.length - 2];
      if (lastCompletedStep && step.id < lastCompletedStep) {
        stepScore -= 5; // Penalty for out of order
      }

      // Add step score to game data
      if (!gameData.stepScores) {
        gameData.stepScores = [];
      }
      gameData.stepScores.push({
        stepId: step.id,
        score: stepScore,
        timestamp: Date.now() - this.startTime,
        timeFormatted: this.formatTime(Date.now() - this.startTime),
      });

      // Update total score
      if (!gameData.currentScore) {
        gameData.currentScore = 0;
      }
      gameData.currentScore += stepScore;

      return stepScore;
    }
  }

  // Create smoke effect particles at specified position
  createSmokeEffect(x, y, tint = 0xcccccc, alpha = 0.9) {
    // Always use stove position for smoke
    const stovePos = this.itemPositions.stove;
    const smokeX = stovePos.x + stovePos.width / 2;
    const smokeY = stovePos.y + stovePos.height / 2 - 50; // Offset upward from stove center

    for (let i = 0; i < 12; i++) {
      // Increased particle count from 8 to 12
      const particle = this.getSmokeParticle();
      if (!particle) continue;

      const offsetX = Phaser.Math.Between(-25, 25); // Wider spread
      const offsetY = Phaser.Math.Between(-15, 15); // Wider spread

      particle.setPosition(smokeX + offsetX, smokeY + offsetY);
      particle.setFillStyle(tint, alpha);
      particle.setAlpha(alpha);
      particle.setScale(0.4); // Increased base size from 0.3 to 0.4
      particle.setVisible(true);

      this.tweens.add({
        targets: particle,
        y: smokeY + offsetY - Phaser.Math.Between(80, 120), // Increased rise height
        x: smokeX + offsetX + Phaser.Math.Between(-40, 40), // Increased spread
        alpha: 0,
        scale: Phaser.Math.FloatBetween(1.0, 1.5), // Increased final scale
        duration: Phaser.Math.Between(1500, 2500), // Increased duration for more visibility
        ease: "Power2",
        onComplete: () => {
          particle.setVisible(false);
        },
      });
    }
  }

  // Show floating text that rises and fades
  showFloatingText(x, y, message, color = "#FFFFFF") {
    const text = this.getFloatingText(x, y, message, color);

    // Use animation preset for floating text
    this.playAnimation(text, "floatingText", {
      onComplete: () => {
        text.setVisible(false);
      },
    });

    return text;
  }

  // Helper to get texture for different types of items
  getTexture(key) {
    // Standardize texture naming - replace hyphens with underscores for asset lookups
    const textureKey = key.replace(/-/g, "_");

    // Check if the texture exists
    if (this.textures.exists(textureKey)) {
      return textureKey;
    }

    // Fall back to the original key
    if (this.textures.exists(key)) {
      return key;
    }

    // Log warning for missing textures
    console.warn(`Texture not found for ${key} or ${textureKey}`);
    return "missing_texture";
  }

  // Checks if all required textures are loaded
  checkRequiredTextures() {
    const requiredTextures = [
      "background",
      "mid",
      "front",
      "stove",
      "pan",
      "choppingBoard",
      "woodenSpoon",
      "mixingSpoon",
      "potato_raw",
      "potato_peeled",
      "potato_diced",
      "potato_cooked",
      "oil",
    ];

    const missing = requiredTextures.filter(
      (texture) => !this.textures.exists(texture)
    );

    if (missing.length > 0) {
      console.warn("Missing required textures:", missing);
    } else {
      console.log("All required textures are loaded");
    }

    return missing.length === 0;
  }

  // Helper method for improved interaction setup with asset shape awareness
  setUpInteraction(sprite, size = "medium", pixelPerfect = false) {
    if (!sprite) {
      console.warn("Attempted to set up interaction on null/undefined sprite");
      return sprite;
    }

    // Set origin to center for consistent positioning and interaction
    sprite.setOrigin(0.5, 0.5);

    // Extract asset key from sprite if available
    const assetKey = sprite.texture ? sprite.texture.key : null;

    // Determine if this is a special shape asset
    const isVertical = this.isVerticalAsset(assetKey);
    const isHorizontal = this.isHorizontalAsset(assetKey);
    const isWiderThanTall = sprite.width > sprite.height * 1.2;
    const isTallerThanWide = sprite.height > sprite.width * 1.2;
    const isSpecialAsset = this.getSpecialHitboxSettings(assetKey);

    // Make interactive with appropriate hitbox size
    let hitArea;

    if (isSpecialAsset) {
      // Use custom hitbox settings for special assets
      const settings = isSpecialAsset;

      // Create custom sized hitArea with offset
      const width = sprite.width * (settings.widthScale || 1);
      const height = sprite.height * (settings.heightScale || 1);
      const offsetX = settings.offsetX || 0;
      const offsetY = settings.offsetY || 0;

      hitArea = new Phaser.Geom.Rectangle(
        -width / 2 + offsetX,
        -height / 2 + offsetY,
        width,
        height
      );

      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    } else if (isVertical || isTallerThanWide) {
      // Vertical assets (oil bottle, containers) - taller hitbox
      const width = Math.max(sprite.width * 0.8, 30);
      const height = Math.max(sprite.height * 1.2, 40);
      hitArea = new Phaser.Geom.Rectangle(
        -width / 2,
        -height / 2,
        width,
        height
      );
      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    } else if (isHorizontal || isWiderThanTall) {
      // Horizontal assets (pan, spoons) - wider hitbox
      const width = Math.max(sprite.width * 1.2, 40);
      const height = Math.max(sprite.height * 0.8, 30);
      hitArea = new Phaser.Geom.Rectangle(
        -width / 2,
        -height / 2,
        width,
        height
      );
      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    } else if (size === "large") {
      // Larger hitArea for better interaction
      const width = sprite.width * 1.2;
      const height = sprite.height * 1.2;
      hitArea = new Phaser.Geom.Rectangle(
        -width / 2,
        -height / 2,
        width,
        height
      );
      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    } else if (size === "small") {
      // Small but still usable hitArea
      const width = Math.max(sprite.width * 0.8, 30);
      const height = Math.max(sprite.height * 0.8, 30);
      hitArea = new Phaser.Geom.Rectangle(
        -width / 2,
        -height / 2,
        width,
        height
      );
      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    } else {
      // Medium/default hitArea with improved size
      const width = Math.max(sprite.width * 1, 40);
      const height = Math.max(sprite.height * 1, 40);
      hitArea = new Phaser.Geom.Rectangle(
        -width / 2,
        -height / 2,
        width,
        height
      );
      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    }

    // Add debug visualization for this sprite
    if (this.showInteractiveAreas && this.debugGraphics) {
      const bounds = sprite.getBounds();
      this.debugGraphics.strokeRect(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height
      );

      // Draw hitArea for debug purposes
      if (hitArea) {
        this.debugGraphics.lineStyle(1, 0x00ff00, 0.8);
        this.debugGraphics.strokeRect(
          sprite.x + hitArea.x,
          sprite.y + hitArea.y,
          hitArea.width,
          hitArea.height
        );
      }
    }

    // Add to cursor manager for cursor handling
    this.cursorManager.addInteractive(sprite);

    return sprite;
  }

  // Helper method to identify vertical assets based on asset name
  isVerticalAsset(assetKey) {
    const verticalAssets = [
      "oil",
      "container1",
      "container2",
      "container-big",
      "milkglass",
      "steelglass",
    ];
    return verticalAssets.some((key) => assetKey && assetKey.includes(key));
  }

  // Helper method to identify horizontal assets based on asset name
  isHorizontalAsset(assetKey) {
    const horizontalAssets = [
      "woodenspoon",
      "wooden_spoon",
      "woodenSpoon",
      "mixingSpoon",
      "mixng_spoon",
      "pan",
      "kadhai",
      "nonsticktawa",
      "steeltawa",
    ];
    return horizontalAssets.some((key) => assetKey && assetKey.includes(key));
  }

  // Helper method to get special hitbox settings for specific assets
  getSpecialHitboxSettings(assetKey) {
    if (!assetKey) return null;

    // Special hitbox settings map
    const specialHitboxes = {
      stove: { widthScale: 0.85, heightScale: 0.8, offsetY: 10 }, // Tighter hitbox centered on cooking area
      pan: { widthScale: 0.85, heightScale: 0.42, offsetY: 5 },
      recipebook: { widthScale: 1, heightScale: 0.9, offsetY: -20 }, // Focus on top part of recipe book
      oil: { widthScale: 0.9, heightScale: 0.9 },
      potato: { widthScale: 1.2, heightScale: 1.2 }, // Larger hitbox for better potato interaction
      potato_raw: { widthScale: 1.2, heightScale: 1.2 },
      potato_peeled: { widthScale: 1.2, heightScale: 1.2 },
      potato_diced: { widthScale: 1.2, heightScale: 1.2 },
      potato_cooked: { widthScale: 1.2, heightScale: 1.2 },
      potato_cooking: { widthScale: 1.2, heightScale: 1.2 },
      choppingboard: { widthScale: 0.9, heightScale: 0.8, offsetY: -10 }, // Focus on usable area
      container1: { widthScale: 1.2, heightScale: 0.9, offsetY: -10 }, // Focus on top part where lid is
      container2: { widthScale: 1.2, heightScale: 0.9, offsetY: -10 },
      "container-big": { widthScale: 1.2, heightScale: 0.9, offsetY: -10 },
      woodenspoon: { widthScale: 0.8, heightScale: 1.2 },
      wooden_spoon: { widthScale: 0.8, heightScale: 1.2 },
      woodenSpoon: { widthScale: 0.8, heightScale: 1.2 },
      mixng_spoon: { widthScale: 0.8, heightScale: 1.2 },
      mixingSpoon: { widthScale: 0.8, heightScale: 1.2 },
    };

    // Check for exact match first
    if (specialHitboxes[assetKey]) {
      return specialHitboxes[assetKey];
    }

    // Otherwise check for partial matches
    for (const key in specialHitboxes) {
      if (assetKey.includes(key) || key.includes(assetKey)) {
        return specialHitboxes[key];
      }
    }

    return null;
  }
}

export default GameScene;
