"use client";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

const NFTAward = ({ type, nftAddress, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Auto-close after animation completes
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Define NFT details based on type
  const nftDetails = {
    firstDish: {
      title: "First Dish Achievement",
      description: "Congratulations on completing your first dish!",
      image: "/assets/nft-artwork/first-dish.png",
    },
    highScore: {
      title: "High Score Achievement",
      description: "Congratulations! You've achieved an exceptional score!",
      image: "/assets/nft-artwork/high-score.png",
    },
    recipe: {
      title: "Recipe Master",
      description: "You've mastered this recipe and earned a special NFT!",
      image: "/assets/nft-artwork/recipe-master.png",
    },
  };

  const details = nftDetails[type] || nftDetails.firstDish;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-8 text-center max-w-md relative shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            boxShadow: isAnimating
              ? [
                  "0 0 30px rgba(255, 193, 7, 0.6)",
                  "0 0 50px rgba(255, 193, 7, 0.9)",
                ]
              : "0 0 30px rgba(255, 193, 7, 0.6)",
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            duration: 0.5,
            boxShadow: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            },
          }}
        >
          <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
            onClick={onClose}
          >
            ×
          </button>

          <motion.h2
            className="text-2xl font-bold text-curry-500 mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            🎉 NFT Awarded! 🎉
          </motion.h2>

          <motion.div
            className="w-48 h-48 mx-auto mb-6 rounded-lg overflow-hidden bg-spice-50 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <motion.img
              src={details.image}
              alt={details.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.svg?height=200&width=200";
              }}
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.6 }}
            />
          </motion.div>

          <motion.h3
            className="text-xl font-semibold text-masala-700 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {details.title}
          </motion.h3>

          <motion.p
            className="text-masala-600 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {details.description}
          </motion.p>

          {nftAddress && (
            <motion.div
              className="bg-gray-100 rounded-lg p-3 mb-6 font-mono text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="text-masala-500 mb-1">NFT Address:</div>
              <a
                href={`https://etherscan.io/token/${nftAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {`${nftAddress.substring(0, 6)}...${nftAddress.substring(
                  nftAddress.length - 4
                )}`}
              </a>
            </motion.div>
          )}

          <motion.button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/dashboard")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            View in Dashboard
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NFTAward;
