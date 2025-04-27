"use client";

import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GameComponent from "./components/GameComponent";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import { WalletProvider, useWallet } from "./utils/blockchain/WalletConnector";
import Navbar from "./components/Navbar";

function AppContent() {
  const { account, connectWallet } = useWallet();
  const [connecting, setConnecting] = useState(false);

  // Function to handle wallet connection
  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="App min-h-screen bg-spice-50">
      <Navbar
        isConnected={Boolean(account)}
        walletAddress={account}
        onConnect={handleConnect}
        connecting={connecting}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              isConnected={Boolean(account)}
              walletAddress={account}
              onConnect={handleConnect}
              connecting={connecting}
            />
          }
        />
        <Route
          path="/game"
          element={
            account ? (
              <GameComponent />
            ) : (
              <Navigate to="/" replace state={{ requiresWallet: true }} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            account ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace state={{ requiresWallet: true }} />
            )
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </Router>
  );
}

export default App;
