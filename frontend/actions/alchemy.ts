// Setup: npm install alchemy-sdk
import { Alchemy, Network } from "alchemy-sdk";

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

export const alchemy = new Alchemy(config);

// const data = await alchemy.core.getAssetTransfers({
//   fromBlock: "0x0",
//   fromAddress: "0x5c43B1eD97e52d009611D89b74fA829FE4ac56b1",
//   category: ["erc20", "erc721", "erc1155", "external", "internal"] as const,
// });

// console.log(data);
