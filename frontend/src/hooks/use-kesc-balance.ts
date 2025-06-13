"use client";

import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";
import { KESC_ABI, KESC_ADDRESS } from "@/config/contracts";
import { useCallback } from "react";

export function useKescBalance() {
  const { address } = useAccount();

  const {
    data: balance,
    isLoading,
    refetch,
  } = useReadContract({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    functionName: "balanceOfFormatted",
    args: [address!],
    // watch: true, // Enable automatic updates
  });

  // Memoize the refetch callback
  const handleBalanceChange = useCallback(() => {
    refetch();
  }, [refetch]);

  // Watch for Transfer events involving the user's address
  useWatchContractEvent({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    eventName: "Transfer",
    onLogs: (logs) => {
      for (const log of logs) {
        try {
          const { args } = log;
          if (!args) continue;

          const { from, to } = args;
          // Refetch if user is sender or receiver
          if (from === address || to === address) {
            handleBalanceChange();
          }
        } catch (error) {
          console.error("Error processing transfer event:", error);
        }
      }
    },
  });

  // Watch for Mint events
  useWatchContractEvent({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    eventName: "Mint",
    onLogs: (logs) => {
      for (const log of logs) {
        try {
          const { args } = log;
          if (!args || args.to !== address) continue;
          handleBalanceChange();
        } catch (error) {
          console.error("Error processing mint event:", error);
        }
      }
    },
  });

  // Watch for Burn events
  useWatchContractEvent({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    eventName: "Burn",
    onLogs: (logs) => {
      for (const log of logs) {
        try {
          const { args } = log;
          if (!args || args.from !== address) continue;
          handleBalanceChange();
        } catch (error) {
          console.error("Error processing burn event:", error);
        }
      }
    },
  });

  return {
    balance: balance ? Number(balance) : 0,
    isLoading,
    refetch: handleBalanceChange,
  };
}
