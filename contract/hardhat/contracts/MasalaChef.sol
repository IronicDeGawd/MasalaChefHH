// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MasalaChef {
    struct GameLog {
        string recipeName;
        uint256 score;
        uint256 timeTaken;
        uint256 timestamp;
        string gameData; // JSON string containing full game data
        string aiResponse; // AI-generated feedback on the cooking performance
        address nftAddress; // Address of NFT awarded for this achievement
    }

    // Mapping from player address to their game logs
    mapping(address => GameLog[]) private playerGameLogs;

    // Tracking NFT achievements
    mapping(address => address) private firstDishNFT; // NFT for completing first dish
    mapping(address => address) private highScoreNFT; // NFT for achieving high scores
    mapping(string => mapping(address => address)) private recipeCompletionNFT; // NFT for completing specific recipes

    // Authorization for server addresses
    address private authorizedServer;
    address private authorizedConnector; // For NFT minting

    // Events
    event GameLogSaved(
        address indexed player,
        uint256 score,
        string recipeName,
        uint256 timestamp
    );

    // Events for NFT assignments
    event NFTAssigned(
        address indexed player,
        string achievement,
        address nftAddress
    );

    // Set the authorized server address that can save games on behalf of players
    function setAuthorizedServer(address _server) external {
        // Only allow the contract deployer or current authorized server to set a new one
        require(
            authorizedServer == address(0) || authorizedServer == msg.sender,
            "Not authorized"
        );
        authorizedServer = _server;
    }

    // Set the authorized connector address that can mint NFTs
    function setAuthorizedConnector(address _connector) external {
        // Allow the contract deployer, current authorized connector, authorized server, or the owner to set a new one
        require(
            authorizedConnector == address(0) ||
                authorizedConnector == msg.sender ||
                authorizedServer == msg.sender ||
                tx.origin == msg.sender,
            "Not authorized"
        );
        authorizedConnector = _connector;
    }

    // Get the current authorized server address
    function getAuthorizedServer() external view returns (address) {
        return authorizedServer;
    }

    // Get the current authorized connector address
    function getAuthorizedConnector() external view returns (address) {
        return authorizedConnector;
    }

    /**
     * @dev Save a new game log for the caller
     * @param _recipeName Name of the recipe played
     * @param _score Final score of the game
     * @param _timeTaken Time taken to complete the recipe in seconds
     * @param _gameData JSON string of the full game data
     * @param _aiResponse AI-generated feedback on the cooking performance
     */
    function saveGameLog(
        string memory _recipeName,
        uint256 _score,
        uint256 _timeTaken,
        string memory _gameData,
        string memory _aiResponse
    ) external {
        GameLog memory newLog = GameLog({
            recipeName: _recipeName,
            score: _score,
            timeTaken: _timeTaken,
            timestamp: block.timestamp,
            gameData: _gameData,
            aiResponse: _aiResponse,
            nftAddress: address(0)
        });

        playerGameLogs[msg.sender].push(newLog);

        emit GameLogSaved(msg.sender, _score, _recipeName, block.timestamp);
    }

    /**
     * @dev Save a new game log for a specific player (only callable by authorized server)
     * @param _player Address of the player
     * @param _recipeName Name of the recipe played
     * @param _score Final score of the game
     * @param _timeTaken Time taken to complete the recipe in seconds
     * @param _gameData JSON string of the full game data
     * @param _aiResponse AI-generated feedback on the cooking performance
     */
    function saveGameLogForPlayer(
        address _player,
        string memory _recipeName,
        uint256 _score,
        uint256 _timeTaken,
        string memory _gameData,
        string memory _aiResponse
    ) external {
        // Only the authorized server can call this function
        require(msg.sender == authorizedServer, "Not authorized server");

        GameLog memory newLog = GameLog({
            recipeName: _recipeName,
            score: _score,
            timeTaken: _timeTaken,
            timestamp: block.timestamp,
            gameData: _gameData,
            aiResponse: _aiResponse,
            nftAddress: address(0)
        });

        playerGameLogs[_player].push(newLog);

        emit GameLogSaved(_player, _score, _recipeName, block.timestamp);
    }

    /**
     * @dev Get the total number of games played by a player
     * @param _player Address of the player
     * @return Number of games played
     */
    function getPlayerGameCount(
        address _player
    ) external view returns (uint256) {
        return playerGameLogs[_player].length;
    }

    /**
     * @dev Get game log summary for a player at a specific index
     * @param _player Address of the player
     * @param _index Index of the game log
     * @return recipeName The name of the recipe that was played
     * @return score The final score achieved in the game
     * @return timeTaken The time taken to complete the recipe in seconds
     * @return timestamp The block timestamp when the game was saved
     */
    function getPlayerGameSummary(
        address _player,
        uint256 _index
    )
        external
        view
        returns (
            string memory recipeName,
            uint256 score,
            uint256 timeTaken,
            uint256 timestamp
        )
    {
        require(
            _index < playerGameLogs[_player].length,
            "Game log does not exist"
        );
        GameLog memory gameLog = playerGameLogs[_player][_index];

        return (
            gameLog.recipeName,
            gameLog.score,
            gameLog.timeTaken,
            gameLog.timestamp
        );
    }

    /**
     * @dev Get all game logs for a player
     * @param _player Address of the player
     * @return Array of GameLog structs
     */
    function getAllPlayerGameLogs(
        address _player
    ) external view returns (GameLog[] memory) {
        return playerGameLogs[_player];
    }

    /**
     * @dev Get full game data for a player at a specific index
     * @param _player Address of the player
     * @param _index Index of the game log
     * @return Full game data JSON string
     */
    function getPlayerGameData(
        address _player,
        uint256 _index
    ) external view returns (string memory) {
        require(
            _index < playerGameLogs[_player].length,
            "Game log does not exist"
        );
        return playerGameLogs[_player][_index].gameData;
    }

    /**
     * @dev Get player's best score
     * @param _player Address of the player
     * @return Best score achieved by the player
     */
    function getPlayerBestScore(
        address _player
    ) external view returns (uint256) {
        uint256 bestScore = 0;
        for (uint256 i = 0; i < playerGameLogs[_player].length; i++) {
            if (playerGameLogs[_player][i].score > bestScore) {
                bestScore = playerGameLogs[_player][i].score;
            }
        }
        return bestScore;
    }

    /**
     * @dev Get AI response for a player's game log
     * @param _player Address of the player
     * @param _index Index of the game log
     * @return AI-generated feedback for the game
     */
    function getAIResponse(
        address _player,
        uint256 _index
    ) external view returns (string memory) {
        require(
            _index < playerGameLogs[_player].length,
            "Game log does not exist"
        );
        return playerGameLogs[_player][_index].aiResponse;
    }

    /**
     * @dev Assign an NFT address to a player's game log
     * @param _player Address of the player
     * @param _logIndex Index of the game log
     * @param _nftAddress Address of the NFT being awarded
     */
    function assignNFTToGameLog(
        address _player,
        uint256 _logIndex,
        address _nftAddress
    ) external {
        require(
            _logIndex < playerGameLogs[_player].length,
            "Game log does not exist"
        );
        playerGameLogs[_player][_logIndex].nftAddress = _nftAddress;
    }

    /**
     * @dev Get the NFT address assigned to a game log
     * @param _player Address of the player
     * @param _logIndex Index of the game log
     * @return The NFT address assigned to the game log
     */
    function getGameLogNFT(
        address _player,
        uint256 _logIndex
    ) external view returns (address) {
        require(
            _logIndex < playerGameLogs[_player].length,
            "Game log does not exist"
        );
        return playerGameLogs[_player][_logIndex].nftAddress;
    }

    /**
     * @dev Assign a first dish completion NFT to a player
     * @param _player Address of the player
     * @param _nftAddress Address of the NFT being awarded
     */
    function assignFirstDishNFT(address _player, address _nftAddress) external {
        firstDishNFT[_player] = _nftAddress;
        emit NFTAssigned(_player, "FirstDish", _nftAddress);
    }

    /**
     * @dev Assign a high score NFT to a player
     * @param _player Address of the player
     * @param _nftAddress Address of the NFT being awarded
     */
    function assignHighScoreNFT(address _player, address _nftAddress) external {
        highScoreNFT[_player] = _nftAddress;
        emit NFTAssigned(_player, "HighScore", _nftAddress);
    }

    /**
     * @dev Assign a recipe completion NFT to a player
     * @param _player Address of the player
     * @param _recipeName Name of the completed recipe
     * @param _nftAddress Address of the NFT being awarded
     */
    function assignRecipeCompletionNFT(
        address _player,
        string memory _recipeName,
        address _nftAddress
    ) external {
        recipeCompletionNFT[_recipeName][_player] = _nftAddress;
        emit NFTAssigned(
            _player,
            string(abi.encodePacked("Recipe:", _recipeName)),
            _nftAddress
        );
    }

    /**
     * @dev Get first dish completion NFT for a player
     * @param _player Address of the player
     * @return The NFT address for first dish completion
     */
    function getFirstDishNFT(address _player) external view returns (address) {
        return firstDishNFT[_player];
    }

    /**
     * @dev Get high score NFT for a player
     * @param _player Address of the player
     * @return The NFT address for high score achievement
     */
    function getHighScoreNFT(address _player) external view returns (address) {
        return highScoreNFT[_player];
    }

    /**
     * @dev Get recipe completion NFT for a player
     * @param _player Address of the player
     * @param _recipeName Name of the completed recipe
     * @return The NFT address for the recipe completion
     */
    function getRecipeCompletionNFT(
        address _player,
        string memory _recipeName
    ) external view returns (address) {
        return recipeCompletionNFT[_recipeName][_player];
    }
}
