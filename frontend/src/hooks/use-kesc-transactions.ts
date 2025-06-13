"use client";

import { KESC_ABI, KESC_ADDRESS } from "@/config/contracts";
import { useCallback, useEffect, useState } from "react";
import { decodeEventLog, formatUnits, parseAbiItem } from "viem";
import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";

export type Transaction = {
  id: string;
  type: "send" | "receive" | "deposit" | "sell";
  amount: string;
  status: "success" | "pending" | "failed";
  date: string;
  from: string;
  to: string;
};

type TransferEvent = {
  data: `0x${string}`;
  topics: [`0x${string}`, ...`0x${string}`[]];
  blockHash: `0x${string}`;
  transactionHash: `0x${string}`;
};

export function useKescTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Function to format transaction
  const formatTransaction = (
    type: Transaction["type"],
    amount: bigint,
    hash: string,
    timestamp: number
  ): Transaction => ({
    id: hash,
    type,
    amount: (Number(amount) / 1e18).toString(),
    date: new Date(timestamp * 1000).toLocaleDateString(),
    status: "success",
    from: "",
    to: "",
  });

  // Function to add new transaction
  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => {
      // More robust duplicate check
      const isDuplicate = prev.some(
        (t) =>
          t.id === transaction.id || // Same transaction hash
          (t.amount === transaction.amount &&
            t.type === transaction.type &&
            Math.abs(
              new Date(t.date).getTime() - new Date(transaction.date).getTime()
            ) < 5000) // Same amount, type, and within 5 seconds
      );

      if (isDuplicate) {
        return prev;
      }

      // Add new transaction and sort by date
      const newTransactions = [transaction, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return newTransactions;
    });
  };

  // Wrap loadHistoricalTransactions in useCallback
  const loadHistoricalTransactions = useCallback(async () => {
    if (!address || !publicClient) {
      return;
    }

    try {
      // Get the current block
      const currentBlock = await publicClient.getBlockNumber();
      // Start from block 0 since we're on a local chain
      const fromBlock = BigInt(0);

      // Get all relevant events
      const [transfers, mints, burns] = await Promise.all([
        publicClient.getLogs({
          address: KESC_ADDRESS,
          event: parseAbiItem(
            "event Transfer(address indexed from, address indexed to, uint256 value)"
          ),
          fromBlock,
          toBlock: currentBlock,
        }),
        publicClient.getLogs({
          address: KESC_ADDRESS,
          event: parseAbiItem(
            "event Mint(address indexed to, uint256 amount, string reason)"
          ),
          fromBlock,
          toBlock: currentBlock,
        }),
        publicClient.getLogs({
          address: KESC_ADDRESS,
          event: parseAbiItem(
            "event Burn(address indexed from, uint256 amount, string reason)"
          ),
          fromBlock,
          toBlock: currentBlock,
        }),
      ]);

      const newTransactions: Transaction[] = [];

      // Process transfers
      for (const log of transfers as TransferEvent[]) {
        try {
          const { args } = decodeEventLog({
            abi: KESC_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (!args) {
            console.log("No args found for transfer log:", log);
            continue;
          }
          const { from, to, value } = args as {
            from: string;
            to: string;
            value: bigint;
          };

          // Check if the user is the sender or receiver
          const userIsFrom = from.toLowerCase() === address.toLowerCase();
          const userIsTo = to.toLowerCase() === address.toLowerCase();

          if (userIsFrom || userIsTo) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash as `0x${string}`,
            });
            const transaction: Transaction = {
              id: log.transactionHash,
              type: userIsFrom ? "send" : "receive",
              amount: formatUnits(value, 18),
              status: "success",
              date: new Date(Number(block.timestamp) * 1000).toISOString(), // Convert Unix timestamp to ISO string
              from,
              to,
            };
            newTransactions.push(transaction);
          }
        } catch (error) {
          console.error("Error processing historical transfer:", error);
        }
      }

      // Process mints
      for (const log of mints as TransferEvent[]) {
        try {
          const { args } = decodeEventLog({
            abi: KESC_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (!args) {
            console.log("No args found for mint log:", log);
            continue;
          }
          const { to, amount } = args as { to: string; amount: bigint };

          if (to.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash as `0x${string}`,
            });
            const transaction = formatTransaction(
              "deposit",
              amount,
              log.transactionHash,
              Number(block.timestamp)
            );
            newTransactions.push(transaction);
          }
        } catch (error) {
          console.error("Error processing historical mint:", error);
        }
      }

      // Process burns
      for (const log of burns as TransferEvent[]) {
        try {
          const { args } = decodeEventLog({
            abi: KESC_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (!args) {
            console.log("No args found for burn log:", log);
            continue;
          }
          const { from, amount } = args as { from: string; amount: bigint };

          if (from.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash as `0x${string}`,
            });
            const transaction = formatTransaction(
              "sell",
              amount,
              log.transactionHash,
              Number(block.timestamp)
            );
            newTransactions.push(transaction);
          }
        } catch (error) {
          console.error("Error processing historical burn:", error);
        }
      }

      // Sort by timestamp (newest first) and update state
      const sortedTransactions = newTransactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Sort in descending order (newest first)
      });

      // Ensure uniqueness before setting state
      const uniqueTransactions = sortedTransactions.filter(
        (transaction, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.id === transaction.id &&
              t.type === transaction.type &&
              t.amount === transaction.amount
          )
      );

      setTransactions(uniqueTransactions);
    } catch (error) {
      console.error("Error loading historical transactions:", error);
    }
  }, [address, publicClient]); // Add dependencies

  // Function to manually refresh transactions
  const refresh = useCallback(() => {
    loadHistoricalTransactions();
  }, [loadHistoricalTransactions]);

  useEffect(() => {
    loadHistoricalTransactions();
  }, [loadHistoricalTransactions]);

  // Watch for Transfer events
  useWatchContractEvent({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    eventName: "Transfer",
    onLogs: async (logs) => {
      if (!address || !publicClient) return;

      for (const log of logs as TransferEvent[]) {
        try {
          const { args } = decodeEventLog({
            abi: KESC_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (!args) continue;
          const { from, to, value } = args as {
            from: string;
            to: string;
            value: bigint;
          };

          // Check if the user is the sender or receiver
          const userIsFrom = from.toLowerCase() === address.toLowerCase();
          const userIsTo = to.toLowerCase() === address.toLowerCase();

          if (userIsFrom || userIsTo) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash as `0x${string}`,
            });
            addTransaction(
              formatTransaction(
                userIsFrom ? "send" : "receive",
                value,
                log.transactionHash,
                Number(block.timestamp)
              )
            );
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
    onLogs: async (logs) => {
      if (!address || !publicClient) return;

      for (const log of logs as TransferEvent[]) {
        try {
          const { args } = decodeEventLog({
            abi: KESC_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (!args) continue;
          const { to, amount } = args as { to: string; amount: bigint };

          if (to.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash as `0x${string}`,
            });
            addTransaction(
              formatTransaction(
                "deposit",
                amount,
                log.transactionHash,
                Number(block.timestamp)
              )
            );
          }
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
    onLogs: async (logs) => {
      if (!address || !publicClient) return;

      for (const log of logs as TransferEvent[]) {
        try {
          const { args } = decodeEventLog({
            abi: KESC_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (!args) continue;
          const { from, amount } = args as { from: string; amount: bigint };

          if (from.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash as `0x${string}`,
            });
            addTransaction(
              formatTransaction(
                "sell",
                amount,
                log.transactionHash,
                Number(block.timestamp)
              )
            );
          }
        } catch (error) {
          console.error("Error processing burn event:", error);
        }
      }
    },
  });

  return { transactions, refresh };
}
