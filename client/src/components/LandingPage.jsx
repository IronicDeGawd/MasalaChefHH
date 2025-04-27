"use client";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const LandingPage = ({ isConnected, walletAddress, onConnect, connecting }) => {
  // Function to format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="landing-page cursor-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-masala-700 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-curry-500">Masala</span>
            <span className="text-spice-500">Chef</span>
          </motion.h1>

          <motion.h2
            className="text-xl md:text-2xl text-masala-600 font-normal max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Learn to cook delicious Indian recipes in a fun, interactive way!
          </motion.h2>
        </motion.div>

        {/* Game Preview */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="relative max-w-2xl mx-auto">
            <img
              src="/assets/game-preview.png"
              alt="MasalaChef Game Preview"
              className="rounded-xl shadow-2xl w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl flex items-end justify-center pb-8">
              <Link
                to={isConnected ? "/game" : "#connect-wallet"}
                onClick={!isConnected ? onConnect : undefined}
                className="btn btn-primary text-lg px-8 py-3"
              >
                {isConnected ? "Start Cooking" : "Connect to Play"}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          className="card p-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-masala-700 mb-6 text-center">
            About MasalaChef
          </h3>
          <p className="text-masala-600 mb-8 text-center max-w-3xl mx-auto">
            MasalaChef is a 2.5D cooking simulator inspired by Indian cuisine.
            Learn authentic recipes, master the art of spices, and become a
            master chef in this interactive cooking experience!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature text-center">
              <div className="w-16 h-16 bg-curry-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-curry-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-masala-700 mb-2">
                Interactive Cooking
              </h4>
              <p className="text-masala-600">
                Chop, fry, stir and add spices in a realistic environment
              </p>
            </div>

            <div className="feature text-center">
              <div className="w-16 h-16 bg-spice-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-spice-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-masala-700 mb-2">
                Learn Recipes
              </h4>
              <p className="text-masala-600">
                Master authentic Indian dishes step by step
              </p>
            </div>

            <div className="feature text-center">
              <div className="w-16 h-16 bg-masala-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-masala-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-masala-700 mb-2">
                [WIP] Get Feedback
              </h4>
              <p className="text-masala-600">
                Receive personalized AI feedback on your cooking
              </p>
            </div>
          </div>
        </motion.div>

        {/* Blockchain Features */}
        <motion.div
          className="card p-8 mb-16 border-l-4 border-spice-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h3 className="text-2xl font-bold text-spice-600 mb-6 text-center">
            <span role="img" aria-label="blockchain">
              ⛓️
            </span>{" "}
            Blockchain Integration
          </h3>
          <p className="text-masala-600 mb-8 text-center max-w-3xl mx-auto">
            MasalaChef leverages blockchain technology to enhance your cooking
            experience:
          </p>

          <div className="blockchain-features">
            <div className="feature text-center">
              <div className="w-16 h-16 bg-spice-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span role="img" aria-label="trophy" className="text-2xl">
                  🏆
                </span>
              </div>
              <h4 className="text-lg font-semibold text-spice-600 mb-2">
                NFT Rewards
              </h4>
              <p className="text-masala-600">
                Earn NFTs for completing recipes and achieving milestones
              </p>
            </div>

            <div className="feature text-center">
              <div className="w-16 h-16 bg-spice-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span role="img" aria-label="storage" className="text-2xl">
                  📊
                </span>
              </div>
              <h4 className="text-lg font-semibold text-spice-600 mb-2">
                Progress Tracking
              </h4>
              <p className="text-masala-600">
                Store your cooking history securely on the blockchain
              </p>
            </div>

            <div className="feature text-center">
              <div className="w-16 h-16 bg-spice-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span role="img" aria-label="chef" className="text-2xl">
                  👨‍🍳
                </span>
              </div>
              <h4 className="text-lg font-semibold text-spice-600 mb-2">
                Chef Reputation
              </h4>
              <p className="text-masala-600">
                Build your culinary reputation through verified achievements
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-masala-500 italic">
              Powered by Monad Testnet
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          id="connect-wallet"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {isConnected ? (
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Wallet connected: {formatWalletAddress(walletAddress)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/game" className="btn btn-primary text-lg px-8 py-3">
                  Start Cooking
                </Link>

                <Link
                  to="/dashboard"
                  className="btn btn-tertiary text-lg px-8 py-3"
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
                className={`btn text-lg px-8 py-3 ${
                  connecting ? "bg-gray-300 cursor-not-allowed" : "btn-primary"
                }`}
              >
                {connecting ? (
                  <div className="flex items-center justify-center">
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
                    Connecting...
                  </div>
                ) : (
                  "Connect Wallet to Play"
                )}
              </button>

              <p className="text-masala-600 mt-4 max-w-md mx-auto">
                Connect your wallet to track your progress and earn NFTs as you
                master Indian cooking!
              </p>

              <p className="text-sm text-masala-500 mt-6">
                Note: A wallet connection is required to play MasalaChef as it's
                a blockchain-based game
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
