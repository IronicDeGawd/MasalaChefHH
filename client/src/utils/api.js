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
  return fetchWithErrorHandling(`${API_BASE_URL}/game/save`, {
    method: "POST",
    body: JSON.stringify({
      address,
      recipeName,
      score,
      timeTaken,
      gameData,
    }),
  });
};

/**
 * Get game history for a wallet
 * @param {string} address - The wallet address
 * @returns {Promise} - The response data
 */
export const getGameHistory = async (address) => {
  return fetchWithErrorHandling(`${API_BASE_URL}/game/history/${address}`);
};

/**
 * Get details for a specific game
 * @param {string} address - The wallet address
 * @param {number} index - The game index
 * @returns {Promise} - The response data
 */
export const getGameDetails = async (address, index) => {
  return fetchWithErrorHandling(`${API_BASE_URL}/game/${address}/${index}`);
};

/**
 * Get NFTs owned by a wallet
 * @param {string} address - The wallet address
 * @returns {Promise} - The response data
 */
export const getNFTs = async (address) => {
  return fetchWithErrorHandling(`${API_BASE_URL}/nfts/${address}`);
};

export default {
  connectWallet,
  saveGame,
  getGameHistory,
  getGameDetails,
  getNFTs,
};
