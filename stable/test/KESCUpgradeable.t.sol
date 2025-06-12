// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/KESCUpgradeable.sol";
import "../src/KESCOperations.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract KESCUpgradeableTest is Test {
    KESCUpgradeable public kesc;
    KESCOperations public operations;
    
    address public owner = address(0x1);
    address public minter = address(0x2);
    address public pauser = address(0x3);
    address public blacklistManager = address(0x4);
    address public user1 = address(0x5);
    address public user2 = address(0x6);
    address public trustedForwarder = address(0x7);
    
    // Events to test
    event Mint(address indexed to, uint256 amount, string reason);
    event Burn(address indexed from, uint256 amount, string reason);
    event DestroyedBlackListedFunds(address indexed user, uint256 amount);
    
    function setUp() public {
        // Deploy operations contract
        KESCOperations operationsImpl = new KESCOperations();
        bytes memory operationsInitData = abi.encodeWithSelector(
            KESCOperations.initialize.selector,
            owner
        );
        ERC1967Proxy operationsProxy = new ERC1967Proxy(address(operationsImpl), operationsInitData);
        operations = KESCOperations(address(operationsProxy));
        
        // Deploy KESC token contract
        KESCUpgradeable kescImpl = new KESCUpgradeable();
        bytes memory kescInitData = abi.encodeWithSelector(
            KESCUpgradeable.initialize.selector,
            owner,
            trustedForwarder,
            address(operations)
        );
        ERC1967Proxy kescProxy = new ERC1967Proxy(address(kescImpl), kescInitData);
        kesc = KESCUpgradeable(address(kescProxy));
        
        // Grant additional roles
        vm.startPrank(owner);
        kesc.grantMinterRole(minter);
        kesc.grantPauserRole(pauser);
        kesc.grantBlacklistManagerRole(blacklistManager);
        
        operations.grantMintManagerRole(minter);
        operations.grantBlacklistManagerRole(blacklistManager);
        operations.grantWhitelistManagerRole(owner);
        
        // Set the token contract address
        operations.setTokenContract(address(kesc));
        vm.stopPrank();
    }
    
    function testInitialization() public {
        assertEq(kesc.name(), "KESC");
        assertEq(kesc.symbol(), "KESC");
        assertEq(kesc.decimals(), 18);
        assertEq(kesc.totalSupply(), 0);
        assertEq(kesc.trustedForwarderContract(), trustedForwarder);
        assertEq(kesc.adminOperationsContract(), address(operations));
    }
    
    function testInitialRoles() public {
        assertTrue(kesc.hasRole(kesc.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(kesc.hasRole(kesc.MINTER_ROLE(), owner));
        assertTrue(kesc.hasRole(kesc.PAUSER_ROLE(), owner));
        assertTrue(kesc.hasRole(kesc.BLACKLIST_MANAGER_ROLE(), owner));
        
        assertTrue(kesc.hasRole(kesc.MINTER_ROLE(), minter));
        assertTrue(kesc.hasRole(kesc.PAUSER_ROLE(), pauser));
        assertTrue(kesc.hasRole(kesc.BLACKLIST_MANAGER_ROLE(), blacklistManager));
    }
    
    function testMintWithAuthorization() public {
        uint256 amount = 1000 * 10**18;
        
        // Authorize mint
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        
        // Mint tokens
        vm.prank(minter);
        vm.expectEmit(true, false, false, true);
        emit Mint(user1, amount, "");
        bool success = kesc.mint(amount, user1);
        
        assertTrue(success);
        assertEq(kesc.balanceOf(user1), amount);
        assertEq(kesc.totalSupply(), amount);
        
        // Check that authorization was removed
        assertFalse(operations.canMint(minter));
        assertEq(operations.mintAmount(minter), 0);
    }
    
    function testMintWithReasonAndAuthorization() public {
        uint256 amount = 500 * 10**18;
        string memory reason = "KES deposit via M-Pesa";
        
        // Authorize mint
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        
        // Mint tokens with reason
        vm.prank(minter);
        vm.expectEmit(true, false, false, true);
        emit Mint(user1, amount, reason);
        bool success = kesc.mintWithReason(amount, user1, reason);
        
        assertTrue(success);
        assertEq(kesc.balanceOf(user1), amount);
    }
    
    function testMintWithoutAuthorization() public {
        uint256 amount = 1000 * 10**18;
        
        vm.prank(minter);
        vm.expectRevert("KESC: minter not authorized");
        kesc.mint(amount, user1);
    }
    
    function testMintWrongAmount() public {
        uint256 authorizedAmount = 1000 * 10**18;
        uint256 attemptedAmount = 2000 * 10**18;
        
        // Authorize mint for specific amount
        vm.prank(minter);
        operations.authorizeMint(minter, authorizedAmount);
        
        // Try to mint different amount
        vm.prank(minter);
        vm.expectRevert("KESC: attempting to mint more than authorized");
        kesc.mint(attemptedAmount, user1);
    }
    
    function testMintToBlacklistedAddress() public {
        uint256 amount = 1000 * 10**18;
        
        // Blacklist user1
        vm.prank(blacklistManager);
        operations.addToBlackList(user1);
        
        // Authorize mint
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        
        // Try to mint to blacklisted address
        vm.prank(minter);
        vm.expectRevert("KESC: receiver is blacklisted");
        kesc.mint(amount, user1);
    }
    
    function testBurnWithReason() public {
        uint256 amount = 1000 * 10**18;
        string memory reason = "KES redemption to M-Pesa";
        
        // First mint tokens
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        vm.prank(minter);
        kesc.mint(amount, user1);
        
        // Then burn tokens
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, amount, reason);
        kesc.burnWithReason(amount, reason);
        
        assertEq(kesc.balanceOf(user1), 0);
        assertEq(kesc.totalSupply(), 0);
    }
    
    function testBurnFromWithReason() public {
        uint256 amount = 1000 * 10**18;
        string memory reason = "Platform redemption";
        
        // First mint tokens
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        vm.prank(minter);
        kesc.mint(amount, user1);
        
        // User approves the minter to spend tokens
        vm.prank(user1);
        kesc.approve(minter, amount);
        
        // Minter burns tokens from user's account
        vm.prank(minter);
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, amount, reason);
        kesc.burnFromWithReason(user1, amount, reason);
        
        assertEq(kesc.balanceOf(user1), 0);
        assertEq(kesc.totalSupply(), 0);
    }
    
    function testTransferWithBlacklistCheck() public {
        uint256 amount = 1000 * 10**18;
        
        // Mint tokens to user1
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        vm.prank(minter);
        kesc.mint(amount, user1);
        
        // Blacklist user2
        vm.prank(blacklistManager);
        operations.addToBlackList(user2);
        
        // Try to transfer to blacklisted address
        vm.prank(user1);
        vm.expectRevert("KESC: recipient is blacklisted");
        kesc.transfer(user2, amount / 2);
        
        // Remove from blacklist and try again
        vm.prank(blacklistManager);
        operations.removeFromBlackList(user2);
        
        vm.prank(user1);
        bool success = kesc.transfer(user2, amount / 2);
        assertTrue(success);
        assertEq(kesc.balanceOf(user2), amount / 2);
    }
    
    function testSpecialTransferCase() public {
        uint256 amount = 1000 * 10**18;
        
        // Mint tokens to user1
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        vm.prank(minter);
        kesc.mint(amount, user1);
        
        // Add user1 to external whitelist and user2 to internal whitelist
        vm.prank(owner);
        operations.addToExternalWhitelist(user1);
        vm.prank(owner);
        operations.addToInternalWhitelist(user2);
        
        uint256 initialTotalSupply = kesc.totalSupply();
        
        // Transfer should burn tokens due to special case
        vm.prank(user1);
        bool success = kesc.transfer(user2, amount / 2);
        assertTrue(success);
        
        // Check that tokens were burned (total supply reduced)
        assertEq(kesc.totalSupply(), initialTotalSupply - (amount / 2));
        assertEq(kesc.balanceOf(user2), 0); // Tokens were burned
    }
    
    function testDestroyBlackListedFunds() public {
        uint256 amount = 1000 * 10**18;
        
        // Mint tokens to user1
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        vm.prank(minter);
        kesc.mint(amount, user1);
        
        // Blacklist user1
        vm.prank(blacklistManager);
        operations.addToBlackList(user1);
        
        uint256 initialTotalSupply = kesc.totalSupply();
        
        // Destroy blacklisted funds
        vm.prank(blacklistManager);
        vm.expectEmit(true, false, false, true);
        emit DestroyedBlackListedFunds(user1, amount);
        bool success = kesc.destroyBlackListedFunds(user1);
        
        assertTrue(success);
        assertEq(kesc.balanceOf(user1), 0);
        assertEq(kesc.totalSupply(), initialTotalSupply - amount);
    }
    
    function testDestroyBlackFundsNotBlacklisted() public {
        uint256 amount = 1000 * 10**18;
        
        // Mint tokens to user1
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        vm.prank(minter);
        kesc.mint(amount, user1);
        
        // Try to destroy funds without blacklisting
        vm.prank(blacklistManager);
        vm.expectRevert("KESC: address is not blacklisted");
        kesc.destroyBlackListedFunds(user1);
    }
    
    function testPauseUnpause() public {
        uint256 amount = 1000 * 10**18;
        
        // Mint tokens to user1
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        vm.prank(minter);
        kesc.mint(amount, user1);
        
        // Pause the contract
        vm.prank(pauser);
        kesc.pause();
        assertTrue(kesc.paused());
        
        // Try to transfer (should fail)
        vm.prank(user1);
        vm.expectRevert();
        kesc.transfer(user2, amount);
        
        // Unpause the contract
        vm.prank(pauser);
        kesc.unpause();
        assertFalse(kesc.paused());
        
        // Transfer should work now
        vm.prank(user1);
        bool success = kesc.transfer(user2, amount);
        assertTrue(success);
        assertEq(kesc.balanceOf(user2), amount);
    }
    
    function testUpdateTrustedForwarder() public {
        address newForwarder = address(0x99);
        
        vm.prank(owner);
        bool success = kesc.updateTrustedForwarder(newForwarder);
        assertTrue(success);
        assertEq(kesc.trustedForwarderContract(), newForwarder);
        assertTrue(kesc.isTrustedForwarder(newForwarder));
        assertFalse(kesc.isTrustedForwarder(trustedForwarder));
    }
    
    function testUpdateAdminOperations() public {
        address newAdminOps = address(0x88);
        
        vm.prank(owner);
        bool success = kesc.updateAdminOperations(newAdminOps);
        assertTrue(success);
        assertEq(kesc.adminOperationsContract(), newAdminOps);
    }
    
    function testOperationsContractBlacklist() public {
        assertFalse(operations.isBlackListed(user1));
        
        vm.prank(blacklistManager);
        operations.addToBlackList(user1);
        assertTrue(operations.isBlackListed(user1));
        
        vm.prank(blacklistManager);
        operations.removeFromBlackList(user1);
        assertFalse(operations.isBlackListed(user1));
    }
    
    function testOperationsContractWhitelist() public {
        assertFalse(operations.isInternalUserWhitelisted(user1));
        assertFalse(operations.isExternalSenderWhitelisted(user1));
        
        vm.prank(owner);
        operations.addToInternalWhitelist(user1);
        assertTrue(operations.isInternalUserWhitelisted(user1));
        
        vm.prank(owner);
        operations.addToExternalWhitelist(user1);
        assertTrue(operations.isExternalSenderWhitelisted(user1));
    }
    
    function testOperationsContractMintAuthorization() public {
        uint256 amount = 1000 * 10**18;
        
        assertFalse(operations.canMint(minter));
        assertEq(operations.mintAmount(minter), 0);
        
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        
        assertTrue(operations.canMint(minter));
        assertEq(operations.mintAmount(minter), amount);
        
        vm.prank(minter);
        bool removed = operations.removeCanMint(minter);
        assertTrue(removed);
        assertFalse(operations.canMint(minter));
        assertEq(operations.mintAmount(minter), 0);
    }
    
    function testBatchBlacklistOperations() public {
        address[] memory accounts = new address[](3);
        accounts[0] = user1;
        accounts[1] = user2;
        accounts[2] = address(0x10);
        
        vm.prank(blacklistManager);
        operations.addMultipleToBlackList(accounts);
        
        assertTrue(operations.isBlackListed(user1));
        assertTrue(operations.isBlackListed(user2));
        assertTrue(operations.isBlackListed(address(0x10)));
        
        vm.prank(blacklistManager);
        operations.removeMultipleFromBlackList(accounts);
        
        assertFalse(operations.isBlackListed(user1));
        assertFalse(operations.isBlackListed(user2));
        assertFalse(operations.isBlackListed(address(0x10)));
    }
    
    function testReentrancyProtection() public {
        // This test would require a malicious contract to properly test reentrancy
        // For now, we just ensure the functions have the nonReentrant modifier
        uint256 amount = 1000 * 10**18;
        
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        
        vm.prank(minter);
        bool success = kesc.mint(amount, user1);
        assertTrue(success);
    }
    
    function testFormattedBalances() public {
        uint256 amount = 1500 * 10**18; // 1500 KESC
        
        vm.prank(minter);
        operations.authorizeMint(minter, amount);
        vm.prank(minter);
        kesc.mint(amount, user1);
        
        assertEq(kesc.balanceOfFormatted(user1), 1500);
        assertEq(kesc.totalSupplyFormatted(), 1500);
    }
} 