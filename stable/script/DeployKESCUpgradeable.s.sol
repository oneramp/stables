// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/KESCUpgradeable.sol";
import "../src/KESCOperations.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployKESCUpgradeable is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying KESC Upgradeable with deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy the KESCOperations contract (implementation)
        KESCOperations operationsImpl = new KESCOperations();
        console.log("KESCOperations implementation deployed at:", address(operationsImpl));
        
        // Step 2: Deploy KESCOperations proxy
        bytes memory operationsInitData = abi.encodeWithSelector(
            KESCOperations.initialize.selector,
            deployer // admin
        );
        
        ERC1967Proxy operationsProxy = new ERC1967Proxy(
            address(operationsImpl),
            operationsInitData
        );
        
        KESCOperations operations = KESCOperations(address(operationsProxy));
        console.log("KESCOperations proxy deployed at:", address(operations));
        
        // Step 3: Deploy the KESC token contract (implementation)
        KESCUpgradeable tokenImpl = new KESCUpgradeable();
        console.log("KESC implementation deployed at:", address(tokenImpl));
        
        // Step 4: Deploy KESC proxy
        bytes memory tokenInitData = abi.encodeWithSelector(
            KESCUpgradeable.initialize.selector,
            deployer, // initial owner
            address(0), // trusted forwarder (can be set later)
            address(operations) // admin operations contract
        );
        
        ERC1967Proxy tokenProxy = new ERC1967Proxy(
            address(tokenImpl),
            tokenInitData
        );
        
        KESCUpgradeable kesc = KESCUpgradeable(address(tokenProxy));
        
        // Step 5: Set the token contract address in operations
        operations.setTokenContract(address(kesc));
        
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("=== DEPLOYMENT SUMMARY ===");
        console.log("KESC Token Proxy deployed at:", address(kesc));
        console.log("KESC Implementation deployed at:", address(tokenImpl));
        console.log("KESCOperations Proxy deployed at:", address(operations));
        console.log("KESCOperations Implementation deployed at:", address(operationsImpl));
        
        console.log("\n=== TOKEN DETAILS ===");
        console.log("Token name:", kesc.name());
        console.log("Token symbol:", kesc.symbol());
        console.log("Token decimals:", kesc.decimals());
        console.log("Total supply:", kesc.totalSupply());
        
        console.log("\n=== ROLES ===");
        console.log("Deployer has DEFAULT_ADMIN_ROLE:", kesc.hasRole(kesc.DEFAULT_ADMIN_ROLE(), deployer));
        console.log("Deployer has MINTER_ROLE:", kesc.hasRole(kesc.MINTER_ROLE(), deployer));
        console.log("Deployer has PAUSER_ROLE:", kesc.hasRole(kesc.PAUSER_ROLE(), deployer));
        console.log("Deployer has BLACKLIST_MANAGER_ROLE:", kesc.hasRole(kesc.BLACKLIST_MANAGER_ROLE(), deployer));
        
        console.log("\n=== CONFIGURATION ===");
        console.log("Trusted Forwarder:", kesc.trustedForwarderContract());
        console.log("Admin Operations Contract:", kesc.adminOperationsContract());
        
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Set trusted forwarder address if using meta-transactions");
        console.log("2. Configure whitelist/blacklist addresses in operations contract");
        console.log("3. Grant specific roles to operational addresses");
        console.log("4. Verify contracts on block explorer");
    }
} 