// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IKESCOperations
 * @dev Interface for KESC admin operations contract
 */
interface IKESCOperations {
    // Blacklisting functions
    function isBlackListed(address account) external view returns (bool);
    function addToBlackList(address account) external;
    function removeFromBlackList(address account) external;
    
    // Whitelisting functions
    function isInternalUserWhitelisted(address account) external view returns (bool);
    function isExternalSenderWhitelisted(address account) external view returns (bool);
    function addToInternalWhitelist(address account) external;
    function addToExternalWhitelist(address account) external;
    function removeFromInternalWhitelist(address account) external;
    function removeFromExternalWhitelist(address account) external;
    
    // Minting authorization functions
    function canMint(address minter) external view returns (bool);
    function mintAmount(address minter) external view returns (uint256);
    function authorizeMint(address minter, uint256 amount) external;
    function removeCanMint(address minter) external returns (bool);
    
    // Events
    event BlackListed(address indexed account);
    event RemovedFromBlackList(address indexed account);
    event InternalWhitelisted(address indexed account);
    event ExternalWhitelisted(address indexed account);
    event RemovedFromInternalWhitelist(address indexed account);
    event RemovedFromExternalWhitelist(address indexed account);
    event MintAuthorized(address indexed minter, uint256 amount);
    event MintAuthorizationRemoved(address indexed minter);
} 