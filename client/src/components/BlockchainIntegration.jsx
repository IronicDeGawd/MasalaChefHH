"use client";

import { useState } from "react";
import { useWallet } from "../utils/blockchain/WalletConnector";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const BlockchainIntegration = ({ gameData, onSaveSuccess, onSaveError }) => {
  const { account, connectWallet, saveGameToBlockchain } = useWallet();
  const [saving, setSaving] = useState(false);
  const [nftAwarded, setNftAwarded] = useState(false);

  // Function to save game to blockchain
  const handleSaveGame = async () => {
    if (!account) {
      try {
        const connected = await connectWallet();
        if (!connected) return;
      } catch (error) {
        toast.error("Failed to connect wallet" + error);
        return;
      }
    }

    setSaving(true);
    try {
      const result = await saveGameToBlockchain(gameData);
      toast.success("Game saved to blockchain successfully!");

      // Check if NFT was awarded
      if (result.nftAwarded) {
        setNftAwarded(true);
        toast.success("Congratulations! You received the First Dish NFT!", {
          autoClose: 10000,
        });
      }

      if (onSaveSuccess) onSaveSuccess(result);
    } catch (error) {
      console.error("Error saving game to blockchain:", error);
      toast.error(`Failed to save game: ${error.message || "Unknown error"}`);
      if (onSaveError) onSaveError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="blockchain-integration mt-6">
      {!account ? (
        <div className="blockchain-buttons flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={connectWallet}
            className="btn btn-primary w-full sm:w-auto flex items-center justify-center"
            disabled={saving}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Connect Wallet to Save Game
          </button>
          <small className="text-sm text-masala-500">Monad Testnet Only</small>
        </div>
      ) : (
        <div className="blockchain-buttons flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={handleSaveGame}
            className={`btn ${
              saving ? "bg-gray-300 cursor-not-allowed" : "btn-primary"
            } w-full sm:w-auto flex items-center justify-center`}
            disabled={saving}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving to Blockchain...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Game to Blockchain
              </>
            )}
          </button>
          <small className="text-sm text-masala-500 flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            Connected to Monad Testnet
          </small>
        </div>
      )}

      {nftAwarded && (
        <motion.div
          className="nft-award mt-8 p-6 bg-spice-50 rounded-lg text-center border-2 border-spice-300"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-curry-500 mb-2">
            🎉 First Dish NFT Awarded! 🎉
          </h3>
          <p className="text-masala-600 mb-4">
            Congratulations on completing your first dish! You've earned a
            special NFT.
          </p>
          <img
            src="/assets/nft-artwork/first-dish.png"
            alt="First Dish NFT"
            className="nft-image max-w-[200px] mx-auto my-4 rounded-lg shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.svg?height=200&width=200";
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default BlockchainIntegration;
