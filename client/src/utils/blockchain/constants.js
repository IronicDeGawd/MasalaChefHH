// Blockchain Configuration
export const MONAD_TESTNET = {
  chainId: "0x279f", // Decimal 10143 converted to hex
  chainName: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MONAD",
    decimals: 18,
  },
  rpcUrls: ["https://testnet-rpc.monad.xyz/"],
  blockExplorerUrls: ["https://testnet.monadexplorer.com/"],
};

// Contract Addresses on Monad Testnet
export const CONTRACT_ADDRESSES = {
  masalaChef:
    import.meta.env.VITE_MASALA_CHEF ||
    "0x0000000000000000000000000000000000000000",
  nftConnector:
    import.meta.env.VITE_NFT_CONNECTOR_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  firstDishNFT:
    import.meta.env.VITE_FIRST_DISH_NFT_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
};
