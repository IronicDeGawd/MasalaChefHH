"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import MasalaChefGame from "../game/MasalaChefGame";
import BlockchainIntegration from "./BlockchainIntegration";
import NFTAward from "./NFTAward";
import { useWallet } from "../utils/blockchain/WalletConnector";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

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

  // Automatically save game data to blockchain when wallet is connected
  const autoSaveToBlockchain = useCallback(
    async (data) => {
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
    },
    [account, saveGameToBlockchain]
  );

  const handleGameComplete = useCallback(
    async (data) => {
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
    },
    [account, autoSaveToBlockchain]
  );
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
  }, [handleGameComplete]);

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
    <div className="game-container flex justify-center items-center w-full min-h-screen py-8 px-4 bg-spice-50">
      <ToastContainer position="top-right" autoClose={5000} />

      {nftAwarded && (
        <NFTAward
          type={nftAwarded.type}
          nftAddress={nftAwarded.address}
          onClose={handleCloseNFTModal}
        />
      )}

      <div className="w-full max-w-6xl mx-auto relative">
        <div className="game-wrapper bg-white rounded-xl shadow-lg overflow-hidden">
          <div
            ref={containerRef}
            id="game-container"
            style={{
              width: "100%",
              maxWidth: "1280px",
              height: "auto",
              aspectRatio: "4/3",
              margin: "0 auto",
            }}
          />
        </div>

        {/* Auto-saving indicator */}
        {autoSaving && (
          <motion.div
            className="fixed top-20 right-4 bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg flex items-center gap-2 z-50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Saving to blockchain...</span>
          </motion.div>
        )}

        {/* Game completion overlay for users without wallet connected */}
        {gameCompleted && gameData && !account && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-xl p-8 max-w-2xl w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-curry-500 mb-6 text-center">
                Game Completed!
              </h2>

              <div className="bg-spice-50 p-6 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3">
                    <div className="text-sm text-masala-500 mb-1">Recipe:</div>
                    <div className="text-lg font-semibold text-masala-700">
                      {gameData.selectedRecipe}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-masala-500 mb-1">Score:</div>
                    <div className="text-lg font-semibold text-masala-700">
                      {gameData.score}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-masala-500 mb-1">Time:</div>
                    <div className="text-lg font-semibold text-masala-700">
                      {Math.floor(gameData.timeTaken / 60)}:
                      {(gameData.timeTaken % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-masala-500 mb-1">
                      Steps Completed:
                    </div>
                    <div className="text-lg font-semibold text-masala-700">
                      {gameData.stepsCompleted || "All"} /{" "}
                      {gameData.totalSteps || "?"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain integration for users without connected wallet */}
              <div className="mb-6">
                <BlockchainIntegration
                  gameData={gameData}
                  onSaveSuccess={handleSaveSuccess}
                  onSaveError={handleSaveError}
                />

                {savedTxHash && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg text-center">
                    <p className="text-sm text-green-800 mb-1">
                      Transaction Hash:
                    </p>
                    <a
                      href={`https://etherscan.io/tx/${savedTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-sm font-mono break-all"
                    >
                      {savedTxHash}
                    </a>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={handlePlayAgain} className="btn btn-primary">
                  Play Again
                </button>

                <button onClick={goToDashboard} className="btn btn-tertiary">
                  View Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Game completion notification for connected users */}
        {gameCompleted && gameData && account && !autoSaving && (
          <motion.div
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold text-curry-500 mb-2">
              Game Completed!
            </h3>
            <div className="mb-3">
              <p className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-masala-500">Recipe:</span>
                <span className="font-medium text-masala-700">
                  {gameData.selectedRecipe}
                </span>
              </p>
              <p className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-masala-500">Score:</span>
                <span className="font-medium text-masala-700">
                  {gameData.score}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePlayAgain}
                className="btn btn-primary py-1 px-3 text-sm flex-1"
              >
                Play Again
              </button>
              <button
                onClick={goToDashboard}
                className="btn btn-tertiary py-1 px-3 text-sm flex-1"
              >
                Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameComponent;
