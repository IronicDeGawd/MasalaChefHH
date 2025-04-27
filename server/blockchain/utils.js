const { ethers } = require("ethers");
const MasalaChefABI = require("./MasalaChefABI.json");
const FirstDishNFTABI = require("./FirstDishNFTABI.json");
const MasalaChefNFTConnectorABI = require("./MasalaChefNFTConnectorABI.json");

// Contract addresses - from environment variables
const CONTRACT_ADDRESS = process.env.MASALA_CHEF;
const FIRST_DISH_NFT_ADDRESS = process.env.FIRST_DISH_NFT_ADDRESS;
const NFT_CONNECTOR_ADDRESS = process.env.NFT_CONNECTOR_ADDRESS;

// Private key for server wallet - should be in environment variable in production
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Provider URL - should be in environment variable in production
const PROVIDER_URL =
  process.env.PROVIDER_URL || "https://testnet-rpc.monad.xyz";

// Keep track of initialization state
let isContractInitialized = false;

/**
 * Setup a provider for blockchain interactions
 * @returns {ethers.providers.JsonRpcProvider} Configured provider
 */
const setupProvider = () => {
  try {
    return new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  } catch (error) {
    console.error("Error setting up provider:", error);
    throw new Error("Failed to connect to blockchain network");
  }
};

/**
 * Get a signer instance for transactions
 * @returns {ethers.Wallet} Signer wallet
 */
const getSigner = () => {
  try {
    if (!PRIVATE_KEY) {
      throw new Error("Server private key not configured");
    }

    const provider = setupProvider();
    return new ethers.Wallet(PRIVATE_KEY, provider);
  } catch (error) {
    console.error("Error getting signer:", error);
    throw error;
  }
};

/**
 * Get MasalaChef contract instance, optionally with signer
 * @param {boolean} withSigner Whether to include a signer for write operations
 * @returns {ethers.Contract} Contract instance
 */
const getMasalaChefContract = (withSigner = false) => {
  try {
    if (withSigner) {
      const signer = getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, MasalaChefABI, signer);
    } else {
      const provider = setupProvider();
      return new ethers.Contract(CONTRACT_ADDRESS, MasalaChefABI, provider);
    }
  } catch (error) {
    console.error("Error getting MasalaChef contract:", error);
    throw error;
  }
};

/**
 * Get FirstDishNFT contract instance, optionally with signer
 * @param {boolean} withSigner Whether to include a signer for write operations
 * @returns {ethers.Contract} Contract instance
 */
const getFirstDishNFTContract = (withSigner = false) => {
  try {
    if (withSigner) {
      const signer = getSigner();
      return new ethers.Contract(
        FIRST_DISH_NFT_ADDRESS,
        FirstDishNFTABI,
        signer
      );
    } else {
      const provider = setupProvider();
      return new ethers.Contract(
        FIRST_DISH_NFT_ADDRESS,
        FirstDishNFTABI,
        provider
      );
    }
  } catch (error) {
    console.error("Error getting FirstDishNFT contract:", error);
    throw error;
  }
};

/**
 * Get NFT Connector contract instance, optionally with signer
 * @param {boolean} withSigner Whether to include a signer for write operations
 * @returns {ethers.Contract} Contract instance
 */
const getNFTConnectorContract = (withSigner = false) => {
  try {
    if (withSigner) {
      const signer = getSigner();
      return new ethers.Contract(
        NFT_CONNECTOR_ADDRESS,
        MasalaChefNFTConnectorABI,
        signer
      );
    } else {
      const provider = setupProvider();
      return new ethers.Contract(
        NFT_CONNECTOR_ADDRESS,
        MasalaChefNFTConnectorABI,
        provider
      );
    }
  } catch (error) {
    console.error("Error getting NFTConnector contract:", error);
    throw error;
  }
};

/**
 * Verify if an address implements expected contract functionality
 * @param {string} contractType The type of contract to verify ('masalaChef', 'firstDishNFT', 'nftConnector')
 * @param {string} address The contract address to verify
 * @returns {Promise<boolean>} True if address passes basic verification
 */
const verifyContractAddress = async (contractType, address) => {
  try {
    // Basic address format check
    if (!ethers.utils.isAddress(address)) {
      console.error(`Invalid address format for ${contractType}: ${address}`);
      return false;
    }

    const provider = setupProvider();

    // Check if address has code deployed (is a contract)
    const code = await provider.getCode(address);
    if (code === "0x") {
      console.error(
        `No contract code found at ${contractType} address: ${address}`
      );
      return false;
    }

    // Additional verification based on contract type could be done here
    // For example, checking if specific functions exist

    return true;
  } catch (error) {
    console.error(
      `Error verifying ${contractType} contract at ${address}:`,
      error.message
    );
    return false;
  }
};

/**
 * Initialize contract relationships to ensure proper authorization
 * This function sets up the MasalaChef contract to recognize the NFT Connector
 */
