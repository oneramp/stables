"use client";

import { useAccount, usePublicClient } from "wagmi";
import { useEffect } from "react";

export default function DebugInfo() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    async function checkConnection() {
      if (!publicClient) return;

      const blockNumber = await publicClient.getBlockNumber();
      console.log("Debug Info:", {
        address,
        isConnected,
        blockNumber: blockNumber.toString(),
        chainId: await publicClient.getChainId(),
        rpcUrl: publicClient.transport.url,
      });
    }

    checkConnection();
  }, [address, isConnected, publicClient]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs">
      <pre>
        {JSON.stringify(
          {
            address,
            isConnected,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
