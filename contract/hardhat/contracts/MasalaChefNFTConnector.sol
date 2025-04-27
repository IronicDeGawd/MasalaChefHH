// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Use interfaces instead of direct imports to avoid naming conflicts
interface IMasalaChef {
    function getPlayerGameCount(
        address _player
    ) external view returns (uint256);

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
        );

    function assignFirstDishNFT(address _player, address _nftAddress) external;

    function assignNFTToGameLog(
        address _player,
        uint256 _logIndex,
        address _nftAddress
    ) external;
}

interface IFirstDishNFT {
    function playerHasFirstDishNFT(address player) external view returns (bool);

    function awardFirstDishNFT(
        address player,
        string memory tokenURI_
    ) external returns (uint256);
}

/**
 * @title MasalaChefNFTConnector
 * @dev Contract that connects the MasalaChef game logs with the FirstDishNFT contract
 * to automatically award NFTs when players complete their first dish
 */
contract MasalaChefNFTConnector {
    // References to the connected contracts
    IMasalaChef public masalaChef;
    IFirstDishNFT public firstDishNFT;

    // Address of the contract owner/admin
    address public owner;

    // Address of the authorized game server
    address public authorizedServer;

    // Base URI for the NFT metadata
    string private baseTokenURI;

    // Tracking minted NFTs to prevent double minting
    mapping(address => bool) public hasFirstDishMinted;

    // Event emitted when a FirstDishNFT is awarded
    event FirstDishAchieved(
        address player,
        uint256 tokenId,
        uint256 gameLogIndex
    );

    /**
     * @dev Modifier to restrict functions to the contract owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /**
     * @dev Modifier to restrict functions to authorized callers
     */
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == authorizedServer,
            "Caller is not authorized"
        );
        _;
    }

    /**
     * @dev Constructor
     * @param _masalaChefAddress Address of the MasalaChef contract
     * @param _firstDishNFTAddress Address of the FirstDishNFT contract
     * @param _baseTokenURI Base URI for the NFT metadata
     */
    constructor(
        address _masalaChefAddress,
        address _firstDishNFTAddress,
        string memory _baseTokenURI
    ) {
        masalaChef = IMasalaChef(_masalaChefAddress);
        firstDishNFT = IFirstDishNFT(_firstDishNFTAddress);
        baseTokenURI = _baseTokenURI;
        owner = msg.sender;
    }

    /**
     * @dev Change the owner of the contract
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(
            _newOwner != address(0),
            "New owner cannot be the zero address"
        );
        owner = _newOwner;
    }

    /**
     * @dev Set the authorized server address
     * @param _serverAddress Address of the authorized server
     */
    function setAuthorizedServer(address _serverAddress) external onlyOwner {
        require(
            _serverAddress != address(0),
            "Server address cannot be the zero address"
        );
        authorizedServer = _serverAddress;
    }

    /**
     * @dev Check if a player has completed their first dish and award NFT if eligible
     * @param player Address of the player to check
     * @return success Boolean indicating success of the operation
     */
    function checkAndAwardFirstDish(address player) external returns (bool) {
        // Security check: Only the player themselves, owner, or authorized server can mint NFTs
        require(
            msg.sender == player ||
                msg.sender == owner ||
                msg.sender == authorizedServer,
            "Not authorized to mint NFTs"
        );

        // Check if player already has a FirstDishNFT via contract check
        if (firstDishNFT.playerHasFirstDishNFT(player)) {
            return false;
        }

        // Double check with our own tracking to prevent double minting
        if (hasFirstDishMinted[player]) {
            return false;
        }

        // Check if player has completed at least one dish
        uint256 gameCount = masalaChef.getPlayerGameCount(player);
        if (gameCount == 0) {
            return false;
        }

        // Get details of the first game log
        (string memory recipeName, uint256 score, , ) = masalaChef
            .getPlayerGameSummary(player, 0);

        // Only award if there's a valid recipe name and score > 0
        if (bytes(recipeName).length > 0 && score > 0) {
            // Generate token URI based on recipe name and score
            string memory tokenURI = string(
                abi.encodePacked(
                    baseTokenURI,
                    "?recipe=",
                    recipeName,
                    "&score=",
                    _toString(score)
                )
            );

            // Award the NFT
            uint256 tokenId = firstDishNFT.awardFirstDishNFT(player, tokenURI);

            // Update the MasalaChef contract with the NFT address
            masalaChef.assignFirstDishNFT(player, address(firstDishNFT));
            masalaChef.assignNFTToGameLog(player, 0, address(firstDishNFT));

            // Mark as minted in our tracking
            hasFirstDishMinted[player] = true;

            emit FirstDishAchieved(player, tokenId, 0);
            return true;
        }

        return false;
    }

    /**
     * @dev Set the base token URI
     * @param _baseTokenURI New base URI for token metadata
     */
    function setBaseTokenURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    /**
     * @dev Update the MasalaChef contract address
     * @param _masalaChefAddress New address for the MasalaChef contract
     */
    function setMasalaChefAddress(
        address _masalaChefAddress
    ) external onlyOwner {
        masalaChef = IMasalaChef(_masalaChefAddress);
    }

    /**
     * @dev Update the FirstDishNFT contract address
     * @param _firstDishNFTAddress New address for the FirstDishNFT contract
     */
    function setFirstDishNFTAddress(
        address _firstDishNFTAddress
    ) external onlyOwner {
        firstDishNFT = IFirstDishNFT(_firstDishNFTAddress);
    }

    /**
     * @dev Helper function to convert a uint256 to a string
     * @param value The uint256 value to convert
     * @return string representation of the value
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        // Return "0" if value is 0
        if (value == 0) {
            return "0";
        }

        // Find the number of digits in the value
        uint256 temp = value;
        uint256 digits;
        while (temp > 0) {
            digits++;
            temp /= 10;
        }

        // Create a byte array for the string representation
        bytes memory buffer = new bytes(digits);

        // Fill the buffer from right to left
        while (value > 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
