# MasalaChef - Product Requirement Document (PRD)

## Overview

---

MasalaChef is a 2.5D cooking simulator game inspired by Indian-style cooking, designed to teach users how to cook simple recipes in an interactive, gamified way. It is built for a hackathon and will be deployed on the Monad testnet.

## Core Gameplay

---

- Players choose a recipe and enter a virtual kitchen setup.
- The kitchen has vegetables, masala, stove, utensils, etc.
- Players simulate cooking by following real-life-based recipes.
- Actions include chopping, stirring, frying, adding spices, etc.
- A cooldown on making dishes, upgrade utensils, aprons etc. to make cooking faster and cooldown less
- The final dish is rated by an AI system and receives personalized suggestions for improvement.

## **Game Environments**

---

- Different cooking settings unlockable or purchasable with tokens:
    - Dhaba-style cooking with local customers
    - Professional restaurant with gourmet judges
    - Street vendor-style with casual passersby as reviewers
- Each environment features judge characters with unique personalities that rate your dish based on the setting.

## Visual Style

---

- 2.5D isometric/top-down view.
- Clean UI representing Indian kitchens with animated utensils and ingredients.

## Monetization Strategy

---

- Limited number of ingredients available for free users.
- Additional ingredients and advanced tools can be purchased using Monad tokens.
- Cosmetic unlocks (aprons, kitchen skins, utensils) could be added for additional monetization.

## Blockchain Integration (Monad Testnet)

---

- Game data and user logs are stored on Monad.
- User actions like recipe completions, scores, and upgrades are recorded.
- Ingredient/token purchases are handled using Monad smart contracts.

## Tech Stack

---

- Frontend: Phaser.js (2D game framework in JavaScript)
- Backend: Node.js + Express (Game logic, AI evaluation)
- Blockchain: Monad Testnet (for logs, tokens, purchases)
- Storage: Off-chain game logic and asset delivery for performance
- Optional: AI model or rule-based system for scoring recipe accuracy

## **Cooking Game MVP – Notion Checklist**

---

**Frontend (Phaser.js)**

- [ ]  Setup Phaser.js boilerplate and game scenes (Main, Menu, Recipe Select, Game,Result)
- [ ]  Show only “Kitchen” as unlocked in the environment menu
- [ ]  Add recipe selection menu (max 2 recipes) after Kitchen click
- [ ]  Load main kitchen scene with background, shelf, and stove
- [ ]  Implement click-to-place pan on stove
- [ ]  Clicking stove shows heat options (low/med/high)
- [ ]  Clicking masala container shows quantity options (adds to pan)
- [ ]  Clicking a vegetable places it on chopping board
- [ ]  Clicking chopping board shows chop options (fine/medium/rough)
- [ ]  Clicking oil container shows tablespoon options (adds to pan)

**Backend (Node.js + Express)**

- [ ]  Setup Node.js server with basic API routing
- [ ]  Create endpoint to receive & store step logs from frontend
- [ ]  Structure logs in a consistent step-by-step action format

**Blockchain (Monad Contract)**

- [ ]  Setup wallet login for user authentication
- [ ]  Write Monad smart contract to store game logs
- [ ]  Send logs from backend to Monad after game ends

**AI Judge (GroqCloud)**

- [ ]  Format ideal recipe vs player logs as prompt for Groq model
- [ ]  Send prompt to Groq & receive AI feedback on cooking quality
- [ ]  Display feedback (stars/comments) in final game result screen

masalachef/
├── client/                      # Frontend code
│   ├── index.html               # Entry point
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS config for Tailwind
│   ├── vercel.json              # Vercel configuration
│   ├── public/                  # Static assets that don't need processing
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── src/                     # Source files
│   │   ├── assets/              # Assets that will be processed
│   │   │   ├── images/          # Image assets
│   │   │   │   ├── logo.png
│   │   │   │   ├── hero-image.png
│   │   │   │   └── ...
│   │   │   └── audio/           # Audio assets
│   │   ├── css/
│   │   │   └── styles.css       # Global styles (includes Tailwind)
│   │   ├── js/
│   │   │   ├── main.js          # Main script for landing page
│   │   │   └── wallet.js        # Wallet connection logic
│   │   └── game/                # Phaser game files
│   │       ├── config.js        # Phaser configuration
│   │       ├── index.js         # Game entry point
│   │       ├── assets/          # Game-specific assets
│   │       │   ├── sprites/
│   │       │   │   ├── ingredients/  # Ingredient sprites
│   │       │   │   ├── utensils/     # Utensil sprites
│   │       │   │   └── ui/           # UI elements
│   │       │   ├── audio/            # Game sounds
│   │       │   └── tilemaps/         # Kitchen environment maps
│   │       ├── scenes/              # Game scenes
│   │       │   ├── BootScene.js
│   │       │   ├── TitleScene.js
│   │       │   ├── MenuScene.js
│   │       │   ├── KitchenScene.js
│   │       │   └── ResultsScene.js
│   │       ├── objects/             # Game object classes
│   │       │   ├── Ingredient.js
│   │       │   ├── Utensil.js
│   │       │   ├── Pan.js
│   │       │   └── ...
│   │       ├── managers/            # Game systems
│   │       │   ├── LogManager.js    # Game logging
│   │       │   ├── RecipeManager.js # Recipe data and validation
│   │       │   └── ScoreManager.js  # Scoring system
│   │       └── data/               # Game data
│   │           ├── recipes.js      # Recipe definitions
│   │           └── ingredients.js  # Ingredient properties
│   └── game.html                   # Game page
├── server/                      # Backend server code
│   ├── package.json             # Server dependencies
│   ├── index.js                 # Server entry point
│   ├── .env                     # Environment variables (gitignored)
│   ├── config/                  # Server configuration
│   │   └── monad.js             # Monad blockchain configuration
│   ├── routes/                  # API routes
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── logs.js              # Game log endpoints
│   │   └── scores.js            # Scoring endpoints
│   ├── services/                # Business logic
│   │   ├── monadService.js      # Monad blockchain integration
│   │   └── aiService.js         # Groq AI integration
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Error handling middleware
│   └── utils/                   # Utility functions
│       ├── logger.js
│       └── validation.js
└── contracts/                   # Monad smart contracts
    ├── package.json             # Contract dependencies
    ├── hardhat.config.js        # Hardhat configuration
    ├── .env                     # Environment variables (gitignored)
    ├── contracts/               # Smart contract source code
    │   ├── GameLogs.sol         # Contract for storing game logs
    │   └── MasalaToken.sol      # Game token contract (if used)
    ├── scripts/                 # Deployment scripts
    │   ├── deploy.js            # Main deployment script
    │   └── verify.js            # Contract verification script
    └── test/                    # Contract tests
        ├── GameLogs.test.js
        └── MasalaToken.test.js
