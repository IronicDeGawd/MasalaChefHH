const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("Starting deployment...");

  // Get the contract factories
  const MasalaChef = await ethers.getContractFactory(
    "contracts/MasalaChef.sol:MasalaChef"
  );
  const FirstDishNFT = await ethers.getContractFactory("FirstDishNFT");
  const MasalaChefNFTConnector = await ethers.getContractFactory(
    "MasalaChefNFTConnector"
  );

  // Use IPFS gateway for production or fallback to environment variable or local development URL
  const ipfsCID = "";
  const baseTokenURI =
    process.env.BASE_TOKEN_URI || `https://ipfs.io/ipfs/${ipfsCID}/`;

  //   console.log(`Using base token URI: ${baseTokenURI}`);

  // Deploy FirstDishNFT with required constructor arguments
  console.log("Deploying FirstDishNFT...");
  const firstDishNFT = await FirstDishNFT.deploy(
    "Masala Chef First Dish", // name
    "MCFD", // symbol
    baseTokenURI // baseTokenURI
  );
  await firstDishNFT.deployed();
  console.log("FirstDishNFT deployed to:", firstDishNFT.address);

  // Deploy MasalaChef
  console.log("Deploying MasalaChef...");
  const masalaChef = await MasalaChef.deploy();
  await masalaChef.deployed();
  console.log("MasalaChef deployed to:", masalaChef.address);

  // Deploy NFT Connector (linking it with the other contracts)
  console.log("Deploying MasalaChefNFTConnector...");
  const nftConnector = await MasalaChefNFTConnector.deploy(
    masalaChef.address,
    firstDishNFT.address,
    baseTokenURI
  );
  await nftConnector.deployed();
  console.log("MasalaChefNFTConnector deployed to:", nftConnector.address);

  // Set up any connections between contracts if needed
  // For example, if MasalaChef needs to know about the NFT connector:
  console.log("Setting up contract connections...");
  const setConnectorTx = await masalaChef.setAuthorizedConnector(
    nftConnector.address
  );
  await setConnectorTx.wait();
  console.log("Set NFT connector in MasalaChef");

  // Save deployment addresses to a file for easy reference
  const deploymentAddresses = {
    masalaChef: masalaChef.address,
    firstDishNFT: firstDishNFT.address,
    nftConnector: nftConnector.address,
    network: network.name,
    deploymentTime: new Date().toISOString(),
  };

  // Create deployment directory if it doesn't exist
  const deployDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
  }

  // Save deployment info to a file
  const deploymentFilePath = path.join(
    deployDir,
    `${network.name}-deployment.json`
  );
  fs.writeFileSync(
    deploymentFilePath,
    JSON.stringify(deploymentAddresses, null, 2)
  );
  console.log(`Deployment addresses saved to ${deploymentFilePath}`);

  // Export ABIs
  console.log("Exporting contract ABIs...");
  const abiDir = "../../server/blockchain";

  // Ensure the directory exists
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Export MasalaChef ABI
  const masalaChefArtifact = require("../artifacts/contracts/MasalaChef.sol/MasalaChef.json");
  fs.writeFileSync(
    path.join(abiDir, "MasalaChefABI.json"),
    JSON.stringify(masalaChefArtifact.abi, null, 2)
  );

  // Export FirstDishNFT ABI
  const firstDishNFTArtifact = require("../artifacts/contracts/FirstDishNFT.sol/FirstDishNFT.json");
  fs.writeFileSync(
    path.join(abiDir, "FirstDishNFTABI.json"),
    JSON.stringify(firstDishNFTArtifact.abi, null, 2)
  );

  // Export NFTConnector ABI
  const nftConnectorArtifact = require("../artifacts/contracts/MasalaChefNFTConnector.sol/MasalaChefNFTConnector.json");
  fs.writeFileSync(
    path.join(abiDir, "MasalaChefNFTConnectorABI.json"),
    JSON.stringify(nftConnectorArtifact.abi, null, 2)
  );

  console.log("ABIs exported to server/blockchain directory");

  // Create a .env file with deployment addresses
  const envConfig = `
# Contract addresses deployed on ${network.name}
CONTRACT_ADDRESS=${masalaChef.address}
FIRST_DISH_NFT_ADDRESS=${firstDishNFT.address}
NFT_CONNECTOR_ADDRESS=${nftConnector.address}
BASE_TOKEN_URI=${baseTokenURI}
`;

  fs.writeFileSync(path.join(__dirname, "../.env.deployments"), envConfig);
  console.log("Environment variables saved to .env.deployments");

  return deploymentAddresses;
}

main()
  .then((addresses) => {
    console.log("Deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
