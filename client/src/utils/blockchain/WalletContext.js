import { createContext, useContext } from "react";

// Create the wallet context
const WalletContext = createContext();

// Create hook for using wallet context
export const useWallet = () => useContext(WalletContext);

export default WalletContext;
