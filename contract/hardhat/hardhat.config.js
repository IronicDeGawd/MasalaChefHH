require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local development network
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Monad Testnet - updated RPC URL
    monad: {
      url: process.env.MONAD_URL || "https://testnet-rpc.monad.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10143, // Use the correct chain ID for Monad testnet
    },
  },
  // For contract verification
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      // Add other networks as needed
    },
    customChains: [
      {
        network: "monad",
        chainId: 10143,
        urls: {
          apiURL: "https://api-testnet.monad.xyz/",
          browserURL: "https://explorer.testnet.monad.xyz/",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
