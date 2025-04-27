require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const { ethers } = require("ethers");

// Import blockchain utilities
const {
  setupProvider,
  getContract,
  getNFTConnectorContract,
  initializeContracts,
} = require("./blockchain/utils");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize contract relationships
async function startServer() {
  try {
    // Initialize contract relationships
    await initializeContracts();

    // Start server after contracts are initialized
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize contracts:", error);
    console.log("Starting server without full contract initialization...");

    // Start the server anyway, but some features might not work correctly
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} (with limited functionality)`
      );
    });
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Connect wallet endpoint
app.post("/api/wallet/connect", async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !ethers.utils.isAddress(address)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid wallet address" });
    }

    // Check if the user has any NFTs
    const contract = await getContract();
    const firstDishNFTAddress = await contract.getFirstDishNFT(address);
    const hasFirstDishNFT =
      firstDishNFTAddress !== ethers.constants.AddressZero;

    // Get player stats
    const gameCount = await contract.getPlayerGameCount(address);
    const bestScore = await contract.getPlayerBestScore(address);

    return res.status(200).json({
      success: true,
      address,
      playerStats: {
        gameCount: gameCount.toNumber(),
        bestScore: bestScore.toNumber(),
        hasFirstDishNFT,
      },
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while connecting wallet",
      error: error.message,
    });
  }
});

// Save game data endpoint
app.post(
  "/api/game/save",
  [
    body("address")
      .isEthereumAddress()
      .withMessage("Valid wallet address is required"),
    body("recipeName").notEmpty().withMessage("Recipe name is required"),
    body("score").isInt({ min: 0 }).withMessage("Valid score is required"),
    body("timeTaken").isInt({ min: 0 }).withMessage("Valid time is required"),
    body("gameData").notEmpty().withMessage("Game data is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { address, recipeName, score, timeTaken, gameData } = req.body;

      // Get contract with signer
      const contract = await getContract(true); // true means we want a signer

      // Convert gameData to JSON string if it's not already
      const gameDataString =
        typeof gameData === "string" ? gameData : JSON.stringify(gameData);

      // Empty AI response for now
      const aiResponse = "";

      // Get current game count before saving
      const previousGameCount = await contract.getPlayerGameCount(address);
      console.log(
        `Previous game count for ${address}: ${previousGameCount.toNumber()}`
      );

      // Call contract to save game for the player using the new function
      const tx = await contract.saveGameLogForPlayer(
        address,
        recipeName,
        score,
        timeTaken,
        gameDataString,
        aiResponse
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log(
        `Game saved with transaction hash: ${receipt.transactionHash}`
      );

      // Add a delay to ensure blockchain state is updated
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get updated game count after transaction is confirmed with retry logic
      let currentGameCount;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          currentGameCount = await contract.getPlayerGameCount(address);
          console.log(
            `Current game count for ${address} (attempt ${
              retries + 1
            }): ${currentGameCount.toNumber()}`
          );

          // If the count has increased, break out of the retry loop
          if (currentGameCount.toNumber() > previousGameCount.toNumber()) {
            break;
          }
        } catch (countError) {
          console.error(
            `Error getting game count (attempt ${retries + 1}):`,
            countError
          );
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retries++;
      }

      // Calculate the game ID (should be the latest game added)
      let gameId = -1;
      if (
        currentGameCount &&
        currentGameCount.toNumber() > previousGameCount.toNumber()
      ) {
        gameId = currentGameCount.toNumber() - 1;
        console.log(`Game ID calculated: ${gameId}`);
      } else {
        // Fallback: try to get game ID by searching for matching timestamp
        try {
          const count = await contract.getPlayerGameCount(address);
          const totalGames = count.toNumber();

          // Search from the end (newest) to beginning
          for (let i = totalGames - 1; i >= 0; i--) {
            const summary = await contract.getPlayerGameSummary(address, i);
            // If this game was saved within the last 30 seconds, it's likely our game
            const gameSavedTime = summary.timestamp.toNumber();
            const currentTime = Math.floor(Date.now() / 1000);

            if (currentTime - gameSavedTime < 30) {
              gameId = i;
              console.log(`Game ID found through fallback method: ${gameId}`);
              break;
            }
          }
        } catch (fallbackError) {
          console.error("Error in fallback game ID search:", fallbackError);
        }
      }

      // Check if this is the player's first dish
      const firstDishNFTBefore = await contract.getFirstDishNFT(address);
      const hasFirstDishNFTBefore =
        firstDishNFTBefore !== ethers.constants.AddressZero;

      let nftAwarded = false;

      // If this is the first dish and player doesn't have an NFT, try to award one
      if (!hasFirstDishNFTBefore) {
        try {
          // Get the connector contract from environment variable
          const connector = await getNFTConnectorContract(true); // With signer

          // Try to award the NFT
          const nftTx = await connector.checkAndAwardFirstDish(address);
          await nftTx.wait();

          // Check if NFT was awarded
          const firstDishNFTAfter = await contract.getFirstDishNFT(address);
          nftAwarded = firstDishNFTAfter !== ethers.constants.AddressZero;
        } catch (nftError) {
          console.error("Error awarding NFT:", nftError);
          // We don't want to fail the whole request if just the NFT part fails
        }
      }

      return res.status(200).json({
        success: true,
        transactionHash: receipt.transactionHash,
        nftAwarded,
        gameId: gameId >= 0 ? gameId : 0, // Ensure we never return -1
      });
    } catch (error) {
      console.error("Error saving game:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while saving game",
        error: error.message,
      });
    }
  }
);

// Get game history endpoint
app.get("/api/game/history/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!address || !ethers.utils.isAddress(address)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid wallet address" });
    }

    const contract = await getContract();

    // Get number of games
    const count = await contract.getPlayerGameCount(address);
    const gameCount = count.toNumber();

    // Get best score
    const best = await contract.getPlayerBestScore(address);
    const bestScore = best.toNumber();

    // Get game summaries
    const games = [];
    for (let i = 0; i < gameCount; i++) {
      try {
        const summary = await contract.getPlayerGameSummary(address, i);
        games.push({
          index: i,
          recipeName: summary.recipeName || summary[0],
          score: (summary.score || summary[1]).toNumber(),
          timeTaken: (summary.timeTaken || summary[2]).toNumber(),
          timestamp: (summary.timestamp || summary[3]).toNumber() * 1000, // Convert to milliseconds
        });
      } catch (err) {
        console.error(`Error fetching game ${i}:`, err);
      }
    }

    return res.status(200).json({
      success: true,
      address,
      gameCount,
      bestScore,
      games: games.reverse(), // Show newest first
    });
  } catch (error) {
    console.error("Error getting game history:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting game history",
      error: error.message,
    });
  }
});

// Get game details endpoint
app.get("/api/game/:address/:index", async (req, res) => {
  try {
    const { address, index } = req.params;

    if (!address || !ethers.utils.isAddress(address)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid wallet address" });
    }

    if (isNaN(index)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid game index" });
    }

    const contract = await getContract();

    // Get game data
    const gameDataString = await contract.getPlayerGameData(address, index);

    // Parse game data
    const gameData = JSON.parse(gameDataString);

    // Get AI response if available
    let aiResponse = "";
    try {
      aiResponse = await contract.getAIResponse(address, index);
    } catch (err) {
      console.error("Error getting AI response:", err);
    }

    return res.status(200).json({
      success: true,
      gameData,
      aiResponse,
    });
  } catch (error) {
    console.error("Error getting game details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting game details",
      error: error.message,
    });
  }
});

// Get player NFTs endpoint
app.get("/api/nfts/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!address || !ethers.utils.isAddress(address)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid wallet address" });
    }

    const contract = await getContract();

    // Get first dish NFT
    const firstDishNFT = await contract.getFirstDishNFT(address);

    // Get recipe NFTs (if we know what recipes are available)
    const recipeNames = ["alooBhujia", "pavBhaji"]; // Add all your recipes here
    const recipeNFTs = {};

    for (const recipe of recipeNames) {
      try {
        const nftAddress = await contract.getRecipeCompletionNFT(
          address,
          recipe
        );
        if (nftAddress && nftAddress !== ethers.constants.AddressZero) {
          recipeNFTs[recipe] = nftAddress;
        }
      } catch (err) {
        console.error(`Error fetching NFT for recipe ${recipe}:`, err);
      }
    }

    return res.status(200).json({
      success: true,
      address,
      nfts: {
        firstDishNFT:
          firstDishNFT !== ethers.constants.AddressZero ? firstDishNFT : null,
        recipeNFTs,
      },
    });
  } catch (error) {
    console.error("Error getting player NFTs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting player NFTs",
      error: error.message,
    });
  }
});

// Start server
startServer();
