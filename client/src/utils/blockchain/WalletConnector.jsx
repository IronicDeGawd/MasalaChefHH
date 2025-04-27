import { useState, useEffect, useContext } from "react";
import { BrowserProvider } from "ethers";
import * as api from "../api";
import { MONAD_TESTNET, CONTRACT_ADDRESSES } from "./constants";
import WalletContext from "./WalletContext";

// Create a hook for components to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// Only export the provider component
export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [playerStats, setPlayerStats] = useState({
    gameCount: 0,
    bestScore: 0,
    hasFirstDishNFT: false,
  });

  // Initialize provider if window.ethereum is available
  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          // Update to use BrowserProvider for ethers v6
          const ethProvider = new BrowserProvider(window.ethereum);
          setProvider(ethProvider);

          // Add Monad network to MetaMask if not already added
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: MONAD_TESTNET.chainId }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [MONAD_TESTNET],
                });
              } catch (addError) {
                console.error("Error adding Monad network:", addError);
              }
            }
          }

          // Check if already connected
          const accounts = await ethProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            fetchPlayerStats(accounts[0].address);
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              fetchPlayerStats(accounts[0]);
            } else {
              setAccount(null);
              setPlayerStats({
                gameCount: 0,
                bestScore: 0,
                hasFirstDishNFT: false,
              });
            }
          });

          // Listen for chain changes
          window.ethereum.on("chainChanged", (chainId) => {
            // If user switches away from Monad, try to switch back
            if (chainId !== MONAD_TESTNET.chainId) {
              window.ethereum
                .request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: MONAD_TESTNET.chainId }],
                })
                .catch(console.error);
            } else {
              window.location.reload();
            }
          });
        } catch (err) {
          console.error("Error initializing provider:", err);
          setError("Failed to initialize wallet provider");
        }
      } else {
        setError(
          "Ethereum wallet not found. Please install a wallet like MetaMask."
        );
      }
    };

    initProvider();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // Fetch player stats from backend
  const fetchPlayerStats = async (address) => {
    try {
      const response = await api.connectWallet(address);
      if (response.success) {
        setPlayerStats(response.playerStats);
      }
    } catch (err) {
      console.error("Error fetching player stats:", err);
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    if (!provider) {
      setError("No Ethereum provider found. Please install MetaMask.");
      return false;
    }

    setConnecting(true);
    setError(null);

    try {
      // Request account access from wallet
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        const userAddress = accounts[0];
        setAccount(userAddress);

        // Make sure we're on the Monad testnet
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MONAD_TESTNET.chainId }],
          });
        } catch (switchError) {
          // Add the chain if it doesn't exist
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [MONAD_TESTNET],
              });
            } catch (addError) {
              console.error("Error adding Monad network:", addError);
              setError("Failed to add Monad network: " + addError.message);
              return false;
            }
          } else {
            console.error("Error switching to Monad network:", switchError);
            setError(
              "Failed to switch to Monad network: " + switchError.message
            );
            return false;
          }
        }

        // Connect through backend and get player stats
        await fetchPlayerStats(userAddress);

        return true;
      }
      return false;
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet: " + err.message);
      return false;
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setPlayerStats({
      gameCount: 0,
      bestScore: 0,
      hasFirstDishNFT: false,
    });
  };

  // Save game to blockchain via backend
  const saveGameToBlockchain = async (gameData) => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    try {
      const recipeName = gameData.selectedRecipe;
      const score = gameData.score;
      const timeTaken = Math.floor(gameData.timeTaken); // Make sure this is in seconds

      // Call backend API to save game
      const response = await api.saveGame(
        account,
        recipeName,
        score,
        timeTaken,
        gameData
      );

      if (response.success) {
        // Update player stats
        await fetchPlayerStats(account);

        return {
          transactionHash: response.transactionHash,
          nftAwarded: response.nftAwarded,
        };
      } else {
        throw new Error(response.message || "Failed to save game");
      }
    } catch (err) {
      console.error("Error saving game to blockchain:", err);
      throw err;
    }
  };

  // Get game history
  const getGameHistory = async () => {
    if (!account) return [];

    try {
      const response = await api.getGameHistory(account);
      return response.success ? response.games : [];
    } catch (err) {
      console.error("Error getting game history:", err);
      throw err;
    }
  };

  // Get game details
  const getGameDetails = async (index) => {
    if (!account) return null;

    try {
      const response = await api.getGameDetails(account, index);
      return response.success ? response.gameData : null;
    } catch (err) {
      console.error("Error getting game details:", err);
      throw err;
    }
  };

  // Get player NFTs
  const getPlayerNFTs = async () => {
    if (!account) return { firstDishNFT: null, recipeNFTs: {} };

    try {
      const response = await api.getNFTs(account);
      return response.success
        ? response.nfts
        : { firstDishNFT: null, recipeNFTs: {} };
    } catch (err) {
      console.error("Error getting player NFTs:", err);
      throw err;
    }
  };

  const value = {
    account,
    provider,
    connecting,
    error,
    playerStats,
    connectWallet,
    disconnectWallet,
    saveGameToBlockchain,
    getGameHistory,
    getGameDetails,
    getPlayerNFTs,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
