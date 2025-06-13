import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { anvil, base } from "./chains";

// Get projectId from https://cloud.reown.com
export const projectId = "5175fef48e45eaa35b29009c6a3b8f77";
// process.env.NEXT_PUBLIC_PROJECT_ID || "72d9f10ab6e67c3e8ed81cb9fc7d6c29"; // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Define supported networks
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  arbitrum,
  base,
];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
