// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/KESC.sol";

contract KESCTest is Test {
    KESC public kesc;
    address public owner = address(0x1);
    address public minter = address(0x2);
    address public pauser = address(0x3);
    address public user1 = address(0x4);
    address public user2 = address(0x5);
    
    // Events to test
    event Mint(address indexed to, uint256 amount, string reason);
    event Burn(address indexed from, uint256 amount, string reason);
    
    function setUp() public {
        vm.prank(owner);
        kesc = new KESC(owner);
    }
    
    function testTokenBasics() public {
        assertEq(kesc.name(), "Kenyan Shilling Coin");
        assertEq(kesc.symbol(), "KESC");
        assertEq(kesc.decimals(), 18);
        assertEq(kesc.totalSupply(), 0);
    }
    
    function testInitialRoles() public {
        assertTrue(kesc.hasRole(kesc.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(kesc.hasRole(kesc.MINTER_ROLE(), owner));
        assertTrue(kesc.hasRole(kesc.PAUSER_ROLE(), owner));
    }
    
    function testGrantMinterRole() public {
        vm.prank(owner);
        kesc.grantMinterRole(minter);
        assertTrue(kesc.hasRole(kesc.MINTER_ROLE(), minter));
    }
    
    function testGrantPauserRole() public {
        vm.prank(owner);
        kesc.grantPauserRole(pauser);
        assertTrue(kesc.hasRole(kesc.PAUSER_ROLE(), pauser));
    }
    
    function testMintWithReason() public {
        uint256 amount = 1000 * 10**18; // 1000 KESC
        string memory reason = "KES deposit via M-Pesa";
        
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit Mint(user1, amount, reason);
        kesc.mint(user1, amount, reason);
        
        assertEq(kesc.balanceOf(user1), amount);
        assertEq(kesc.totalSupply(), amount);
        assertEq(kesc.balanceOfFormatted(user1), 1000);
        assertEq(kesc.totalSupplyFormatted(), 1000);
    }
    
    function testMintWithoutReason() public {
        uint256 amount = 500 * 10**18; // 500 KESC
        
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit Mint(user1, amount, "");
        kesc.mint(user1, amount);
        
        assertEq(kesc.balanceOf(user1), amount);
        assertEq(kesc.totalSupply(), amount);
    }
    
    function testMintUnauthorized() public {
        vm.prank(user1);
        vm.expectRevert();
        kesc.mint(user2, 100 * 10**18);
    }
    
    function testMintZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert("KESC: mint amount must be greater than 0");
        kesc.mint(user1, 0);
    }
    
    function testMintZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("KESC: mint to zero address");
        kesc.mint(address(0), 100 * 10**18);
    }
    
    function testBurnWithReason() public {
        uint256 amount = 1000 * 10**18;
        string memory reason = "KES redemption to M-Pesa";
        
        // First mint tokens
        vm.prank(owner);
        kesc.mint(user1, amount);
        
        // Then burn tokens
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, amount, reason);
        kesc.burn(amount, reason);
        
        assertEq(kesc.balanceOf(user1), 0);
        assertEq(kesc.totalSupply(), 0);
    }
    
    function testBurnWithoutReason() public {
        uint256 amount = 500 * 10**18;
        
        // First mint tokens
        vm.prank(owner);
        kesc.mint(user1, amount);
        
        // Then burn tokens
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, amount, "");
        kesc.burn(amount);
        
        assertEq(kesc.balanceOf(user1), 0);
        assertEq(kesc.totalSupply(), 0);
    }
    
    function testBurnFromWithReason() public {
        uint256 amount = 1000 * 10**18;
        string memory reason = "Platform redemption";
        
        // First mint tokens
        vm.prank(owner);
        kesc.mint(user1, amount);
        
        // User approves the minter to spend tokens
        vm.prank(user1);
        kesc.approve(owner, amount);
        
        // Minter burns tokens from user's account
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, amount, reason);
        kesc.burnFrom(user1, amount, reason);
        
        assertEq(kesc.balanceOf(user1), 0);
        assertEq(kesc.totalSupply(), 0);
    }
    
    function testBurnFromUnauthorized() public {
        uint256 amount = 1000 * 10**18;
        
        // First mint tokens
        vm.prank(owner);
        kesc.mint(user1, amount);
        
        // User approves the user2 to spend tokens
        vm.prank(user1);
        kesc.approve(user2, amount);
        
        // user2 tries to burn (should fail - no MINTER_ROLE)
        vm.prank(user2);
        vm.expectRevert();
        kesc.burnFrom(user1, amount, "unauthorized burn");
    }
    
    function testTransferBasic() public {
        uint256 amount = 1000 * 10**18;
        
        // Mint tokens to user1
        vm.prank(owner);
        kesc.mint(user1, amount);
        
        // Transfer from user1 to user2
        vm.prank(user1);
        kesc.transfer(user2, amount / 2);
        
        assertEq(kesc.balanceOf(user1), amount / 2);
        assertEq(kesc.balanceOf(user2), amount / 2);
    }
    
    function testPauseUnpause() public {
        uint256 amount = 1000 * 10**18;
        
        // Mint tokens to user1
        vm.prank(owner);
        kesc.mint(user1, amount);
        
        // Pause the contract
        vm.prank(owner);
        kesc.pause();
        assertTrue(kesc.paused());
        
        // Try to transfer (should fail)
        vm.prank(user1);
        vm.expectRevert();
        kesc.transfer(user2, amount);
        
        // Unpause the contract
        vm.prank(owner);
        kesc.unpause();
        assertFalse(kesc.paused());
        
        // Transfer should work now
        vm.prank(user1);
        kesc.transfer(user2, amount);
        assertEq(kesc.balanceOf(user2), amount);
    }
    
    function testPauseUnauthorized() public {
        vm.prank(user1);
        vm.expectRevert();
        kesc.pause();
    }
    
    function testRoleManagement() public {
        // Grant minter role
        vm.prank(owner);
        kesc.grantMinterRole(minter);
        assertTrue(kesc.hasRole(kesc.MINTER_ROLE(), minter));
        
        // Revoke minter role
        vm.prank(owner);
        kesc.revokeMinterRole(minter);
        assertFalse(kesc.hasRole(kesc.MINTER_ROLE(), minter));
        
        // Grant pauser role
        vm.prank(owner);
        kesc.grantPauserRole(pauser);
        assertTrue(kesc.hasRole(kesc.PAUSER_ROLE(), pauser));
        
        // Revoke pauser role
        vm.prank(owner);
        kesc.revokePauserRole(pauser);
        assertFalse(kesc.hasRole(kesc.PAUSER_ROLE(), pauser));
    }
    
    function testRoleManagementUnauthorized() public {
        vm.prank(user1);
        vm.expectRevert();
        kesc.grantMinterRole(minter);
        
        vm.prank(user1);
        vm.expectRevert();
        kesc.revokeMinterRole(owner);
        
        vm.prank(user1);
        vm.expectRevert();
        kesc.grantPauserRole(pauser);
        
        vm.prank(user1);
        vm.expectRevert();
        kesc.revokePauserRole(owner);
    }
    
    function testFormattedBalances() public {
        uint256 amount = 1500 * 10**18; // 1500 KESC
        
        vm.prank(owner);
        kesc.mint(user1, amount);
        
        assertEq(kesc.balanceOfFormatted(user1), 1500);
        assertEq(kesc.totalSupplyFormatted(), 1500);
    }
    
    function testConstructorZeroAddress() public {
        vm.expectRevert("KESC: initial owner cannot be zero address");
        new KESC(address(0));
    }
} 