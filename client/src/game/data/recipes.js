/**
 * Recipe Registry - All recipes available in the game
 * Import all recipes here for a central access point
 */

// Import individual recipes
import alooBhujia from "./recipes/alooBhujia";

// Create a recipe registry
const recipes = {
  // Register recipes by ID for easy access
  alooBhujia: alooBhujia,
  // Add more recipes here as they are created
};

export default recipes;
