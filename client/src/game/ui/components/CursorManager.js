/**
 * CursorManager class
 * Handles custom cursors and pointer interactions in the game
 */
export default class CursorManager {
  /**
   * @param {Phaser.Scene} scene - The scene this cursor manager belongs to
   * @param {Object} options - Configuration options
   */
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = Object.assign(
      {
        cursorKey: "handCursor", // Texture key for the cursor sprite
        cursorPath: "assets/player.png", // Path to cursor image
        scale: 0.5, // Scale of the cursor sprite
        originX: 0.1, // X origin to align with pointer (finger tip)
        originY: 0.1, // Y origin to align with pointer (finger tip)
        depth: 9999, // Increased depth to ensure cursor is always on top
        defaultVisible: true, // Whether cursor is visible by default
        globalCursorHide: false, // Whether to hide cursor for the whole page
      },
      options
    );

    this.cursor = null;
    this.isActive = false;
    this.eventListeners = [];
    this.interactiveObjects = new Set();
    this.styleElement = null;

    // Initialize cursor
    this.initialize();
  }

  /**
   * Initialize the cursor manager
   */
  initialize() {
    // Check if the texture exists, load if it doesn't
    if (!this.scene.textures.exists(this.options.cursorKey)) {
      console.log(
        `Loading cursor texture "${this.options.cursorKey}" from ${this.options.cursorPath}`
      );
      
      // Load the cursor image
      this.scene.load.image(this.options.cursorKey, this.options.cursorPath);
      
      // Wait for load to complete
      this.scene.load.once("complete", () => {
        console.log("Cursor texture loaded successfully");
        this.createCursor();
      });

      // Start loading
      this.scene.load.start();
    } else {
      console.log("Cursor texture already exists, creating cursor");
      this.createCursor();
    }

    // Add CSS to forcefully hide the cursor
    this.injectCursorCSS();

    // Hide default cursor
    this.hideDefaultCursor();

    // Add event listener to prevent cursor showing on hover
    this.scene.game.canvas.addEventListener('mouseover', () => {
      this.hideDefaultCursor();
    });
  }

  /**
   * Inject CSS to force cursor to be hidden
   */
  injectCursorCSS() {
    // Remove any existing style element
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
    }

    // Create new style element
    this.styleElement = document.createElement('style');
    
    // Apply CSS based on whether we want global or canvas-only cursor hiding
    if (this.options.globalCursorHide) {
      this.styleElement.innerHTML = `
        * {
          cursor: none !important;
        }
      `;
    } else {
      this.styleElement.innerHTML = `
        canvas, canvas * {
          cursor: none !important;
        }
      `;
    }
    
    // Add style to document
    document.head.appendChild(this.styleElement);
  }

  /**
   * Create the cursor sprite
   */
  createCursor() {
    try {
      // Create cursor sprite
      this.cursor = this.scene.add
        .image(0, 0, this.options.cursorKey)
        .setScale(this.options.scale)
        .setOrigin(this.options.originX, this.options.originY)
        .setDepth(this.options.depth)
        .setVisible(this.options.defaultVisible);

      // Set up pointer move listener
      const moveHandler = (pointer) => {
        if (this.cursor && this.cursor.active) {
          this.cursor.setPosition(pointer.x, pointer.y);
          this.cursor.setVisible(true);
        }
      };

      // Add pointer move listener
      this.scene.input.on("pointermove", moveHandler);
      this.eventListeners.push({ event: "pointermove", handler: moveHandler });

      // Set up game focus listeners
      window.addEventListener('blur', () => {
        if (this.cursor) {
          this.cursor.setVisible(false);
        }
      });
      window.addEventListener('focus', () => {
        if (this.cursor) {
          this.cursor.setVisible(true);
        }
      });

      this.isActive = true;
      console.log("Cursor created successfully");
    } catch (error) {
      console.error("Error creating cursor:", error);
      this.showDefaultCursor();
    }
  }

  /**
   * Add interactive object to be managed by cursor
   * @param {Phaser.GameObjects.GameObject} object - The game object to make interactive
   */
  addInteractive(object) {
    if (!object || !object.setInteractive || !this.cursor) return;

    // Add to tracked objects
    this.interactiveObjects.add(object);

    // Set up hover handlers
    object.on('pointerover', () => {
      this.hideDefaultCursor();
      if (this.cursor) {
        this.cursor.setVisible(true);
      }
    });

    object.on('pointerout', () => {
      this.hideDefaultCursor();
      if (this.cursor) {
        this.cursor.setVisible(true);
      }
    });
  }

  /**
   * Remove interactive object from cursor management
   * @param {Phaser.GameObjects.GameObject} object - The game object to remove
   */
  removeInteractive(object) {
    if (!object) return;
    this.interactiveObjects.delete(object);
  }

  /**
   * Show the default system cursor
   */
  showDefaultCursor() {
    document.body.style.cursor = "default";
    if (this.scene.game.canvas) {
      this.scene.game.canvas.style.cursor = "default";
    }
  }

  /**
   * Hide the default system cursor
   */
  hideDefaultCursor() {
    document.body.style.cursor = "none";
    if (this.scene.game.canvas) {
      this.scene.game.canvas.style.cursor = "none";
    }
  }

  /**
   * Destroy the cursor manager and clean up resources
   */
  destroy() {
    // Remove all event listeners
    this.eventListeners.forEach(({ event, handler }) => {
      this.scene.input.off(event, handler);
    });
    this.eventListeners = [];

    // Clear interactive objects
    this.interactiveObjects.clear();

    // Destroy cursor sprite
    if (this.cursor) {
      this.cursor.destroy();
      this.cursor = null;
    }

    // Remove CSS style element
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
      this.styleElement = null;
    }

    // Show default cursor
    this.showDefaultCursor();

    this.isActive = false;
  }

  /**
   * Change the cursor texture
   * @param {string} textureKey - Key of the new texture
   */
  changeTexture(textureKey) {
    if (this.cursor && this.scene.textures.exists(textureKey)) {
      this.cursor.setTexture(textureKey);
    }
  }
}
