// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title KESC - Kenyan Shilling Coin
 * @dev ERC-20 stablecoin pegged 1:1 to the Kenyan Shilling (KES)
 * 
 * Features:
 * - ERC-20 compliant with 18 decimals
 * - Role-based access control for minting and administrative functions
 * - Pausable functionality for emergency stops
 * - Burnable tokens for redemption process
 * - 1:1 peg to Kenyan Shilling backed by KES reserves
 */
contract KESC is ERC20, AccessControl, ERC20Pausable, ERC20Burnable {
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Events
    event Mint(address indexed to, uint256 amount, string reason);
    event Burn(address indexed from, uint256 amount, string reason);
    
    /**
     * @dev Constructor that sets up the token with initial roles
     * @param initialOwner Address that will be granted DEFAULT_ADMIN_ROLE
     */
    constructor(address initialOwner) ERC20("Kenyan Shilling Coin", "KESC") {
        require(initialOwner != address(0), "KESC: initial owner cannot be zero address");
        
        // Grant the initial owner the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        
        // Grant the initial owner minter and pauser roles initially
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
    }
    
    /**
     * @dev Mints tokens to a specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in wei, 18 decimals)
     * @param reason Optional reason for minting (e.g., "KES deposit via M-Pesa")
     */
    function mint(address to, uint256 amount, string calldata reason) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "KESC: mint to zero address");
        require(amount > 0, "KESC: mint amount must be greater than 0");
        
        _mint(to, amount);
        emit Mint(to, amount, reason);
    }
    
    /**
     * @dev Mints tokens to a specified address (overloaded version without reason)
     * @param to The address to mint tokens to  
     * @param amount The amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "KESC: mint to zero address");
        require(amount > 0, "KESC: mint amount must be greater than 0");
        
        _mint(to, amount);
        emit Mint(to, amount, "");
    }
    
    /**
     * @dev Burns tokens from a specified address (with reason)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     * @param reason Optional reason for burning (e.g., "KES redemption to M-Pesa")
     */
    function burnFrom(address from, uint256 amount, string calldata reason) external onlyRole(MINTER_ROLE) {
        require(from != address(0), "KESC: burn from zero address");
        require(amount > 0, "KESC: burn amount must be greater than 0");
        
        _spendAllowance(from, _msgSender(), amount);
        _burn(from, amount);
        emit Burn(from, amount, reason);
    }
    
    /**
     * @dev Burns tokens from caller's balance (with reason)
     * @param amount The amount of tokens to burn
     * @param reason Optional reason for burning
     */
    function burn(uint256 amount, string calldata reason) public {
        require(amount > 0, "KESC: burn amount must be greater than 0");
        
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount, reason);
    }
    
    /**
     * @dev Override burn function to emit custom event
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        require(amount > 0, "KESC: burn amount must be greater than 0");
        
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount, "");
    }
    
    /**
     * @dev Pauses all token transfers
     * Can only be called by accounts with PAUSER_ROLE
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers
     * Can only be called by accounts with PAUSER_ROLE
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Returns the number of decimals used for token amounts (18)
     * @return Number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Grants MINTER_ROLE to an address
     * @param account Address to grant minter role to
     */
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }
    
    /**
     * @dev Revokes MINTER_ROLE from an address
     * @param account Address to revoke minter role from
     */
    function revokeMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
    }
    
    /**
     * @dev Grants PAUSER_ROLE to an address
     * @param account Address to grant pauser role to
     */
    function grantPauserRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(PAUSER_ROLE, account);
    }
    
    /**
     * @dev Revokes PAUSER_ROLE from an address
     * @param account Address to revoke pauser role from
     */
    function revokePauserRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(PAUSER_ROLE, account);
    }
    
    /**
     * @dev Returns the total supply in a human-readable format
     * @return Total supply divided by 10^18
     */
    function totalSupplyFormatted() external view returns (uint256) {
        return totalSupply() / 10**decimals();
    }
    
    /**
     * @dev Returns the balance of an account in a human-readable format
     * @param account Address to check balance for
     * @return Balance divided by 10^18
     */
    function balanceOfFormatted(address account) external view returns (uint256) {
        return balanceOf(account) / 10**decimals();
    }
    
    // Required overrides for multiple inheritance
    
    /**
     * @dev Hook that is called before any transfer of tokens
     * @param from Address tokens are transferred from
     * @param to Address tokens are transferred to  
     * @param amount Amount of tokens being transferred
     */
    function _update(address from, address to, uint256 amount) 
        internal 
        override(ERC20, ERC20Pausable) 
    {
        super._update(from, to, amount);
    }
} 