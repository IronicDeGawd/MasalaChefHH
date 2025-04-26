import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import MasalaChefGame from "../game/MasalaChefGame";
import BlockchainIntegration from "./BlockchainIntegration";
import NFTAward from "./NFTAward";
import { useWallet } from "../utils/blockchain/WalletConnector";

const GameComponent = () => {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const { account, saveGameToBlockchain } = useWallet();
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [savedTxHash, setSavedTxHash] = useState(null);
  const [nftAwarded, setNftAwarded] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize game only once
    if (!gameRef.current && containerRef.current) {
      gameRef.current = new MasalaChefGame();
      gameRef.current.init(containerRef.current);

      // Add game completion event listener
      if (gameRef.current.game) {
        gameRef.current.game.events.on("gameCompleted", handleGameComplete);
      }
    }

    // Cleanup when component unmounts
    return () => {
      if (gameRef.current) {
        if (gameRef.current.game && gameRef.current.game.events) {
          gameRef.current.game.events.off("gameCompleted", handleGameComplete);
        }
        gameRef.current.game.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Automatically save game data to blockchain when wallet is connected
  const autoSaveToBlockchain = async (data) => {
    if (!account) return;

    setAutoSaving(true);
    try {
      const result = await saveGameToBlockchain(data);
      setSavedTxHash(result.transactionHash);
      toast.success("Game saved successfully to the blockchain!");

      // Check if NFT was awarded
      if (result.nftAwarded) {
        setTimeout(() => {
          setNftAwarded({
            type: "firstDish",
            address: result.nftAddress,
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving game to blockchain:", error);
      toast.error(`Failed to save game: ${error.message || "Unknown error"}`);
    } finally {
      setAutoSaving(false);
    }
  };

  // Handle game completion event from Phaser
  const handleGameComplete = async (data) => {
    console.log("Game completed with data:", data);
    setGameData(data);
    setGameCompleted(true);

    // Only show completion toast, not saving toast yet
    toast.success("Game completed!");

    // If wallet is connected, automatically save to blockchain
    if (account) {
      toast.info("Game completed! Automatically saving to the blockchain...");
      await autoSaveToBlockchain(data);
    } else {
      toast.success(
        "Game completed! Connect your wallet to save your progress."
      );
    }
  };

  // Handle successful blockchain save - removed duplicate toast
  const handleSaveSuccess = (result) => {
    setSavedTxHash(result.transactionHash);
    toast.success("Game saved successfully to the blockchain!");

    // Check if NFT was awarded
    if (result.nftAwarded) {
      setTimeout(() => {
        setNftAwarded({
          type: "firstDish",
          address: result.nftAddress,
        });
      }, 1000);
    }
  };

  // Handle error in blockchain save
  const handleSaveError = (error) => {
    toast.error(`Error saving game: ${error.message}`);
  };

  // Navigation handlers using React Router
  const goToDashboard = () => {
    // Restore default cursor before navigation
    document.body.style.cursor = "default";
    if (
      gameRef.current &&
      gameRef.current.game &&
      gameRef.current.game.canvas
    ) {
      gameRef.current.game.canvas.style.cursor = "default";
    }

    // Remove any cursor-related CSS that might have been injected
    const cursorStyleElement = document.querySelector(
      "style[data-cursor-styles]"
    );
    if (cursorStyleElement) {
      document.head.removeChild(cursorStyleElement);
    }

    navigate("/dashboard");
  };

  const handlePlayAgain = () => {
    setGameCompleted(false);
    setGameData(null);
    setSavedTxHash(null);

    // Restart the game
    if (gameRef.current && gameRef.current.game) {
      gameRef.current.resetGameData();
      gameRef.current.game.scene.start("MenuScene");
    }
  };

  // Close NFT award modal
  const handleCloseNFTModal = () => {
    setNftAwarded(null);
  };

  return (
    <div className="game-container">
      <ToastContainer position="top-right" autoClose={5000} />

      {nftAwarded && (
        <NFTAward
          type={nftAwarded.type}
          nftAddress={nftAwarded.address}
          onClose={handleCloseNFTModal}
        />
      )}

      <div
        className="game-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        <div
          ref={containerRef}
          id="game-container"
          style={{
            width: "100%",
            maxWidth: "1280px",
            height: "auto",
            aspectRatio: "4/3",
            margin: "0 auto",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        />

        {/* Auto-saving indicator */}
        {autoSaving && (
          <div
            className="autosaving-indicator"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "10px 15px",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 100,
            }}
          >
            <div
              className="spinner"
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #ffffff",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span>Saving to blockchain...</span>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}

        {/* Game completion overlay for users without wallet connected */}
        {gameCompleted && gameData && !account && (
          <div
            className="game-completion-overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              color: "white",
              zIndex: 100,
              borderRadius: "10px",
            }}
          >
            <h2>Game Completed!</h2>

            <div
              className="game-stats"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "1rem 2rem",
                borderRadius: "8px",
                margin: "1rem 0",
                width: "80%",
                maxWidth: "500px",
              }}
            >
              <div
                className="stat-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "0.5rem 0",
                }}
              >
                <span>Recipe:</span>
                <span>{gameData.selectedRecipe}</span>
              </div>
              <div
                className="stat-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "0.5rem 0",
                }}
              >
                <span>Score:</span>
                <span>{gameData.score}</span>
              </div>
              <div
                className="stat-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "0.5rem 0",
                }}
              >
                <span>Time:</span>
                <span>
                  {Math.floor(gameData.timeTaken / 60)}:
                  {(gameData.timeTaken % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div
                className="stat-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "0.5rem 0",
                }}
              >
                <span>Steps Completed:</span>
                <span>
                  {gameData.stepsCompleted || "All"} /{" "}
                  {gameData.totalSteps || "?"}
                </span>
              </div>
            </div>

            {/* Blockchain integration for users without connected wallet */}
            <div
              className="blockchain-container"
              style={{
                marginTop: "1.5rem",
                width: "80%",
                maxWidth: "500px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <BlockchainIntegration
                gameData={gameData}
                onSaveSuccess={handleSaveSuccess}
                onSaveError={handleSaveError}
              />

              {savedTxHash && (
                <div
                  className="transaction-info"
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.9rem",
                    backgroundColor: "rgba(76, 175, 80, 0.2)",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  <p>Transaction Hash:</p>
                  <a
                    href={`https://etherscan.io/tx/${savedTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#4caf50", wordBreak: "break-all" }}
                  >
                    {savedTxHash}
                  </a>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div
              className="action-buttons"
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "2rem",
              }}
            >
              <button
                onClick={handlePlayAgain}
                style={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Play Again
              </button>

              <button
                onClick={goToDashboard}
                style={{
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Game completion notification for connected users */}
        {gameCompleted && gameData && account && !autoSaving && (
          <div
            className="game-completion-mini"
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "15px 20px",
              borderRadius: "10px",
              maxWidth: "300px",
              zIndex: 100,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
              Game Completed!
            </h3>
            <p style={{ margin: "5px 0" }}>
              Recipe: <strong>{gameData.selectedRecipe}</strong>
            </p>
            <p style={{ margin: "5px 0" }}>
              Score: <strong>{gameData.score}</strong>
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handlePlayAgain}
                style={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Play Again
              </button>
              <button
                onClick={goToDashboard}
                style={{
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameComponent;
