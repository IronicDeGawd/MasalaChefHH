import React, { useState, useEffect } from "react";

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
    <div className={`nft-award-overlay ${isAnimating ? "animating" : ""}`}>
      <div className="nft-award-content">
        <div className="close-button" onClick={onClose}>
          ×
        </div>

        <h2>🎉 NFT Awarded! 🎉</h2>
        <div className="nft-image-container">
          <img src={details.image} alt={details.title} className="nft-image" />
        </div>

        <h3>{details.title}</h3>
        <p>{details.description}</p>

        {nftAddress && (
          <div className="nft-address">
            <span>NFT Address:</span>
            <a
              href={`https://etherscan.io/token/${nftAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${nftAddress.substring(0, 6)}...${nftAddress.substring(
                nftAddress.length - 4
              )}`}
            </a>
          </div>
        )}

        <button
          className="view-dashboard-button"
          onClick={() => (window.location.href = "/dashboard")}
        >
          View in Dashboard
        </button>
      </div>

      <style jsx>{`
        .nft-award-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .nft-award-content {
          background-color: #fff;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          max-width: 500px;
          position: relative;
          box-shadow: 0 0 30px rgba(255, 193, 7, 0.6);
          animation: ${isAnimating ? "glow 2s infinite alternate" : "none"};
        }

        @keyframes glow {
          from {
            box-shadow: 0 0 30px rgba(255, 193, 7, 0.6);
          }
          to {
            box-shadow: 0 0 50px rgba(255, 193, 7, 0.9);
          }
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 1.5rem;
          cursor: pointer;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          border-radius: 50%;
          background-color: #f44336;
          color: white;
        }

        h2 {
          margin-top: 0;
          color: #e65100;
          font-size: 2rem;
        }

        h3 {
          color: #333;
          margin: 1rem 0 0.5rem;
        }

        p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .nft-image-container {
          width: 200px;
          height: 200px;
          margin: 1.5rem auto;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: 8px;
          background-color: #f8f8f8;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .nft-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          animation: ${isAnimating ? "zoomIn 1s" : "none"};
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .nft-address {
          margin: 1.5rem 0;
          padding: 0.5rem;
          background-color: #f5f5f5;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          font-family: monospace;
        }

        .nft-address a {
          color: #2196f3;
          text-decoration: none;
        }

        .nft-address a:hover {
          text-decoration: underline;
        }

        .view-dashboard-button {
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .view-dashboard-button:hover {
          background-color: #43a047;
        }

        .animating {
          animation: fadeIn 0.5s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NFTAward;
