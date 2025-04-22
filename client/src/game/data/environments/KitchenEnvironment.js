import Phaser from "phaser";
/**
 * KitchenEnvironment.js
 *
 * Centralizes all kitchen asset positions, depth layers, and hitbox settings
 * for the Masala Chef game. This class makes it easier to keep consistent
 * positioning and interaction areas across different scenes.
 */

class KitchenEnvironment {
  constructor() {
    // Item positions from Figma layout with exact coordinates
    this.itemPositions = {
      // Ingredients
      potato: { x: 694, y: 431, width: 60, height: 60 },
      "potato-peeled": { x: 172, y: 480, width: 60, height: 60 },
      "potato-diced": { x: 240, y: 486, width: 80, height: 64 },
      "potato-cooked": { x: 512, y: 651, width: 80, height: 64 },
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
      "pan-on-stove": { x: 424, y: 566, width: 366, height: 219 },
      woodenSpoon: { x: 483, y: 510, width: 124, height: 66 },
      mixingSpoon: { x: 373, y: 466, width: 188, height: 100 },

      // UI elements
      basket: { x: 607, y: 407, width: 200, height: 200 },
      recipeBook: { x: 788, y: 629, width: 189, height: 202 },
      recipeMenu: { x: 909, y: 215, width: 350, height: 517 },
      shelf: { x: 242, y: 330, width: 310, height: 144 },
    };

    // Depth management system - consistent z-index values across scenes
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

    // Standard hit area sizes for different item types
    this.hitAreas = {
      small: { width: 50, height: 50 },
      medium: { width: 80, height: 80 },
      large: { width: 120, height: 120 },
      extraLarge: { width: 150, height: 150 },
    };

    // Lists for identifying special asset types
    this.verticalAssets = [
      "oil",
      "container1",
      "container2",
      "container-big",
      "milkglass",
      "steelglass",
    ];

    this.horizontalAssets = [
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

    // Special hitbox settings for specific assets
    this.specialHitboxes = {
      stove: { widthScale: 0.85, heightScale: 0.8, offsetY: 10 }, // Tighter hitbox centered on cooking area
      pan: { widthScale: 0.85, heightScale: 0.85, offsetY: 5 },
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

    // Texture mapping for fallback textures
    this.textureMap = {
      potato: ["potato", "potato-raw"],
      mixingSpoon: ["mixingSpoon", "mixing_spoon"],
      woodenSpoon: ["woodenSpoon", "wooden_spoon"],
      "potato-peeled": ["potato-peeled", "potato_peeled"],
      "potato-diced": ["potato-diced", "potato_diced"],
      "potato-cooked": ["potato-cooked", "potato_cooked"],
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
  }

  /**
   * Gets item position with calculated center coordinates
   * @param {string} key - The item key
   * @returns {Object|null} Position with x, y, width, height
   */
  getItemPosition(key) {
    const pos = this.itemPositions[key];
    if (!pos) return null;

    return {
      ...pos,
      centerX: pos.x + pos.width / 2,
      centerY: pos.y + pos.height / 2,
    };
  }

  /**
   * Checks if an asset is considered vertical based on its key
   * @param {string} assetKey - The asset key to check
   * @returns {boolean} True if the asset is vertical
   */
  isVerticalAsset(assetKey) {
    if (!assetKey) return false;
    return this.verticalAssets.some((key) => assetKey.includes(key));
  }

  /**
   * Checks if an asset is considered horizontal based on its key
   * @param {string} assetKey - The asset key to check
   * @returns {boolean} True if the asset is horizontal
   */
  isHorizontalAsset(assetKey) {
    if (!assetKey) return false;
    return this.horizontalAssets.some((key) => assetKey.includes(key));
  }

  /**
   * Gets special hitbox settings for specific assets
   * @param {string} assetKey - The asset key to check
   * @returns {Object|null} Hitbox settings or null if no special settings
   */
  getSpecialHitboxSettings(assetKey) {
    if (!assetKey) return null;

    // Check for exact match first
    if (this.specialHitboxes[assetKey]) {
      return this.specialHitboxes[assetKey];
    }

    // Otherwise check for partial matches
    for (const key in this.specialHitboxes) {
      if (assetKey.includes(key) || key.includes(assetKey)) {
        return this.specialHitboxes[key];
      }
    }

    return null;
  }

  /**
   * Gets the first available texture for an asset
   * @param {Phaser.Scene} scene - The Phaser scene object
   * @param {string} key - The primary texture key to look for
   * @returns {string} The first available texture key
   */
  getTexture(scene, key) {
    const options = this.textureMap[key] || [key];
    return options.find((t) => scene.textures.exists(t)) || options[0];
  }

  /**
   * Checks if a spice is of a particular type
   * @param {string} spiceName - The spice name to check
   * @param {string} targetType - The target spice type to match against
   * @returns {boolean} True if the spice matches the target type
   */
  isSpiceType(spiceName, targetType) {
    // Direct match with the target type
    if (spiceName === targetType) return true;

    // Check if the spice name is a variant of the target type
    if (
      this.spiceNameVariants[targetType] &&
      this.spiceNameVariants[targetType].some(
        (variant) => variant.toLowerCase() === spiceName.toLowerCase()
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Gets the proper spice name for a container
   * @param {string} containerKey - The container key
   * @returns {string|null} The spice name or null if not found
   */
  getSpiceForContainer(containerKey) {
    return this.spiceMap[containerKey] || null;
  }

  /**
   * Sets up appropriate hitbox and interaction for a sprite
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite to make interactive
   * @param {string} size - Size category (small, medium, large, extraLarge)
   * @param {boolean} pixelPerfect - Whether to use pixel-perfect detection
   * @returns {Phaser.GameObjects.Sprite} The sprite with hitbox applied
   */
  setupInteraction(scene, sprite, size = "medium", pixelPerfect = false) {
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
      // For tall items, use a taller hitbox
      const hitSize = this.hitAreas[size] || this.hitAreas.medium;
      hitArea = new Phaser.Geom.Rectangle(
        -hitSize.width / 2,
        -hitSize.height / 2,
        hitSize.width,
        hitSize.height * 1.5
      );
      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    } else if (isHorizontal || isWiderThanTall) {
      // For wide items, use a wider hitbox
      const hitSize = this.hitAreas[size] || this.hitAreas.medium;
      hitArea = new Phaser.Geom.Rectangle(
        -hitSize.width / 2,
        -hitSize.height / 2,
        hitSize.width * 1.5,
        hitSize.height
      );
      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    } else {
      // For regular items, use standard hitbox
      const hitSize = this.hitAreas[size] || this.hitAreas.medium;
      hitArea = new Phaser.Geom.Rectangle(
        -hitSize.width / 2,
        -hitSize.height / 2,
        hitSize.width,
        hitSize.height
      );
      sprite.setInteractive(
        hitArea,
        Phaser.Geom.Rectangle.Contains,
        pixelPerfect
      );
    }

    // Set hand cursor for interactive elements
    sprite.input.cursor = "pointer";

    return sprite;
  }

  /**
   * Draws debug visualization for a sprite's hitbox
   * @param {Phaser.Scene} scene - The scene containing the sprite
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite to visualize
   * @param {Phaser.GameObjects.Graphics} graphics - The graphics object to draw on
   * @returns {Object|null} Label text object if created
   */
  drawDebugHitbox(scene, sprite, graphics) {
    if (!sprite || !sprite.input || !sprite.input.hitArea || !graphics) {
      return null;
    }

    const bounds = sprite.input.hitArea;
    const key = sprite.texture ? sprite.texture.key : "unknown";

    // Draw rectangle around the interactive area, accounting for item position and origin
    if (bounds.type === 8) {
      // Phaser.GEOM_CONST.RECTANGLE = 8
      const x = sprite.x + bounds.x;
      const y = sprite.y + bounds.y;
      graphics.strokeRect(x, y, bounds.width, bounds.height);

      // Add label for the item
      const label = scene.add.text(x, y - 10, key, {
        font: "12px Arial",
        fill: "#00ff00",
        backgroundColor: "#000000",
      });

      return label;
    }

    return null;
  }
}

export default KitchenEnvironment;
