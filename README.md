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



