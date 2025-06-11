// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./IKESCOperations.sol";

/**
 * @title KESCOperations
 * @dev Admin operations contract for KESC stablecoin
 */
contract KESCOperations is Initializable, AccessControlUpgradeable, IKESCOperations {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");
    bytes32 public constant WHITELIST_MANAGER_ROLE = keccak256("WHITELIST_MANAGER_ROLE");
    bytes32 public constant MINT_MANAGER_ROLE = keccak256("MINT_MANAGER_ROLE");
    
    // Blacklist mapping
    mapping(address => bool) private _blacklisted;
    
    // Whitelist mappings
    mapping(address => bool) private _internalWhitelist;
    mapping(address => bool) private _externalWhitelist;
    
    // Mint authorization mappings
    mapping(address => bool) private _canMint;
    mapping(address => uint256) private _mintAmounts;
    
    // Token contract address (for allowing mint authorization removal)
    address public tokenContract;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address admin) public initializer {
        __AccessControl_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(BLACKLIST_MANAGER_ROLE, admin);
        _grantRole(WHITELIST_MANAGER_ROLE, admin);
        _grantRole(MINT_MANAGER_ROLE, admin);
    }
    
    // Blacklisting functions
    function isBlackListed(address account) external view override returns (bool) {
        return _blacklisted[account];
    }
    
    function addToBlackList(address account) external override onlyRole(BLACKLIST_MANAGER_ROLE) {
        require(account != address(0), "Cannot blacklist zero address");
        _blacklisted[account] = true;
        emit BlackListed(account);
    }
    
    function removeFromBlackList(address account) external override onlyRole(BLACKLIST_MANAGER_ROLE) {
        _blacklisted[account] = false;
        emit RemovedFromBlackList(account);
    }
    
    // Internal whitelist functions (for receiving tokens)
    function isInternalUserWhitelisted(address account) external view override returns (bool) {
        return _internalWhitelist[account];
    }
    
    function addToInternalWhitelist(address account) external override onlyRole(WHITELIST_MANAGER_ROLE) {
        require(account != address(0), "Cannot whitelist zero address");
        _internalWhitelist[account] = true;
        emit InternalWhitelisted(account);
    }
    
    function removeFromInternalWhitelist(address account) external override onlyRole(WHITELIST_MANAGER_ROLE) {
        _internalWhitelist[account] = false;
        emit RemovedFromInternalWhitelist(account);
    }
    
    // External whitelist functions (for sending tokens)
    function isExternalSenderWhitelisted(address account) external view override returns (bool) {
        return _externalWhitelist[account];
    }
    
    function addToExternalWhitelist(address account) external override onlyRole(WHITELIST_MANAGER_ROLE) {
        require(account != address(0), "Cannot whitelist zero address");
        _externalWhitelist[account] = true;
        emit ExternalWhitelisted(account);
    }
    
    function removeFromExternalWhitelist(address account) external override onlyRole(WHITELIST_MANAGER_ROLE) {
        _externalWhitelist[account] = false;
        emit RemovedFromExternalWhitelist(account);
    }
    
    // Mint authorization functions
    function canMint(address minter) external view override returns (bool) {
        return _canMint[minter];
    }
    
    function mintAmount(address minter) external view override returns (uint256) {
        return _mintAmounts[minter];
    }
    
    function authorizeMint(address minter, uint256 amount) external override onlyRole(MINT_MANAGER_ROLE) {
        require(minter != address(0), "Cannot authorize zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _canMint[minter] = true;
        _mintAmounts[minter] = amount;
        emit MintAuthorized(minter, amount);
    }
    
    function removeCanMint(address minter) external override returns (bool) {
        // Allow either MINT_MANAGER_ROLE or the token contract to call this
        require(
            hasRole(MINT_MANAGER_ROLE, msg.sender) || 
            msg.sender == tokenContract,
            "Unauthorized to remove mint authorization"
        );
        
        _canMint[minter] = false;
        _mintAmounts[minter] = 0;
        emit MintAuthorizationRemoved(minter);
        return true;
    }
    
    // Batch operations for efficiency
    function addMultipleToBlackList(address[] calldata accounts) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] != address(0)) {
                _blacklisted[accounts[i]] = true;
                emit BlackListed(accounts[i]);
            }
        }
    }
    
    function removeMultipleFromBlackList(address[] calldata accounts) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        for (uint256 i = 0; i < accounts.length; i++) {
            _blacklisted[accounts[i]] = false;
            emit RemovedFromBlackList(accounts[i]);
        }
    }
    
    function addMultipleToInternalWhitelist(address[] calldata accounts) external onlyRole(WHITELIST_MANAGER_ROLE) {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] != address(0)) {
                _internalWhitelist[accounts[i]] = true;
                emit InternalWhitelisted(accounts[i]);
            }
        }
    }
    
    function addMultipleToExternalWhitelist(address[] calldata accounts) external onlyRole(WHITELIST_MANAGER_ROLE) {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] != address(0)) {
                _externalWhitelist[accounts[i]] = true;
                emit ExternalWhitelisted(accounts[i]);
            }
        }
    }
    
    // Admin functions for role management
    function grantBlacklistManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(BLACKLIST_MANAGER_ROLE, account);
    }
    
    function grantWhitelistManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(WHITELIST_MANAGER_ROLE, account);
    }
    
    function grantMintManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINT_MANAGER_ROLE, account);
    }
    
    /**
     * @dev Set the token contract address
     * @param _tokenContract Address of the token contract
     */
    function setTokenContract(address _tokenContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_tokenContract != address(0), "Token contract cannot be zero address");
        tokenContract = _tokenContract;
    }
    
    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[45] private __gap;
} 