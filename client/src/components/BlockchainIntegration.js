import React, { useState } from "react";
import { useWallet } from "../utils/blockchain/WalletConnector";
import { toast } from "react-toastify";

const BlockchainIntegration = ({ gameData, onSaveSuccess, onSaveError }) => {
  const { account, connectWallet, saveGameToBlockchain, playerStats } =
    useWallet();
  const [saving, setSaving] = useState(false);
  const [nftAwarded, setNftAwarded] = useState(false);

  // Function to save game to blockchain
  const handleSaveGame = async () => {
    if (!account) {
      try {
        const connected = await connectWallet();
        if (!connected) return;
      } catch (error) {
        toast.error("Failed to connect wallet");
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
    <div className="blockchain-integration">
      {!account ? (
        <div className="blockchain-buttons">
          <button
            onClick={connectWallet}
            className="primary-button"
            disabled={saving}
          >
            Connect Wallet to Save Game
          </button>
          <small className="network-info">Monad Testnet Only</small>
        </div>
      ) : (
        <div className="blockchain-buttons">
          <button
            onClick={handleSaveGame}
            className="primary-button"
            disabled={saving}
          >
            {saving ? "Saving to Blockchain..." : "Save Game to Blockchain"}
          </button>
          <small className="network-info">Connected to Monad Testnet</small>
        </div>
      )}

      {nftAwarded && (
        <div className="nft-award">
          <h3>🎉 First Dish NFT Awarded! 🎉</h3>
          <p>
            Congratulations on completing your first dish! You've earned a
            special NFT.
          </p>
          <img
            src="/assets/nft-artwork/first-dish.png"
            alt="First Dish NFT"
            className="nft-image"
          />
        </div>
      )}
    </div>
  );
};

export default BlockchainIntegration;
