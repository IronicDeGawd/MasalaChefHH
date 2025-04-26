import React from "react";
import { Link } from "react-router-dom";

const LandingPage = ({ isConnected, walletAddress, onConnect, connecting }) => {
  // Function to format wallet address for display (first 6 and last 4 characters)
  const formatWalletAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div
      className="landing-page"
      style={{
        textAlign: "center",
        padding: "50px 20px",
        backgroundColor: "#FDF5E6",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        className="header"
        style={{
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            color: "#8B4513",
            marginBottom: "15px",
          }}
        >
          MasalaChef
        </h1>
        <h2
          style={{
            fontSize: "1.5rem",
            color: "#5E3A1F",
            fontWeight: "normal",
          }}
        >
          Learn to cook delicious Indian recipes in a fun, interactive way!
        </h2>
      </div>

      <div
        className="game-details"
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          marginBottom: "40px",
        }}
      >
        <h3 style={{ color: "#8B4513", marginBottom: "20px" }}>
          About MasalaChef
        </h3>
        <p style={{ marginBottom: "15px", lineHeight: "1.6" }}>
          MasalaChef is a 2.5D cooking simulator inspired by Indian cuisine.
          Learn authentic recipes, master the art of spices, and become a master
          chef!
        </p>

        <div
          className="features"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            margin: "30px 0",
          }}
        >
          <div className="feature">
            <h4 style={{ color: "#8B4513" }}>Interactive Cooking</h4>
            <p>Chop, fry, stir and add spices in a realistic environment</p>
          </div>
          <div className="feature">
            <h4 style={{ color: "#8B4513" }}>Learn Recipes</h4>
            <p>Master authentic Indian dishes step by step</p>
          </div>
          <div className="feature">
            <h4 style={{ color: "#8B4513" }}>Get Feedback</h4>
            <p>Receive personalized AI feedback on your cooking</p>
          </div>
        </div>

        {/* Blockchain features section */}
        <div
          style={{
            backgroundColor: "#fff8e1",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "30px",
            marginBottom: "30px",
            border: "1px solid #ffe0b2",
          }}
        >
          <h3 style={{ color: "#ff9800", marginBottom: "15px" }}>
            <span role="img" aria-label="blockchain">
              ⛓️
            </span>{" "}
            Blockchain Integration
          </h3>
          <p style={{ marginBottom: "15px", lineHeight: "1.6" }}>
            MasalaChef leverages blockchain technology to enhance your cooking
            experience:
          </p>
          <div
            className="blockchain-features"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              margin: "20px 0",
            }}
          >
            <div className="feature">
              <h4 style={{ color: "#ff9800" }}>
                <span role="img" aria-label="trophy">
                  🏆
                </span>{" "}
                NFT Rewards
              </h4>
              <p>Earn NFTs for completing recipes and achieving milestones</p>
            </div>
            <div className="feature">
              <h4 style={{ color: "#ff9800" }}>
                <span role="img" aria-label="storage">
                  📊
                </span>{" "}
                Progress Tracking
              </h4>
              <p>Store your cooking history securely on the blockchain</p>
            </div>
            <div className="feature">
              <h4 style={{ color: "#ff9800" }}>
                <span role="img" aria-label="chef">
                  👨‍🍳
                </span>{" "}
                Chef Reputation
              </h4>
              <p>
                Build your culinary reputation through verified achievements
              </p>
            </div>
          </div>
        </div>

        <p style={{ fontStyle: "italic", color: "#666" }}>
          Built for the Monad Testnet Hackathon
        </p>
      </div>

      <div className="cta-section">
        {isConnected ? (
          <div>
            <p
              style={{
                color: "#4caf50",
                marginBottom: "15px",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                padding: "10px",
                borderRadius: "5px",
                display: "inline-block",
              }}
            >
              <span role="img" aria-label="check">
                ✅
              </span>{" "}
              Wallet connected successfully!{" "}
              {walletAddress && (
                <span
                  style={{
                    fontWeight: "bold",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  Address: {formatWalletAddress(walletAddress)}
                </span>
              )}
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "20px" }}
            >
              <Link
                to="/game"
                style={{
                  display: "inline-block",
                  backgroundColor: "#8B4513",
                  color: "white",
                  padding: "15px 30px",
                  fontSize: "1.2rem",
                  textDecoration: "none",
                  borderRadius: "8px",
                  transition: "background-color 0.3s",
                }}
              >
                Start Cooking
              </Link>

              <Link
                to="/dashboard"
                style={{
                  display: "inline-block",
                  backgroundColor: "#2196f3",
                  color: "white",
                  padding: "15px 30px",
                  fontSize: "1.2rem",
                  textDecoration: "none",
                  borderRadius: "8px",
                  transition: "background-color 0.3s",
                }}
              >
                View Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={onConnect}
              disabled={connecting}
              style={{
                backgroundColor: connecting ? "#cccccc" : "#ff9800",
                color: "white",
                border: "none",
                padding: "15px 30px",
                fontSize: "1.2rem",
                borderRadius: "8px",
                cursor: connecting ? "default" : "pointer",
                transition: "background-color 0.3s",
                marginBottom: "20px",
              }}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
            <p style={{ color: "#666", marginBottom: "10px" }}>
              Connect your wallet to track your progress and earn NFTs
            </p>
            <p style={{ fontSize: "0.9rem", color: "#888", marginTop: "20px" }}>
              Note: A wallet connection is required to play MasalaChef as it's a
              blockchain-based game
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
