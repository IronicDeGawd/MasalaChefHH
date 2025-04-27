// API base URL - Use environment variable when available
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * General fetch wrapper with error handling
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    throw error;
  }
};

/**
 * Connect wallet through backend
 * @param {string} address - The wallet address to connect
 * @returns {Promise} - The response data
 */
export const connectWallet = async (address) => {
  if (!address) {
    throw new Error("Wallet address is required");
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/wallet/connect`, {
    method: "POST",
    body: JSON.stringify({ address }),
  });
};

/**
 * Save game data to blockchain through backend
 * @param {string} address - The wallet address
 * @param {string} recipeName - The recipe name
 * @param {number} score - The game score
 * @param {number} timeTaken - The time taken in seconds
 * @param {object} gameData - The full game data
 * @returns {Promise} - The response data
 */
export const saveGame = async (
  address,
  recipeName,
  score,
  timeTaken,
  gameData
) => {
  if (!address) {
    throw new Error("Wallet address is required");
  }

  // Ensure proper data types for numeric values
  const scoreNum = Number(score);
  const timeTakenNum = Number(timeTaken);
  
  // Log what we're sending to server for debugging
  console.log("Saving game with data:", {
    address,
    recipeName,
    score: scoreNum,
    timeTaken: timeTakenNum,
    gameDataType: typeof gameData
  });

  const response = await fetchWithErrorHandling(`${API_BASE_URL}/game/save`, {
    method: "POST",
    body: JSON.stringify({
      address,
      recipeName,
      score: scoreNum,
      timeTaken: timeTakenNum,
      gameData,
    }),
  });
  
  // Log the server response for debugging
  console.log("Server response for saveGame:", response);
  
  // If the gameId is -1, it means there was an issue with the game count
  if (response.gameId === -1) {
    console.warn("Server returned gameId -1, refreshing game history");
    // Try to get updated game history to get correct count
    try {
      const historyResponse = await getGameHistory(address);
      if (historyResponse.games && historyResponse.games.length > 0) {
        response.gameId = historyResponse.gameCount - 1;
      }
    } catch (err) {
      console.error("Failed to refresh game history:", err);
    }
  }

  return response;
};

/**
 * Get game history for a wallet
 * @param {string} address - The wallet address
 * @returns {Promise} - The response data
 */
export const getGameHistory = async (address) => {
  if (!address) {
    throw new Error("Wallet address is required");
  }
  
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/game/history/${address}`);
  
  // Log the response for debugging
  console.log("Game history response:", response);
  
  return response;
};

/**
 * Get details for a specific game
 * @param {string} address - The wallet address
 * @param {number} index - The game index
 * @returns {Promise} - The response data
 */
export const getGameDetails = async (address, index) => {
  if (!address) {
    throw new Error("Wallet address is required");
  }
  
  if (index === undefined || index === null || isNaN(index)) {
    throw new Error("Valid game index is required");
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/game/${address}/${index}`);
};

/**
 * Get NFTs owned by a wallet
 * @param {string} address - The wallet address
 * @returns {Promise} - The response data
 */
export const getNFTs = async (address) => {
  if (!address) {
    throw new Error("Wallet address is required");
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/nfts/${address}`);
};

export default {
  connectWallet,
  saveGame,
  getGameHistory,
  getGameDetails,
  getNFTs,
};
