// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "./IKESCOperations.sol";

/**
 * @title KESCUpgradeable - Kenyan Shilling Coin (Upgradeable)
 * @dev Upgradeable ERC-20 stablecoin pegged 1:1 to the Kenyan Shilling (KES)
 * 
 * Enhanced Features:
 * - Upgradeable contract pattern
 * - Role-based access control
 * - Pausable functionality for emergency stops
 * - Reentrancy protection
 * - Blacklisting and whitelisting capabilities
 * - Meta-transaction support via trusted forwarder
 * - Advanced mint authorization system
 * - 1:1 peg to Kenyan Shilling backed by KES reserves
 */
contract KESCUpgradeable is 
    Initializable,
    ERC20Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC20BurnableUpgradeable
{
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");
    
    // State variables
    address public trustedForwarderContract;
    address public adminOperationsContract;
    
    // Events
    event Mint(address indexed to, uint256 amount, string reason);
    event Burn(address indexed from, uint256 amount, string reason);
    event DestroyedBlackListedFunds(address indexed user, uint256 amount);
    event TrustedForwarderUpdated(address indexed oldForwarder, address indexed newForwarder);
    event AdminOperationsUpdated(address indexed oldAdmin, address indexed newAdmin);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initialize the contract
     * @param initialOwner Address that will be granted DEFAULT_ADMIN_ROLE
     * @param _trustedForwarderContract Address of the trusted forwarder for meta-transactions
     * @param _adminOperationsContract Address of the admin operations contract
     */
    function initialize(
        address initialOwner,
        address _trustedForwarderContract,
        address _adminOperationsContract
    ) public initializer {
        require(initialOwner != address(0), "KESC: initial owner cannot be zero address");
        
        __ERC20_init("Kenyan Shilling Coin", "KESC");
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __ERC20Burnable_init();
        
        // Grant the initial owner the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        
        // Grant the initial owner minter, pauser, and blacklist manager roles initially
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        _grantRole(BLACKLIST_MANAGER_ROLE, initialOwner);
        
        trustedForwarderContract = _trustedForwarderContract;
        adminOperationsContract = _adminOperationsContract;
    }
    
    /**
     * @dev Returns the number of decimals used for token amounts (18)
     * @return Number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Check if an address is a trusted forwarder
     * @param forwarder Address to check
     * @return True if the address is a trusted forwarder
     */
    function isTrustedForwarder(address forwarder) public view returns (bool) {
        return forwarder == trustedForwarderContract;
    }
    
    /**
     * @dev Get the actual message sender (supports meta-transactions)
     * @return signer The actual message sender
     */
    function _msgSender() internal view override returns (address) {
        if (msg.data.length >= 20 && isTrustedForwarder(msg.sender)) {
            // Extract the real sender from the end of msg.data
            return address(uint160(uint256(bytes32(msg.data[msg.data.length - 20:]))));
        } else {
            return super._msgSender();
        }
    }
    
    /**
     * @dev Mints tokens to a specified address with advanced authorization
     * @param amount The amount of tokens to mint (in wei, 18 decimals)
     * @param mintTo The address to mint tokens to
     */
    function mint(uint256 amount, address mintTo) external onlyRole(MINTER_ROLE) nonReentrant returns (bool) {
        address signer = _msgSender();
        
        require(amount > 0, "KESC: mint amount must be greater than 0");
        require(mintTo != address(0), "KESC: mint to zero address");
        
        // Check blacklist status
        require(!IKESCOperations(adminOperationsContract).isBlackListed(signer), "KESC: minter is blacklisted");
        require(!IKESCOperations(adminOperationsContract).isBlackListed(mintTo), "KESC: receiver is blacklisted");
        
        // Check mint authorization
        require(IKESCOperations(adminOperationsContract).canMint(signer), "KESC: minter not authorized");
        require(IKESCOperations(adminOperationsContract).mintAmount(signer) == amount, "KESC: attempting to mint more than authorized");
        
        _mint(mintTo, amount);
        
        // Remove mint authorization after successful mint
        bool removed = IKESCOperations(adminOperationsContract).removeCanMint(signer);
        require(removed, "KESC: failed to revoke minting authorization");
        
        emit Mint(mintTo, amount, "");
        return true;
    }
    
    /**
     * @dev Mints tokens to a specified address with reason
     * @param amount The amount of tokens to mint (in wei, 18 decimals)
     * @param mintTo The address to mint tokens to
     * @param reason Reason for minting
     */
    function mintWithReason(uint256 amount, address mintTo, string calldata reason) external onlyRole(MINTER_ROLE) nonReentrant returns (bool) {
        address signer = _msgSender();
        
        require(amount > 0, "KESC: mint amount must be greater than 0");
        require(mintTo != address(0), "KESC: mint to zero address");
        
        // Check blacklist status
        require(!IKESCOperations(adminOperationsContract).isBlackListed(signer), "KESC: minter is blacklisted");
        require(!IKESCOperations(adminOperationsContract).isBlackListed(mintTo), "KESC: receiver is blacklisted");
        
        // Check mint authorization
        require(IKESCOperations(adminOperationsContract).canMint(signer), "KESC: minter not authorized");
        require(IKESCOperations(adminOperationsContract).mintAmount(signer) == amount, "KESC: attempting to mint more than authorized");
        
        _mint(mintTo, amount);
        
        // Remove mint authorization after successful mint
        bool removed = IKESCOperations(adminOperationsContract).removeCanMint(signer);
        require(removed, "KESC: failed to revoke minting authorization");
        
        emit Mint(mintTo, amount, reason);
        return true;
    }
    
    /**
     * @dev Burns tokens from caller's balance with reason
     * @param amount The amount of tokens to burn
     * @param reason Reason for burning
     */
    function burnWithReason(uint256 amount, string calldata reason) external nonReentrant {
        require(amount > 0, "KESC: burn amount must be greater than 0");
        
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount, reason);
    }
    
    /**
     * @dev Burns tokens from a specified address (for platform redemption)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     * @param reason Reason for burning
     */
    function burnFromWithReason(
        address from, 
        uint256 amount, 
        string calldata reason
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(from != address(0), "KESC: burn from zero address");
        require(amount > 0, "KESC: burn amount must be greater than 0");
        
        _spendAllowance(from, _msgSender(), amount);
        _burn(from, amount);
        emit Burn(from, amount, reason);
    }
    
    /**
     * @dev Transfer tokens with blacklist and whitelist checks
     * @param to Address to transfer to
     * @param amount Amount to transfer
     * @return Success status
     */
    function transfer(address to, uint256 amount) public override nonReentrant returns (bool) {
        address owner = _msgSender();
        
        // Check blacklist status
        require(!IKESCOperations(adminOperationsContract).isBlackListed(owner), "KESC: sender is blacklisted");
        require(!IKESCOperations(adminOperationsContract).isBlackListed(to), "KESC: recipient is blacklisted");
        
        // Check if this is a special transfer case (internal user + external sender)
        if (IKESCOperations(adminOperationsContract).isInternalUserWhitelisted(to) && 
            IKESCOperations(adminOperationsContract).isExternalSenderWhitelisted(owner)) {
            // For special case: transfer and then burn (off-ramp scenario)
            _transfer(owner, to, amount);
            _burn(to, amount);
            return true;
        } else {
            // Regular transfer
            _transfer(owner, to, amount);
            return true;
        }
    }
    
    /**
     * @dev Transfer tokens from with blacklist checks
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param amount Amount to transfer
     * @return Success status
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused nonReentrant returns (bool) {
        // Check blacklist status
        require(!IKESCOperations(adminOperationsContract).isBlackListed(_msgSender()), "KESC: spender is blacklisted");
        require(!IKESCOperations(adminOperationsContract).isBlackListed(from), "KESC: sender is blacklisted");
        require(!IKESCOperations(adminOperationsContract).isBlackListed(to), "KESC: recipient is blacklisted");
        
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Destroy tokens from a blacklisted address
     * @param blacklistedUser Address of the blacklisted user
     * @return Success status
     */
    function destroyBlackListedFunds(address blacklistedUser) external onlyRole(BLACKLIST_MANAGER_ROLE) nonReentrant returns (bool) {
        require(IKESCOperations(adminOperationsContract).isBlackListed(blacklistedUser), "KESC: address is not blacklisted");
        
        uint256 dirtyFunds = balanceOf(blacklistedUser);
        require(dirtyFunds > 0, "KESC: no funds to destroy");
        
        _burn(blacklistedUser, dirtyFunds);
        emit DestroyedBlackListedFunds(blacklistedUser, dirtyFunds);
        
        return true;
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
     * @dev Update the trusted forwarder contract address
     * @param newForwarderContract Address of the new trusted forwarder
     * @return Success status
     */
    function updateTrustedForwarder(address newForwarderContract) external onlyRole(DEFAULT_ADMIN_ROLE) returns (bool) {
        address oldForwarder = trustedForwarderContract;
        trustedForwarderContract = newForwarderContract;
        emit TrustedForwarderUpdated(oldForwarder, newForwarderContract);
        return true;
    }
    
    /**
     * @dev Update the admin operations contract address
     * @param newAdminContract Address of the new admin operations contract
     * @return Success status
     */
    function updateAdminOperations(address newAdminContract) external onlyRole(DEFAULT_ADMIN_ROLE) returns (bool) {
        require(newAdminContract != address(0), "KESC: admin contract cannot be zero address");
        address oldAdmin = adminOperationsContract;
        adminOperationsContract = newAdminContract;
        emit AdminOperationsUpdated(oldAdmin, newAdminContract);
        return true;
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
     * @dev Grants BLACKLIST_MANAGER_ROLE to an address
     * @param account Address to grant blacklist manager role to
     */
    function grantBlacklistManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(BLACKLIST_MANAGER_ROLE, account);
    }
    
    /**
     * @dev Revokes BLACKLIST_MANAGER_ROLE from an address
     * @param account Address to revoke blacklist manager role from
     */
    function revokeBlacklistManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(BLACKLIST_MANAGER_ROLE, account);
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
     * @dev Hook that is called on any transfer of tokens
     * @param from Address tokens are transferred from
     * @param to Address tokens are transferred to  
     * @param value Amount of tokens being transferred
     */
    function _update(address from, address to, uint256 value) 
        internal 
        override(ERC20Upgradeable) 
        whenNotPaused 
    {
        super._update(from, to, value);
    }
    
    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[45] private __gap;
} 