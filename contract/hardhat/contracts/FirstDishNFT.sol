// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MasalaChef Interface
 * @dev Minimal interface to access the authorizedConnector function
 */
interface MasalaChef {
    function getAuthorizedConnector() external view returns (address);
}

/**
 * @title FirstDishNFT
 * @dev Contract for awarding NFTs to users who complete their first dish in the Masala Chef game
 * This is a simplified version that doesn't rely on OpenZeppelin libraries
 */
contract FirstDishNFT {
    // Contract owner address
    address public owner;

    // Counter for token IDs
    uint256 private _nextTokenId;

    // Token name and symbol
    string private _name;
    string private _symbol;

    // Base URI for the NFT metadata
    string private _baseTokenURI;

    // Address of the MasalaChef contract that can award NFTs
    address private masalaChefContract;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from token ID to token URI
    mapping(uint256 => string) private _tokenURIs;

    // Mapping to track whether a player has already received a first dish NFT
    mapping(address => bool) public hasFirstDishNFT;

    // Events
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
    event FirstDishNFTAwarded(address player, uint256 tokenId);

    /**
     * @dev Modifier to restrict functions to the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "FirstDishNFT: caller is not the owner");
        _;
    }

    /**
     * @dev Constructor
     * @param name_ Name of the NFT token
     * @param symbol_ Symbol of the NFT token
     * @param baseTokenURI_ Base URI for token metadata
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_
    ) {
        _name = name_;
        _symbol = symbol_;
        _baseTokenURI = baseTokenURI_;
        owner = msg.sender;
        _nextTokenId = 1; // Start token IDs at 1
    }

    /**
     * @dev Returns the name of the token
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of tokens owned by `owner`
     */
    function balanceOf(address tokenOwner) public view returns (uint256) {
        require(
            tokenOwner != address(0),
            "FirstDishNFT: balance query for the zero address"
        );
        return _balances[tokenOwner];
    }

    /**
     * @dev Returns the owner of the `tokenId` token
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(
            tokenOwner != address(0),
            "FirstDishNFT: owner query for nonexistent token"
        );
        return tokenOwner;
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     */
    function approve(address to, uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);
        require(to != tokenOwner, "FirstDishNFT: approval to current owner");
        require(
            msg.sender == tokenOwner || msg.sender == owner,
            "FirstDishNFT: approve caller is not owner nor approved for all"
        );

        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    /**
     * @dev Returns the approved address for `tokenId`
     */
    function getApproved(uint256 tokenId) public view returns (address) {
        require(
            _exists(tokenId),
            "FirstDishNFT: approved query for nonexistent token"
        );
        return _tokenApprovals[tokenId];
    }

    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    /**
     * @dev Internal function to mint a new token
     */
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "FirstDishNFT: mint to the zero address");
        require(!_exists(tokenId), "FirstDishNFT: token already minted");

        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    /**
     * @dev Sets the token URI for a given token
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_exists(tokenId), "FirstDishNFT: URI set of nonexistent token");
        _tokenURIs[tokenId] = uri;
    }

    /**
     * @dev Returns the token URI
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(
            _exists(tokenId),
            "FirstDishNFT: URI query for nonexistent token"
        );

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        if (bytes(_tokenURI).length == 0) {
            return string(abi.encodePacked(base, _toString(tokenId)));
        }
        // If both are set, concatenate the baseURI and tokenURI
        return string(abi.encodePacked(base, _tokenURI));
    }

    /**
     * @dev Base URI for computing {tokenURI}
     */
    function _baseURI() internal view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Set the MasalaChef contract address
     * @param _masalaChefAddress Address of the MasalaChef contract
     */
    function setMasalaChefContract(
        address _masalaChefAddress
    ) external onlyOwner {
        masalaChefContract = _masalaChefAddress;
    }

    /**
     * @dev Mint a new First Dish NFT for a player
     * @param player Address of the player to award the NFT to
     * @param tokenURI_ URI for the token metadata
     * @return tokenId The ID of the newly minted NFT
     */
    function awardFirstDishNFT(
        address player,
        string memory tokenURI_
    ) external returns (uint256) {
        // Get authorized connector if MasalaChef contract is set
        address authorizedConnector = address(0);
        if (masalaChefContract != address(0)) {
            try
                MasalaChef(masalaChefContract).getAuthorizedConnector()
            returns (address connector) {
                authorizedConnector = connector;
            } catch {
                // If the call fails, authorizedConnector remains address(0)
            }
        }

        // Only the MasalaChef contract, authorized connector, or the owner can mint NFTs
        require(
            msg.sender == masalaChefContract ||
                (authorizedConnector != address(0) &&
                    msg.sender == authorizedConnector) ||
                msg.sender == owner,
            "FirstDishNFT: Only MasalaChef contract or owner can mint NFTs"
        );

        // Check if player already has a First Dish NFT
        require(
            !hasFirstDishNFT[player],
            "FirstDishNFT: Player already has a First Dish NFT"
        );

        // Get the next token ID
        uint256 newTokenId = _nextTokenId++;

        // Mint the new NFT
        _mint(player, newTokenId);

        // Set the token URI if provided
        if (bytes(tokenURI_).length > 0) {
            _setTokenURI(newTokenId, tokenURI_);
        }

        // Mark player as having received the NFT
        hasFirstDishNFT[player] = true;

        // Emit event
        emit FirstDishNFTAwarded(player, newTokenId);

        return newTokenId;
    }

    /**
     * @dev Check if a player already has a First Dish NFT
     * @param player Address of the player to check
     * @return Boolean indicating whether the player has a First Dish NFT
     */
    function playerHasFirstDishNFT(
        address player
    ) external view returns (bool) {
        return hasFirstDishNFT[player];
    }

    /**
     * @dev Set the base URI for all token metadata
     * @param baseTokenURI_ New base token URI
     */
    function setBaseTokenURI(string memory baseTokenURI_) external onlyOwner {
        _baseTokenURI = baseTokenURI_;
    }

    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(
            newOwner != address(0),
            "FirstDishNFT: new owner is the zero address"
        );
        owner = newOwner;
    }

    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        // Check if value is zero
        if (value == 0) {
            return "0";
        }

        // Find number of digits
        uint256 temp = value;
        uint256 digits;
        while (temp > 0) {
            digits++;
            temp /= 10;
        }

        // Create the string
        bytes memory buffer = new bytes(digits);
        while (value > 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
