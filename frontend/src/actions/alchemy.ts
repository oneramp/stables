import { Alchemy, Network } from "alchemy-sdk";

// if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
//   throw new Error(
//     "NEXT_PUBLIC_ALCHEMY_API_KEY is not defined in environment variables"
//   );
// }

const config = {
  //   apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  apiKey: "hsx94PLAt9LYphnC3sfPiuAEAwWFxqA7",
  network: Network.BASE_MAINNET,
};

export const alchemy = new Alchemy(config);