const initializeContracts = async () => {
  if (isContractInitialized) {
    return true; // Already initialized
  }

  try {
    console.log("Initializing contract relationships...");

    // Verify contract addresses
    const validMasalaChef = await verifyContractAddress(
      "masalaChef",
      CONTRACT_ADDRESS
    );
    const validFirstDishNFT = await verifyContractAddress(
      "firstDishNFT",
      FIRST_DISH_NFT_ADDRESS
    );
    const validNFTConnector = await verifyContractAddress(
      "nftConnector",
      NFT_CONNECTOR_ADDRESS
    );

    if (!validMasalaChef || !validFirstDishNFT || !validNFTConnector) {
      console.error("One or more contract addresses failed verification");
      console.log("Attempting to continue with available contracts");
    }

    // Get contracts with signer
    const masalaChefContract = await getMasalaChefContract(true);
    const firstDishNFTContract = await getFirstDishNFTContract(true);
    const nftConnectorContract = await getNFTConnectorContract(true);

    // Try to set the NFT Connector as authorized in MasalaChef contract
    try {
      console.log(
        "Setting NFT Connector as authorized in MasalaChef contract..."
      );
      const tx = await masalaChefContract.setAuthorizedConnector(
        NFT_CONNECTOR_ADDRESS
      );
      await tx.wait();
      console.log("NFT Connector successfully authorized");
    } catch (error) {
      console.error(
        "Error setting NFT Connector authorization:",
        error.message
      );
      // Try an alternative approach - the contract might have a different function
      try {
        // Some contracts use different naming conventions
        if (typeof masalaChefContract.authorizeConnector === "function") {
          console.log("Trying alternative authorization method...");
          const tx = await masalaChefContract.authorizeConnector(
            NFT_CONNECTOR_ADDRESS
          );
          await tx.wait();
          console.log(
            "NFT Connector successfully authorized using alternative method"
          );
        }
      } catch (fallbackError) {
        console.error(
          "Fallback authorization also failed:",
          fallbackError.message
        );
      }
    }

    // Try to set the server as authorized for saving games
    try {
      const serverAddress = await getSigner().getAddress();
      console.log(`Setting server address (${serverAddress}) as authorized...`);

      // Directly try to set the server as authorized without checking first
      const serverTx = await masalaChefContract.setAuthorizedServer(
        serverAddress
      );
      await serverTx.wait();
      console.log("Server successfully authorized to save games");
    } catch (error) {
      console.error("Error authorizing server:", error.message);

      // Try an alternative approach
      try {
        const serverAddress = await getSigner().getAddress();

        // Some contracts use different function names
        if (typeof masalaChefContract.authorizeServer === "function") {
          console.log("Trying alternative server authorization method...");
          const serverTx = await masalaChefContract.authorizeServer(
            serverAddress
          );
          await serverTx.wait();
          console.log(
            "Server successfully authorized using alternative method"
          );
        }
      } catch (fallbackError) {
        console.error(
          "Fallback server authorization failed:",
          fallbackError.message
        );
        console.log(
          "Continuing without server authorization - some functions may be limited"
        );
      }
    }

    // Ensure FirstDishNFT has MasalaChef set correctly
    try {
      console.log("Setting MasalaChef contract in FirstDishNFT...");
      const tx = await firstDishNFTContract.setMasalaChefContract(
        CONTRACT_ADDRESS
      );
      await tx.wait();
      console.log("MasalaChef contract configured in FirstDishNFT");
    } catch (error) {
      console.error("Error setting MasalaChef in FirstDishNFT:", error.message);
      // Continue execution even if this fails
    }

    // Additionally, make sure NFT connector knows about both contracts
    try {
      console.log("Updating NFT Connector contract addresses...");

      // Set MasalaChef address first and wait for the transaction to complete
      const tx1 = await nftConnectorContract.setMasalaChefAddress(
        CONTRACT_ADDRESS
      );
      await tx1.wait();
      console.log("MasalaChef address updated in NFT Connector");

      // Then set FirstDishNFT address and wait for that transaction
      const tx2 = await nftConnectorContract.setFirstDishNFTAddress(
        FIRST_DISH_NFT_ADDRESS
      );
      await tx2.wait();
      console.log("FirstDishNFT address updated in NFT Connector");

      // Set the server address as authorized in NFT Connector
      try {
        const serverAddress = await getSigner().getAddress();
        console.log(
          `Setting server address (${serverAddress}) as authorized in NFT Connector...`
        );

        if (typeof nftConnectorContract.setAuthorizedServer === "function") {
          const tx3 = await nftConnectorContract.setAuthorizedServer(
            serverAddress
          );
          await tx3.wait();
          console.log("Server successfully authorized in NFT Connector");
        }
      } catch (authError) {
        console.error(
          "Error authorizing server in NFT Connector:",
          authError.message
        );
      }

      console.log("NFT Connector addresses updated successfully");
    } catch (error) {
      console.error("Error updating NFT Connector addresses:", error.message);
    }

    isContractInitialized = true;
    console.log("Contract initialization process completed");
    return true;
  } catch (error) {
    console.error("Error initializing contracts:", error);
    throw error;
  }
};

// Legacy function for compatibility
const getContract = getMasalaChefContract;

module.exports = {
  setupProvider,
  getSigner,
  getMasalaChefContract,
  getFirstDishNFTContract,
  getNFTConnectorContract,
  getContract, // For backward compatibility
  initializeContracts,
  CONTRACT_ADDRESS,
  FIRST_DISH_NFT_ADDRESS,
  NFT_CONNECTOR_ADDRESS,
};
