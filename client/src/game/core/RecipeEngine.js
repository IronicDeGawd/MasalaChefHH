/**
 * Recipe Engine class to manage the state and flow of cooking recipes
 * Separates game logic from UI handling for better modularity
 */
class RecipeEngine {
  constructor(recipe) {
    this.recipe = recipe;
    this.currentIndex = 0;
    this.completedSteps = new Set();
    this.currentState = null;
    this.ingredients = {};
  }

  getCurrentStep() {
    // Find first uncompleted step that has prerequisites met
    return this.recipe.steps.find(
      (step) =>
        !this.completedSteps.has(step.id) && this.arePrerequisitesMet(step)
    );
  }

  getNextSteps() {
    // Get all possible next steps (multiple branches possible)
    return this.recipe.steps.filter(
      (step) =>
        !this.completedSteps.has(step.id) && this.arePrerequisitesMet(step)
    );
  }

  canPerformAction(action, item = null) {
    const possibleSteps = this.getNextSteps();

    // Check if any valid step matches this action
    return possibleSteps.some((step) => {
      // If item is specified, it must match too
      if (item && step.item !== item) {
        return false;
      }
      return step.action === action;
    });
  }

  arePrerequisitesMet(step) {
    if (!step.requires || step.requires.length === 0) return true;
    return step.requires.every((id) => this.completedSteps.has(id));
  }

  completeStep(stepId, option = null) {
    const step = this.recipe.steps.find((s) => s.id === stepId);
    if (!step) return false;

    this.completedSteps.add(stepId);

    // Update current state if this step defines a new state
    if (step.state) {
      this.currentState = step.state;
    }

    // Track selected option if provided
    if (option && step.options) {
      step.selectedOption = option;
    }

    // Track ingredients
    if (step.item && !["pan", "stove", "board"].includes(step.item)) {
      this.ingredients[step.item] = option || true;
    }

    return true;
  }

  getState() {
    return this.currentState;
  }

  getHints() {
    const currentStep = this.getCurrentStep();
    return currentStep?.hints || [];
  }

  /**
   * Get current hints for the game based on recipe state
   * This is an alias for getHints() for better readability in GameScene
   * @returns {Array} - Array of hint strings
   */
  getCurrentHints() {
    return this.getHints();
  }

  validateIngredient(ingredient, expectedIngredient) {
    if (!expectedIngredient) return true;

    // Direct match
    if (ingredient === expectedIngredient) return true;

    // Handle alternative names (could be extended with a mapping)
    const alternatives = {
      zeera: ["cumin", "jeera"],
      turmeric: ["haldi"],
      redChilli: ["red chili powder", "chilli powder"],
      // Add more mappings as needed
    };

    // Check alternatives
    for (const [key, values] of Object.entries(alternatives)) {
      if (
        (key === ingredient && values.includes(expectedIngredient)) ||
        (values.includes(ingredient) && key === expectedIngredient) ||
        (values.includes(ingredient) && values.includes(expectedIngredient))
      ) {
        return true;
      }
    }

    return false;
  }

  getProgress() {
    return {
      total: this.recipe.steps.length,
      completed: this.completedSteps.size,
      percentage: (this.completedSteps.size / this.recipe.steps.length) * 100,
    };
  }

  /**
   * Reset the recipe engine to initial state
   */
  reset() {
    this.currentIndex = 0;
    this.completedSteps.clear();
    this.currentState = null;
    this.ingredients = {};
  }

  /**
   * Get available recipe options for a specific step
   * @param {String} action - The action type to check (e.g. 'chop', 'add')
   * @param {String} item - The item being acted upon
   * @returns {Array} - Available options or empty array if none
   */
  getOptionsForAction(action, item) {
    const possibleSteps = this.getNextSteps();
    const matchingStep = possibleSteps.find(
      (step) => step.action === action && step.item === item
    );

    return matchingStep?.options || [];
  }

  /**
   * Get the step by ID
   * @param {Number} id - Step ID to find
   * @returns {Object} The step object or null if not found
   */
  getStepById(id) {
    return this.recipe.steps.find((step) => step.id === id);
  }

  /**
   * Find all steps that match a specific criteria
   * @param {Object} criteria - Object with properties to match against steps
   * @returns {Array} - All matching steps
   */
  findSteps(criteria) {
    return this.recipe.steps.filter((step) => {
      for (const key in criteria) {
        if (step[key] !== criteria[key]) {
          return false;
        }
      }
      return true;
    });
  }
}

export default RecipeEngine;
