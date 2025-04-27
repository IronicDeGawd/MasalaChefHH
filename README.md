<<<<<<< Updated upstream
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
- Deployment: AWS + Vercel
- Optional: AI model or rule-based system for scoring recipe accuracy



=======
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

## HackHazards '25 Submission

---

### Project Name
MasalaChef

### Tagline
Cook, Learn, Earn: A Web3 Indian Cooking Simulator That Turns Digital Skills Into Culinary NFTs

### The Problem It Solves
MasalaChef solves multiple problems at the intersection of education, gaming, and blockchain:

1. **Culinary Education**: Many people want to learn Indian cooking but find traditional recipes intimidating or hard to follow. MasalaChef gamifies the learning process, making it fun and interactive to master authentic Indian recipes.

2. **Blockchain Onboarding**: By wrapping a cooking game in blockchain functionality, we create a natural on-ramp for users who might not otherwise engage with Web3 technologies.

3. **Digital Ownership of Achievements**: Traditional cooking apps don't reward mastery in meaningful ways. With MasalaChef, users earn NFTs representing their culinary achievements, creating digital ownership that can be displayed and potentially used across the metaverse.

4. **Cultural Appreciation**: The game promotes understanding and appreciation of Indian cuisine and cooking techniques in an engaging, respectful format.

5. **On-chain Activity Generation**: Creates meaningful on-chain activities beyond simple token transfers, demonstrating practical blockchain utility through gameplay logs, achievement tracking, and digital collectibles.

### Challenges We Ran Into
Building MasalaChef presented several significant technical challenges:

1. **Blockchain-Game Integration**: Balancing on-chain activities with gameplay performance was challenging. We had to carefully determine which aspects to keep on-chain (achievements, logs, ownership) versus off-chain (real-time gameplay) to maintain smooth user experience.

2. **Physics Interactions in Cooking Simulation**: Creating realistic interactions between cooking implements, ingredients, and cooking processes required complex Phaser.js physics implementations. We overcame this by developing a modular system of object interactions with predefined state transitions.

3. **Smart Contract Optimization**: Storing game logs efficiently on Monad while minimizing gas costs required multiple iterations. We implemented a batching system that groups actions before writing to the blockchain.

4. **AI Evaluation System**: Developing a fair and informative AI scoring system that could evaluate player cooking performance required fine-tuning prompts and creating a standardized logging format to ensure consistent evaluations.

5. **Asset Design**: Creating authentic-looking Indian cooking implements and ingredients that were both visually appealing and functional in the game environment required multiple design iterations in collaboration with artists familiar with Indian cuisine.

### Technologies We Used
Phaser.js, React, Node.js, Express, Hardhat, Solidity, Monad, ERC-721, Groq AI API, Tailwind CSS, Ethers.js, Web3.js

### How Our Project Fits Into Monad Track
MasalaChef showcases Monad's capabilities through:

1. **High-throughput Game Logging**: Our game generates many micro-transactions as players perform cooking actions. Monad's high throughput enables us to record detailed gameplay data on-chain without performance bottlenecks.

2. **Low-latency User Experience**: Monad's fast finality allows us to mint achievement NFTs and update player stats quickly, creating a seamless gaming experience where blockchain interactions feel as responsive as traditional gaming.

3. **Cost-effective On-chain Activity**: The efficiency of Monad enables us to store more game data on-chain than would be economically feasible on other networks, enhancing the game's transparency and data permanence.

4. **Smart Contract Innovation**: We leverage Monad's EVM compatibility to create complex game logic while maintaining familiar development patterns, demonstrating how traditional gaming experiences can be enhanced through blockchain integration.

### How Our Project Fits Into Ethereum Track
While primarily built for Monad, MasalaChef also connects to the broader Ethereum ecosystem through:

1. **Cross-chain NFT Display**: Achievement NFTs earned in the game can be bridged to Ethereum for display in major marketplaces and metaverse platforms.

2. **EVM Compatibility**: Our contracts are designed with EVM compatibility in mind, showcasing how games can be deployed across the Ethereum ecosystem including L2s and sidechains.

3. **Web3 Standards Adoption**: We implement ERC-721 standards for NFTs, ensuring compatibility with the broader Ethereum ecosystem and wallet infrastructure.

4. **Onboarding to Ethereum Ecosystem**: The game serves as an engaging entry point for new users to experience blockchain technology through familiar gaming mechanics before exploring the wider Ethereum ecosystem.
>>>>>>> Stashed changes
