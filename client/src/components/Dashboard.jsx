"use client";

import { useState, useEffect } from "react";
import { useWallet } from "../utils/blockchain/WalletConnector";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const {
    account,
    connectWallet,
    playerStats,
    getGameHistory,
    getGameDetails,
    getPlayerNFTs,
  } = useWallet();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showNFTs, setShowNFTs] = useState(false);
  const [nfts, setNfts] = useState({
    firstDishNFT: null,
    recipeNFTs: {},
  });

  // Fetch game data when account changes
  useEffect(() => {
    if (account) {
      fetchGameData();
    } else {
      // Reset data when disconnected
      setGames([]);
      setSelectedGame(null);
    }
  }, [account]);

  // Function to fetch player's game data
  const fetchGameData = async () => {
    if (!account) return;

    setLoading(true);
    try {
      // Get game history
      const gameList = await getGameHistory();
      setGames(gameList);
      toast.success("Game history loaded successfully!");

      // Fetch NFTs
      await fetchNFTs();
    } catch (err) {
      console.error("Error fetching game data:", err);
      toast.error("Failed to load game history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch player's NFTs
  const fetchNFTs = async () => {
    if (!account) return;

    try {
      const nftData = await getPlayerNFTs();
      setNfts(nftData);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
    }
  };

  // Function to view detailed game data
  const viewGameDetails = async (index) => {
    if (!account) return;

    try {
      const gameData = await getGameDetails(index);
      setSelectedGame({ ...gameData, index });
    } catch (err) {
      console.error("Error fetching game details:", err);
      toast.error("Failed to load game details");
    }
  };

  // If no wallet is connected
  if (!account) {
    return (
      <div className="dashboard-container max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md my-8 cursor-default">
        <div className="dashboard-header mb-8">
          <h2 className="text-3xl font-bold text-curry-500">Game Dashboard</h2>
          <p className="text-masala-600">
            Connect your wallet to view your game history.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-spice-100 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-spice-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <button
            onClick={connectWallet}
            className="btn btn-primary text-lg px-8 py-3 mb-4"
          >
            Connect Wallet
          </button>
          <p className="text-masala-500 text-center max-w-md">
            You need a Web3 wallet like MetaMask to view your game history and
            achievements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md my-8 cursor-default">
      <div className="dashboard-header mb-8">
        <h2 className="text-3xl font-bold text-curry-500">
          Masala Chef Dashboard
        </h2>
        <div className="wallet-info flex items-center">
          <div className="flex items-center space-x-2 bg-spice-50 px-3 py-2 rounded-md">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-masala-700">
              {account.substring(0, 6)}...
              {account.substring(account.length - 4)}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-stats grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-box bg-spice-50 rounded-lg p-6 shadow-sm text-center border-l-4 border-curry-500">
          <h3 className="text-lg font-semibold text-curry-500 mb-2">
            Total Games
          </h3>
          <p className="text-3xl font-bold text-masala-700">
            {playerStats.gameCount || 0}
          </p>
        </div>
        <div className="stat-box bg-spice-50 rounded-lg p-6 shadow-sm text-center border-l-4 border-curry-500">
          <h3 className="text-lg font-semibold text-curry-500 mb-2">
            Best Score
          </h3>
          <p className="text-3xl font-bold text-masala-700">
            {playerStats.bestScore || 0}
          </p>
        </div>
        <div className="stat-box bg-spice-50 rounded-lg p-6 shadow-sm text-center border-l-4 border-curry-500">
          <h3 className="text-lg font-semibold text-curry-500 mb-2">
            Achievements
          </h3>
          <button
            className="btn btn-secondary mt-2"
            onClick={() => setShowNFTs(!showNFTs)}
          >
            {showNFTs ? "Hide NFTs" : "Show NFTs"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNFTs && (
          <motion.div
            className="nft-collection bg-gray-50 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-curry-500 mb-6">
              Your NFT Collection
            </h3>
            <div className="nft-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nfts.firstDishNFT ? (
                <div className="nft-card bg-white rounded-lg overflow-hidden shadow-sm text-center transition-transform duration-300 hover:-translate-y-2">
                  <div className="h-48 bg-spice-50 flex items-center justify-center">
                    <img
                      src="/assets/nft-artwork/first-dish.png"
                      alt="First Dish NFT"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg?height=200&width=200";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-masala-700 mb-1">
                      First Dish Achievement
                    </h4>
                    <p className="text-xs bg-gray-100 rounded-full px-3 py-1 inline-block text-masala-500">
                      {nfts.firstDishNFT.substring(0, 6)}...
                      {nfts.firstDishNFT.substring(
                        nfts.firstDishNFT.length - 4
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="nft-card bg-gray-100 rounded-lg overflow-hidden shadow-sm text-center opacity-70">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      src="/assets/recipebook.png"
                      alt="Locked NFT"
                      className="max-h-full max-w-full object-contain opacity-50"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg?height=200&width=200";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-masala-700 mb-1">
                      First Dish Achievement
                    </h4>
                    <p className="text-sm text-masala-500">
                      Complete your first dish to earn!
                    </p>
                  </div>
                </div>
              )}

              {Object.entries(nfts.recipeNFTs || {}).map(
                ([recipe, address]) => (
                  <div
                    className="nft-card bg-white rounded-lg overflow-hidden shadow-sm text-center transition-transform duration-300 hover:-translate-y-2"
                    key={recipe}
                  >
                    <div className="h-48 bg-spice-50 flex items-center justify-center">
                      <img
                        src={`/assets/recipe_menu.png`}
                        alt={`${recipe} NFT`}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "/placeholder.svg?height=200&width=200";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-masala-700 mb-1">
                        {recipe} Master
                      </h4>
                      <p className="text-xs bg-gray-100 rounded-full px-3 py-1 inline-block text-masala-500">
                        {address.substring(0, 6)}...
                        {address.substring(address.length - 4)}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="loader w-12 h-12 border-4 border-gray-200 border-t-curry-500 rounded-full animate-spin mb-4"></div>
          <p className="text-masala-600">Loading game history...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-masala-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-lg text-masala-600 mb-6">No games played yet.</p>
          <a href="/game" className="btn btn-primary inline-block">
            Play Your First Game
          </a>
        </div>
      ) : (
        <div className="game-history mb-8">
          <h3 className="text-xl font-bold text-curry-500 mb-4">
            Game History
          </h3>
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-curry-500 text-white font-medium p-3 text-left">
                    #
                  </th>
                  <th className="bg-curry-500 text-white font-medium p-3 text-left">
                    Recipe
                  </th>
                  <th className="bg-curry-500 text-white font-medium p-3 text-left">
                    Score
                  </th>
                  <th className="bg-curry-500 text-white font-medium p-3 text-left">
                    Time
                  </th>
                  <th className="bg-curry-500 text-white font-medium p-3 text-left">
                    Date
                  </th>
                  <th className="bg-curry-500 text-white font-medium p-3 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 hover:bg-spice-50 transition-colors ${
                      selectedGame && selectedGame.index === game.index
                        ? "bg-spice-50"
                        : idx % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3">{playerStats.gameCount - idx}</td>
                    <td className="p-3 font-medium text-masala-700">
                      {game.recipeName}
                    </td>
                    <td className="p-3">{game.score}</td>
                    <td className="p-3">
                      {Math.floor(game.timeTaken / 60)}:
                      {(game.timeTaken % 60).toString().padStart(2, "0")}
                    </td>
                    <td className="p-3">
                      {new Date(game.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => viewGameDetails(game.index)}
                        className="btn btn-tertiary py-1 px-3 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedGame && (
          <motion.div
            className="game-details bg-spice-50 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-curry-500">Game Details</h3>
              <button
                onClick={() => setSelectedGame(null)}
                className="btn btn-outline py-1 px-3 text-sm"
              >
                Close
              </button>
            </div>

            <div className="details-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-masala-500 mb-1">
                  Recipe
                </h4>
                <p className="text-xl font-semibold text-masala-700">
                  {selectedGame.selectedRecipe || selectedGame.recipeName}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-masala-500 mb-1">
                  Score
                </h4>
                <p className="text-xl font-semibold text-masala-700">
                  {selectedGame.score}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-masala-500 mb-1">
                  Time
                </h4>
                <p className="text-xl font-semibold text-masala-700">
                  {Math.floor(selectedGame.timeTaken / 60)}:
                  {(selectedGame.timeTaken % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-masala-500 mb-1">
                  Steps Completed
                </h4>
                <p className="text-xl font-semibold text-masala-700">
                  {selectedGame.stepsCompleted || "All"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dashboard-actions flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
        <button
          onClick={fetchGameData}
          className="btn btn-secondary w-full sm:w-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 inline"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Data
        </button>
        <a href="/game" className="btn btn-primary w-full sm:w-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 inline"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Play Game
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
