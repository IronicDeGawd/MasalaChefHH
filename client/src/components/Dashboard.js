import React, { useState, useEffect } from "react";
import { useWallet } from "../utils/blockchain/WalletConnector";
import { toast } from "react-toastify";
import "./Dashboard.css";

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
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Game Dashboard</h2>
          <p>Connect your wallet to view your game history.</p>
        </div>

        <div className="wallet-connect-container">
          <button onClick={connectWallet} className="connect-wallet-button">
            Connect Wallet
          </button>
          <p className="note">
            You need a Web3 wallet like MetaMask to view your game history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Masala Chef Dashboard</h2>
        <div className="wallet-info">
          <span className="wallet-address">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-box">
          <h3>Total Games</h3>
          <p>{playerStats.gameCount || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Best Score</h3>
          <p>{playerStats.bestScore || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Achievements</h3>
          <button
            className="nft-toggle-button"
            onClick={() => setShowNFTs(!showNFTs)}
          >
            {showNFTs ? "Hide NFTs" : "Show NFTs"}
          </button>
        </div>
      </div>

      {showNFTs && (
        <div className="nft-collection">
          <h3>Your NFT Collection</h3>
          <div className="nft-grid">
            {nfts.firstDishNFT ? (
              <div className="nft-card">
                <img
                  src="/assets/nft-artwork/first-dish.png"
                  alt="First Dish NFT"
                />
                <h4>First Dish Achievement</h4>
                <p className="nft-address">
                  {nfts.firstDishNFT.substring(0, 6)}...
                  {nfts.firstDishNFT.substring(nfts.firstDishNFT.length - 4)}
                </p>
              </div>
            ) : (
              <div className="nft-card locked">
                <img
                  src="/assets/recipebook.png"
                  alt="Locked NFT"
                  className="locked-nft"
                />
                <h4>First Dish Achievement</h4>
                <p>Complete your first dish to earn!</p>
              </div>
            )}

            {Object.entries(nfts.recipeNFTs || {}).map(([recipe, address]) => (
              <div className="nft-card" key={recipe}>
                <img src={`/assets/recipe_menu.png`} alt={`${recipe} NFT`} />
                <h4>{recipe} Master</h4>
                <p className="nft-address">
                  {address.substring(0, 6)}...
                  {address.substring(address.length - 4)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading game history...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="no-games-container">
          <p>No games played yet.</p>
          <button
            onClick={() => (window.location.href = "/game")}
            className="play-button"
          >
            Play Your First Game
          </button>
        </div>
      ) : (
        <div className="game-history">
          <h3>Game History</h3>
          <div className="table-container">
            <table className="game-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Recipe</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, idx) => (
                  <tr
                    key={idx}
                    className={
                      selectedGame && selectedGame.index === game.index
                        ? "selected"
                        : ""
                    }
                  >
                    <td>{playerStats.gameCount - idx}</td>
                    <td>{game.recipeName}</td>
                    <td>{game.score}</td>
                    <td>
                      {Math.floor(game.timeTaken / 60)}:
                      {(game.timeTaken % 60).toString().padStart(2, "0")}
                    </td>
                    <td>{new Date(game.timestamp).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => viewGameDetails(game.index)}
                        className="view-details-button"
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

      {selectedGame && (
        <div className="game-details">
          <h3>Game Details</h3>
          <div className="details-grid">
            <div>
              <h4>Recipe</h4>
              <p>{selectedGame.selectedRecipe || selectedGame.recipeName}</p>
            </div>
            <div>
              <h4>Score</h4>
              <p>{selectedGame.score}</p>
            </div>
            <div>
              <h4>Time</h4>
              <p>
                {Math.floor(selectedGame.timeTaken / 60)}:
                {(selectedGame.timeTaken % 60).toString().padStart(2, "0")}
              </p>
            </div>
            <div>
              <h4>Steps Completed</h4>
              <p>{selectedGame.stepsCompleted || "All"}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedGame(null)}
            className="close-button"
          >
            Close Details
          </button>
        </div>
      )}

      <div className="dashboard-actions">
        <button onClick={fetchGameData} className="refresh-button">
          Refresh Data
        </button>
        <button
          onClick={() => (window.location.href = "/game")}
          className="play-button"
        >
          Play Game
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
