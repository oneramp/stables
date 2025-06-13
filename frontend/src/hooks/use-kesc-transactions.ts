"use client";

import { KESC_ABI, KESC_ADDRESS } from "@/config/contracts";
import { useCallback, useEffect, useState } from "react";
import { decodeEventLog, formatUnits, parseAbiItem, Log, AbiEvent } from "viem";
import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";

export type Transaction = {
  id: string;
  type: "send" | "receive" | "deposit" | "sell";
  amount: string;
  status: "success" | "pending" | "failed";
  date: string;
  from: string;
  to: string;
  blockNumber: bigint;
};

const TRANSFER_EVENT = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);
const MINT_EVENT = parseAbiItem(
  "event Mint(address indexed to, uint256 amount, string reason)"
);
const BURN_EVENT = parseAbiItem(
  "event Burn(address indexed from, uint256 amount, string reason)"
);

// Block range size for chunked fetching
const BLOCK_CHUNK_SIZE = BigInt(10000);

export function useKescTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Function to create transaction object
  const createTransaction = useCallback(
    (
      type: Transaction["type"],
      amount: bigint,
      hash: string,
      timestamp: bigint,
      from: string = "",
      to: string = "",
      blockNumber: bigint
    ): Transaction => ({
      id: hash,
      type,
      amount: formatUnits(amount, 18),
      date: new Date(Number(timestamp) * 1000).toISOString(),
      status: "success",
      from,
      to,
      blockNumber,
    }),
    []
  );

  // Function to safely decode event logs
  const safeDecodeEventLog = useCallback((log: Log) => {
    try {
      return decodeEventLog({
        abi: KESC_ABI,
        data: log.data,
        topics: log.topics,
      });
    } catch (error) {
      console.warn("Failed to decode log:", error);
      return null;
    }
  }, []);

  // Function to process Transfer events
  const processTransferLogs = useCallback(
    async (logs: Log[]): Promise<Transaction[]> => {
      if (!address || !publicClient) return [];

      const processedTransactions: Transaction[] = [];

      for (const log of logs) {
        try {
          const decoded = safeDecodeEventLog(log);
          if (!decoded?.args) continue;

          const { from, to, value } = decoded.args as {
            from: string;
            to: string;
            value: bigint;
          };

          const userIsFrom = from.toLowerCase() === address.toLowerCase();
          const userIsTo = to.toLowerCase() === address.toLowerCase();

          if (userIsFrom || userIsTo) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash!,
            });

            const transaction = createTransaction(
              userIsFrom ? "send" : "receive",
              value,
              log.transactionHash!,
              block.timestamp,
              from,
              to,
              log.blockNumber!
            );

            processedTransactions.push(transaction);
          }
        } catch (error) {
          console.error("Error processing transfer log:", error);
        }
      }

      return processedTransactions;
    },
    [address, publicClient, safeDecodeEventLog, createTransaction]
  );

  // Function to process Mint events
  const processMintLogs = useCallback(
    async (logs: Log[]): Promise<Transaction[]> => {
      if (!address || !publicClient) return [];

      const processedTransactions: Transaction[] = [];

      for (const log of logs) {
        try {
          const decoded = safeDecodeEventLog(log);
          if (!decoded?.args) continue;

          const { to, amount } = decoded.args as {
            to: string;
            amount: bigint;
          };

          if (to.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash!,
            });

            const transaction = createTransaction(
              "deposit",
              amount,
              log.transactionHash!,
              block.timestamp,
              "",
              to,
              log.blockNumber!
            );

            processedTransactions.push(transaction);
          }
        } catch (error) {
          console.error("Error processing mint log:", error);
        }
      }

      return processedTransactions;
    },
    [address, publicClient, safeDecodeEventLog, createTransaction]
  );

  // Function to process Burn events
  const processBurnLogs = useCallback(
    async (logs: Log[]): Promise<Transaction[]> => {
      if (!address || !publicClient) return [];

      const processedTransactions: Transaction[] = [];

      for (const log of logs) {
        try {
          const decoded = safeDecodeEventLog(log);
          if (!decoded?.args) continue;

          const { from, amount } = decoded.args as {
            from: string;
            amount: bigint;
          };

          if (from.toLowerCase() === address.toLowerCase()) {
            const block = await publicClient.getBlock({
              blockHash: log.blockHash!,
            });

            const transaction = createTransaction(
              "sell",
              amount,
              log.transactionHash!,
              block.timestamp,
              from,
              "",
              log.blockNumber!
            );

            processedTransactions.push(transaction);
          }
        } catch (error) {
          console.error("Error processing burn log:", error);
        }
      }

      return processedTransactions;
    },
    [address, publicClient, safeDecodeEventLog, createTransaction]
  );

  // Function to fetch logs in chunks to avoid timeouts
  const fetchLogsInChunks = useCallback(
    async (
      eventAbi: AbiEvent,
      fromBlock: bigint,
      toBlock: bigint
    ): Promise<Log[]> => {
      if (!publicClient) return [];

      const allLogs: Log[] = [];
      let currentFromBlock = fromBlock;

      while (currentFromBlock <= toBlock) {
        const currentToBlock =
          currentFromBlock + BLOCK_CHUNK_SIZE > toBlock
            ? toBlock
            : currentFromBlock + BLOCK_CHUNK_SIZE;

        try {
          const logs = await publicClient.getLogs({
            address: KESC_ADDRESS,
            event: eventAbi,
            fromBlock: currentFromBlock,
            toBlock: currentToBlock,
          });

          allLogs.push(...logs);
        } catch (error) {
          console.warn(
            `Failed to fetch logs for blocks ${currentFromBlock} to ${currentToBlock}:`,
            error
          );
          // Continue with next chunk instead of failing completely
        }

        currentFromBlock = currentToBlock + BigInt(1);
      }

      return allLogs;
    },
    [publicClient]
  );

  // Main function to load all historical transactions
  const loadHistoricalTransactions = useCallback(async () => {
    if (!address || !publicClient) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = BigInt(0);

      // Fetch all events in parallel with chunking
      const [transferLogs, mintLogs, burnLogs] = await Promise.all([
        fetchLogsInChunks(TRANSFER_EVENT, fromBlock, currentBlock),
        fetchLogsInChunks(MINT_EVENT, fromBlock, currentBlock),
        fetchLogsInChunks(BURN_EVENT, fromBlock, currentBlock),
      ]);

      // Process all logs
      const [transferTxs, mintTxs, burnTxs] = await Promise.all([
        processTransferLogs(transferLogs),
        processMintLogs(mintLogs),
        processBurnLogs(burnLogs),
      ]);

      // Combine and deduplicate transactions
      const allTransactions = [...transferTxs, ...mintTxs, ...burnTxs];

      // Remove duplicates based on transaction hash and type
      const uniqueTransactions = allTransactions.filter(
        (transaction, index, self) =>
          index ===
          self.findIndex(
            (t) => t.id === transaction.id && t.type === transaction.type
          )
      );

      // Sort by block number (descending) then by date
      const sortedTransactions = uniqueTransactions.sort((a, b) => {
        const blockDiff = Number(b.blockNumber - a.blockNumber);
        if (blockDiff !== 0) return blockDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error loading historical transactions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load transactions"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    address,
    publicClient,
    fetchLogsInChunks,
    processTransferLogs,
    processMintLogs,
    processBurnLogs,
  ]);

  // Function to add new transaction with duplicate prevention
  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => {
      // Check for duplicates
      const isDuplicate = prev.some(
        (t) => t.id === transaction.id && t.type === transaction.type
      );

      if (isDuplicate) {
        return prev;
      }

      // Add and sort
      const newTransactions = [transaction, ...prev].sort((a, b) => {
        const blockDiff = Number(b.blockNumber - a.blockNumber);
        if (blockDiff !== 0) return blockDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      return newTransactions;
    });
  }, []);

  // Refresh function
  const refresh = useCallback(async () => {
    await loadHistoricalTransactions();
  }, [loadHistoricalTransactions]);

  // Clear transactions when address changes
  useEffect(() => {
    if (address) {
      setTransactions([]);
      loadHistoricalTransactions();
    } else {
      setTransactions([]);
    }
  }, [address, loadHistoricalTransactions]);

  // Watch for new Transfer events
  useWatchContractEvent({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    eventName: "Transfer",
    onLogs: async (logs) => {
      if (!address || !publicClient) return;

      const newTransactions = await processTransferLogs(logs as Log[]);
      newTransactions.forEach(addTransaction);
    },
  });

  // Watch for new Mint events
  useWatchContractEvent({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    eventName: "Mint",
    onLogs: async (logs) => {
      if (!address || !publicClient) return;

      const newTransactions = await processMintLogs(logs as Log[]);
      newTransactions.forEach(addTransaction);
    },
  });

  // Watch for new Burn events
  useWatchContractEvent({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    eventName: "Burn",
    onLogs: async (logs) => {
      if (!address || !publicClient) return;

      const newTransactions = await processBurnLogs(logs as Log[]);
      newTransactions.forEach(addTransaction);
    },
  });

  return {
    transactions,
    refresh,
    isLoading,
    error,
    hasTransactions: transactions.length > 0,
  };
}
