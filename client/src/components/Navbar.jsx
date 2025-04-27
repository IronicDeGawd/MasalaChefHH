"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ isConnected, walletAddress, onConnect, connecting }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-masala-700">
                <span className="text-curry-500">Masala</span>
                <span className="text-spice-500">Chef</span>
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/")
                  ? "bg-spice-50 text-curry-600"
                  : "text-masala-600 hover:bg-spice-50 hover:text-curry-500"
              }`}
            >
              Home
            </Link>

            {isConnected && (
              <>
                <Link
                  to="/game"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/game")
                      ? "bg-spice-50 text-curry-600"
                      : "text-masala-600 hover:bg-spice-50 hover:text-curry-500"
                  }`}
                >
                  Play Game
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/dashboard")
                      ? "bg-spice-50 text-curry-600"
                      : "text-masala-600 hover:bg-spice-50 hover:text-curry-500"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex md:items-center">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-spice-50 px-3 py-2 rounded-md">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-masala-700">
                    {formatWalletAddress(walletAddress)}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={onConnect}
                disabled={connecting}
                className={`btn ${
                  connecting ? "bg-gray-300 cursor-not-allowed" : "btn-primary"
                }`}
              >
                {connecting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  "Connect Wallet"
                )}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-masala-500 hover:text-masala-700 hover:bg-spice-50 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/")
                  ? "bg-spice-50 text-curry-600"
                  : "text-masala-600 hover:bg-spice-50 hover:text-curry-500"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {isConnected && (
              <>
                <Link
                  to="/game"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/game")
                      ? "bg-spice-50 text-curry-600"
                      : "text-masala-600 hover:bg-spice-50 hover:text-curry-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Play Game
                </Link>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/dashboard")
                      ? "bg-spice-50 text-curry-600"
                      : "text-masala-600 hover:bg-spice-50 hover:text-curry-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              {isConnected ? (
                <div className="flex items-center px-3 py-2">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-spice-100 flex items-center justify-center">
                      <span className="text-curry-500 text-sm font-medium">
                        {walletAddress?.substring(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-masala-700">
                      Wallet Connected
                    </div>
                    <div className="text-sm font-medium text-masala-500">
                      {formatWalletAddress(walletAddress)}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onConnect();
                    setIsMenuOpen(false);
                  }}
                  disabled={connecting}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    connecting
                      ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                      : "bg-curry-500 text-white hover:bg-curry-600"
                  }`}
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
