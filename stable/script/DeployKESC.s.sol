// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/KESC.sol";

contract DeployKESC is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying KESC with deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy KESC with the deployer as the initial owner
        KESC kesc = new KESC(deployer);
        
        vm.stopBroadcast();
        
        console.log("KESC deployed at:", address(kesc));
        console.log("Token name:", kesc.name());
        console.log("Token symbol:", kesc.symbol());
        console.log("Token decimals:", kesc.decimals());
        console.log("Initial owner:", deployer);
        console.log("Owner has DEFAULT_ADMIN_ROLE:", kesc.hasRole(kesc.DEFAULT_ADMIN_ROLE(), deployer));
        console.log("Owner has MINTER_ROLE:", kesc.hasRole(kesc.MINTER_ROLE(), deployer));
        console.log("Owner has PAUSER_ROLE:", kesc.hasRole(kesc.PAUSER_ROLE(), deployer));
    }
} 