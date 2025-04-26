/**
 * NFT Utilities for the MasalaChef game
 * Handles interactions with the NFT contracts
 */

import * as api from "./api";

// Check if player has First Dish NFT
export const checkFirstDishNFT = async (playerAddress) => {
  try {
    console.log(`Checking if player ${playerAddress} has First Dish NFT`);

    // Call the API endpoint to check NFTs
    const response = await api.getNFTs(playerAddress);

    // Check if the player has a First Dish NFT
    return {
      hasNFT: response.nfts.firstDishNFT !== null,
      tokenId: response.nfts.firstDishNFT || null,
    };
  } catch (error) {
    console.error("Error checking First Dish NFT:", error);
    return {
      hasNFT: false,
      tokenId: null,
      error: error.message,
    };
  }
};

export const awardFirstDishNFT = async (playerAddress, recipeName, score) => {
  try {
    console.log(`Awarding First Dish NFT to ${playerAddress}`);
    console.log(`Recipe: ${recipeName}, Score: ${score}`);

    // In a full implementation, the NFT is awarded automatically by the server
    // when saving game data. Here we're using the wallet connector's
    // saveGameToBlockchain function which will handle this.

    // Create metadata with dynamic values (this is now handled by the blockchain)
    const metadata = {
      name: "MasalaChef First Dish Achievement",
      description: `This NFT celebrates ${playerAddress}'s first dish completion in MasalaChef!`,
      image: "/assets/nft-artwork/first-dish.png",
      attributes: [
        {
          trait_type: "Achievement Type",
          value: "First Dish",
        },
        {
          display_type: "date",
          trait_type: "Achievement Date",
          value: Math.floor(Date.now() / 1000),
        },
        {
          trait_type: "Recipe",
          value: recipeName,
        },
        {
          display_type: "number",
          trait_type: "Score",
          value: score,
        },
      ],
    };

    // Check if the NFT was awarded after the game was saved
    const nftResponse = await api.getNFTs(playerAddress);
    const wasAwarded = nftResponse.nfts.firstDishNFT !== null;

    return {
      success: wasAwarded,
      tokenId: wasAwarded ? nftResponse.nfts.firstDishNFT : null,
      metadata: wasAwarded ? metadata : null,
    };
  } catch (error) {
    console.error("Error awarding First Dish NFT:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getFirstDishNFTMetadata = async (tokenId) => {
  try {
    // In a production environment, this would fetch metadata from IPFS or your server
    // based on the tokenURI from the contract

    // For now, we're still using the static metadata file
    const baseUrl = window.location.origin;
    const response = await fetch(
      `${baseUrl}/assets/nft-metadata/first-dish.json`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch NFT metadata: ${response.status}`);
    }

    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error getting NFT metadata:", error);
    return null;
  }
};

// New function to get all NFTs for a player
export const getAllPlayerNFTs = async (playerAddress) => {
  try {
    const response = await api.getNFTs(playerAddress);
    return response.nfts;
  } catch (error) {
    console.error("Error getting all player NFTs:", error);
    return {
      firstDishNFT: null,
      recipeNFTs: {},
    };
  }
};
