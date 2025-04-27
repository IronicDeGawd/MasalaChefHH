![github-submission-banner](https://github.com/user-attachments/assets/a1493b84-e4e2-456e-a791-ce35ee2bcf2f)

# 🚀 MasalaChef

> Cook, Learn, Earn: A Web3 Indian Cooking Simulator That Turns Digital Skills Into Culinary NFTs

---

## 📌 Problem Statement

**Problem Statement X – [Add the official problem statement title here]**

---

## 🎯 Objective

MasalaChef solves multiple problems at the intersection of education, gaming, and blockchain:

- **Culinary Education**: Gamifies the Indian cooking learning process, making traditional recipes accessible and fun to master
- **Blockchain Onboarding**: Creates a natural on-ramp for users to engage with Web3 technologies through familiar gaming mechanics
- **Digital Ownership**: Rewards cooking mastery with NFTs that represent culinary achievements
- **Cultural Appreciation**: Promotes understanding of Indian cuisine and cooking techniques
- **On-chain Activity**: Demonstrates practical blockchain utility through gameplay logs and achievement tracking

---

## 🧠 Team & Approach

### Team Name:
The A+

### Team Members:
- Aditya Srivastava
- Vasundhara Pandey
- Smrita Shukla

### Our Approach:
- We chose this problem to bridge the gap between culinary education and blockchain technology
- Key challenges included balancing on-chain activities with gameplay performance, creating realistic cooking interactions in Phaser.js, optimizing smart contracts, and designing authentic Indian cooking assets
- We pivoted from a purely educational app to a gamified experience with blockchain rewards to increase user engagement

---

## 🛠️ Tech Stack

### Core Technologies Used:
- Frontend: React.js, Phaser.js (2D game framework) + Ethers
- Backend: Node.js + Express
- Blockchain: Solidity smart contracts for Monad Testnet
- Hosting: AWS Amplify + Render

### Sponsor Technologies Used:
- [x] **Monad:** Game data logs, NFT minting, and achievements tracked on Monad testnet

---

## ✨ Key Features

- ✅ Interactive 2.5D cooking simulation with authentic Indian kitchen environment
- ✅ Step-by-step virtual cooking with actions like chopping, stirring, frying, and adding spices
- ✅ AI evaluation system that rates dishes and provides personalized improvement suggestions
- ✅ NFT rewards for culinary achievements stored on the blockchain
- ✅ Different cooking environments with unique judges and challenges

![Game Preview](/client/public/assets/game-preview.png)

---

## 📽️ Demo & Deliverables

- **Demo Video Link:** [MasalaChefYT](https://youtu.be/1tMLdZsQfhA)
- **Deployed Link:** [Live Link](https://production.dt4m177dpz07s.amplifyapp.com/)

---

## ✅ Tasks & Bonus Checklist

- [✅] **All members of the team completed the mandatory task - Followed at least 2 of our social channels and filled the form**
- [ ] **All members of the team completed Bonus Task 1 - Sharing of Badges and filled the form (2 points)**
- [✅] **All members of the team completed Bonus Task 2 - Signing up for Sprint.dev and filled the form (3 points)**

---

## 🧪 How to Run the Project

### Requirements:
- Node.js (v18 or higher)
- Web3 wallet (MetaMask recommended)
- Monad testnet access

### Local Setup:
```bash
# Clone the repo
git clone https://github.com/IronicDeGawd/MasalaChefHH
cd MasalaChefHH

# Install frontend dependencies
cd client
npm install
Create and add contract abi and addresses in .env
# Start the frontend development server
npm start

# In a new terminal, setup the backend
cd ../server
npm install
Create and add contract abi and addresses in .env

# Start the backend server
npm start
```

Visit `http://localhost:3000` in your browser to play the game.

### Smart Contract Deployment:
```bash
# Setup the contract
cd ../contract/hardhat
npm install

# Deploy to Monad testnet
npx hardhat run scripts/deploy.js --network monad
```

---

## 🧬 Future Scope

- 📈 Additional recipes and cooking techniques
- 🎮 Multiplayer cooking competitions
- 🛒 Marketplace for trading recipe NFTs and kitchen upgrades
- 🌐 Mobile app version for on-the-go cooking practice
- 🧑‍🍳 Chef collaborations for celebrity recipes and techniques

---

## 📎 Resources / Credits

- Game assets created by our design team
- Phaser.js game framework for interactive gameplay
- Monad testnet for blockchain integration
- Recipe inspiration from traditional Indian cooking techniques

---

## 🏁 Final Words

MasalaChef represents our vision of how blockchain technology can enhance educational gaming experiences. By combining the joy of cooking with the permanence of blockchain achievements, we've created a unique platform that teaches real skills while introducing users to Web3 in an engaging, accessible way.

---
